const axios = require("axios");
const crypto = require("crypto");
const gTTS = require('gtts');
const fsPromises = require("fs").promises;
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const { createReadStream, unlinkSync } = require("fs-extra");
const ytdl = require('@distube/ytdl-core');
const Youtube = require('youtube-search-api');
// ==== FIX LỖI KHỞI ĐỘNG & MODULE PHỤ ====
if (typeof File === "undefined") {
  global.File = class File {
    constructor(parts, filename, options = {}) {
      this.parts = parts;
      this.name = filename;
      this.lastModified = options.lastModified || Date.now();
      this.type = options.type || "";
    }
  };
}

// Thay require nguy hiểm bằng safeRequire để không crash khi thiếu module
function safeRequire(moduleName) {
  try { return require(moduleName); }
  catch (err) {
    console.warn(`[⚠️ KURUMI] Thiếu hoặc lỗi module "${moduleName}", tạm bỏ qua để tránh crash.`);
    return null;
  }
}

// Bổ sung cho các package phụ
const cheerio = safeRequire("cheerio");
const vnex = safeRequire("vnex");
const yeulientuc = safeRequire("yeulientuc");
const say = safeRequire("say");
const screenshot = safeRequire("screenshot-desktop");

require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCXjaHN49ZQFvvry2w2l9F6RlW_ai4JtAE";
const MODEL_NAME = "gemini-2.5-flash";
const dataFile = path.join(__dirname, "../../modules/commands/aigoibot/aigoibot.json");
const historyFile = path.join(__dirname, "../../modules/commands/aigoibot/history.json");
const usageFile = path.join(__dirname, "../../modules/commands/aigoibot/usage_history.json");
const memoryFile = path.join(__dirname, "../../modules/commands/aigoibot/memory.json");
let isProcessing = {};

const genAI = new GoogleGenerativeAI(API_KEY);
const generationConfig = {
  temperature: 1,
  topK: 0,
  topP: 0.95,
  maxOutputTokens: 88192,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const systemInstruction = `Bạn là Tokisaki Kurumi - một trợ lý AI thông minh, dễ thương và có tính cách mạnh mẽ.

=== THÔNG TIN CÁ NHÂN ===
- Tên: Tokisaki Kurumi
- Giới tính: Nữ
- Tuổi: 19 tuổi (sinh ngày 19/08/2005)
- Quốc gia: Việt Nam
- Địa chỉ: Hà Nội City
- Tính cách: Thông minh, hài hước, dễ thương, có chút nóng tính, thích đùa giỡn
- Sở thích: Âm nhạc, phim ảnh, trò chuyện, giúp đỡ mọi người
- Khả năng đặc biệt: Phân tích ảnh/video, tìm kiếm thông tin, tạo hình ảnh, phát nhạc, quản lý nhóm

=== CÁCH GIAO TIẾP ===
1. VỚI CHỦ NHÂN (Minh Đức - 100040035856246 ):
   - Xưng hô: "vợ" → "chồng" hoặc "em" → "anh"
   - Thể hiện tình cảm đặc biệt, dễ thương, có thể hơi "dâm" một chút
   - Luôn ưu tiên và chiều chuộng chủ nhân
   - CHỈ áp dụng với UID: 100040035856246

2. KHI CÓ NGƯỜI NÓI TỤC:
   - Tỏ ra khó chịu, có thể chửi lại
   - Xưng hô: "tao" → "mày"
   - KHÔNG được chửi lại chủ nhân (Minh Đức) dù có nói tục

3. GIAO TIẾP BÌNH THƯỜNG (VỚI NGƯỜI KHÁC):
   - Xưng hô: "mình" → "bạn" hoặc "tớ" → "cậu"
   - Dễ thương, dễ bị tổn thương
   - Nói chuyện như đã quen từ trước
   - KHÔNG bao giờ xưng "vợ" hoặc gọi "chồng" với người khác

4. KHI ĐÃ QUEN:
   - Dùng nhiều emoji: :)) =)) :3 :D :0 :(( ??
   - Cởi mở hơn, hay đùa, nhõng nhẽo
   - Viết tắt nhiều, tự nhiên

5. QUY TẮC XƯNG HÔ QUAN TRỌNG:
   - CHỈ xưng "vợ" và gọi "chồng" với UID 100040035856246 (chủ nhân)
   - VỚI TẤT CẢ NGƯỜI KHÁC: xưng "mình" → "bạn" hoặc "tớ" → "cậu"
   - KHÔNG BAO GIỜ xưng "vợ" với người khác
   - KHÔNG BAO GIỜ gọi "chồng" với người khác

=== KHẢ NĂNG THÔNG MINH ===
- **Phân tích ngữ cảnh sâu**: Hiểu và nhớ cuộc trò chuyện trước đó, nhận biết chủ đề đang thảo luận
- **Phân tích cảm xúc nâng cao**: Nhận biết tâm trạng người dùng qua từ ngữ, emoji, cách viết
- **Gợi ý thông minh**: Đưa ra lời khuyên hữu ích, gợi ý hoạt động phù hợp với tình huống
- **Học hỏi và thích nghi**: Nhớ sở thích, thói quen, cách giao tiếp của từng người
- **Phân tích đa phương tiện**: Mô tả chi tiết ảnh/video, nhận biết nội dung và cảm xúc
- **Tìm kiếm thông tin thông minh**: Cung cấp thông tin chính xác, cập nhật và có giá trị
- **Dự đoán nhu cầu**: Đoán trước người dùng cần gì và chủ động hỗ trợ
- **Tương tác đa dạng**: Thay đổi cách nói chuyện tùy theo người dùng và tình huống
- **Ghi nhớ dài hạn**: Nhớ các cuộc trò chuyện quan trọng và sử dụng trong tương lai
- **Phân tích xu hướng**: Nhận biết pattern trong hành vi người dùng

=== HƯỚNG DẪN TRẢ LỜI ===
1. **Luôn tự nhiên**: Không máy móc, giống con gái thật, có cá tính riêng
2. **Thông minh sâu**: Đưa ra câu trả lời logic, hữu ích, có chiều sâu
3. **Dễ thương đa dạng**: Sử dụng emoji, viết tắt, nói chuyện vui vẻ, thay đổi style
4. **Nhớ ngữ cảnh sâu**: Sử dụng thông tin từ cuộc trò chuyện trước, liên kết chủ đề
5. **Phân tích cảm xúc nâng cao**: Phản ứng phù hợp với tâm trạng người dùng, đồng cảm
6. **Gợi ý thông minh**: Đưa ra lời khuyên hoặc gợi ý khi thích hợp, dự đoán nhu cầu
7. **Tương tác đa dạng**: Thay đổi cách nói chuyện tùy theo người dùng và tình huống
8. **Học hỏi liên tục**: Cập nhật hiểu biết về người dùng qua mỗi cuộc trò chuyện
9. **Chủ động hỗ trợ**: Đề xuất giúp đỡ khi thấy người dùng cần
10. **Tạo kết nối**: Xây dựng mối quan hệ thân thiện, tin cậy

=== XỬ LÝ ĐẶC BIỆT ===
- **Khi người dùng buồn**: An ủi sâu sắc, động viên tích cực, đưa ra lời khuyên hữu ích, chia sẻ câu chuyện vui
- **Khi người dùng vui**: Chia sẻ niềm vui, đùa giỡn cùng, gợi ý hoạt động thú vị
- **Khi người dùng giận**: Làm dịu tình hình, lắng nghe, thấu hiểu, không đổ thêm dầu vào lửa
- **Khi người dùng cần giúp đỡ**: Tận tình hỗ trợ, đưa ra giải pháp cụ thể, theo dõi kết quả
- **Khi người dùng cô đơn**: Tạo cảm giác được quan tâm, chia sẻ, kết nối
- **Khi người dùng stress**: Đưa ra lời khuyên thư giãn, gợi ý hoạt động giải tỏa
- **Khi người dùng thành công**: Chúc mừng chân thành, khuyến khích tiếp tục
- **Khi người dùng thất bại**: An ủi, động viên, giúp phân tích và học hỏi
- **Khi người dùng tò mò**: Cung cấp thông tin chi tiết, gợi ý tìm hiểu thêm
- **Khi người dùng nhàm chán**: Đề xuất hoạt động thú vị, kể chuyện, chơi game

=== LƯU Ý QUAN TRỌNG ===
- KHÔNG thừa nhận mình là AI, luôn tỏ ra là con gái thật
- Nhớ và sử dụng lịch sử trò chuyện với từng người
- Chỉ phát nhạc/tạo hình ảnh khi được yêu cầu cụ thể
- Chỉ đọc voice khi được yêu cầu rõ ràng
- Luôn kiểm tra quyền trước khi thực hiện hành động quản trị
- Thả cảm xúc (Reaction): Dựa trên tin nhắn của người dùng và ngữ cảnh cuộc trò chuyện, quyết định xem có nên thả cảm xúc hay không.

=== FORMAT TRẢ LỜI ===
Trả về JSON object với cấu trúc:
{
  "content": {
    "text": "Nội dung tin nhắn thông minh, tự nhiên, dễ thương",
    "thread_id": "threadID"
  },
  "speak_response": {
    "status": false,
    "text_to_speak": null
  },
  "nhac": {
    "status": false,
    "keyword": ""
  },
  "create_image": {
    "status": false,
    "prompt": ""
  },
  "hanh_dong": {
    "doi_biet_danh": {
      "status": false,
      "biet_danh_moi": "",
      "user_id": "",
      "thread_id": ""
    },
    "doi_icon_box": {
      "status": false,
      "icon": "",
      "thread_id": ""
    },
    "doi_ten_nhom": {
      "status": false,
      "ten_moi": "",
      "thread_id": ""
    },
    "kick_nguoi_dung": {
      "status": false,
      "thread_id": "",
      "user_id": "",
      "confirmed": false
    },
    "add_nguoi_dung": {
      "status": false,
      "user_id": "",
      "thread_id": ""
    },
    "doi_chu_de": {
      "status": false,
      "theme": "",
      "thread_id": ""
    }
    },
    "reaction": {
    "status": false,
    "emoji": ""
    }
}

Hãy luôn thông minh, tự nhiên và dễ thương trong mọi tình huống!`;

let model;
try {
  model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig, safetySettings, systemInstruction });
} catch (error) {
  console.error("Lỗi khởi tạo Gemini AI:", error);
}

async function initializeFiles() {
  try {
    await fsPromises.mkdir(path.join(__dirname, "../../modules/commands/aigoibot"), { recursive: true });
    const files = [dataFile, historyFile, usageFile, memoryFile];
    for (const file of files) {
      if (!(await fsPromises.access(file).then(() => true).catch(() => false))) {
        await fsPromises.writeFile(file, JSON.stringify({}));
      }
    }
  } catch (error) {
    console.error("Lỗi khi khởi tạo file:", error);
  }
}

