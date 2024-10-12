import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyA0sXaKh5FnwiNdIYr26IVYuxQZFTtfDG0");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generate(prompt) {
    const result = await model.generateContent(prompt);
    return result.response.text();
}

export async function handleImageUpload(imageFile, prompt) {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
            const base64data = reader.result; // This will be a Data URL
            const imagePart = {
                inlineData: {
                    data: base64data.split(',')[1], // Get the base64 part
                    mimeType: imageFile.type,
                },
            };

            try {
                const result = await model.generateContent([prompt, imagePart]);
                resolve(result.response.text());
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(imageFile); // Read the file as a Data URL
    });
}
