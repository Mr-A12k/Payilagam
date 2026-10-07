const prisma = require('../../config/prisma');
const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { RedisVectorStore } = require("@langchain/redis");
const { createClient } = require("redis");
const { OllamaEmbeddings } = require("@langchain/ollama");
const path = require("path");

// Redis configuration
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const REDIS_INDEX_NAME = process.env.REDIS_INDEX_NAME || "taskpro-edu-docs";

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
});
const redisClient = () => {
  const client = createClient({ url: REDIS_URL, socket: { connectTimeout: 2000, reconnectStrategy: false } });
  client.on('error', error => console.error('Document index connection failed:', error.message));
  return client;
};

exports.uploadDocument = async (uploaderId, file, title, topic) => {
  if (typeof title !== 'string' || !title.trim()) {
    throw Object.assign(new Error('Title is required.'), { statusCode: 400 });
  }
  const parser = new PDFParse({ data: await fs.promises.readFile(file.path) });
  try {
    const info = await parser.getInfo();
    if (!info.total) throw new Error('No PDF pages');
  } catch {
    throw Object.assign(new Error('Please upload a valid, readable PDF.'), { statusCode: 400 });
  } finally {
    await parser.destroy();
  }
  // 1. Create DB Record
  const fileUrl = `/uploads/documents/${file.filename}`;
  const newDoc = await prisma.eduDocument.create({
    data: {
      title: title.trim(),
      topic,
      fileUrl,
      sizeBytes: file.size,
      uploaderId: parseInt(uploaderId, 10),
      isProcessed: false,
    },
  });

  // 2. Process in background to avoid blocking
  this.processDocument(newDoc.id, file.path, topic).catch((error) => {
    console.error("Failed to process document:", error);
  });

  return newDoc;
};

exports.processDocument = async (docId, filePath, topic) => {
  const client = redisClient();
  try {
    // 1. Extract Text
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    let data;
    try { data = await parser.getText(); } finally { await parser.destroy(); }
    const text = data.text;
    await client.connect();

    // 2. Split Text
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitText(text);

    // 3. Generate Embeddings locally and save to Redis using OllamaEmbeddings
    const batchSize = 50;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batchChunks = chunks.slice(i, i + batchSize);

      const documents = batchChunks.map((chunk, index) => ({
        pageContent: chunk,
        metadata: {
          docId,
          topic: topic || "general",
        },
      }));

      // We use standard Redis schema for similarity
      await RedisVectorStore.fromDocuments(documents, embeddings, {
        redisClient: client,
        indexName: REDIS_INDEX_NAME,
        keyPrefix: `doc:${docId}:chunk:`,
      });
    }


    // 5. Mark as processed
    await prisma.eduDocument.update({
      where: { id: docId },
      data: { isProcessed: true },
    });

    console.log(`Document ${docId} processed and indexed successfully.`);
  } catch (error) {
    console.error(`Error processing document ${docId}:`, error);
    throw error;
  } finally {
    if (client.isOpen) client.destroy();
  }
};

exports.getAllDocuments = async () => {
  return await prisma.eduDocument.findMany({
    include: {
      uploader: {
        select: { userName: true, fullName: true, profileUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

exports.deleteDocument = async (docId, actor) => {
  if (!/^\d+$/.test(String(docId)) || Number(docId) > 2147483647) throw Object.assign(new Error('Invalid document ID'), { statusCode: 400 });
  const doc = await prisma.eduDocument.findUnique({
    where: { id: parseInt(docId) },
  });
  if (!doc) throw Object.assign(new Error("Document not found"), { statusCode: 404 });
  if (!actor || (!['admin', 'mentor'].includes(actor.role) && Number(actor.userId) !== doc.uploaderId)) {
    throw Object.assign(new Error('You can only delete your own documents.'), { statusCode: 403 });
  }

  // Remove from DB
  await prisma.eduDocument.delete({ where: { id: parseInt(docId) } });

  // Remove file
  const filePath = path.join(__dirname, "../../../", doc.fileUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Attempt to remove from Redis if configured
  const client = redisClient();
  try {
    await client.connect();

    // Find all keys starting with the prefix for this docId
    const keys = await client.keys(`doc:${docId}:chunk:*`);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(
        `Deleted ${keys.length} vector chunks for document ${docId} from Redis`,
      );
    }
  } catch (error) {
    console.error("Failed to delete vectors from Redis:", error);
  } finally {
    if (client.isOpen) client.destroy();
  }

  return true;
};
