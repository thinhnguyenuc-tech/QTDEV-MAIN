const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "setprefix",
    version: "1.0.1",
    hasPermssion: 1,
    credits: "qt",
    description: "Đặt lại prefix của nhóm",
    commandCategory: "QTV",
    usages: "[prefix/reset]",
    cooldowns: 0
};

module.exports.handleReaction = async function({ api, event, Threads, handleReaction }) {
    try {
        if (event.userID != handleReaction.author) return;
        const { threadID, messageID } = event;
        var data = (await Threads.getData(String(threadID))).data || {};
        const prefix = handleReaction.PREFIX;
        data["PREFIX"] = prefix;
        await Threads.setData(threadID, { data });
        await global.data.threadData.set(String(threadID), data);
        api.unsendMessage(handleReaction.messageID);

        const thuebotPath = path.join(__dirname, './data/thuebot.json');
        let thuebotData = '';
        try {
            const thuebot = JSON.parse(fs.readFileSync(thuebotPath, 'utf8'));
            const threadData = thuebot.find(item => item.t_id === threadID);
            if (threadData) {
                thuebotData = ` | HSD: ${threadData.time_end}`;
            }
        } catch (e) {}

        api.changeNickname(`『 ${prefix} 』 • ${global.config.BOTNAME}${thuebotData}`, event.threadID, event.senderID);
        return api.sendMessage(`☑️ Đã thay đổi prefix của nhóm thành: ${prefix}`, threadID, messageID);

    } catch (e) {
        return console.log(e);
    }
};

module.exports.run = async ({ api, event, args, Threads }) => {
    if (typeof args[0] === "undefined") return api.sendMessage(`⚠️ Vui lòng nhập prefix mới để thay đổi prefix của nhóm`, event.threadID, event.messageID);
    const prefix = args[0].trim();
    if (!prefix) return api.sendMessage(`⚠️ Vui lòng nhập prefix mới để thay đổi prefix của nhóm`, event.threadID, event.messageID);
    if (prefix === "reset") {
        var data = (await Threads.getData(event.threadID)).data || {};
        data["PREFIX"] = global.config.PREFIX;
        await Threads.setData(event.threadID, { data });
        await global.data.threadData.set(String(event.threadID), data);
        var uid = api.getCurrentUserID();
        
        const thuebotPath = path.join(__dirname, './data/thuebot.json');
        let thuebotData = '';
        try {
            const thuebot = JSON.parse(fs.readFileSync(thuebotPath, 'utf8'));
            const threadData = thuebot.find(item => item.t_id === event.threadID);
            if (threadData) {
                thuebotData = ` | HSD: ${threadData.time_end}`;
            }
        } catch (e) {}

        api.changeNickname(`『 ${global.config.PREFIX} 』 • ${global.config.BOTNAME}${thuebotData}`, event.threadID, uid);
        return api.sendMessage(`☑️ Đã reset prefix về mặc định: ${global.config.PREFIX}`, event.threadID, event.messageID);
    } else {
        api.sendMessage(`📝 Bạn đang yêu cầu set prefix mới: ${prefix}\n👉 Reaction tin nhắn này để xác nhận`, event.threadID, (error, info) => {
            global.client.handleReaction.push({
                name: "setprefix",
                messageID: info.messageID,
                author: event.senderID,
                PREFIX: prefix
            });
        });
    }
};