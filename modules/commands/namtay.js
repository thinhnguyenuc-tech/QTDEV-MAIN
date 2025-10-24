module.exports.config = {
    name: "namtay",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "qt", 
    description: "ắm tay với người được tag",
    commandCategory: "Giải Trí",
    usages: "namtay [tag]",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "path": "",
        "jimp": ""
    }
};

module.exports.onLoad = async () => {
    const { resolve } = global.nodemodule["path"];
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { downloadFile } = global.utils;
    const dirMaterial = __dirname + `/cache/canvas/`;
    const path = resolve(dirMaterial, 'namtay.png');
    if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path)) await downloadFile("https://files.catbox.moe/dnycdf.jpg", path);
}

async function makeImage({ one, two }) {
    const fs = global.nodemodule["fs-extra"];
    const path = global.nodemodule["path"];
    const axios = global.nodemodule["axios"];
    const jimp = global.nodemodule["jimp"];
    const __root = path.resolve(__dirname, "cache", "canvas");

    let namtay_img = await jimp.read(__root + "/namtay.png");
    let pathImg = __root + `/namtay_${one}_${two}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;

    try {
        let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?height=720&width=720`, { responseType: 'arraybuffer' })).data;
        fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

        let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?height=720&width=720`, { responseType: 'arraybuffer' })).data;
        fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));
    } catch (e) {
        throw new Error("Không thể tải ảnh đại diện.");
    }

    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));
    namtay_img.resize(700, 440).composite(circleOne.resize(80, 80), 256, 63).composite(circleTwo.resize(80, 80), 20, 100);

    let raw = await namtay_img.getBufferAsync("image/png");

    fs.writeFileSync(pathImg, raw);
    fs.unlinkSync(avatarOne);
    fs.unlinkSync(avatarTwo);

    return pathImg;
}

async function circle(image) {
    const jimp = require("jimp");
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args }) {
    const fs = global.nodemodule["fs-extra"];
    const { threadID, messageID, senderID } = event;
    var mention = Object.keys(event.mentions)[0];
    if (!mention) return api.sendMessage("Vui lòng tag 1 người", threadID, messageID);

    var one = senderID, two = mention;
    let tag = event.mentions[mention]?.name || "người bạn";

    try {
        const path = await makeImage({ one, two });
        return api.sendMessage({
            body: `𝗡𝗮̆́𝗺 𝘁𝗮𝘆 𝗻𝗵𝗮𝘂 𝘁𝗵𝗮̣̂𝘁 𝗰𝗵𝗮̣̆𝘁 𝗻𝗵𝗲́ ${tag} đ𝘂̛̀𝗻𝗴 𝗯𝘂𝗼̂𝗻𝗴 𝘁𝗮𝘆 𝗻𝗵𝗲́ 𝗯𝗮𝗲😍`,
            mentions: [{
                tag: tag,
                id: mention
            }],
            attachment: fs.createReadStream(path)
        }, threadID, () => fs.unlinkSync(path), messageID);
    } catch (err) {
        return api.sendMessage("Đã có lỗi xảy ra khi tạo ảnh.", threadID, messageID);
    }
};