const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports.config = {
    name: "atd",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "LocDev - Converted to Mirai by Trae - Enhanced by Trae AI(mod by qt)", // qt newbie thêm chút mắm muối
    description: "Tự động tải tất cả nền tảng",
    commandCategory: "Tiện Ích",
    usages: "Tự động tải",
    cooldowns: 5,
    usePrefix: true
};

module.exports.handleEvent = async function ({ api, event }) {
    if (!event.body) return;

    const url = event.body;
    const isURL = /^http(s)?:\/\//.test(url);

    const patterns = [
        /instagram\.com/,
        /facebook\.com/,
        /pinterest\.com/,
        /soundcloud\.com/,
        /on\.soundcloud\.com/,
        /capcut\.com/,
        /pin\.it/,
        /spotify\.com/,
        /x\.com/,
        /tiktok\.com/,
        /v\.douyin\.com/,
        /threads\.com/,
        /youtube\.com/,
        /youtu\.be/,
        /bilibili\.com/,
        /zingmp3\.vn/
    ];

    const matches = patterns.find(pattern => pattern.test(url));
    if (!matches) return;

    // React with "⏳" to indicate processing
    api.setMessageReaction("⏳", event.messageID, null, true);

    let data;
    try {
        if (/facebook\.com/.test(url)) {
            const fbDown = await axios.get(`https://subhatde.id.vn/fb/download?url=${url}`);
            data = fbDown.data;
        } else {
            const down = await axios.get(`https://j2down.vercel.app/download?url=${url}`);
            data = down.data;
        }
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        // React with "❌" to indicate failure
        return api.setMessageReaction("❌", event.messageID, null, true);
    }

    // Check if data or data.medias doesn't exist or isn't an array
    if (!data || !Array.isArray(data.medias) || data.medias.length === 0) {
        // React with "❓" to indicate no media found
        return api.setMessageReaction("❓", event.messageID, null, true);
    }

    let fileContent = [];
    const findImg = data.medias.find(item => item.type === 'image');

    if (findImg) {
        fileContent = data.medias
            .filter(item => item.type === 'image' || item.type === 'video')
            .map((item, index) => ({
                path: path.join(__dirname, '..', '..', 'modules', 'commands', 'cache', `${Date.now() + index}.${item.type === 'video' ? 'mp4' : 'jpg'}`),
                url: item.url
            }));
    } else {
        fileContent.push({
            path: path.join(__dirname, '..', '..', 'modules', 'commands', 'cache', `${Date.now()}.${data.medias[0].type === 'video' ? 'mp4' : data.medias[0].type === 'audio' ? 'mp3' : 'jpg'}`),
            url: data.medias[0].url
        });
    }

    let attachments = [];
    for (const content of fileContent) {
        try {
            const attachment = await download(content.url, content.path);
            if (attachment.err) {
                // React with "⚠️" if there's an error with one of the downloads
                api.setMessageReaction("⚠️", event.messageID, null, true);
                continue;
            }
            attachments.push(attachment);
        } catch (error) {
            console.error('Download error:', error);
            continue;
        }
    }

    if (attachments.length === 0) {
        // React with "📭" if no attachments were successfully downloaded
        return api.setMessageReaction("📭", event.messageID, null, true);
    }

    let messageBody = `🎦 ${data.title || "AUTODOWN"}`;

    // Send the message with attachments
    api.sendMessage({
        body: messageBody,
        attachment: attachments
    }, event.threadID, (err, info) => {
        if (err) {
            // React with "🔄" if sending failed
            return api.setMessageReaction("🔄", event.messageID, null, true);
        }
        // React with "✅" to indicate success
        api.setMessageReaction("✅", event.messageID, null, true);
    }, event.messageID);
};

module.exports.run = async function ({ api, event }) {
    return api.sendMessage(
        '🎦 AUTODOWN tự động tải link đó',
        event.threadID,
        event.messageID
    );
};

async function download(url, savePath) {
    try {
        const dirPath = path.dirname(savePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const response = await axios.get(url, { responseType: 'arraybuffer' });

        fs.writeFileSync(savePath, response.data);
        setTimeout(() => {
            fs.unlink(savePath, (err) => {
                if (err) console.error('Lỗi khi xóa tệp:', err);
            });
        }, 1000 * 60);

        return fs.createReadStream(savePath);
    } catch (error) {
        console.error('Lỗi khi tải:', error.message);
        return { err: true };
    }
}