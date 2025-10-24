const fs = require("fs-extra");
const path = require("path");

const dataFilePath = path.resolve(__dirname, "data/camtu.json");

module.exports.config = {
  name: "camtu",
  version: "3.0.0",
  credits: "qt",
  hasPermssion: 1,
  description: "Tự động phát hiện và cảnh báo thành viên sử dụng từ ngữ bị cấm",
  usages: "camtu on/off/add/del/list/set/check/kick",
  commandCategory: "QTV",
  cooldowns: 0
};

function loadData() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeJsonSync(dataFilePath, {});
  }
  return fs.readJsonSync(dataFilePath);
}

function saveData(data) {
  fs.writeJsonSync(dataFilePath, data, { spaces: 2 });
}

module.exports.run = async ({ api, event, args, Users }) => {
  const { threadID, messageID } = event;
  const command = args[0];
  const groupData = loadData();

  if (!groupData[threadID]) {
    groupData[threadID] = {
      settings: {
        enabled: false,
        bannedWords: [],
        violationLimit: 3
      },
      violations: {},
      kicked: []
    };
  }

  const threadSettings = groupData[threadID].settings;

  switch (command) {

    case "check": {
      const threadData = groupData[threadID];
      const { violations, settings } = threadData;
      const entries = Object.entries(violations).filter(([uid, count]) => count > 0);
      if (entries.length === 0) return api.sendMessage("Không ai đang vi phạm từ cấm.", threadID, messageID);
      let msg = "⚠️ Đang vi phạm từ cấm:\n";
      const names = await Promise.all(entries.map(async ([uid]) => {
        try {
          return await Users.getNameUser(uid);
        } catch (e) {
          return uid;
        }
      }));
      for (const [idx, [uid, count]] of entries.entries()) {
        let name = names[idx];
        let lastWord = "";
        if (threadData.lastWord && threadData.lastWord[uid]) lastWord = threadData.lastWord[uid];
        msg += `\n${idx + 1}. ${name}\n🔹 Từ cấm: "${lastWord}"\n🔹 Vi phạm: ${count}/${settings.violationLimit}\n`;
      }
      msg += "\nReply số để reset số lần vi phạm";
      return api.sendMessage(msg, threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "resetviolation",
            uids: entries.map(([uid]) => uid)
          });
        }
      });
    }

    case "on":
      threadSettings.enabled = true;
      saveData(groupData);
      return api.sendMessage("Đã bật lọc từ cấm.", threadID, messageID);

    case "off":
      threadSettings.enabled = false;
      saveData(groupData);
      return api.sendMessage("Đã tắt lọc từ cấm.", threadID, messageID);

    case "add":
      if (args.length < 2) return api.sendMessage("Nhập từ cấm.", threadID, messageID);
      const wordsToAdd = args.slice(1).join(" ").split(",").map(w => w.trim());
      const newWords = wordsToAdd.filter(word => !threadSettings.bannedWords.includes(word));
      threadSettings.bannedWords.push(...newWords);
      saveData(groupData);
      return api.sendMessage(`Đã thêm ${newWords.length} từ.`, threadID, messageID);

    case "del":
      if (args.length < 2) return api.sendMessage("Nhập từ xoá.", threadID, messageID);
      const wordsToDelete = args.slice(1).join(" ").split(",").map(w => w.trim());
      const deletedWords = wordsToDelete.filter(word => threadSettings.bannedWords.includes(word));
      threadSettings.bannedWords = threadSettings.bannedWords.filter(word => !deletedWords.includes(word));
      saveData(groupData);
      return api.sendMessage(`Đã xoá ${deletedWords.length} từ.`, threadID, messageID);


    case "list": {
      const bannedList = threadSettings.bannedWords;
      if (bannedList.length === 0) return api.sendMessage("Không có từ cấm nào.", threadID, messageID);
      const msg = bannedList.map((w, i) => `📃 DANH SÁCH TỪ CẤM:\n\n${i + 1}. ${w}`).join("\n") +
        "\n\nReply số để xóa từ cấm";
      return api.sendMessage(msg, threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            threadID,
            author: event.senderID,
            type: "delword"
          });
        }
      });
    }

    case "set":
      const limit = parseInt(args[1]);
      if (isNaN(limit) || limit < 1) return api.sendMessage("Nhập số lần hợp lệ.", threadID, messageID);
      threadSettings.violationLimit = limit;
      saveData(groupData);
      return api.sendMessage(`Đã đặt số lần vi phạm tối đa là ${limit} lần.`, threadID, messageID);

    case "kick": {
      const kickedList = groupData[threadID].kicked || [];
      if (kickedList.length === 0) {
        return api.sendMessage("Chưa có data người bị kick từ cấm.", threadID, messageID);
      }

      const names = await Promise.all(kickedList.map(async (uid) => {
        try {
          return await Users.getNameUser(uid);
        } catch {
          return uid;
        }
      }));
      let msg = "🧾 Thành viên đã bị kick:\n\n";
      kickedList.forEach((uid, i) => {
        const name = names[i];
        msg += `${i + 1}. ${name} (${uid})\n`;
      });
      msg += "\n📥 Reply số để mời lại người tương ứng.";

      return api.sendMessage(msg, threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            threadID,
            author: event.senderID,
            type: "restore_select",
            uids: kickedList
          });
        }
      });
    }

    default:
      return api.sendMessage(
        `🛡️ CAMTU COMMANDS\n
❥ camtu on/off → Bật/tắt lọc từ cấm
❥ camtu add → Thêm từ cấm
❥ camtu del → Xoá từ cấm
❥ camtu list → Xem danh sách từ cấm
❥ camtu set → Đặt giới hạn vi phạm
❥ camtu check → Xem người vi phạm
❥ camtu kick → Mời lại người đã bị kick
`,
        threadID, messageID
      );
  }
};

