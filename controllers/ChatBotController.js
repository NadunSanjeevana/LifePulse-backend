const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GoogleGenerativeAI_API_KEY);

exports.getChatbotResponse = async (req, res) => {
  const { message } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 50, // Set the maximum number of tokens for the output
      },
    });
    const result = await model.generateContent(message);
    const response = await result.response;
    const botMessage = response.text();
    res.json({ response: botMessage });
  } catch (error) {
    console.error("Error fetching chatbot response:", error);
    res.status(500).json({ error: "Failed to fetch chatbot response." });
  }
};
