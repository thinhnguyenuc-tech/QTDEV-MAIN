const fs = require("fs");
const path = __dirname + "/data/antibdbot.json";

module.exports.config = {
  name: "antibdbot",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "qt",
  description: "Bật/tắt chống đổi tên bot",
  commandCategory: "QTV",
  usages: "[on/off]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const type = args[0]?.toLowerCase();

  if (!["on", "off"].includes(type)) {
    return api.sendMessage("🛠 Dùng: antibdbot on/off", threadID, messageID);
  }

  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (e) {
    data = [];
  }

  if (type === "on") {
    if (!data.includes(threadID)) data.push(threadID);
  } else {
    data = data.filter(id => id != threadID);
  }

  fs.writeFileSync(path, JSON.stringify(data, null, 2));
  return api.sendMessage(`✅ Đã ${type === "on" ? "bật" : "tắt"} chống đổi biệt danh bot cho nhóm này.`, threadID, messageID);
};