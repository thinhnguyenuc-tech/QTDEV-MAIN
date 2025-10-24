const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "topanime",
    version: "1.0.2", 
    credits: "qt",
    hasPermssion: 0,
    description: "Xem top anime từ MyAnimeList",
    commandCategory: "Thông Tin",
    usages: "[all | trending | airing]", 
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const clientId = "ca869af7d8ce7a67fbfd8a2cecc248ef"; 

    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

    let rankingType = "all"; 
    let title = "📊 Top Anime (Toàn Bộ)"; 

    
    if (args.length > 0) {
        const arg = args[0].toLowerCase();
        if (arg === "airing") {
            rankingType = "bypopularity";
            title = "🔥 Top Anime Phổ Biến Nhất";
        } else if (arg === "trending") {
            rankingType = "airing";
            title = "📺 Top Anime Đang Phát Sóng";
        } else if (arg === "all") {
            rankingType = "all";
            title = "📊 Top Anime (Toàn Bộ)";
        } else {
            return api.sendMessage(
                "Sai cú pháp. Vui lòng sử dụng: !topanime [all | trending | airing]",
                event.threadID,
                event.messageID
            );
        }
    }

    try {
        const res = await axios.get("https://api.myanimelist.net/v2/anime/ranking", {
            headers: { "X-MAL-CLIENT-ID": clientId },
            params: {
                ranking_type: rankingType, 
                limit: 6,
                fields: "title,mean,rank,main_picture"
            }
        });

        const list = res.data.data;
        let msg = `${title}\n\n`;
        const attachments = [];

        for (const item of list) {
            const anime = item.node;
            msg += `🥇 #${anime.rank} - ${anime.title} (${anime.mean || "?"}⭐)\n`;

            if (anime.main_picture?.medium) {
                const imgPath = path.join(cachePath, `${anime.rank}.jpg`);
                const writer = fs.createWriteStream(imgPath);
                const imageRes = await axios.get(anime.main_picture.medium, { responseType: "stream" });
                imageRes.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on("finish", resolve);
                    writer.on("error", reject);
                });

                attachments.push(fs.createReadStream(imgPath));
            }
        }

        api.sendMessage({ body: msg, attachment: attachments }, event.threadID, () => {
            
            for (const file of attachments) {
                try { fs.unlinkSync(file.path); } catch (e) {}
            }
        }, event.messageID);

    } catch (err) {
        console.error(err?.response?.data || err.message);
        let errorMessage = "⚠️ Đã xảy ra lỗi khi truy cập MyAnimeList! Vui lòng thử lại sau.";
        if (err?.response?.status === 400) {
            errorMessage += "\n(Lỗi dữ liệu yêu cầu, có thể do Client ID hoặc tham số)";
        } else if (err?.response?.status === 401) {
            errorMessage += "\n(Lỗi xác thực, Client ID có thể không đúng)";
        } else if (err?.response?.status === 403) {
            errorMessage += "\n(Không có quyền truy cập API)";
        } else if (err?.response?.status === 404) {
            errorMessage += "\n(Endpoint không tìm thấy)";
        } else if (err?.response?.status === 429) {
            errorMessage += "\n(Bạn đang gửi quá nhiều yêu cầu, vui lòng chờ ít phút)";
        }
        api.sendMessage(errorMessage, event.threadID, event.messageID);
    }
};