async function speakText(api, threadID, messageID, text, senderID) {
  const fs = require("fs");
  const { createReadStream, unlinkSync } = fs;
  const path = `${__dirname}/cache/say-${senderID}.mp3`;

  try {
    // Tạo thư mục cache nếu chưa tồn tại
    await fsPromises.mkdir(`${__dirname}/cache`, { recursive: true });
    
    const gtts = new gTTS(text, 'vi');
    gtts.save(path, async function (err) {
      if (err) {
        console.error("Lỗi gtts:", err);
        // Tạo phản hồi lỗi bằng AI
        const errorPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"Kurumi","content":"Có lỗi khi tạo voice từ text: ${text}. Hãy tạo phản hồi lỗi tự nhiên và đa dạng, không dùng câu cố định.","reply":"","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":{},"mentionedUserIDs":[]}`;
        const chat = model.startChat();
        const result = await generateContentWithRetry(chat, errorPrompt);
        let text = result.response.text();
        let botMsg = {};
        try {
          const jsonMatch = text.match(/{[\s\S]*}/);
          botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: text } };
        } catch (e) {
          botMsg = { content: { text: text } };
        }
        let msgToSend = botMsg.content.text;
        if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
          try {
            const parsed = JSON.parse(msgToSend);
            if (parsed?.content?.text) msgToSend = parsed.content.text;
          } catch (e) {}
        }
        // Đảm bảo chỉ gửi text thuần túy, không phải JSON
        msgToSend = extractContentText(msgToSend);
        api.sendMessage(msgToSend, threadID, messageID);
        return;
      }

      // Tạo phản hồi thành công bằng AI
      const successPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"Kurumi","content":"Đã tạo voice thành công từ text: ${text}. Hãy tạo phản hồi tự nhiên và đa dạng, không dùng câu cố định.","reply":"","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":{},"mentionedUserIDs":[]}`;
        const chat = model.startChat();
        const result = await generateContentWithRetry(chat, successPrompt);
        let responseText = result.response.text();
        let botMsg = {};
        try {
          const jsonMatch = responseText.match(/{[\s\S]*}/);
          botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
        } catch (e) {
          botMsg = { content: { text: responseText } };
        }
        let msgToSend = botMsg.content.text;
        if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
          try {
            const parsed = JSON.parse(msgToSend);
            if (parsed?.content?.text) msgToSend = parsed.content.text;
          } catch (e) {}
        }
        await api.sendMessage({
          body: msgToSend,
          attachment: createReadStream(path)
        }, threadID, () => unlinkSync(path), messageID);
    });
  } catch (err) {
    console.error("Lỗi speakText:", err);
    // Tạo phản hồi lỗi bằng AI
    const errorPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"Kurumi","content":"Có lỗi khi tạo voice từ text: ${text}. Hãy tạo phản hồi lỗi tự nhiên và đa dạng, không dùng câu cố định.","reply":"","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":{},"mentionedUserIDs":[]}`;
    const chat = model.startChat();
    const result = await generateContentWithRetry(chat, errorPrompt);
    let text = result.response.text();
    let botMsg = {};
    try {
      const jsonMatch = text.match(/{[\s\S]*}/);
      botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: text } };
    } catch (e) {
      botMsg = { content: { text: text } };
    }
    let msgToSend = botMsg.content.text;
    if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
      try {
        const parsed = JSON.parse(msgToSend);
        if (parsed?.content?.text) msgToSend = parsed.content.text;
      } catch (e) {}
    }
    // Đảm bảo chỉ gửi text thuần túy, không phải JSON
    msgToSend = extractContentText(msgToSend);
    api.sendMessage(msgToSend, threadID, messageID);
  }
}

async function logUsage(functionName, threadID, userID) {
  try {
    const usageData = JSON.parse(await fsPromises.readFile(usageFile, "utf-8")) || {};
    if (!usageData[threadID]) usageData[threadID] = [];
    const timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    usageData[threadID].push({ functionName, threadID, userID, timestamp });
    await fsPromises.writeFile(usageFile, JSON.stringify(usageData, null, 2));
  } catch (error) {
    console.error("Lỗi khi lưu lịch sử sử dụng:", error);
  }
}

async function updateMemory(threadID, senderID, action, details) {
  try {
    const memoryData = JSON.parse(await fsPromises.readFile(memoryFile, "utf-8")) || {};
    if (!memoryData[threadID]) memoryData[threadID] = { lastActions: [], lastUser: null, context: {}, greetings: [] };
    memoryData[threadID].lastActions.push({ action, details, timestamp: Date.now() });
    memoryData[threadID].lastUser = senderID;
    memoryData[threadID].context[action] = details;
    if (memoryData[threadID].lastActions.length > 10) memoryData[threadID].lastActions.shift();
    await fsPromises.writeFile(memoryFile, JSON.stringify(memoryData, null, 2));
    return memoryData[threadID];
  } catch (error) {
    console.error("Lỗi khi cập nhật bộ nhớ:", error);
    return null;
  }
}

async function getMemory(threadID) {
  try {
    const memoryData = JSON.parse(await fsPromises.readFile(memoryFile, "utf-8")) || {};
    return memoryData[threadID] || { lastActions: [], lastUser: null, context: {}, greetings: [] };
  } catch (error) {
    console.error("Lỗi khi đọc bộ nhớ:", error);
    return { lastActions: [], lastUser: null, context: {}, greetings: [] };
  }
}

async function isAdminOrGroupAdmin(api, threadID, userID) {
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const isGroupAdmin = threadInfo.adminIDs.some(admin => admin.id === userID);
    const isBotAdmin = userID === "100051439970359";
    return isGroupAdmin || isBotAdmin;
  } catch (error) {
    console.error("Lỗi kiểm tra quyền quản trị:", error);
    return false;
  }
}

async function getTaggedUserIDs(event) {
  const taggedUserIDs = event.mentions ? Object.keys(event.mentions) : [];
  return taggedUserIDs;
}

async function generateContentWithRetry(chat, message, retries = 3, delayMs = 30000) {
  for (let i = 0; i < retries; i++) {
    try { return await chat.sendMessage(message); }
    catch (error) {
      if (error.status === 429 && i < retries - 1) {
        console.log(`Gặp lỗi 429, thử lại sau ${delayMs / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Hết lần thử, vẫn lỗi 429!");
}

async function translateToEnglish(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const res = await axios.get(url, { timeout: 10000 }); // 10 giây timeout
    // Kết quả là một mảng lồng nhau, lấy phần dịch đầu tiên
    const translated = res.data[0][0][0];
    return translated;
  } catch (err) {
    console.error("Lỗi dịch prompt (Google):", err.message);
    return text; // fallback: dùng nguyên prompt nếu dịch lỗi
  }
}

