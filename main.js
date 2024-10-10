const {GoogleGenerativeAI} = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run() {
    const model = genAI.getGenerativeModel({model: "gemini-pro"});
    const prompt = "write a story of 20 words on fox";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text;
    console.log(text);
}

run()