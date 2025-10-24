const path = require('path');

module.exports.config = {
  name: "reload",
  version: "1.0.0",
  hasPermssion: 3,
  credits: "qt",
  description: "Reload listen và handle",
  commandCategory: "Admin",
  usages: "reload",
  cooldowns: 3
};

module.exports.run = async function({ api, event }) {
  try {
    if (typeof global._reloadListen === 'function') {
      global._reloadListen();
      return api.sendMessage("✅ Đã reload thành công listen.js và các handle!", event.threadID, event.messageID);
    } else {
      return api.sendMessage("❌ Không thể reload.", event.threadID, event.messageID);
    }
  } catch (err) {
    console.error("❌ Lỗi khi reload:", err);
  }
};