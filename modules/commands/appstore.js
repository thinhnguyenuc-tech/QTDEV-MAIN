const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

module.exports.config = {
  name: "appstore",
  version: "1.0.1",
  usePrefix: false,
  hasPermssion: 0,
  credits: "tiến",
  description: "Tìm kiếm và xem thông tin ứng dụng trên App Store",
  commandCategory: "Thông Tin",
  usages: "[tên ứng dụng]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  if (args.length === 0) {
    return api.sendMessage("Vui lòng nhập tên ứng dụng cần tìm.", event.threadID, event.messageID);
  }

  const appName = args.join(" ");
  const encodedAppName = encodeURIComponent(appName);

  try {
    const response = await axios.get(`https://itunes.apple.com/search?term=${encodedAppName}&entity=software`);
    const apps = response.data.results;

    if (apps.length === 0) {
      return api.sendMessage("Không tìm thấy ứng dụng nào với từ khóa bạn cung cấp.", event.threadID, event.messageID);
    }

    const searchResults = apps.slice(0, 5).map((app, index) => {
      return `${index + 1}. ${app.trackName} - ${app.artistName}\n` +
             `📱 Giá: ${app.formattedPrice || "Miễn phí"}\n` +
             `⭐️ Đánh giá: ${app.averageUserRating || "Chưa có"} (${app.userRatingCount || 0} lượt)\n` +
             `🌐 Xem thêm: ${app.trackViewUrl}\n`;
    }).join("\n\n");

    const attachments = [];
    for (const app of apps.slice(0, 5)) {
      try {
        const imageUrl = app.artworkUrl512; // Ảnh độ phân giải cao hơn
        const imagePath = path.resolve(__dirname, 'cache', `${app.trackId}.jpg`);
        
        // Tải xuống hình ảnh
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, 'binary'));

        // Thêm file vào danh sách đính kèm
        attachments.push(fs.createReadStream(imagePath));
      } catch (error) {
        console.error(`Lỗi tải ảnh cho ứng dụng ${app.trackName}:`, error.message);
      }
    }

    // Gửi kết quả
    api.sendMessage({
      body: `🔍 Kết quả tìm kiếm cho từ khóa: "${appName}"\n\n${searchResults}`,
      attachment: attachments
    }, event.threadID, () => {
      // Xóa file cache sau khi gửi
      attachments.forEach(file => fs.unlinkSync(file.path));
    }, event.messageID);

  } catch (error) {
    console.error("Lỗi khi gọi API App Store:", error.message);
    api.sendMessage("Đã xảy ra lỗi khi tìm kiếm ứng dụng. Vui lòng thử lại sau.", event.threadID, event.messageID);
  }
};