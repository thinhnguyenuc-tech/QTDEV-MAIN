module.exports.config = {
  name: "typtest",
  version: "1.0.0",
  hasPermssion: 0, 
  credits: "cc",
  description: "xem ảnh địt nhau",
  commandCategory: "Admin",
  usages: "[số giây/stop]", 
  cooldowns: 5 
};

let typingTimer = null;
let endTyping = null;

module.exports.run = async function({ api, event, args }) {
  if (!api.sendTypMqtt) {
    return api.sendMessage("❌ Đã có lỗi xảy ra...", event.threadID);
  }

  if (args[0]?.toLowerCase() === "stop") {
    if (endTyping) {
      endTyping();
      endTyping = null;
      if (typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
      }
      api.sendMessage("✅ Đã dừng hiển thị typing", event.threadID);
      return;
    } else {
      return api.sendMessage("❌ Không có typing nào đang chạy", event.threadID);
    }
  }

  const time = parseInt(args[0]) || 5;
  const duration = Math.max(1, Math.min(100, time));
  
  endTyping = api.sendTypMqtt(event.threadID);
  api.sendMessage(`⌨️ Đang hiển thị typing trong ${duration} giây...`, event.threadID);
  
  typingTimer = setTimeout(() => {
    if (endTyping) {
      endTyping();
      endTyping = null;
    }
    typingTimer = null;
    api.sendMessage(`✅ Đã dừng hiển thị typing sau ${duration} giây`, event.threadID);
  }, duration * 1000);
};