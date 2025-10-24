const axios = require("axios");
const cheerio = require("cheerio");

module.exports.config = {
  name: "vnex",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "qt + GPT-Fix",
  description: "Lấy tin tức mới nhất từ VNExpress",
  commandCategory: "Thông Tin",
  usages: "",
  cooldowns: 5,
  dependencies: { "axios": "", "cheerio": "" }
};

module.exports.run = async function ({ api, event }) {
  try {
    const { data } = await axios.get("https://vnexpress.net/tin-tuc-24h");
    const $ = cheerio.load(data);

    // Lấy bài đầu tiên
    const firstNews = $(".item-news:first");
    const title = firstNews.find("h3.title-news a").attr("title");
    const link = firstNews.find("h3.title-news a").attr("href");
    const desc = firstNews.find("p.description a").text().trim();

    if (!title || !link) {
      return api.sendMessage("❌ Không thể lấy tin tức. Có thể trang VNExpress thay đổi cấu trúc.", event.threadID);
    }

    const msg = `📰 𝗧𝗶𝗻 𝗧𝘂̛́𝗰 𝗠𝗼̛́𝗶 𝗡𝗵𝗮̂́𝘁\n━━━━━━━━━━━━━━\n📌 Tiêu đề: ${title}\n📄 Mô tả: ${desc}\n🔗 Liên kết: ${link}`;
    return api.sendMessage(msg, event.threadID, event.messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("⚠️ Lỗi khi lấy tin tức từ VNExpress!", event.threadID, event.messageID);
  }
};
