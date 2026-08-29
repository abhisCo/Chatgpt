


// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const cohortChatGptIndex = pc.Index('project-chatgpt');

async function createMemory({ vectors, metadata, messageId }) {

    await cohortChatGptIndex.upsert({
        records: [
            {
                id: messageId.toString(),
                values: vectors,
                metadata: {
                    chat: metadata.chat.toString(),
                    user: metadata.user.toString(),
                    text: metadata.text
                }
            }
        ]
    });

    console.log("✅ Vector stored in Pinecone");
}


async function queryMemory({ queryVector, limit = 5, metadata }) {

    const data = await cohortChatGptIndex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true
    })

    return data.matches

}

module.exports = { createMemory, queryMemory }