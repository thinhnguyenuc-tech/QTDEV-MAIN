const axios = require("axios");

module.exports.config = {
  name: "vdgai",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "qt", // qt newbie biết gì đâu mà cứ bảo idol
  description: "Gửi video gái random",
  commandCategory: "Giải Trí",
  usages: "",
  cooldowns: 3
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;
  try {
    const res = await axios.get("https://qt-dev.vercel.app/api/video-girl");
    const videoUrl = res.data.url;
    const videoRes = await axios.get(videoUrl, { responseType: "stream" });
    api.sendMessage({
      body: "🌸 Video gái đây ~",
      attachment: videoRes.data
    }, threadID, messageID);
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Không lấy được video, thử lại sau!", threadID, messageID);
  }
};