const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "sex",
  version: "3.0.0",
  hasPermssion: 2,
  credits: "qt",
  description: "Xem sex ngay trên box chat của bạn",
  commandCategory: "Tiện Ích",
  usages: "sex <từ khóa>",
  cooldowns: 1000
};

module.exports.run = async function({ api, event, args }) {
  if (!args[0]) return api.sendMessage("❌ Bạn cần nhập từ khóa để tìm clip.", event.threadID, event.messageID);
  const query = args.join(" ");

  try {
    const res = await axios.get(`https://adidaphat.site/xvideos?q=${encodeURIComponent(query)}`);
    const data = res.data.results;
    if (!data || data.length === 0) return api.sendMessage("❌ Không tìm thấy kết quả.", event.threadID, event.messageID);

    return sendPage(api, event, data, 0, query);

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ Đã xảy ra lỗi khi tìm clip.", event.threadID, event.messageID);
  }
};

async function sendPage(api, event, data, page, query) {
  const perPage = 10;
  const start = page * perPage;
  const sliced = data.slice(start, start + perPage);

  const msg = sliced.map((item, index) =>
    `${index + 1}. ${item.title}\n⏱ Thời lượng: ${item.duration}`
  ).join("\n\n");

  let extra = "\n\n📌 Reply số tương ứng để tải clip bạn muốn.";
  if ((page + 1) * perPage < data.length) {
    extra += `\n👉 Reply "next" để xem trang tiếp theo (${page + 2}).`;
  } else {
    extra += "\n✅ Đã hiển thị hết danh sách.";
  }

  api.sendMessage(`🔎 Kết quả tìm kiếm "${query}" (Trang ${page + 1}):\n\n${msg}${extra}`, event.threadID, (err, info) => {
    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: event.senderID,
      data,
      page,
      query
    });
  }, event.messageID);
}

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { body, threadID, messageID, senderID } = event;
  if (handleReply.author !== senderID) return;
  
  if (body.toLowerCase() === "next") {
    const nextPage = handleReply.page + 1;
    api.unsendMessage(handleReply.messageID);
    const maxPage = Math.ceil(handleReply.data.length / 10);

    if (nextPage >= maxPage) {
      return api.sendMessage("✅ Đã hiển thị hết danh sách.", threadID, messageID);
    }

    return sendPage(api, event, handleReply.data, nextPage, handleReply.query);
  }

  const choice = parseInt(body);
  if (isNaN(choice) || choice < 1 || choice > 10) {
    return api.sendMessage("❌ Vui lòng reply số tương ứng hoặc 'next' để xem tiếp.", threadID, messageID);
  }
  const selectedIndex = handleReply.page * 10 + (choice - 1);
  const selected = handleReply.data[selectedIndex];
  
  if (!selected) return api.sendMessage("❌ Không tìm thấy clip này.", threadID, messageID);

  const downloadApi = `https://adidaphat.site/xvideos/download?url=${encodeURIComponent(selected.url)}`;
api.unsendMessage(handleReply.messageID);
api.setMessageReaction("⏳", messageID, () => {}, true);

try {
  const res = await axios.get(downloadApi);
  const json = res.data;

  if (!json.success || !json.data?.videoUrls?.high) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("❌ Không thể lấy link tải.", threadID, messageID);
  }

  const downloadUrl = json.data.videoUrls.high;
  const safeTitle = selected.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50);
  const path = `${__dirname}/cache/${safeTitle}.mp4`;

  const response = await axios({ url: downloadUrl, method: "GET", responseType: "stream" });
  const writer = fs.createWriteStream(path);

  response.data.pipe(writer);

  writer.on("finish", () => {
    api.sendMessage(
      { body: `📥 ${selected.title}`, attachment: fs.createReadStream(path) },
      threadID,
      () => {
        fs.unlinkSync(path);
        api.setMessageReaction("✅", messageID, () => {}, true); 
      },
      messageID
    );
  });

  writer.on("error", () => {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage("❌ Lỗi khi tải clip.", threadID, messageID);
  });

} catch (e) {
  console.error(e);
  api.setMessageReaction("❌", messageID, () => {}, true);
  return api.sendMessage("❌ Lỗi trong quá trình tải clip.", threadID, messageID);
}
}