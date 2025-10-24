const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "givefile",
  version: "1.0.0",
  hasPermssion: 3,
  credits: "qt",
  description: "Share mô-đun",
  commandCategory: "Admin",
  usages: "givefile <tên file>",
  cooldowns: 2
};

module.exports.run = async ({ args, api, event }) => {
  if (event.senderID != 100051439970359)
    return api.sendMessage("Quyền lồn biên giới?", event.threadID);

  if (!args[0])
    return api.sendMessage("❌ Vui lòng nhập tên file", event.threadID);

  // Gộp từ khóa lại và thêm .js nếu chưa có
  let keyword = args.join(" ").toLowerCase();
  if (!keyword.endsWith(".js")) keyword += ".js";

  // Đọc danh sách file trong thư mục hiện tại
  const allFiles = fs.readdirSync(__dirname);

  // Tìm file khớp tên tuyệt đối (không chứa/bao gồm)
  const matchedFile = allFiles.find(f => f.toLowerCase() === keyword);

  if (!matchedFile)
    return api.sendMessage(`❌ Không tồn tại file ${keyword}`, event.threadID);

  const filePath = path.join(__dirname, matchedFile);
  let tempFile = null;

  try {
    let stream;

    if (matchedFile.endsWith(".js")) {
      tempFile = filePath.replace(".js", ".txt");
      fs.copyFileSync(filePath, tempFile);
      stream = fs.createReadStream(tempFile);
    } else {
      stream = fs.createReadStream(filePath);
    }

    api.sendMessage({ attachment: stream }, event.threadID, () => {
      if (tempFile) fs.unlinkSync(tempFile);
    });

  } catch (err) {
    return api.sendMessage(`❌ Không thể gửi file: ${matchedFile}`, event.threadID);
  }
};