module.exports.handleReply = async ({ api, event, handleReply, args, Users }) => {
  const { threadID, messageID, senderID, body } = event;
  if (handleReply.type === "delword" && handleReply.author == senderID) {
    const groupData = loadData();
    if (!groupData[threadID]) return;
    const bannedWords = groupData[threadID].settings.bannedWords;
    const nums = body.split(/\s+/).map(x => parseInt(x)).filter(x => !isNaN(x) && x > 0 && x <= bannedWords.length);
    if (nums.length === 0) return api.sendMessage("Không hợp lệ.", threadID, messageID);
    const removed = [];
    nums.sort((a, b) => b - a).forEach(idx => {
      removed.push(bannedWords[idx - 1]);
      bannedWords.splice(idx - 1, 1);
    });
    saveData(groupData);
    return api.sendMessage(
      `Đã xóa từ cấm:\n${removed.map((w, i) => `${i + 1}. ${w}`).join("\n")}`,
      threadID, messageID
    );
  }

  if (handleReply.type === "resetviolation" && handleReply.author == senderID) {
    const groupData = loadData();
    if (!groupData[threadID]) return;
    const threadData = groupData[threadID];
    const nums = body.split(/\s+/).map(x => parseInt(x)).filter(x => !isNaN(x) && x > 0 && x <= handleReply.uids.length);
    if (nums.length === 0) return api.sendMessage("Không hợp lệ.", threadID, messageID);
    const resetNames = [];
  for (const i of nums) {
    const uid = handleReply.uids[i - 1];
    threadData.violations[uid] = 0;
    const name = await Users.getNameUser(uid) || uid;
    resetNames.push(name);
  }

  saveData(groupData);
    return api.sendMessage(
      `Đã reset số lần vi phạm cho:\n${resetNames.map((n, i) => `${i + 1}. ${n}`).join("\n")}`,
      threadID, messageID
    );
  }

  if (handleReply.type === "restore_select") {
  const groupData = loadData();
  const threadData = groupData[threadID];
  if (!threadData) return api.sendMessage("Không tìm thấy dữ liệu nhóm.", threadID, messageID);

  const uids = handleReply.uids;
  const nums = body.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n) && n > 0 && n <= uids.length);
  const restoreUIDs = nums.map(i => uids[i - 1]);
  const success = [], fail = [];

  for (const uid of restoreUIDs) {
    try {
      await api.addUserToGroup(uid, threadID);
      success.push(uid);
    } catch (e) {
      fail.push(uid);
    }
  }

  threadData.kicked = threadData.kicked.filter(uid => !success.includes(uid));
  saveData(groupData);

  const userInfo = await api.getUserInfo([...success, ...fail]);
  let msg = `🔁 Kết quả mời lại:\n`;

  if (success.length)
    msg += `✅ Thành công:\n${success.map((uid, i) => `${i + 1}. ${userInfo[uid]?.name || uid}`).join("\n")}\n`;
  if (fail.length)
    msg += `❌ Thất bại:\n${fail.map((uid, i) => `${i + 1}. ${userInfo[uid]?.name || uid}`).join("\n")}`;
  return api.sendMessage(msg, threadID);
  }
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, senderID, body } = event;
  if (!body) return;

  const groupData = loadData();
  if (!groupData[threadID] || !groupData[threadID].settings.enabled) return;

  const threadData = groupData[threadID];
  const { bannedWords, violationLimit } = threadData.settings;
  const messageText = body.toLowerCase();

  const matchedWord = bannedWords.find(word => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(messageText);
  });

  if (matchedWord) {
    if (!threadData.violations[senderID]) {
      threadData.violations[senderID] = 1;
    } else {
      threadData.violations[senderID] += 1;
    }
    if (!threadData.lastWord) threadData.lastWord = {};
    threadData.lastWord[senderID] = matchedWord;
    saveData(groupData);
    const currentCount = threadData.violations[senderID];
    let name = senderID;
    try {
      const userInfo = await api.getUserInfo(senderID);
      if (userInfo && userInfo[senderID] && userInfo[senderID].name) {
        name = userInfo[senderID].name;
      }
    } catch (e) {}
    const msg = `⚠️ Phát hiện từ cấm: "${matchedWord}"
🔹 Cảnh cáo: ${name}
🔹 Vi phạm: ${currentCount}/${violationLimit}`;
    if (currentCount >= violationLimit) {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const botID = api.getCurrentUserID();
        if (!threadInfo.adminIDs.some(ad => ad.id == botID)) {
          return api.sendMessage(msg + `\n➡️ Bot không có quyền quản trị viên.`, threadID);
        }
        await api.removeUserFromGroup(senderID, threadID);
        if (!groupData[threadID].kicked) groupData[threadID].kicked = [];
        if (!groupData[threadID].kicked.includes(senderID)) groupData[threadID].kicked.push(senderID);
        if (threadData.violations) delete threadData.violations[senderID];
        if (threadData.lastWord) delete threadData.lastWord[senderID];
        saveData(groupData);
        return api.sendMessage(msg + `\n➡️ Đã bị kick khỏi nhóm.`, threadID);
      } catch (error) {
        return api.sendMessage("Lỗi kick: " + error.message, threadID);
      }
    } else {
      return api.sendMessage(msg, threadID);
    }
  }
};