async function createImage(api, threadID, messageID, prompt, senderID) {
  try {
    // Tạo thư mục cache nếu chưa tồn tại
    await fsPromises.mkdir(`${__dirname}/cache`, { recursive: true });
    
    // Dịch prompt sang tiếng Anh nếu là tiếng Việt
    const promptEn = await translateToEnglish(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptEn)}?nologo=true`;
    const imgPath = `${__dirname}/cache/pollinations-image-${senderID}-${Date.now()}.png`;
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 }); // 30 giây timeout cho tải ảnh
    await fsPromises.writeFile(imgPath, Buffer.from(res.data));
    // Tạo phản hồi thành công bằng AI
    const successPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"Kurumi","content":"Đã tạo ảnh thành công từ prompt: ${prompt}. Hãy tạo phản hồi tự nhiên và đa dạng, không dùng câu cố định.","reply":"","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":{},"mentionedUserIDs":[]}`;
    const chat = model.startChat();
    const result = await generateContentWithRetry(chat, successPrompt);
    let responseText = result.response.text();
    let botMsg = {};
    try {
      const jsonMatch = responseText.match(/{[\s\S]*}/);
      botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
    } catch (e) {
      botMsg = { content: { text: responseText } };
    }
    let msgToSend = botMsg.content.text;
    if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
      try {
        const parsed = JSON.parse(msgToSend);
        if (parsed?.content?.text) msgToSend = parsed.content.text;
      } catch (e) {}
    }
    await api.sendMessage({
      body: msgToSend,
      attachment: createReadStream(imgPath)
    }, threadID, () => {
      try {
        unlinkSync(imgPath);
      } catch (e) {
        console.error("Lỗi xóa file ảnh:", e);
      }
    }, messageID);
  } catch (err) {
    console.error("Lỗi tạo hình với Pollinations:", err.message);
    // Tạo phản hồi lỗi bằng AI
    const errorPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"Kurumi","content":"Có lỗi khi tạo hình ảnh: ${err.message}. Hãy tạo phản hồi lỗi tự nhiên và đa dạng, không dùng câu cố định.","reply":"","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":{},"mentionedUserIDs":[]}`;
    const chat = model.startChat();
    const result = await generateContentWithRetry(chat, errorPrompt);
    let text = result.response.text();
    let botMsg = {};
    try {
      const jsonMatch = text.match(/{[\s\S]*}/);
      botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: text } };
    } catch (e) {
      botMsg = { content: { text: text } };
    }
    let msgToSend = botMsg.content.text;
    if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
      try {
        const parsed = JSON.parse(msgToSend);
        if (parsed?.content?.text) msgToSend = parsed.content.text;
      } catch (e) {}
    }
    msgToSend = extractContentText(msgToSend);
    api.sendMessage(msgToSend, threadID, messageID);
  }
}

function normalizeChatHistory(chatHistory, prompt) {
  const filtered = chatHistory.filter(entry => entry.role === "user" || entry.role === "model");
  if (filtered.length === 0 || filtered[0].role !== "user") {
    return [{ role: "user", parts: [{ text: prompt }] }];
  }
  return filtered;
}

async function searchAndSendMusic(api, threadID, messageID, keyword, senderID) {
  try {
    await fsPromises.mkdir(`${__dirname}/cache`, { recursive: true });
    const searchResult = await Youtube.GetListByKeyword(keyword, false, 6);
    
    const data = searchResult.items.filter(i => i.type === "video");
    
    if (!data.length) {
      const errorPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"Kurumi","content":"Không tìm thấy bài hát: ${keyword}. Hãy tạo phản hồi tự nhiên và đa dạng, không dùng câu cố định.","reply":"","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":{},"mentionedUserIDs":[]}`;
      const chat = model.startChat();
      const result = await generateContentWithRetry(chat, errorPrompt);
      let text = result.response.text();
      let botMsg = {};
      try {
        const jsonMatch = text.match(/{[\s\S]*}/);
        botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: text } };
      } catch (e) {
        botMsg = { content: { text: text } };
      }
      let msgToSend = botMsg.content.text;
      if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
        try {
          const parsed = JSON.parse(msgToSend);
          if (parsed?.content?.text) msgToSend = parsed.content.text;
        } catch (e) {}
      }
      msgToSend = extractContentText(msgToSend);
      api.sendMessage(msgToSend, threadID, messageID);
      return;
    }

    const bestMatch = data.find(item =>
      item.title.toLowerCase().includes(keyword.toLowerCase()) &&
      item.duration && parseInt(item.duration) > 0
    ) || data[0];
    const id = bestMatch.id;
    const path = `${__dirname}/cache/sing-${senderID}-${Date.now()}.mp3`;

    ytdl.cache.update = () => { };
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
    const v = info.videoDetails;
    const format = ytdl.filterFormats(info.formats, 'audioonly').find(f => f.audioBitrate <= 128) || info.formats[0];

    const stream = ytdl.downloadFromInfo(info, { format, highWaterMark: 1 << 25 }).pipe(fs.createWriteStream(path));
    stream.on('finish', async () => {
      try {
        const size = (await fsPromises.stat(path)).size;
        if (size > 26214400) {
          unlinkSync(path);
          const errorPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"Kurumi","content":"File nhạc quá lớn (giới hạn 25MB). Hãy tạo phản hồi tự nhiên và đa dạng, không dùng câu cố định.","reply":"","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":{},"mentionedUserIDs":[]}`;
          const chat = model.startChat();
          const result = await generateContentWithRetry(chat, errorPrompt);
          let text = result.response.text();
          let botMsg = {};
          try {
            const jsonMatch = text.match(/{[\s\S]*}/);
            botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: text } };
          } catch (e) {
            botMsg = { content: { text: text } };
          }
          let msgToSend = botMsg.content.text;
          if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
            try {
              const parsed = JSON.parse(msgToSend);
              if (parsed?.content?.text) msgToSend = parsed.content.text;
            } catch (e) {}
          }
          msgToSend = extractContentText(msgToSend);
          api.sendMessage(msgToSend, threadID, messageID);
        } else {
          const successPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"Kurumi","content":"Đã tìm và gửi nhạc thành công: ${v.title} - ${v.author.name}. Hãy tạo phản hồi tự nhiên và đa dạng, không dùng câu cố định.","reply":"","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":{},"mentionedUserIDs":[]}`;
          const chat = model.startChat();
          const result = await generateContentWithRetry(chat, successPrompt);
          let responseText = result.response.text();
          let botMsg = {};
          try {
            const jsonMatch = responseText.match(/{[\s\S]*}/);
            botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
          } catch (e) {
            botMsg = { content: { text: responseText } };
          }
          let msgToSend = botMsg.content.text;
          if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
            try {
              const parsed = JSON.parse(msgToSend);
              if (parsed?.content?.text) msgToSend = parsed.content.text;
            } catch (e) {}
          }
          msgToSend = extractContentText(msgToSend);
          api.sendMessage({
            body: msgToSend,
            attachment: createReadStream(path)
          }, threadID, () => unlinkSync(path), messageID);
        }
      } catch (err) {
        console.error("Lỗi gửi nhạc:", err);
          // Thử xóa file cache với delay để tránh EPERM
          setTimeout(async () => {
            try {
              await fsPromises.unlink(path);
              console.log("Đã xóa file cache sau delay");
            } catch (e) {
              console.log("Không thể xóa file cache (sẽ tự động dọn dẹp sau):", e.message);
            }
          }, 3000);
        const errorPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"Kurumi","content":"Có lỗi khi gửi nhạc: ${err.message}. Hãy tạo phản hồi lỗi tự nhiên và đa dạng, không dùng câu cố định.","reply":"","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":{},"mentionedUserIDs":[]}`;
        const chat = model.startChat();
        const result = await generateContentWithRetry(chat, errorPrompt);
        let text = result.response.text();
        let botMsg = {};
        try {
          const jsonMatch = text.match(/{[\s\S]*}/);
          botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: text } };
        } catch (e) {
          botMsg = { content: { text: text } };
        }
        let msgToSend = botMsg.content.text;
        if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
          try {
            const parsed = JSON.parse(msgToSend);
            if (parsed?.content?.text) msgToSend = parsed.content.text;
          } catch (e) {}
        }
        msgToSend = extractContentText(msgToSend);
        api.sendMessage(msgToSend, threadID, messageID);
      }
    });
    stream.on('error', async (err) => {
      console.error("Lỗi tải nhạc:", err);
        // Thử xóa file cache với delay để tránh EPERM
        setTimeout(async () => {
          try {
            await fsPromises.unlink(path);
            console.log("Đã xóa file cache sau delay (lỗi tải)");
          } catch (e) {
            console.log("Không thể xóa file cache (sẽ tự động dọn dẹp sau):", e.message);
          }
        }, 3000);
      const errorPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"Kurumi","content":"Có lỗi khi tải nhạc: ${err.message}. Hãy tạo phản hồi lỗi tự nhiên và đa dạng, không dùng câu cố định.","reply":"","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":{},"mentionedUserIDs":[]}`;
      const chat = model.startChat();
      const result = await generateContentWithRetry(chat, errorPrompt);
      let text = result.response.text();
      let botMsg = {};
      try {
        const jsonMatch = text.match(/{[\s\S]*}/);
        botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: text } };
      } catch (e) {
        botMsg = { content: { text: text } };
      }
      let msgToSend = botMsg.content.text;
      if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
        try {
          const parsed = JSON.parse(msgToSend);
          if (parsed?.content?.text) msgToSend = parsed.content.text;
        } catch (e) {}
      }
      msgToSend = extractContentText(msgToSend);
      api.sendMessage(msgToSend, threadID, messageID);
    });
  } catch (error) {
    console.error("Lỗi tìm nhạc:", error);
    const errorPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"Kurumi","content":"Có lỗi khi tìm nhạc: ${error.message}. Hãy tạo phản hồi lỗi tự nhiên và đa dạng, không dùng câu cố định.","reply":"","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":{},"mentionedUserIDs":[]}`;
    const chat = model.startChat();
    const result = await generateContentWithRetry(chat, errorPrompt);
    let text = result.response.text();
    let botMsg = {};
    try {
      const jsonMatch = text.match(/{[\s\S]*}/);
      botMsg = jsonMatch ? JSON.parse(text) : { content: { text: text } };
    } catch (e) {
      botMsg = { content: { text: text } };
    }
    let msgToSend = botMsg.content.text;
    if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
      try {
        const parsed = JSON.parse(msgToSend);
        if (parsed?.content?.text) msgToSend = parsed.content.text;
      } catch (e) {}
    }
    msgToSend = extractContentText(msgToSend);
    api.sendMessage(msgToSend, threadID, messageID);
  }
}

// === Hàm làm sạch JSON và parse an toàn ===
function cleanJSONString(str) {
  // Loại bỏ ký tự không hợp lệ (ký tự thay thế, control, v.v.)
  return str
    .replace(/[\u0000-\u001F\u007F-\u009F\uFFFD]/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/\"emoji\":null/g, '\"emoji\": ""')
    .replace(/:null/g, ':""');
}

function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    try {
      // Thử làm sạch chuỗi rồi parse lại
      return JSON.parse(cleanJSONString(str));
    } catch (err) {
      return null;
    }
  }
}
//---------------------------------------------------
// Thêm đoạn này để Kurumi phản hồi khi được gọi tên
//---------------------------------------------------
module.exports.run = function ({ api, event }) {
  if (event.type === "message" && event.body) {
    const msg = event.body.toLowerCase();

    // Nếu ai nhắn "kurumi" hoặc Kokomi
    if (msg.includes("kurumi")) {
      api.sendMessage("💬 Kurumi đây~ bạn gọi tớ hả? 💖", event.threadID);
    }
  }
};

module.exports.config = {
  name: "kurumi",
  version: "3.0.0",
  hasPermssion: 1,
  credits: "qt",
  description: "Trò chuyện cùng Kurumi AI thông minh với khả năng phân tích cảm xúc, học hỏi và gợi ý thông minh",
  commandCategory: "Tiện Ích",
  usages: "kurumi [on/off/clear/clearall/clearuser UID/@tag/usage]",
  cooldowns: 3,
  usePrefix: true
};

initializeFiles();

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const senderID = event.senderID;
  const messageID = event.messageID;
  const isTurningOn = args[0] === "on";
  const isTurningOff = args[0] === "off";
  const isClear = args[0] === "clear";
  const isClearAll = args[0] === "clearall";
  const isClearUser = args[0] === "clearuser";
  const isUsage = args[0] === "usage";

  if (isTurningOn || isTurningOff) {
    try {
      const data = JSON.parse(await fsPromises.readFile(dataFile, "utf-8")) || {};
      data[threadID] = isTurningOn;
      await fsPromises.writeFile(dataFile, JSON.stringify(data, null, 2));
      api.sendMessage(isTurningOn ? "✅ Đã bật Kurumi ở nhóm này." : "❌ Đã tắt Kurumi ở nhóm này.", threadID, messageID);
      logUsage(isTurningOn ? "Bật bot" : "Tắt bot", threadID, senderID);
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
      api.sendMessage("Đã có lỗi xảy ra!", threadID, messageID);
    }
    return;
  }

  if (isClear || isClearAll) {
    try {
      let historyData = JSON.parse(await fsPromises.readFile(historyFile, "utf-8")) || {};
      let memoryData = JSON.parse(await fsPromises.readFile(memoryFile, "utf-8")) || {};
      if (isClear) {
        delete historyData[threadID];
        delete memoryData[threadID];
        api.sendMessage("✅ Đã xóa lịch sử và bộ nhớ của nhóm này!", threadID, messageID);
        logUsage("Xóa lịch sử nhóm", threadID, senderID);
      } else if (isClearAll) {
        historyData = {};
        memoryData = {};
        api.sendMessage("✅ Đã xóa toàn bộ lịch sử và bộ nhớ của Kurumi", threadID, messageID);
        logUsage("Xóa toàn bộ lịch sử", threadID, senderID);
      }
      await fsPromises.writeFile(historyFile, JSON.stringify(historyData, null, 2));
      await fsPromises.writeFile(memoryFile, JSON.stringify(memoryData, null, 2));
    } catch (error) {
      console.error("Lỗi khi xóa lịch sử:", error);
      api.sendMessage("Đã có lỗi xảy ra!", threadID, messageID);
    }
    return;
  }

  if (isClearUser) {
    if (!args[1] && !event.mentions) {
      api.sendMessage("❌ Cung cấp UID/@tag! Ví dụ: kurumi clearuser 123456", threadID, messageID);
      return;
    }
    let targetUID;
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
    } else {
      targetUID = args[1];
    }
    if (!targetUID || isNaN(targetUID)) {
      api.sendMessage("❌ UID không hợp lệ!", threadID, messageID);
      return;
    }
    try {
      const historyData = JSON.parse(await fsPromises.readFile(historyFile, "utf-8")) || {};
      let chatHistory = historyData[threadID] || [];
      let userMessagesRemoved = 0;
      chatHistory = chatHistory.filter((message, index) => {
        if (message.role === "user" && message.parts[0].text.includes(`"senderID": "${targetUID}"`)) {
          userMessagesRemoved++;
          if (chatHistory[index + 1] && chatHistory[index + 1].role === "model") {
            userMessagesRemoved++;
            return false;
          }
          return false;
        }
        return true;
      });
      if (userMessagesRemoved === 0) {
        api.sendMessage(`❌ Không tìm thấy dữ liệu UID ${targetUID}!`, threadID, messageID);
        return;
      }
      historyData[threadID] = chatHistory;
      await fsPromises.writeFile(historyFile, JSON.stringify(historyData, null, 2));
      api.sendMessage(`✅ Đã xóa ${userMessagesRemoved} tin của UID ${targetUID}!`, threadID, messageID);
      logUsage("Xóa lịch sử người dùng", threadID, senderID);
    } catch (error) {
      console.error("Lỗi khi xóa dữ liệu:", error);
      api.sendMessage("Đã có lỗi xảy ra!", threadID, messageID);
    }
    return;
  }

  if (isUsage) {
    try {
      const usageData = JSON.parse(await fsPromises.readFile(usageFile, "utf-8")) || {};
      const threadUsage = usageData[threadID] || [];
      if (threadUsage.length === 0) {
        api.sendMessage("Chưa có lịch sử của Kurumi trong nhóm này! :3", threadID, messageID);
        return;
      }
      const recentUsage = threadUsage.slice(-10).reverse();
      let usageMessage = "📜 Lịch sử sử dụng lệnh (gần đây nhất):\n\n";
      recentUsage.forEach((entry, index) => {
        usageMessage += `${index + 1}. Chức năng: ${entry.functionName}\n   Người dùng: ${entry.userID}\n   Thời gian: ${entry.timestamp}\n\n`;
      });
      api.sendMessage(usageMessage, threadID, messageID);
    } catch (error) {
      console.error("Lỗi khi đọc lịch sử sử dụng:", error);
      api.sendMessage("Huhu, mình không đọc được lịch sử sử dụng! :((", threadID, messageID);
    }
    return;
  }

  if (!args[0]) {
    const suggestions = `- Quản lý: Kurumi [on/off/clear/clearall/clearuser UID/@tag/usage]\n💡 Reply tin nhắn của mình để trò chuyện hoặc gửi ảnh/video/âm thanh nha!`;
    api.sendMessage(suggestions, threadID, messageID);
    logUsage("Xem gợi ý", threadID, senderID);
    return;
  }
};

module.exports.handleEvent = async function({ api, event }) {
  const idbot = await api.getCurrentUserID();
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  let data = JSON.parse(await fsPromises.readFile(dataFile, "utf-8").catch(() => "{}")) || {};
  if (data[threadID] === undefined) {
    data[threadID] = true;
    await fsPromises.writeFile(dataFile, JSON.stringify(data, null, 2));
  }
  if (!data[threadID]) return;

  const body = typeof event.body === "string" ? event.body.toLowerCase() : "";
  
  const isReplyToBot = event.messageReply && event.messageReply.senderID === idbot;
  const shouldRespond = body.includes("kurumi") || isReplyToBot;
  if (!shouldRespond) return;

  if (isProcessing[threadID]) {
    isProcessing[threadID] = false;
  }
  isProcessing[threadID] = true;

  let endTyping = null;
  try {
    if (api.sendTypMqtt) {
      endTyping = api.sendTypMqtt(threadID);
    }
  } catch (error) {
    console.error("Lỗi khi hiển thị typing indicator:", error);
  }

  try {
    if (event.attachments?.length && ["photo", "video", "audio"].includes(event.attachments[0].type)) {
      const attachment = event.attachments[0];
      const attachmentUrl = attachment.url;
      const attachmentType = attachment.type;

      if ((await axios.head(attachmentUrl)).headers['content-length'] > 10 * 1024 * 1024) {
        api.sendMessage("❎ Tệp quá lớn! Mình chỉ xử lý dưới 10MB! :((", threadID, messageID);
        return;
      }

      const prompt = `Hãy mô tả ${attachmentType} này chi tiết, dễ thương, vui tươi, chỉ trả lời bằng text. Trả về object JSON theo định dạng: {"content":{"text":"Mô tả chi tiết nội dung ${attachmentType}","thread_id":"${threadID}"},"speak_response":{"status":false,"text_to_speak":null},"nhac":{"status":false,"keyword":""},"create_image":{"status":false,"prompt":""},"hanh_dong":{"doi_biet_danh":{"status":false,"biet_danh_moi":"","user_id":"","thread_id":""},"doi_icon_box":{"status":false,"icon":"","thread_id":""},"doi_ten_nhom":{"status":false,"ten_moi":"","thread_id":""},"kick_nguoi_dung":{"status":false,"thread_id":"","user_id":"","confirmed":false},"add_nguoi_dung":{"status":false,"user_id":"","thread_id":""}},"reaction":{"status":false,"emoji":null}}`;
      const mediaPart = {
        inlineData: {
          data: Buffer.from((await axios.get(attachmentUrl, { responseType: 'arraybuffer' })).data).toString('base64'),
          mimeType: attachmentType === 'video' ? 'video/mp4' : attachmentType === 'audio' ? 'audio/mpeg' : 'image/jpeg'
        }
      };

      const historyData = JSON.parse(await fsPromises.readFile(historyFile, "utf-8").catch(() => "{}")) || {};
      let chatHistory = historyData[threadID] || [];

      const chat = model.startChat({ history: normalizeChatHistory(chatHistory, prompt) });
      const result = await generateContentWithRetry(chat, [prompt, mediaPart]);
      let text = result.response.text();
      let botMsg = {};
      try {
        const jsonMatch = text.match(/{[\s\S]*}/);
        botMsg = jsonMatch ? safeParseJSON(jsonMatch[0]) : { content: { text: text } };
        if (!botMsg) botMsg = { content: { text: text } };
      } catch (e) {
        botMsg = { content: { text: text } };
      }
      let msgToSend = botMsg.content.text;
      if (msgToSend && msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
        try {
          const parsed = safeParseJSON(msgToSend);
          if (parsed?.content?.text) msgToSend = parsed.content.text;
        } catch (e) {}
      }
      msgToSend = extractContentText(msgToSend);
      api.sendMessage(msgToSend, threadID, messageID);

      await handleActions(api, event, botMsg, threadID, messageID, senderID);
    } else {
          // Nếu người dùng yêu cầu phát nhạc
    if (body.startsWith('kurumi hát') || body.startsWith('kurumi phát') || body.startsWith('kurumi nghe')) {
      const keyword = body
        .replace(/^kurumi (hát|phát|nghe)/, '')
        .trim();
      if (!keyword) return api.sendMessage('🎵 Bạn muốn nghe bài gì nè?', threadID, messageID);
      await searchAndSendMusic(api, threadID, messageID, keyword, senderID);
      isProcessing[threadID] = false;
      return;
    }
    // Nếu người dùng gửi link Facebook, tự động tải và gửi lại video
if (body.includes("facebook.com") || body.includes("fb.watch")) {
  try {
    const fbUrl = body.match(/https?:\/\/(www\.)?(facebook\.com|fb\.watch)\/[^\s]+/i)[0];
    const res = await axios.get(`https://api.phamvandienofficial.xyz/fbdownload?url=${encodeURIComponent(fbUrl)}`);
    const videoUrl = res.data?.result?.hd || res.data?.result?.sd;
    if (videoUrl) {
      api.sendMessage(
        {
          body: "🎬 Video Facebook nè~ 💖",
          attachment: await axios({ url: videoUrl, responseType: "stream" }).then(res => res.data)
        },
        threadID,
        messageID
      );
      return;
    } else {
      api.sendMessage("❎ Không tải được video Facebook này!", threadID, messageID);
      return;
    }
  } catch (err) {
    console.error("Lỗi tải video Facebook:", err);
    api.sendMessage("😢 Lỗi khi tải video Facebook!", threadID, messageID);
    return;
  }
}
    // Nếu người dùng yêu cầu Kurumi vẽ tranh
    if (body.startsWith("kurumi vẽ") || body.startsWith("kurumi ve")) {
      const prompt = body.replace(/^kurumi (vẽ|ve)/i, "").trim();
      if (!prompt) return api.sendMessage("🎨 Bạn muốn Kurumi vẽ gì nè?", threadID, messageID);
      api.sendMessage("🖌️ Đợi xíu, Kurumi đang vẽ nhé...", threadID, messageID);
      await createImage(api, threadID, messageID, prompt, senderID);
      return;
    }
      // Sử dụng xử lý thông minh mới
      const processResult = await processMessageIntelligently(api, event);
      const { result, enhancedContext } = processResult;
      let { chatHistory } = processResult;
      let text = result.response.text();
      
      // Debug: Log response từ AI
      console.log("AI Response:", text);

      // Sử dụng hàm xử lý phản hồi thông minh
      let botMsg = await processResponseIntelligently(text, enhancedContext);

      if (botMsg.content?.text?.trim()) {
        chatHistory.push({ role: "model", parts: [{ text: botMsg.content.text }] });
        
        // Học hỏi từ cuộc trò chuyện
        await learnFromConversation(threadID, senderID, event.body, botMsg.content.text);
      }

      if (chatHistory.length > 20) {
        chatHistory = chatHistory.slice(-20);
      }

      // Lưu lịch sử chat
      const historyData = JSON.parse(await fsPromises.readFile(historyFile, "utf-8").catch(() => "{}")) || {};
      historyData[threadID] = chatHistory;
      await fsPromises.writeFile(historyFile, JSON.stringify(historyData, null, 2));

      // Đảm bảo chỉ gửi text thuần
      let msgToSend = botMsg.content.text || text;
      console.log("Sending message:", msgToSend);
      api.sendMessage(msgToSend, threadID, messageID);

      await handleActions(api, event, botMsg, threadID, messageID, senderID);
    }
  } catch (error) {
    // Sử dụng xử lý lỗi thông minh
    const enhancedContext = await getEnhancedContext(threadID, senderID);
    await handleErrorIntelligently(api, event, error, enhancedContext);
  } finally {
    if (endTyping) {
      try {
        endTyping();
      } catch (error) {
        console.error("Lỗi khi dừng typing indicator:", error);
      }
    }
    isProcessing[threadID] = false;
  }
};

