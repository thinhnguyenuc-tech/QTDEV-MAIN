const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCXjaHN49ZQFvvry2w2l9F6RlW_ai4JtAE";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports.config = {
  name: "Kurumi",
  version: "1.0.0",
  role: 0,
  credits: "Kurumi Dev",
  description: "Trò chuyện AI như ChatGPT",
  hasPrefix: false,
  usages: "[tin nhắn]",
  cooldowns: 3,
};

module.exports.run = async function({ event, api, args }) {
  const prompt = args.join(" ") || event.body;
  if (!prompt) return api.sendMessage("Bạn muốn hỏi gì nè?", event.threadID, event.messageID);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    api.sendMessage(text, event.threadID, event.messageID);
  } catch (err) {
    console.error(err);
    api.sendMessage("Kurumi bị lỗi khi trả lời 😢", event.threadID, event.messageID);
  }
};
