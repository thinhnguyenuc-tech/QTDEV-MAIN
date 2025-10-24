const fs = require("fs");
const path = __dirname + "/../commands/data/antibdbot.json"; 

module.exports.config = {
  name: "antibdbot",
  eventType: ["log:user-nickname"],
  version: "1.1.0",
  credits: "qt",
  description: "Chống đổi biệt danh bot"
};

module.exports.run = async function({ api, event }) {
  const { threadID, author, logMessageData } = event;
  const botID = api.getCurrentUserID();
  if (logMessageData.participant_id !== botID) return;

  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (err) {
    data = [];
  }

  if (!data.includes(threadID)) return;
  const prefix = global.config.PREFIX || "!";
  const expectedName = `『 ${prefix} 』 • ${global.config.BOTNAME}`;

  if (!global.config.ADMINBOT.includes(author)) {
    api.changeNickname(expectedName, threadID, botID);
    return api.sendMessage(`⚠️ Chế độ cấm đổi biệt danh Bot đang bật`, threadID);
  }
};