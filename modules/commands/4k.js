const cloudinary = require('cloudinary').v2;
const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');

cloudinary.config({
  cloud_name: "dge5pz1a5",
  api_key: "592562212941386",
  api_secret: "h66eBtHZ-9URxVL1mvtM8uCcll0"
});

module.exports.config = {
    name: "4k",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "qt",
    description: "Làm nét ảnh bằng AI",
    commandCategory: "Tiện Ích",
    cooldowns: 5,
    usePrefix: true
};

module.exports.run = async function ({ api, event }) {
    let imgFile;
    if (event.messageReply) {
        imgFile = event.messageReply.attachments?.find(attachment => attachment.type == "photo");
    }
    if (!imgFile && event.attachments && event.attachments.length > 0) {
        imgFile = event.attachments.find(attachment => attachment.type == "photo");
    }

    if (!imgFile)
        return api.sendMessage("Vui lòng reply hoặc gửi ảnh để làm nét.", event.threadID, event.messageID);

    const tempPath = path.join(__dirname, 'cache', `cloud4k_${event.senderID}_${Date.now()}.jpg`);
    const response = await axios.get(imgFile.url, { responseType: 'arraybuffer' });
    fs.writeFileSync(tempPath, response.data);

    api.sendMessage("⏳ Đang làm nét ảnh...", event.threadID, async (err, info) => {
        try {
            const upload = await cloudinary.uploader.upload(tempPath, {
                folder: "4k_restore_ai"
            });
            const public_id = upload.public_id;
            const restoreUrl = cloudinary.url(public_id, { effect: "gen_restore", format: "png" });
            const restoreRes = await axios.get(restoreUrl, { responseType: "arraybuffer" });

            const outPath = tempPath.replace(".jpg", "_restored.png");
            fs.writeFileSync(outPath, restoreRes.data);

            await api.sendMessage({
                body: `✅ Done!\n`,
                attachment: fs.createReadStream(outPath)
            }, event.threadID, () => {
                fs.unlinkSync(tempPath);
                fs.unlinkSync(outPath);
                api.unsendMessage(info.messageID);
            }, event.messageID);

        } catch (error) {
            return api.sendMessage(`Đã xảy ra lỗi: ${error.message}`, event.threadID, event.messageID);
        }
    }, event.messageID);
};