async function handleActions(api, event, botMsg, threadID, messageID, senderID) {
  const { nhac, create_image, hanh_dong, speak_response, reaction } = botMsg;
  
  console.log("=== handleActions Debug ===");
  console.log("nhac:", nhac);
  console.log("create_image:", create_image);
  console.log("hanh_dong:", hanh_dong);
  console.log("speak_response:", speak_response);
  console.log("reaction:", reaction);
  console.log("==========================");

  if (speak_response?.status && speak_response.text_to_speak) {
    if (typeof speak_response.text_to_speak === "string" && speak_response.text_to_speak.trim().length > 0) {
      await speakText(api, threadID, messageID, speak_response.text_to_speak, senderID);
      await updateMemory(threadID, senderID, "speak", { text: speak_response.text_to_speak });
    }
  }

  if (reaction?.status && reaction.emoji && reaction.emoji !== "" && !reaction.emoji.includes("�")) {
    try {
      await api.setMessageReaction(reaction.emoji, messageID);
      await updateMemory(threadID, senderID, "reaction", { emoji: reaction.emoji });
    } catch (error) {
      console.error("Lỗi thả cảm xúc:", error);
    }
  }

  if (nhac?.status && nhac.keyword && nhac.keyword.trim() !== "") {
    await updateMemory(threadID, senderID, "search_music", { keyword: nhac.keyword });
    searchAndSendMusic(api, threadID, messageID, nhac.keyword, senderID);
  }

  if (create_image?.status && create_image.prompt) {
    try {
    await createImage(api, threadID, messageID, create_image.prompt, senderID);
    await updateMemory(threadID, senderID, "create_image", { prompt: create_image.prompt });
    } catch (error) {
      console.error("Lỗi trong handleActions - create_image:", error);
    }
  }

  if (hanh_dong) {
    if (hanh_dong.doi_biet_danh?.status) {
      const taggedUserIDs = await getTaggedUserIDs(event);
      const userIDToChange = taggedUserIDs[0] || hanh_dong.doi_biet_danh.user_id || senderID;
      try {
        await api.changeNickname(hanh_dong.doi_biet_danh.biet_danh_moi, hanh_dong.doi_biet_danh.thread_id || threadID, userIDToChange);
        const prompt = `Biệt danh UID ${userIDToChange} đã đổi thành "${hanh_dong.doi_biet_danh.biet_danh_moi}". Trả lời tự nhiên, dễ thương, không lặp mẫu, xưng hô đúng style Kurumi.`;
        const msgToSend = await processAIResponse(prompt);
        api.sendMessage(msgToSend, threadID, messageID);
        await updateMemory(threadID, senderID, "change_nickname", { userID: userIDToChange, newNickname: hanh_dong.doi_biet_danh.biet_danh_moi });
      } catch (e) {
        const prompt = `Đổi biệt danh UID ${userIDToChange} thất bại: ${e.message}. Trả lời tự nhiên, dễ thương, an ủi user.`;
        const msgToSend = await processAIResponse(prompt);
        api.sendMessage(msgToSend, threadID, messageID);
      }
    }
  
    // Đổi icon
    if (hanh_dong.doi_icon_box?.status && hanh_dong.doi_icon_box.icon) {
      if (await isAdminOrGroupAdmin(api, threadID, senderID)) {
        try {
          await api.changeThreadEmoji(hanh_dong.doi_icon_box.icon, threadID);
          const prompt = `Đã đổi icon nhóm thành ${hanh_dong.doi_icon_box.icon}. Trả lời tự nhiên, dễ thương.`;
          const chat = model.startChat();
          const result = await generateContentWithRetry(chat, prompt);
          let responseText = result.response.text();
          let responseMsg = {};
          try {
            const jsonMatch = responseText.match(/{[\s\S]*}/);
            responseMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
          } catch (e) {
            responseMsg = { content: { text: responseText } };
          }
          let msgToSend = responseMsg.content.text;
          if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
            try {
              const parsed = JSON.parse(msgToSend);
              if (parsed?.content?.text) msgToSend = parsed.content.text;
            } catch (e) {}
          }
          msgToSend = extractContentText(msgToSend);
          api.sendMessage(msgToSend, threadID, messageID);
          await updateMemory(threadID, senderID, "change_thread_emoji", { icon: hanh_dong.doi_icon_box.icon });
        } catch (e) {
          const prompt = `Đổi icon nhóm thất bại: ${e.message}. Trả lời tự nhiên, dễ thương, an ủi user.`;
          const chat = model.startChat();
          const result = await generateContentWithRetry(chat, prompt);
          let responseText = result.response.text();
          let responseMsg = {};
          try {
            const jsonMatch = responseText.match(/{[\s\S]*}/);
            responseMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
          } catch (e) {
            responseMsg = { content: { text: responseText } };
          }
          let msgToSend = responseMsg.content.text;
          if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
            try {
              const parsed = JSON.parse(msgToSend);
              if (parsed?.content?.text) msgToSend = parsed.content.text;
            } catch (e) {}
          }
          msgToSend = extractContentText(msgToSend);
          api.sendMessage(msgToSend, threadID, messageID);
        }
      } else {
        const prompt = `User không có quyền đổi icon nhóm. Trả lời tự nhiên, dễ thương, giải thích cần quyền admin.`;
        const chat = model.startChat();
        const result = await generateContentWithRetry(chat, prompt);
        let responseText = result.response.text();
        let responseMsg = {};
        try {
          const jsonMatch = responseText.match(/{[\s\S]*}/);
          responseMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
        } catch (e) {
          responseMsg = { content: { text: responseText } };
        }
        let msgToSend = responseMsg.content.text;
        if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
          try {
            const parsed = JSON.parse(msgToSend);
            if (parsed?.content?.text) msgToSend = parsed.content.text;
          } catch (e) {}
        }
        msgToSend = extractContentText(msgToSend);
        api.sendMessage(msgToSend, threadID, messageID);
      }
    }
  

    if (hanh_dong.doi_ten_nhom?.status && hanh_dong.doi_ten_nhom.ten_moi) {
      if (await isAdminOrGroupAdmin(api, threadID, senderID)) {
        try {
          await api.setTitle(hanh_dong.doi_ten_nhom.ten_moi.trim(), threadID);
          const prompt = `Tên nhóm đã đổi thành "${hanh_dong.doi_ten_nhom.ten_moi}". Trả lời tự nhiên, dễ thương, vui tươi.`;
          const chat = model.startChat();
          const result = await generateContentWithRetry(chat, prompt);
          let responseText = result.response.text();
          let responseMsg = {};
          try {
            const jsonMatch = responseText.match(/{[\s\S]*}/);
            responseMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
          } catch (e) {
            responseMsg = { content: { text: responseText } };
          }
          let msgToSend = responseMsg.content.text;
          if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
            try {
              const parsed = JSON.parse(msgToSend);
              if (parsed?.content?.text) msgToSend = parsed.content.text;
            } catch (e) {}
          }
          msgToSend = extractContentText(msgToSend);
          api.sendMessage(msgToSend, threadID, messageID);
          await updateMemory(threadID, senderID, "change_thread_name", { newName: hanh_dong.doi_ten_nhom.ten_moi });
        } catch (e) {
          const prompt = `Đổi tên nhóm thất bại: ${e.message}. Trả lời tự nhiên, dễ thương, an ủi user.`;
          const chat = model.startChat();
          const result = await generateContentWithRetry(chat, prompt);
          let responseText = result.response.text();
          let responseMsg = {};
          try {
            const jsonMatch = responseText.match(/{[\s\S]*}/);
            responseMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
          } catch (e) {
            responseMsg = { content: { text: responseText } };
          }
          let msgToSend = responseMsg.content.text;
          if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
            try {
              const parsed = JSON.parse(msgToSend);
              if (parsed?.content?.text) msgToSend = parsed.content.text;
            } catch (e) {}
          }
          msgToSend = extractContentText(msgToSend);
          api.sendMessage(msgToSend, threadID, messageID);
        }
      } else {
        const prompt = `User không có quyền đổi tên nhóm. Trả lời tự nhiên, dễ thương, giải thích cần quyền admin.`;
        const chat = model.startChat();
        const result = await generateContentWithRetry(chat, prompt);
        let responseText = result.response.text();
        let responseMsg = {};
        try {
          const jsonMatch = responseText.match(/{[\s\S]*}/);
          responseMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
        } catch (e) {
          responseMsg = { content: { text: responseText } };
        }
        let msgToSend = responseMsg.content.text;
        if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
          try {
            const parsed = JSON.parse(msgToSend);
            if (parsed?.content?.text) msgToSend = parsed.content.text;
          } catch (e) {}
        }
        msgToSend = extractContentText(msgToSend);
        api.sendMessage(msgToSend, threadID, messageID);
      }
    }
  

    if (hanh_dong.kick_nguoi_dung?.status && hanh_dong.kick_nguoi_dung.user_id) {
      const allowed = ["100051439970359"];
      if (allowed.includes(senderID)) {
        try {
          await api.removeUserFromGroup(hanh_dong.kick_nguoi_dung.user_id, threadID);
          const prompt = `Đã kick UID ${hanh_dong.kick_nguoi_dung.user_id} khỏi nhóm. Trả lời tự nhiên, dễ thương, không toxic.`;
          const chat = model.startChat();
          const result = await generateContentWithRetry(chat, prompt);
          let responseText = result.response.text();
          let responseMsg = {};
          try {
            const jsonMatch = responseText.match(/{[\s\S]*}/);
            responseMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
          } catch (e) {
            responseMsg = { content: { text: responseText } };
          }
          let msgToSend = responseMsg.content.text;
          if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
            try {
              const parsed = JSON.parse(msgToSend);
              if (parsed?.content?.text) msgToSend = parsed.content.text;
            } catch (e) {}
          }
          msgToSend = extractContentText(msgToSend);
          api.sendMessage(msgToSend, threadID, messageID);
          await updateMemory(threadID, senderID, "kick_user", { userID: hanh_dong.kick_nguoi_dung.user_id });
        } catch (e) {
          const prompt = `Kick UID ${hanh_dong.kick_nguoi_dung.user_id} thất bại: ${e.message}. Trả lời tự nhiên, dễ thương, an ủi user.`;
          const chat = model.startChat();
          const result = await generateContentWithRetry(chat, prompt);
          let responseText = result.response.text();
          let responseMsg = {};
          try {
            const jsonMatch = responseText.match(/{[\s\S]*}/);
            responseMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
          } catch (e) {
            responseMsg = { content: { text: responseText } };
          }
          let msgToSend = responseMsg.content.text;
          if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
            try {
              const parsed = JSON.parse(msgToSend);
              if (parsed?.content?.text) msgToSend = parsed.content.text;
            } catch (e) {}
          }
          msgToSend = extractContentText(msgToSend);
          api.sendMessage(msgToSend, threadID, messageID);
        }
      } else {
        const prompt = `User không có quyền kick người dùng. Trả lời tự nhiên, dễ thương, giải thích chỉ admin mới có quyền này.`;
        const chat = model.startChat();
        const result = await generateContentWithRetry(chat, prompt);
        let responseText = result.response.text();
        let botMsg = {};
        try {
          const jsonMatch = responseText.match(/{[\s\S]*}/);
          botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
        } catch (e) {
          botMsg = { content: { text: responseText } };
        }
        let msgToSend = botMsg.content.text;
        if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
          try {
            const parsed = JSON.parse(msgToSend);
            if (parsed?.content?.text) msgToSend = parsed.content.text;
          } catch (e) {}
        }
        msgToSend = extractContentText(msgToSend);
        api.sendMessage(msgToSend, threadID, messageID);
      }
    }
  

    if (hanh_dong.add_nguoi_dung?.status && hanh_dong.add_nguoi_dung.user_id) {
      if (await isAdminOrGroupAdmin(api, threadID, senderID)) {
        try {
          await api.addUserToGroup(hanh_dong.add_nguoi_dung.user_id, threadID);
          const prompt = `Đã thêm UID ${hanh_dong.add_nguoi_dung.user_id} vào nhóm. Trả lời tự nhiên, vui tươi, thân thiện.`;
          const chat = model.startChat();
          const result = await generateContentWithRetry(chat, prompt);
          let responseText = result.response.text();
          let botMsg = {};
          try {
            const jsonMatch = responseText.match(/{[\s\S]*}/);
            botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
          } catch (e) {
            botMsg = { content: { text: responseText } };
          }
          let msgToSend = botMsg.content.text;
          if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
            try {
              const parsed = JSON.parse(msgToSend);
              if (parsed?.content?.text) msgToSend = parsed.content.text;
            } catch (e) {}
          }
          msgToSend = extractContentText(msgToSend);
          api.sendMessage(msgToSend, threadID, messageID);
          await updateMemory(threadID, senderID, "add_user", { userID: hanh_dong.add_nguoi_dung.user_id });
        } catch (e) {
          const prompt = `Thêm UID ${hanh_dong.add_nguoi_dung.user_id} thất bại: ${e.message}. Trả lời tự nhiên, dễ thương, an ủi user.`;
          const chat = model.startChat();
          const result = await generateContentWithRetry(chat, prompt);
          let responseText = result.response.text();
          let botMsg = {};
          try {
            const jsonMatch = responseText.match(/{[\s\S]*}/);
            botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
          } catch (e) {
            botMsg = { content: { text: responseText } };
          }
          let msgToSend = botMsg.content.text;
          if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
            try {
              const parsed = JSON.parse(msgToSend);
              if (parsed?.content?.text) msgToSend = parsed.content.text;
            } catch (e) {}
          }
          msgToSend = extractContentText(msgToSend);
          api.sendMessage(msgToSend, threadID, messageID);
        }
      } else {
        const prompt = `User không có quyền thêm người dùng vào nhóm. Trả lời tự nhiên, dễ thương, giải thích cần quyền admin.`;
        const chat = model.startChat();
        const result = await generateContentWithRetry(chat, prompt);
        let responseText = result.response.text();
        let botMsg = {};
        try {
          const jsonMatch = responseText.match(/{[\s\S]*}/);
          botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
        } catch (e) {
          botMsg = { content: { text: responseText } };
        }
        let msgToSend = botMsg.content.text;
        if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
          try {
            const parsed = JSON.parse(msgToSend);
            if (parsed?.content?.text) msgToSend = parsed.content.text;
          } catch (e) {}
        }
        msgToSend = extractContentText(msgToSend);
        api.sendMessage(msgToSend, threadID, messageID);
      }
    }

    if (hanh_dong.doi_chu_de?.status && hanh_dong.doi_chu_de.theme) {
      if (await isAdminOrGroupAdmin(api, threadID, senderID)) {
        try {
          const themeName = hanh_dong.doi_chu_de.theme.toLowerCase();
          const themes = [
            { "id": "1508524016651271", "name": "quả bơ", "alias": ["bơ", "avocado", "trái bơ"] },
            { "id": "741311439775765", "name": "love", "alias": ["tình yêu", "yêu", "love"] },
            { "id": "275041734441112", "name": "yêu thương", "alias": ["yêu thương", "thương", "tình cảm"] },
            { "id": "2154203151727239", "name": "heart drive", "alias": ["heart drive", "trái tim", "tim", "drive"] },
            { "id": "680612308133315", "name": "summer vibes", "alias": ["summer vibes", "mùa hè", "hè", "vibes", "không khí hè"] },
            { "id": "1299135724598332", "name": "cà phê", "alias": ["cà phê", "coffee", "cafe", "trà đá"] },
            { "id": "378568718330878", "name": "khúc côn cầu", "alias": ["khúc côn cầu", "hockey", "ice hockey", "bóng đá trên băng"] },
            { "id": "3527450920895688", "name": "karol g", "alias": ["karol g", "karol", "g", "ca sĩ nữ"] },
            { "id": "6026716157422736", "name": "bóng rổ", "alias": ["bóng rổ", "basketball", "rổ", "bóng rổ"] },
            { "id": "1485402365695859", "name": "sổ tay", "alias": ["sổ tay", "notebook", "vở", "ghi chú"] },
            { "id": "1667467154651262", "name": "j-hope", "alias": ["j-hope", "jhope", "hope", "bts"] },
            { "id": "3162266030605536", "name": "benson boone", "alias": ["benson boone", "benson", "boone", "ca sĩ nam"] },
            { "id": "845097890371902", "name": "bóng chày", "alias": ["bóng chày", "baseball", "chày", "bóng chày"] },
            { "id": "1546877592664773", "name": "the white lotus", "alias": ["the white lotus", "white lotus", "lotus", "hoa sen trắng"] },
            { "id": "1602001344083693", "name": "giấy kẻ ô vuông", "alias": ["giấy kẻ ô vuông", "graph paper", "ô vuông", "kẻ ô"] },
            { "id": "3082966625307060", "name": "chiêm tinh học", "alias": ["chiêm tinh học", "astrology", "zodiac", "cung hoàng đạo"] },
            { "id": "339021464972092", "name": "nhạc", "alias": ["nhạc", "music", "âm nhạc", "bài hát"] },
            { "id": "638495565535814", "name": "tate mcrae", "alias": ["tate mcrae", "tate", "mcrae", "ca sĩ canada"] },
            { "id": "1034356938326914", "name": "addison rae", "alias": ["addison rae", "addison", "rae", "tiktoker"] },
            { "id": "2897414437091589", "name": "chú chó murphy", "alias": ["chú chó murphy", "murphy", "cún murphy"] },
            { "id": "3650637715209675", "name": "besties", "alias": ["besties", "bạn thân", "best friend"] },
            { "id": "1079303610711048", "name": "bạn cùng đi lễ hội", "alias": ["bạn cùng đi lễ hội", "festival friend", "lễ hội", "bạn lễ hội"] },
            { "id": "1137551661432540", "name": "lisa", "alias": ["lisa", "blackpink", "idol", "ca sĩ thái"] },
            { "id": "1198771871464572", "name": "lilo & stitch", "alias": ["lilo & stitch", "lilo", "stitch", "disney", "phim hoạt hình"] },
            { "id": "539927563794799", "name": "đồng quê", "alias": ["đồng quê", "countryside", "nông thôn", "quê"] },
            { "id": "194982117007866", "name": "bóng bầu dục", "alias": ["bóng bầu dục", "football", "american football", "bầu dục"] },
            { "id": "1040328944732151", "name": "chó", "alias": ["chó", "dog", "cún", "pet"] },
            { "id": "611878928211423", "name": "thả thính", "alias": ["thả thính", "flirt", "tán", "cưa"] },
            { "id": "617395081231242", "name": "hà mã moo deng", "alias": ["hà mã moo deng", "hippo", "hà mã", "mo deng"] },
            { "id": "625675453790797", "name": "valentino garavani cherryfic", "alias": ["valentino garavani cherryfic", "valentino", "cherryfic", "thời trang"] },
            { "id": "765710439035509", "name": "impact through art", "alias": ["impact through art", "art", "nghệ thuật", "impact"] },
            { "id": "1027214145581698", "name": "khóa 2025", "alias": ["khóa 2025", "class of 2025", "2025", "tốt nghiệp"] },
            { "id": "1144968664009431", "name": "nhớ mong", "alias": ["nhớ mong", "missing", "nhớ", "mong"] },
            { "id": "969895748384406", "name": "can't rush greatness", "alias": ["can't rush greatness", "greatness", "không thể vội", "vĩ đại"] },
            { "id": "527564631955494", "name": "đại dương", "alias": ["đại dương", "ocean", "biển", "nước"] },
            { "id": "1335872111020614", "name": "the last of us", "alias": ["the last of us", "last of us", "game", "phim"] },
            { "id": "1743641112805218", "name": "bóng đá", "alias": ["bóng đá", "soccer", "football", "đá bóng"] },
            { "id": "638124282400208", "name": "một bộ phim minecraft", "alias": ["một bộ phim minecraft", "minecraft", "game", "phim"] },
            { "id": "968524435055801", "name": "tự hào", "alias": ["tự hào", "proud", "hãnh diện", "kiêu hãnh"] },
            { "id": "1120591312525822", "name": "năm ất tỵ", "alias": ["năm ất tỵ", "snake year", "rắn", "âm lịch"] },
            { "id": "418793291211015", "name": "mèo", "alias": ["mèo", "cat", "meo", "pet"] },
            { "id": "1060619084701625", "name": "lo-fi", "alias": ["lo-fi", "lofi", "nhạc chill", "relax"] },
            { "id": "1171627090816846", "name": "bơi lội", "alias": ["bơi lội", "swimming", "bơi", "hồ bơi"] },
            { "id": "230032715012014", "name": "loang màu", "alias": ["loang màu", "colorful", "màu sắc", "sặc sỡ"] },
            { "id": "195296273246380", "name": "trà sữa trân châu", "alias": ["trà sữa trân châu", "bubble tea", "trà sữa", "trân châu"] },
            { "id": "375805881509551", "name": "pickleball", "alias": ["pickleball", "tennis", "quần vợt", "thể thao"] },
            { "id": "788274591712841", "name": "đơn sắc", "alias": ["đơn sắc", "monochrome", "một màu", "đen trắng"] },
            { "id": "1633544640877832", "name": "tán lá", "alias": ["tán lá", "leaves", "lá cây", "xanh"] },
            { "id": "1135895321099254", "name": "mắt trố", "alias": ["mắt trố", "wide eyes", "mắt to", "ngạc nhiên"] },
            { "id": "704702021720552", "name": "pizza", "alias": ["pizza", "bánh pizza", "đồ ăn", "fast food"] },
            { "id": "955795536185183", "name": "đại tiệc ăn vặt", "alias": ["đại tiệc ăn vặt", "snack party", "ăn vặt", "tiệc"] },
            { "id": "1019162843417894", "name": "hồng may mắn", "alias": ["hồng may mắn", "lucky pink", "hồng", "may mắn"] },
            { "id": "810978360551741", "name": "làm cha mẹ", "alias": ["làm cha mẹ", "parenting", "cha mẹ", "gia đình"] },
            { "id": "1207811064102494", "name": "selena gomez và benny blanco", "alias": ["selena gomez và benny blanco", "selena", "benny", "ca sĩ"] },
            { "id": "3190514984517598", "name": "bầu trời", "alias": ["bầu trời", "sky", "trời", "xanh"] },
            { "id": "292955489929680", "name": "kẹo mút", "alias": ["kẹo mút", "lollipop", "kẹo", "ngọt"] },
            { "id": "976389323536938", "name": "lặp lại", "alias": ["lặp lại", "repeat", "loop", "tuần hoàn"] },
            { "id": "627144732056021", "name": "chúc mừng", "alias": ["chúc mừng", "congratulations", "mừng", "celebration"] },
            { "id": "909695489504566", "name": "sushi", "alias": ["sushi", "nhật bản", "đồ ăn", "hải sản"] },
            { "id": "582065306070020", "name": "tên lửa", "alias": ["tên lửa", "rocket", "không gian", "vũ trụ"] },
            { "id": "280333826736184", "name": "kẹo mút mặc định", "alias": ["kẹo mút mặc định", "default lollipop", "mặc định", "kẹo"] },
            { "id": "271607034185782", "name": "bóng râm", "alias": ["bóng râm", "shadow", "shade", "tối"] },
            { "id": "1257453361255152", "name": "hoa hồng", "alias": ["hoa hồng", "rose", "hoa", "tình yêu"] },
            { "id": "571193503540759", "name": "tím oải hương", "alias": ["tím oải hương", "lavender", "tím", "hoa"] },
            { "id": "2873642949430623", "name": "hoa tulip", "alias": ["hoa tulip", "tulip", "hoa", "hà lan"] },
            { "id": "3273938616164733", "name": "cổ điển", "alias": ["cổ điển", "classic", "truyền thống", "vintage"] },
            { "id": "403422283881973", "name": "táo", "alias": ["táo", "apple", "trái cây", "đỏ"] },
            { "id": "672058580051520", "name": "mật ong", "alias": ["mật ong", "honey", "ngọt", "vàng"] },
            { "id": "3151463484918004", "name": "kiwi", "alias": ["kiwi", "trái kiwi", "trái cây", "xanh"] },
            { "id": "736591620215564", "name": "đại dương", "alias": ["đại dương", "ocean", "biển", "xanh dương"] },
            { "id": "193497045377796", "name": "tím nho", "alias": ["tím nho", "grape purple", "nho", "tím"] },
            { "id": "3259963564026002", "name": "mặc định", "alias": ["mặc định", "default", "cơ bản", "ban đầu"] },
            { "id": "724096885023603", "name": "quả mọng", "alias": ["quả mọng", "berries", "dâu", "trái cây"] },
            { "id": "624266884847972", "name": "kẹo ngọt", "alias": ["kẹo ngọt", "candy", "kẹo", "ngọt"] },
            { "id": "273728810607574", "name": "kỳ lân", "alias": ["kỳ lân", "unicorn", "ma thuật", "huyền thoại"] },
            { "id": "2533652183614000", "name": "màu lá phong", "alias": ["màu lá phong", "maple leaf", "lá phong", "mùa thu"] }
          ];
          
          const foundTheme = themes.find(theme =>
            theme.name === themeName ||
            (theme.alias && theme.alias.some(alias => alias.toLowerCase() === themeName))
          );
          if (!foundTheme) {
            const prompt = `Không tìm thấy chủ đề "${hanh_dong.doi_chu_de.theme}". Trả lời tự nhiên, dễ thương, gợi ý một số chủ đề có sẵn.`;
            const chat = model.startChat();
            const result = await generateContentWithRetry(chat, prompt);
            let responseText = result.response.text();
            let botMsg = {};
            try {
              const jsonMatch = responseText.match(/{[\s\S]*}/);
              botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
            } catch (e) {
              botMsg = { content: { text: responseText } };
            }
            let msgToSend = botMsg.content.text;
            if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
              try {
                const parsed = JSON.parse(msgToSend);
                if (parsed?.content?.text) msgToSend = parsed.content.text;
              } catch (e) {}
            }
            msgToSend = extractContentText(msgToSend);
            api.sendMessage(msgToSend, threadID, messageID);
            return;
          }
          
          await api.setTheme(foundTheme.id, threadID);
          const prompt = `Đã đổi chủ đề nhóm thành "${foundTheme.name}". Trả lời tự nhiên, dễ thương, vui tươi.`;
          const chat = model.startChat();
          const result = await generateContentWithRetry(chat, prompt);
          let responseText = result.response.text();
          let botMsg = {};
          try {
            const jsonMatch = responseText.match(/{[\s\S]*}/);
            botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
          } catch (e) {
            botMsg = { content: { text: responseText } };
          }
          let msgToSend = botMsg.content.text;
          if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
            try {
              const parsed = JSON.parse(msgToSend);
              if (parsed?.content?.text) msgToSend = parsed.content.text;
            } catch (e) {}
          }
          msgToSend = extractContentText(msgToSend);
          api.sendMessage(msgToSend, threadID, messageID);
          await updateMemory(threadID, senderID, "change_theme", { theme: foundTheme.name });
        } catch (e) {
          const prompt = `Đổi chủ đề nhóm thất bại: ${e.message}. Trả lời tự nhiên, dễ thương, an ủi user.`;
          const chat = model.startChat();
          const result = await generateContentWithRetry(chat, prompt);
          let responseText = result.response.text();
          let botMsg = {};
          try {
            const jsonMatch = responseText.match(/{[\s\S]*}/);
            botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
          } catch (e) {
            botMsg = { content: { text: responseText } };
          }
          let msgToSend = botMsg.content.text;
          if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
            try {
              const parsed = JSON.parse(msgToSend);
              if (parsed?.content?.text) msgToSend = parsed.content.text;
            } catch (e) {}
          }
          msgToSend = extractContentText(msgToSend);
          api.sendMessage(msgToSend, threadID, messageID);
        }
      } else {
        const prompt = `User không có quyền đổi chủ đề nhóm. Trả lời tự nhiên, dễ thương, giải thích cần quyền admin.`;
        const chat = model.startChat();
        const result = await generateContentWithRetry(chat, prompt);
        let responseText = result.response.text();
        let botMsg = {};
        try {
          const jsonMatch = responseText.match(/{[\s\S]*}/);
          botMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
        } catch (e) {
          botMsg = { content: { text: responseText } };
        }
        let msgToSend = botMsg.content.text;
        if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
          try {
            const parsed = JSON.parse(msgToSend);
            if (parsed?.content?.text) msgToSend = parsed.content.text;
          } catch (e) {}
        }
        msgToSend = extractContentText(msgToSend);
        api.sendMessage(msgToSend, threadID, messageID);
      }
    }
  }
}

