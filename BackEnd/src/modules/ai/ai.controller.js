const aiService = require('./ai.service');

exports.chat = async (request, response) => {
    const { query, topic } = request.body;

    if (!query) {
        return response.status(400).json({ success: false, message: "Query is required" });
    }

    // Set headers for SSE (Server-Sent Events)
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
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
        }
    );
};