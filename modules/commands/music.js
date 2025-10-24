const ytdl = require("ytdl-core");
const yts = require("yt-search");

module.exports.config = {
  name: "nhac",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Thịnh Nguyễn x GPT-5",
  description: "Phát nhạc từ YouTube",
  commandCategory: "Giải trí",
  usages: "[tên bài hát]",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const query = args.join(" ");
  if (!query) return api.sendMessage("Vui lòng nhập tên bài hát 🎵", event.threadID, event.messageID);

  try {
    const result = await yts(query);
    if (!result.videos.length) return api.sendMessage("Không tìm thấy bài nào!", event.threadID, event.messageID);

    const video = result.videos[0];
    const message = `🎶 ${video.title}\n📺 ${video.url}\n⏱️ Thời lượng: ${video.timestamp}`;
    api.sendMessage(message, event.threadID, event.messageID);

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ Lỗi khi tìm bài hát!", event.threadID, event.messageID);
  }
};