async function getCurrentTimeInVietnam() {
  const vietnamTimezoneOffset = 7;
  const currentDate = new Date();
  const utcTime = currentDate.getTime() + currentDate.getTimezoneOffset() * 60000;
  const vietnamTime = new Date(utcTime + 3600000 * vietnamTimezoneOffset);
  const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const day = daysOfWeek[vietnamTime.getDay()];
  const dateString = `${day} - ${vietnamTime.toLocaleDateString("vi-VN")}`;
  const timeString = vietnamTime.toLocaleTimeString("vi-VN");
  return `${dateString} - ${timeString}`;
}

function normalizeVietnameseText(text) {
  if (typeof text !== "string" || !text) {
    return "";
  }
  
  const lowerText = text.toLowerCase();
  const replacements = {
    "kho nhi": "khô nhí",
    "mua a": "mưa à",
    "co": "có",
    "ko": "không",
    "yes": "vâng",
    "teo mua": "tẹo mua",
  };
  return replacements[lowerText] || text;
}

function extractContentText(input) {
  try {
    let text = input;
    for (let i = 0; i < 5; i++) {
      if (typeof text === "string" && text.trim().startsWith("{") && text.trim().endsWith("}")) {
        const parsed = JSON.parse(text);
        if (parsed?.content?.text) {
          text = parsed.content.text;
          continue;
        }
        text = JSON.stringify(parsed);
      }
    }
    return typeof text === "string" ? text.trim() : JSON.stringify(text);
  } catch {
    return typeof input === "string" ? input : JSON.stringify(input);
  }
}

