const fs = require("fs");
const path = require("path");
const antioutPath = path.join(__dirname, "../commands", "data", "antiout.json");
const moment = require("moment-timezone");

module.exports.config = {
  name: "antiout",
  creadits: "qt",
  eventType: ["log:unsubscribe"],
};

module.exports.run = async function ({ api, event, Users }) {
  const threadID = event.threadID;
  const userID = event.logMessageData?.leftParticipantFbId;
  const authorID = event.author;

  if (!userID || userID === api.getCurrentUserID() || userID !== authorID) return;

  if (!fs.existsSync(antioutPath)) return;
  const antiout = JSON.parse(fs.readFileSync(antioutPath, "utf-8"));
  if (!antiout[threadID]) return;

  const name = await Users.getNameUser(userID) || "Người dùng Facebook";
  const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss - DD/MM/YYYY");

  try {
    await api.addUserToGroup(userID, threadID);
    return api.sendMessage(
      `[💢 ANTIOUT]\nĐã thêm lại ${name} vào nhóm lúc ${time}`,
      threadID
    );
  } catch (e) {
    return api.sendMessage(
      `[⚠️ ANTIOUT]\nKhông thể thêm lại ${name} vào nhóm.`,
      threadID
    );
  }
};