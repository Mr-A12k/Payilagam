const { RedisVectorStore } = require('@langchain/redis');
const { createClient } = require('redis');
const { ChatOllama, OllamaEmbeddings } = require('@langchain/ollama');
const { tavily } = require('@tavily/core');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_INDEX_NAME = process.env.REDIS_INDEX_NAME || 'taskpro-edu-docs';

const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434"
});

// Initialize local Ollama LLM
const llm = new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: "llama3.2:1b", // very small model for <2GB constraints
    temperature: 0.2,
});

// Initialize Tavily Search
const searchTool = process.env.TAVILY_API_KEY ? tavily({ apiKey: process.env.TAVILY_API_KEY }) : null;

exports.ragChatStream = async (query, topic, onToken, onComplete, onError) => {
    if (!llm) {
        return onError(new Error("Local LLM is unavailable."));
    }

    try {
        let localContext = "";
        let webContext = "";
        let sources = [];

        // 1. Retrieve from Redis
        try {
            const client = createClient({ url: REDIS_URL });
            await client.connect();
            
            const vectorStore = new RedisVectorStore(
                embeddings,
                {
                    redisClient: client,
                    indexName: REDIS_INDEX_NAME,
                }
            );
            
            const results = await vectorStore.similaritySearchWithScore(query, 4);
            await client.disconnect();
            
            if (results && results.length > 0) {
                localContext = results.map(response => {
                    const match = response[0];
                    const score = response[1];
                    sources.push(`Document Chunk (Distance: ${score.toFixed(2)})`);
                    return `Content: ${match.pageContent}`;
                }).join("\n\n");
            }
        } catch (error) {
            console.error("Local Redis Search failed:", error);
        }

        // 2. Web Fallback if local context is weak or empty
        if (!localContext && searchTool) {
            console.log("Local context weak. Triggering Web Search Fallback...");
            try {
                const searchResponse = await searchTool.search(query, { maxResults: 3 });
                if (searchResponse && searchResponse.results) {
                    webContext = searchResponse.results.map(response => {
                        sources.push(`Web: ${response.url}`);
                        return `Source: ${response.url}\nContent: ${response.content}`;
                    }).join("\n\n");
                }
            } catch (error) {
                console.error("Tavily search failed:", e);
            }
        }

        // 3. Construct Prompt
        const prompt = `You are a helpful educational AI assistant for students.
Answer the user's question accurately using the provided context.
If the context does not contain the answer, say "I don't have enough information to answer that based on the provided context."
Always cite your sources using the information in the context.

--- Local Knowledge Base Context ---
${localContext || "None"}

--- Web Search Context (if any) ---
${webContext || "None"}

Question: ${query}

Helpful Answer:`;

        // 4. Stream Response
        const stream = await llm.stream(prompt);

        for await (const chunk of stream) {
            if (chunk.content) {
                onToken(chunk.content);
            }
        }

        // Send sources at the very end as a special token or structure
        if (sources.length > 0) {
            const uniqueSources = [...new Set(sources)];
            onToken(`\n\n**Sources Used:**\n- ${uniqueSources.join('\n- ')}`);
        }

        onComplete();
    } catch (error) {
        console.error("RAG Chat Error:", error);
        onError(error);
    }
};