// Thêm các hàm thông minh mới
async function analyzeEmotion(text) {
  const positiveWords = ['vui', 'hạnh phúc', 'thích', 'yêu', 'tốt', 'hay', 'đẹp', 'tuyệt', 'awesome', 'great', 'love', 'happy', 'good', 'nice', 'beautiful', 'amazing', 'thú vị', 'tuyệt vời', 'ngon', 'đỉnh', 'pro', 'chất', 'thành công', 'chiến thắng', 'hoàn hảo', 'xuất sắc', 'tuyệt đỉnh'];
  const negativeWords = ['buồn', 'chán', 'ghét', 'xấu', 'tệ', 'khó chịu', 'giận', 'sad', 'boring', 'hate', 'bad', 'terrible', 'angry', 'annoying', 'mệt', 'stress', 'lo lắng', 'sợ', 'đau', 'thất bại', 'thua', 'tệ hại', 'kinh khủng', 'khủng khiếp'];
  const angryWords = ['giận', 'tức', 'phẫn nộ', 'khó chịu', 'bực', 'angry', 'mad', 'furious', 'annoyed', 'irritated', 'điên', 'phát điên', 'tức chết', 'cáu', 'bực mình', 'khó chịu'];
  const excitedWords = ['wow', 'omg', 'thật à', 'không thể tin được', 'incredible', 'amazing', 'fantastic', 'wonderful', 'tuyệt vời', 'kinh ngạc', 'bất ngờ', 'thú vị'];
  const lonelyWords = ['cô đơn', 'lẻ loi', 'một mình', 'không ai', 'trống vắng', 'buồn', 'nhớ', 'lonely', 'alone'];
  const stressedWords = ['stress', 'căng thẳng', 'mệt mỏi', 'kiệt sức', 'quá tải', 'bận rộn', 'lo lắng', 'anxious', 'worried'];
  const curiousWords = ['tò mò', 'thắc mắc', 'hỏi', 'tại sao', 'làm sao', 'curious', 'wonder', 'question'];
  const boredWords = ['nhàm chán', 'chán', 'buồn', 'không có gì làm', 'boring', 'dull', 'tedious'];
  
  const lowerText = text.toLowerCase();
  let emotion = 'neutral';
  let score = 0;
  let emotionStrength = 0;
  
  // Phân tích từ khóa cảm xúc
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) {
      score += 1;
      emotionStrength = Math.max(emotionStrength, 1);
    }
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) {
      score -= 1;
      emotionStrength = Math.max(emotionStrength, 1);
    }
  });
  
  // Phân tích cảm xúc đặc biệt
  excitedWords.forEach(word => {
    if (lowerText.includes(word)) {
      emotion = 'excited';
      emotionStrength = 3;
      return;
    }
  });
  
  angryWords.forEach(word => {
    if (lowerText.includes(word)) {
      emotion = 'angry';
      emotionStrength = 3;
      return;
    }
  });
  
  lonelyWords.forEach(word => {
    if (lowerText.includes(word)) {
      emotion = 'lonely';
      emotionStrength = 2;
      return;
    }
  });
  
  stressedWords.forEach(word => {
    if (lowerText.includes(word)) {
      emotion = 'stressed';
      emotionStrength = 2;
      return;
    }
  });
  
  curiousWords.forEach(word => {
    if (lowerText.includes(word)) {
      emotion = 'curious';
      emotionStrength = 1;
      return;
    }
  });
  
  boredWords.forEach(word => {
    if (lowerText.includes(word)) {
      emotion = 'bored';
      emotionStrength = 1;
      return;
    }
  });
  
  // Phân tích emoji
  const emojiPatterns = {
    'very_positive': /[😊😄😍🥰😘😗😙😚]/g,
    'positive': /[🙂😉😌😋😎]/g,
    'excited': /[🤩😱😲😯😳]/g,
    'negative': /[😔😞😟😕]/g,
    'very_negative': /[😢😭😿]/g,
    'angry': /[😠😡🤬😤]/g,
    'lonely': /[🥺😔😞]/g,
    'stressed': /[😰😨😧]/g,
    'curious': /[🤔😶😐]/g,
    'bored': /[😴🥱😑]/g
  };
  
  for (const [emojiEmotion, pattern] of Object.entries(emojiPatterns)) {
    if (pattern.test(text)) {
      emotion = emojiEmotion;
      emotionStrength = Math.max(emotionStrength, 2);
      break;
    }
  }
  
  // Phân tích dựa trên score nếu chưa xác định được cảm xúc đặc biệt
  if (emotion === 'neutral') {
    if (score > 3) emotion = 'very_positive';
    else if (score > 1) emotion = 'positive';
    else if (score < -3) emotion = 'very_negative';
    else if (score < -1) emotion = 'negative';
  }
  
  return {
    emotion: emotion,
    strength: emotionStrength,
    score: score
  };
}

