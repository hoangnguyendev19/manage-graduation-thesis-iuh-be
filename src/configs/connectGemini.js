const { TaskType } = require('@google/generative-ai');
const { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const dotenv = require('dotenv');
dotenv.config();

const genAIModel = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
    title: 'Gemini-IUH',
    taskType: TaskType.RETRIEVAL_DOCUMENT,
});

const genChat = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-1.5-flash',
});

module.exports = {
    genAIModel,
    genChat,
};
