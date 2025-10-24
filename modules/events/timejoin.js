const fs = require("fs");
const path = __dirname + "/../commands/data/timejoin.json";

module.exports.config = {
    name: "timejoin",
    eventType: ["log:unsubscribe", "log:subscribe"],
    version: "1.0.0",
    credits: "qt", // qt newbie
    description: "Tự động lưu và xóa dữ liệu thời gian tham gia của người dùng"
};

module.exports.run = async function ({ event: e }) {
    const { threadID: t, logMessageData: l } = e;
    let timejoinData = {};
    try {
        timejoinData = JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (e) {
        timejoinData = {};
    }

    // Đảm bảo threadID tồn tại
    if (!timejoinData[t]) timejoinData[t] = {};

    if (e.logMessageType === "log:unsubscribe") {
        const v = l.leftParticipantFbId;
        delete timejoinData[t][v];
    }
    else if (e.logMessageType === "log:subscribe") {
        for (let user of l.addedParticipants) {
            timejoinData[t][user.userFbId] = Date.now() + 25200000;
        }
    }

    fs.writeFileSync(path, JSON.stringify(timejoinData, null, 2));
};