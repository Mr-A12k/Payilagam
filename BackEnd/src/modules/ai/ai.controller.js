const aiService = require("./ai.service");

exports.chat = async (request, response) => {
  const { query, topic } = request.body;

  if (!query) {
    return response
      .status(400)
      .json({ success: false, message: "Query is required" });
  }

  // Set headers for SSE (Server-Sent Events)
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.flushHeaders(); // flush the headers to establish SSE connection

  aiService.ragChatStream(
    query,
    topic,
    (token) => {
      response.write(`data: ${JSON.stringify({ token })}\n\n`);
    },
    () => {
      response.write(`data: [DONE]\n\n`);
      response.end();
    },
    (error) => {
      response.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      response.end();
    },
  );
};

const exifr = require("exifr");
const sharp = require("sharp");

exports.verifyImage = async (request, response) => {
  try {
    if (!request.file) {
      return response.status(400).json({ success: false, message: "No image uploaded" });
    }
    
    // Parse all possible metadata (EXIF, XMP, IPTC)
    const metadata = await exifr.parse(request.file.buffer, { xmp: true, iptc: true, tiff: true });
    
    if (!metadata) {
      return response.json({ 
        success: true, 
        isAiGenerated: false, 
        confidence: 0, 
        message: "No metadata found. Cannot conclusively determine if AI generated." 
      });
    }

    let isAiGenerated = false;
    let signatures = [];
    const metaString = JSON.stringify(metadata).toLowerCase();

    const aiKeywords = ["midjourney", "dall-e", "dalle", "stable diffusion", "ai generated", "stealth", "comfyui", "novelai"];
    
    for (const keyword of aiKeywords) {
      if (metaString.includes(keyword)) {
        isAiGenerated = true;
        signatures.push(keyword);
      }
    }

    // specific field checks
    if (metadata.Software && aiKeywords.some(kw => metadata.Software.toLowerCase().includes(kw))) {
       isAiGenerated = true;
    }

    response.json({
      success: true,
      isAiGenerated,
      confidence: isAiGenerated ? 99 : 10,
      signatures,
      metadata
    });
  } catch (error) {
    console.error("Verification Error:", error);
    response.status(500).json({ success: false, message: "Error verifying image" });
  }
};

exports.stripMetadata = async (request, response) => {
  try {
    if (!request.file) {
      return response.status(400).json({ success: false, message: "No image uploaded" });
    }

    // sharp by default strips metadata unless .withMetadata() is called!
    const cleanBuffer = await sharp(request.file.buffer)
      .toBuffer();

    response.setHeader("Content-Type", request.file.mimetype);
    response.setHeader("Content-Disposition", `attachment; filename="clean_${request.file.originalname}"`);
    response.send(cleanBuffer);
  } catch (error) {
    console.error("Strip Metadata Error:", error);
    response.status(500).json({ success: false, message: "Error stripping metadata" });
  }
};
