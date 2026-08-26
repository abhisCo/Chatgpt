const { GoogleGenAI } = require("@google/genai");


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


async function generateResponse(content) {  

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: content
    })

    return response.text

}


module.exports = {
    generateResponse
}