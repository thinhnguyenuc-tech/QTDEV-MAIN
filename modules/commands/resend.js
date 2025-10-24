const path = require('path');
const fs = require("fs-extra");

const RESEND_PATH = path.join(__dirname, "data", "resend.json");
const CACHE_DIR = path.join(__dirname, "cache");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function getResendData() {
  if (!fs.existsSync(RESEND_PATH)) fs.writeJsonSync(RESEND_PATH, {});
  return fs.readJsonSync(RESEND_PATH);
}

function saveResendData(data) {
  fs.writeJsonSync(RESEND_PATH, data, { spaces: 2 });
}

module.exports.config = {
  name: "resend",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "qt",
  description: "Xem lại tin nhắn bị gỡ",
  commandCategory: "Box Chat",
  usages: "resend [on/off]",
  cooldowns: 0,
  hide: true,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.handleEvent = async function ({ event, api, Users }) {
  const axios = global.nodemodule["axios"];
  const { threadID, messageID, senderID, body: content } = event;
  const data = getResendData();

  if (!data[threadID]) return;
  if (!global.logMessage) global.logMessage = new Map();
  if (!global.data.botID) global.data.botID = api.getCurrentUserID();
  if (senderID === global.data.botID) return;

  if (event.type !== "message_unsend") {
    global.logMessage.set(messageID, {
      msgBody: content || "",
      attachment: event.attachments || []
    });
  }

  if (event.type === "message_unsend") {
    const getMsg = global.logMessage.get(messageID);
    if (!getMsg) return;

    const name = await Users.getNameUser(senderID);

    if (!getMsg.attachment || getMsg.attachment.length === 0) {
      return api.sendMessage(
        `📛 ${name} vừa thu hồi một tin nhắn:\n💬 Nội dung: ${getMsg.msgBody || "Không có nội dung"}`,
        threadID
      );
    }

    let msg = {
      body: `🔰 ${name} vừa thu hồi ${getMsg.attachment.length} tệp.${getMsg.msgBody ? `\n💬 Nội dung: ${getMsg.msgBody}` : ""}`,
      attachment: []
    };

    const downloadedFiles = [];

    for (let i = 0; i < getMsg.attachment.length; i++) {
      try {
        const attachment = getMsg.attachment[i];
        if (!attachment || !attachment.url) continue;

        const url = attachment.url;
        const pathname = new URL(url).pathname;
        const extMatch = pathname.match(/\.(jpg|jpeg|png|gif|mp4|mp3|pdf|docx|xlsx)$/i);
        const ext = extMatch ? extMatch[0].slice(1) : "bin";
        const filePath = path.join(CACHE_DIR, `${i}.${ext}`);

        const res = await axios.get(url, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'Mozilla/5.0' 
          }
        });

        fs.writeFileSync(filePath, Buffer.from(res.data, 'binary'));
        downloadedFiles.push(filePath);
      } catch (e) {
        console.error(`❌ Lỗi khi tải tệp thứ ${i + 1}:`, e);
      }
    }

    if (downloadedFiles.length > 0) {
      try {
        for (let i = 0; i < downloadedFiles.length; i++) {
          const filePath = downloadedFiles[i];
          try {
            await api.sendMessage({
              body: i === 0 ? msg.body : "",
              attachment: fs.createReadStream(filePath)
            }, threadID);
          } finally {
            if (fs.existsSync(filePath)) {
              try {
                fs.unlinkSync(filePath);
              } catch (e) {
                console.error(`❌ Lỗi khi xóa tệp tạm ${filePath}:`, e);
              }
            }
          }
        }
      } catch (e) {
        console.error("❌ Lỗi khi gửi lại tệp đính kèm:", e);
        return api.sendMessage("❌ Đã xảy ra lỗi khi gửi lại tệp đính kèm", threadID);
      }
    }
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const data = getResendData();

  if (data[threadID]) {
    delete data[threadID];
    saveResendData(data);
    return api.sendMessage("🔕 Đã tắt tính năng resend cho nhóm này.", threadID, messageID);
  } else {
    data[threadID] = true;
    saveResendData(data);
    return api.sendMessage("🔔 Đã bật tính năng resend cho nhóm này.", threadID, messageID);
  }
};