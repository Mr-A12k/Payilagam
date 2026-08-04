const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { RedisVectorStore } = require('@langchain/redis');
const { createClient } = require('redis');
const { OllamaEmbeddings } = require('@langchain/ollama');
const path = require('path');

// Redis configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_INDEX_NAME = process.env.REDIS_INDEX_NAME || 'taskpro-edu-docs';

const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434"
});

exports.uploadDocument = async (uploaderId, file, title, topic) => {
    // 1. Create DB Record
    const fileUrl = `/uploads/documents/${file.filename}`;
    const newDoc = await prisma.eduDocument.create({
        data: {
            title,
            topic,
            fileUrl,
            sizeBytes: file.size,
            uploaderId: parseInt(uploaderId, 10),
            isProcessed: false
        }
    });

    // 2. Process in background to avoid blocking
    this.processDocument(newDoc.id, file.path, topic).catch(error => {
        console.error("Failed to process document:", error);
    });

    return newDoc;
};

exports.processDocument = async (docId, filePath, topic) => {
    try {
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        // 1. Extract Text
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        const text = data.text;

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
                    topic: topic || "general"
                }
            }));
            
            // We use standard Redis schema for similarity
            await RedisVectorStore.fromDocuments(documents, embeddings, {
                redisClient: client,
                indexName: REDIS_INDEX_NAME,
                keyPrefix: `doc:${docId}:chunk:`
            });
        }
        
        await client.disconnect();

        // 5. Mark as processed
        await prisma.eduDocument.update({
            where: { id: docId },
            data: { isProcessed: true }
        });

        console.log(`Document ${docId} processed and indexed successfully.`);
    } catch (error) {
        console.error(`Error processing document ${docId}:`, error);
        throw error;
    }
};

exports.getAllDocuments = async () => {
    return await prisma.eduDocument.findMany({
        include: {
            uploader: {
                select: { userName: true, fullName: true, profileUrl: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

exports.deleteDocument = async (docId) => {
    const doc = await prisma.eduDocument.findUnique({ where: { id: parseInt(docId) } });
    if (!doc) throw new Error("Document not found");

    // Remove from DB
    await prisma.eduDocument.delete({ where: { id: parseInt(docId) } });

    // Remove file
    const filePath = path.join(__dirname, '../../../', doc.fileUrl);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    // Attempt to remove from Redis if configured
    try {
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        
        // Find all keys starting with the prefix for this docId
        const keys = await client.keys(`doc:${docId}:chunk:*`);
        if (keys.length > 0) {
            await client.del(keys);
            console.log(`Deleted ${keys.length} vector chunks for document ${docId} from Redis`);
        }
        await client.disconnect();
    } catch(error) {
        console.error("Failed to delete vectors from Redis:", error);
    }

    return true;
};
