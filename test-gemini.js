const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = "AIzaSyCoQJZF5zWx0JPI9V9Znj7FnqjMXXIBJUI";
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Note: listModels might be on the genAI instance or a specific manager depending on SDK version
        // In recent SDKs, it's often not directly exposed on the client instance in a simple way without using the model manager.
        // However, let's try a simple generation with a known older model 'gemini-pro' to see if that works at least.
        // Actually, let's try to find the list if possible.
        // The error message suggested calling ListModels.

        // Using the raw API to list models might be easier if the SDK doesn't expose it easily.
        // But let's try 'gemini-pro' first as a fallback check.

        console.log("Trying 'gemini-pro'...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const resultPro = await modelPro.generateContent("Hello");
        console.log("Success with gemini-pro!", await resultPro.response.text());

    } catch (error) {
        console.error("Error with gemini-pro:", error.message);
    }

    try {
        console.log("Trying 'gemini-1.0-pro'...");
        const model10 = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const result10 = await model10.generateContent("Hello");
        console.log("Success with gemini-1.0-pro!", await result10.response.text());
    } catch (error) {
        console.error("Error with gemini-1.0-pro:", error.message);
    }
}

listModels();
