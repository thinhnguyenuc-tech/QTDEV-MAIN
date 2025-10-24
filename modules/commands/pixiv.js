const axios = require("axios");
const fs = require("fs-extra");
const { createReadStream } = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "pixiv",
    version: "1.0",
    hasPermssion: 0,
    credits: "TatsuYTB",
    description: "Tìm kiếm ảnh trên Pixiv",
    commandCategory: "Thông Tin",
    usages: "[từ khóa]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    if (!args[0]) return api.sendMessage("Vui lòng nhập từ khóa tìm kiếm!", event.threadID);

    api.sendMessage("Vui lòng chờ...", event.threadID, async () => {
        const keyword = args.join(" ");
        const url = `https://www.pixiv.net/en/tags/${keyword}`;
        try {
            const response = await axios.get(url);
            const html = response.data;

            const imageUrls = [];
            const regex = /data-src="(.*?)"/g;
            let match;
            while ((match = regex.exec(html)) !== null) {
                imageUrls.push(match[1]);
            }

            if (!imageUrls || imageUrls.length === 0) {
                api.sendMessage(`Không tìm thấy kết quả nào với từ khóa "${keyword}"`, event.threadID);
                return;
            }

            await fs.ensureDir(path.join(__dirname, "pixiv", "anh"));
            const downloadedImages = [];
            for (let i = 0; i < Math.min(20, imageUrls.length); i++) {
                const imageUrl = imageUrls[i];
                const imageName = imageUrl.split("/").pop();
                const imagePath = path.join(__dirname, "pixiv", "anh", imageName);
                const imageStream = fs.createWriteStream(imagePath);
                const response = await axios({
                    url: imageUrl,
                    method: "GET",
                    responseType: "stream"
                });
                response.data.pipe(imageStream);
                await new Promise(resolve => imageStream.on("finish", resolve));
                downloadedImages.push(imagePath);
            }

            const message = `Kết quả tìm kiếm hàng đầu với từ khóa "${keyword}":`;
            api.sendMessage({ body: message, attachment: await Promise.all(downloadedImages.map(imagePath => createReadStream(imagePath))) }, event.threadID);

            downloadedImages.forEach(imagePath => fs.unlinkSync(imagePath));
        } catch (error) {
            console.error("Error:", error);
            api.sendMessage(`Đã xảy ra lỗi khi tìm kiếm ảnh trên Pixiv với từ khóa "${keyword}"`, event.threadID);
        }
    });
};