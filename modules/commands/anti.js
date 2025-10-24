const fs = require("fs-extra");
const path = require("path");
const dataPath = global.anti;
const axios = require("axios");

module.exports.config = {
  name: "anti",
  version: "1.0.2",
  hasPermssion: 1,
  credits: "qt", //qt newbie , nghiêm cấm hành vi đổi credits
  description: "Bật/tắt các chế độ chống đổi (tên, ảnh, biệt danh, out, chủ đề) trong nhóm",
  commandCategory: "QTV",
  usages: "anti [name|image|nickname|out|theme|icon|tagall]",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({
    boxname: [],
    boximage: [],
    antiNickname: [],
    antiout: {},
    boxtheme: [],
    boxemoji: [],
    tagall: []
  }, null, 2));

  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const [type, state] = args;

  if (!type) {
    const status = {
      name: data.boxname.some(i => i.threadID === threadID) ? "✅ Bật" : "❌ Tắt",
      image: data.boximage.some(i => i.threadID === threadID) ? "✅ Bật" : "❌ Tắt",
      nickname: data.antiNickname.some(i => i.threadID === threadID) ? "✅ Bật" : "❌ Tắt",
      out: data.antiout[threadID] ? "✅ Bật" : "❌ Tắt",
      theme: data.boxtheme.some(i => i.threadID === threadID) ? "✅ Bật" : "❌ Tắt",
      emoji: data.boxemoji.some(i => i.threadID === threadID) ? "✅ Bật" : "❌ Tắt",
      tagall: data.tagall.some(i => i.threadID === threadID) ? "✅ Bật" : "❌ Tắt"
    };
    return api.sendMessage(
      `🛡️ Trạng thái chống:\n\n❥ Tên nhóm: ${status.name}\n❥ Ảnh nhóm: ${status.image}\n❥ Biệt danh: ${status.nickname}\n❥ Out nhóm: ${status.out}\n❥ Chủ đề: ${status.theme}\n❥ Icon: ${status.emoji}\n❥ Tag all: ${status.tagall}\n\n📌 anti name|image|nickname|out|theme|icon|tagall on/off`,
      threadID,
      messageID
    );
  }

  if (!["name", "image", "nickname", "out", "theme", "icon", "tagall"].includes(type))
    return api.sendMessage("🔧 Các chế độ: name, image, nickname, out, theme, icon, tagall", threadID, messageID);

  if (!state || !["on", "off"].includes(state))
    return api.sendMessage("⚠️ Vui lòng nhập tham số `on` hoặc `off`.", threadID, messageID);

  const isOn = state === "on";

  switch (type) {
    case "name": {
      const index = data.boxname.findIndex(i => i.threadID === threadID);
      if (isOn) {
        const threadInfo = await api.getThreadInfo(threadID);
        if (index === -1) data.boxname.push({ threadID, name: threadInfo.threadName });
        else data.boxname[index].name = threadInfo.threadName;
        api.sendMessage("✅ Đã bật chống đổi tên nhóm", threadID, messageID);
      } else {
        if (index !== -1) data.boxname.splice(index, 1);
        api.sendMessage("❌ Đã tắt chống đổi tên nhóm", threadID, messageID);
      }
      break;
    }
    case "image": {
      const index = data.boximage.findIndex(i => i.threadID === threadID);
      if (isOn) {
        const threadInfo = await api.getThreadInfo(threadID);
        if (!threadInfo.imageSrc) return api.sendMessage("⚠️ Nhóm chưa có ảnh đại diện", threadID, messageID);

        try {
          
          const imgRes = await axios.get(threadInfo.imageSrc, { responseType: "arraybuffer" });
          const base64Img = Buffer.from(imgRes.data).toString("base64");
          const res = await axios({
            method: "POST",
            url: "https://api.imgbb.com/1/upload",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: new URLSearchParams({
              image: base64Img,
              key: "90a697e7b4a9f767392b8bf2df485ddb"
            })
          });
          const imgUrl = res.data.data.url;

          if (index === -1) data.boximage.push({ threadID, url: imgUrl });
          else data.boximage[index].url = imgUrl;

          api.sendMessage("✅ Đã bật chống đổi ảnh nhóm", threadID, messageID);
        } catch (error) {
          console.error(error);
          api.sendMessage("❌ Có lỗi khi lưu ảnh nhóm!", threadID, messageID);
        }
      } else {
        if (index !== -1) data.boximage.splice(index, 1);
        api.sendMessage("❌ Đã tắt chống đổi ảnh nhóm", threadID, messageID);
      }
      break;
    }
    case "nickname": {
      const index = data.antiNickname.findIndex(i => i.threadID === threadID);
      if (isOn) {
        const threadInfo = await api.getThreadInfo(threadID);
        const nickData = {};
        for (const id in threadInfo.nicknames) {
          nickData[id] = threadInfo.nicknames[id];
        }
        if (index === -1) data.antiNickname.push({ threadID, data: nickData });
        else data.antiNickname[index].data = nickData;
        api.sendMessage("✅ Đã bật chống đổi biệt danh", threadID, messageID);
      } else {
        if (index !== -1) data.antiNickname.splice(index, 1);
        api.sendMessage("❌ Đã tắt chống đổi biệt danh", threadID, messageID);
      }
      break;
    }
    case "out": {
      if (isOn) data.antiout[threadID] = true;
      else delete data.antiout[threadID];
      api.sendMessage(isOn ? "✅ Đã bật chống out nhóm" : "❌ Đã tắt chống out nhóm", threadID, messageID);
      break;
    }
    case "theme": {
      const index = data.boxtheme.findIndex(i => i.threadID === threadID);
      if (isOn) {
        const threadInfo = await api.getThreadInfo(threadID);

        let themeID = null;
        if (threadInfo.threadTheme) {
          if (typeof threadInfo.threadTheme === "object" && threadInfo.threadTheme.id) {
            themeID = String(threadInfo.threadTheme.id);
          } else if (typeof threadInfo.threadTheme === "string") {
            themeID = threadInfo.threadTheme;
          }
        }
        themeID = themeID ||
          (threadInfo.theme_fbid && String(threadInfo.theme_fbid)) ||
          (threadInfo.thread_theme && String(threadInfo.thread_theme)) ||
          (threadInfo.theme && String(threadInfo.theme)) ||
          (threadInfo.themeID && String(threadInfo.themeID));

        if (!themeID || themeID === "undefined" || themeID === "null")
          return api.sendMessage("⚠️ Không thể lấy chủ đề nhóm hiện tại!", threadID, messageID);

        if (index === -1) data.boxtheme.push({ threadID, themeID });
        else data.boxtheme[index].themeID = themeID;

        api.sendMessage("✅ Đã bật chống đổi chủ đề nhóm", threadID, messageID);
      } else {
        if (index !== -1) data.boxtheme.splice(index, 1);
        api.sendMessage("❌ Đã tắt chống đổi chủ đề nhóm", threadID, messageID);
      }
      break;
    }
    case "icon": {
      const index = data.boxemoji.findIndex(i => i.threadID === threadID);
      if (isOn) {
        const threadInfo = await api.getThreadInfo(threadID);
        const emoji = threadInfo.emoji || null;
        if (!emoji) return api.sendMessage("⚠️ Nhóm chưa có icon", threadID, messageID);
        if (index === -1) data.boxemoji.push({ threadID, emoji });
        else data.boxemoji[index].emoji = emoji;
        api.sendMessage("✅ Đã bật chống đổi icon nhóm", threadID, messageID);
      } else {
        if (index !== -1) data.boxemoji.splice(index, 1);
        api.sendMessage("❌ Đã tắt chống đổi icon nhóm", threadID, messageID);
      }
      break;
    }
    case "tagall": {
      const index = data.tagall.findIndex(i => i.threadID === threadID);
      if (isOn) {
        if (index === -1) data.tagall.push({ threadID });
        api.sendMessage("✅ Đã bật chống tag all (tag all = kick)", threadID, messageID);
      } else {
        if (index !== -1) data.tagall.splice(index, 1);
        api.sendMessage("❌ Đã tắt chống tag all", threadID, messageID);
      }
      break;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};