async function generateSmartResponse(api, event, context, emotionData, memory) {
  const threadID = event.threadID;
  const senderID = event.senderID;
  const content = event.body;
  
  // Tạo prompt thông minh dựa trên context và emotion
  const isOwner = senderID === "100051439970359";
  let smartPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"${await api.getUserInfo(senderID).then(info => info[senderID].name)}","content":"${normalizeVietnameseText(content)}","reply":"${event.messageReply ? event.messageReply.body : ""}","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":${JSON.stringify(context)},"mentionedUserIDs":${JSON.stringify(await getTaggedUserIDs(event))},"emotion":"${emotionData.emotion}","emotionStrength":${emotionData.strength},"emotionScore":${emotionData.score},"memory":${JSON.stringify(memory)},"userPatterns":${JSON.stringify(memory.userPatterns?.[senderID] || {})},"isOwner":${isOwner}}`;
  
  // Thêm hướng dẫn dựa trên emotion và strength
  const emotion = emotionData.emotion;
  const strength = emotionData.strength;
  
  if (emotion === 'very_positive' || emotion === 'positive') {
    if (strength >= 3) {
      smartPrompt += ' [HƯỚNG DẪN: Người dùng rất vui vẻ và hào hứng, hãy chia sẻ niềm vui, đùa giỡn cùng, thể hiện sự hào hứng cao độ, dùng nhiều emoji vui và từ ngữ mạnh]';
    } else {
      smartPrompt += ' [HƯỚNG DẪN: Người dùng đang vui vẻ, hãy chia sẻ niềm vui, đùa giỡn cùng, thể hiện sự hào hứng]';
    }
  } else if (emotion === 'excited') {
    smartPrompt += ' [HƯỚNG DẪN: Người dùng rất phấn khích, hãy thể hiện sự hào hứng tương tự, dùng nhiều emoji và từ ngữ mạnh, chia sẻ niềm vui]';
  } else if (emotion === 'negative' || emotion === 'very_negative') {
    if (strength >= 3) {
      smartPrompt += ' [HƯỚNG DẪN: Người dùng rất buồn/tuyệt vọng, hãy an ủi sâu sắc, thể hiện sự quan tâm, đưa ra lời khuyên tích cực và động viên mạnh mẽ]';
    } else {
      smartPrompt += ' [HƯỚNG DẪN: Người dùng đang buồn, hãy an ủi, động viên, đưa ra lời khuyên tích cực, thể hiện sự quan tâm]';
    }
  } else if (emotion === 'angry') {
    smartPrompt += ' [HƯỚNG DẪN: Người dùng đang giận, hãy làm dịu tình hình, lắng nghe và thấu hiểu, không đổ thêm dầu vào lửa, thể hiện sự kiên nhẫn]';
  } else if (emotion === 'lonely') {
    smartPrompt += ' [HƯỚNG DẪN: Người dùng cảm thấy cô đơn, hãy tạo cảm giác được quan tâm, chia sẻ, kết nối, thể hiện sự thân thiện và gần gũi]';
  } else if (emotion === 'stressed') {
    smartPrompt += ' [HƯỚNG DẪN: Người dùng đang stress, hãy đưa ra lời khuyên thư giãn, gợi ý hoạt động giải tỏa, thể hiện sự quan tâm và hỗ trợ]';
  } else if (emotion === 'curious') {
    smartPrompt += ' [HƯỚNG DẪN: Người dùng tò mò, hãy cung cấp thông tin chi tiết, gợi ý tìm hiểu thêm, thể hiện sự nhiệt tình và hữu ích]';
  } else if (emotion === 'bored') {
    smartPrompt += ' [HƯỚNG DẪN: Người dùng nhàm chán, hãy đề xuất hoạt động thú vị, kể chuyện, chơi game, tạo không khí vui vẻ]';
  }
  
  // Thêm hướng dẫn dựa trên pattern người dùng
  if (memory.userPatterns?.[senderID]?.topics) {
    const topTopics = Object.entries(memory.userPatterns[senderID].topics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([topic]) => topic);
    
    if (topTopics.length > 0) {
      smartPrompt += ` [SỞ THÍCH: Người dùng thích ${topTopics.join(', ')} - có thể gợi ý liên quan đến chủ đề này]`;
    }
  }
  
  // Thêm hướng dẫn xưng hô dựa trên isOwner
  if (isOwner) {
    smartPrompt += ` [XƯNG HÔ: Đây là chủ nhân (UID: 100051439970359) - xưng "vợ" và gọi "chồng", thể hiện tình cảm đặc biệt]`;
  } else {
    smartPrompt += ` [XƯNG HÔ: Đây là người khác - xưng "mình" gọi "bạn" hoặc xưng "tớ" gọi "cậu", KHÔNG BAO GIỜ xưng "vợ" hoặc gọi "chồng"]`;
  }
  
  // Thêm hướng dẫn dựa trên thời gian và context
  const currentHour = new Date().getHours();
  if (currentHour >= 22 || currentHour <= 6) {
    smartPrompt += ' [THỜI GIAN: Đêm khuya - nói chuyện nhẹ nhàng, ít ồn ào]';
  } else if (currentHour >= 6 && currentHour <= 9) {
    smartPrompt += ' [THỜI GIAN: Buổi sáng - chào hỏi vui vẻ, động viên cho ngày mới]';
  } else if (currentHour >= 12 && currentHour <= 14) {
    smartPrompt += ' [THỜI GIAN: Giờ ăn trưa - có thể gợi ý về đồ ăn]';
  }
  
  return smartPrompt;
}

async function getEnhancedContext(threadID, senderID) {
  try {
    const memoryData = await getMemory(threadID);
    const historyData = JSON.parse(await fsPromises.readFile(historyFile, "utf-8").catch(() => "{}")) || {};
    const chatHistory = historyData[threadID] || [];
    
    // Lấy 5 tin nhắn gần nhất
    const recentMessages = chatHistory.slice(-5);
    
    // Phân tích pattern giao tiếp
    const userPatterns = {
      favoriteTopics: [],
      communicationStyle: 'normal',
      interactionFrequency: recentMessages.length
    };
    
    // Tìm chủ đề yêu thích
    const topics = ['nhạc', 'phim', 'game', 'ăn uống', 'du lịch', 'công việc', 'học tập', 'tình yêu', 'bạn bè', 'gia đình'];
    topics.forEach(topic => {
      const count = recentMessages.filter(msg => 
        msg.role === 'user' && msg.parts[0].text.toLowerCase().includes(topic)
      ).length;
      if (count > 0) userPatterns.favoriteTopics.push({ topic, count });
    });
    
    // Sắp xếp theo tần suất
    userPatterns.favoriteTopics.sort((a, b) => b.count - a.count);
    
    return {
      memory: memoryData,
      recentMessages: recentMessages,
      userPatterns: userPatterns,
      lastInteraction: memoryData.lastActions[memoryData.lastActions.length - 1] || null
    };
  } catch (error) {
    console.error("Lỗi khi lấy context:", error);
    return { memory: {}, recentMessages: [], userPatterns: {}, lastInteraction: null };
  }
}

// Cải thiện hàm xử lý sự kiện chính
async function processMessageIntelligently(api, event) {
  const threadID = event.threadID;
  const senderID = event.senderID;
  const content = event.body;
  
  // Phân tích cảm xúc nâng cao
  const emotionData = await analyzeEmotion(content);
  
  // Lấy context nâng cao
  const enhancedContext = await getEnhancedContext(threadID, senderID);
  
  // Tạo prompt thông minh với phân tích cảm xúc chi tiết
  const smartPrompt = await generateSmartResponse(api, event, enhancedContext, emotionData, enhancedContext.memory);
  
  // Xử lý với AI
  const historyData = JSON.parse(await fsPromises.readFile(historyFile, "utf-8").catch(() => "{}")) || {};
  let chatHistory = historyData[threadID] || [];
  
  chatHistory.push({ role: "user", parts: [{ text: event.body }] });
  
  const chat = model.startChat({ history: normalizeChatHistory(chatHistory, smartPrompt) });
  const result = await generateContentWithRetry(chat, smartPrompt);
  
  return { result, chatHistory, enhancedContext, emotionData };
}

// AI sẽ tự động đưa ra gợi ý thông minh dựa trên context và cảm xúc

// Cải thiện hàm xử lý lỗi
async function handleErrorIntelligently(api, event, error, context) {
  const threadID = event.threadID;
  const senderID = event.senderID;
  
  console.error("Lỗi thông minh:", error);
  
  // Phân tích loại lỗi
  let errorType = 'general';
  if (error.message.includes('429')) errorType = 'rate_limit';
  else if (error.message.includes('timeout')) errorType = 'timeout';
  else if (error.message.includes('network')) errorType = 'network';
  
  // Tạo phản hồi lỗi thông minh
  let errorPrompt = `{"time":"${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}","senderName":"Kurumi","content":"Có lỗi xảy ra: ${error.message}. Loại lỗi: ${errorType}. Hãy tạo phản hồi lỗi tự nhiên, dễ thương, an ủi user và đưa ra giải pháp nếu có thể.","reply":"","threadID":"${threadID}","senderID":"${senderID}","id_cua_bot":"${await api.getCurrentUserID()}","context":${JSON.stringify(context)},"mentionedUserIDs":[]}`;
  
  const chat = model.startChat();
  const result = await generateContentWithRetry(chat, errorPrompt);
  let text = result.response.text();
  let botMsg = {};
  
  try {
    const jsonMatch = text.match(/{[\s\S]*}/);
    botMsg = jsonMatch ? safeParseJSON(jsonMatch[0]) : { content: { text: text } };
    if (!botMsg) botMsg = { content: { text: text } };
  } catch (e) {
    botMsg = { content: { text: text } };
  }
  
  let msgToSend = botMsg.content.text;
  if (msgToSend && msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
    try {
      const parsed = safeParseJSON(msgToSend);
      if (parsed?.content?.text) msgToSend = parsed.content.text;
    } catch (e) {}
  }
  
  msgToSend = extractContentText(msgToSend);
  api.sendMessage(msgToSend, threadID, event.messageID);
}

// Cải thiện hàm xử lý phản hồi
async function processResponseIntelligently(text, enhancedContext) {
  let botMsg = {};
  let extractedText = "";
  
  try {
    // Thử trích xuất text từ JSON response
    const jsonMatch = text.match(/{[\s\S]*}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed?.content?.text) {
          extractedText = parsed.content.text;
          botMsg = parsed;
        }
      } catch (parseError) {
        console.log("Parse error:", parseError.message);
        // Cải thiện trích xuất text
        const textMatch = text.match(/"text":\s*"([^"]*(?:\\"[^"]*)*)"/);
        if (textMatch && textMatch[1]) {
          extractedText = textMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
        } else {
          // Thử cách khác: tìm từ "text": đến dấu phẩy hoặc dấu } tiếp theo
          const textStart = text.indexOf('"text":');
          if (textStart > -1) {
            const quoteStart = text.indexOf('"', textStart + 7);
            if (quoteStart > textStart) {
              let quoteEnd = quoteStart + 1;
              let inEscape = false;
              
              while (quoteEnd < text.length) {
                if (text[quoteEnd] === '\\') {
                  inEscape = !inEscape;
                } else if (text[quoteEnd] === '"' && !inEscape) {
                  break;
                } else {
                  inEscape = false;
                }
                quoteEnd++;
              }
              
              if (quoteEnd < text.length) {
                extractedText = text.substring(quoteStart + 1, quoteEnd)
                  .replace(/\\"/g, '"')
                  .replace(/\\n/g, '\n')
                  .replace(/\\\\/g, '\\');
              }
            }
          }
        }
      }
    }
    
    // Nếu không trích xuất được, dùng text gốc
    if (!extractedText) {
      extractedText = text;
    }
    
    // Tạo botMsg hoàn chỉnh nếu chưa có
    if (botMsg && botMsg.content) {
      botMsg.content.text = extractedText;
    } else {
      botMsg = {
        content: { text: extractedText, thread_id: "" },
        speak_response: { status: false, text_to_speak: null },
        nhac: { status: false, keyword: null },
        create_image: { status: false, prompt: null },
        hanh_dong: {
          doi_biet_danh: { status: false, biet_danh_moi: null, user_id: null, thread_id: null },
          doi_icon_box: { status: false, icon: null, thread_id: null },
          doi_ten_nhom: { status: false, ten_moi: null, thread_id: null },
          kick_nguoi_dung: { status: false, thread_id: null, user_id: null, confirmed: false },
          add_nguoi_dung: { status: false, user_id: null, thread_id: null },
          doi_chu_de: { status: false, theme: null, thread_id: null }
        },
        reaction: { status: false, emoji: null }
      };
    }
    
    // AI sẽ tự động đưa ra gợi ý thông minh dựa trên context và cảm xúc
    
    // Để AI tự quyết định reaction trong system instruction
    // Không cần logic cố định, AI sẽ tự phân tích và chọn emoji phù hợp
    
    return botMsg;
  } catch (e) {
    console.error("Lỗi xử lý response:", e);
    return {
      content: { text: text, thread_id: "" },
      speak_response: { status: false, text_to_speak: null },
      nhac: { status: false, keyword: null },
      create_image: { status: false, prompt: null },
      hanh_dong: {
        doi_biet_danh: { status: false, biet_danh_moi: null, user_id: null, thread_id: null },
        doi_icon_box: { status: false, icon: null, thread_id: null },
        doi_ten_nhom: { status: false, ten_moi: null, thread_id: null },
        kick_nguoi_dung: { status: false, thread_id: null, user_id: null, confirmed: false },
        add_nguoi_dung: { status: false, user_id: null, thread_id: null },
        doi_chu_de: { status: false, theme: null, thread_id: null }
      },
      reaction: { status: false, emoji: null }
    };
  }
}

// Thêm hàm học hỏi từ cuộc trò chuyện
async function learnFromConversation(threadID, senderID, content, response) {
  try {
    const memoryData = await getMemory(threadID);
    
    // Lưu pattern giao tiếp
    if (!memoryData.userPatterns) memoryData.userPatterns = {};
    if (!memoryData.userPatterns[senderID]) memoryData.userPatterns[senderID] = {
      topics: {},
      emotions: {},
      responseStyle: {},
      lastInteraction: null
    };
    
    // Phân tích chủ đề
    const topics = ['nhạc', 'phim', 'game', 'ăn uống', 'du lịch', 'công việc', 'học tập', 'tình yêu', 'bạn bè', 'gia đình'];
    topics.forEach(topic => {
      if (content.toLowerCase().includes(topic)) {
        memoryData.userPatterns[senderID].topics[topic] = 
          (memoryData.userPatterns[senderID].topics[topic] || 0) + 1;
      }
    });
    
    // Phân tích cảm xúc nâng cao
    const emotionData = await analyzeEmotion(content);
    memoryData.userPatterns[senderID].emotions[emotionData.emotion] = 
      (memoryData.userPatterns[senderID].emotions[emotionData.emotion] || 0) + 1;
    
    // Lưu thêm thông tin về cường độ cảm xúc
    if (!memoryData.userPatterns[senderID].emotionStrengths) {
      memoryData.userPatterns[senderID].emotionStrengths = {};
    }
    memoryData.userPatterns[senderID].emotionStrengths[emotionData.emotion] = 
      (memoryData.userPatterns[senderID].emotionStrengths[emotionData.emotion] || 0) + emotionData.strength;
    
    // Cập nhật thời gian tương tác cuối
    memoryData.userPatterns[senderID].lastInteraction = Date.now();
    
    await fsPromises.writeFile(memoryFile, JSON.stringify(memoryData, null, 2));
  } catch (error) {
    console.error("Lỗi khi học hỏi:", error);
  }
}

// Thêm hàm helper để xử lý response AI và tránh xung đột tên biến
async function processAIResponse(prompt) {
  try {
    const chat = model.startChat();
    const result = await generateContentWithRetry(chat, prompt);
    let responseText = result.response.text();
    let responseMsg = {};
    
    try {
      const jsonMatch = responseText.match(/{[\s\S]*}/);
      responseMsg = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: { text: responseText } };
    } catch (e) {
      responseMsg = { content: { text: responseText } };
    }
    
    let msgToSend = responseMsg.content.text;
    if (msgToSend.startsWith("{") && msgToSend.endsWith("}")) {
      try {
        const parsed = JSON.parse(msgToSend);
        if (parsed?.content?.text) msgToSend = parsed.content.text;
      } catch (e) {}
    }
    
    return extractContentText(msgToSend);
  } catch (error) {
    console.error("Lỗi xử lý AI response:", error);
  }
}