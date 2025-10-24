module.exports.config = {
    name: "kick",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "qt",
    description: "Xoá người bạn cần xoá khỏi nhóm bằng cách tag hoặc reply, hoặc kick all",
    commandCategory: "QTV",
    usages: "[tag/reply/all]",
    cooldowns: 0
};

module.exports.run = async function ({ args, api, event, Threads }) {
    const botID = api.getCurrentUserID();
    const { participantIDs } = (await Threads.getData(event.threadID)).threadInfo;

    try {
        if (args.join().includes('@')) {
            const mentionIDs = Object.keys(event.mentions);
            for (let i = 0; i < mentionIDs.length; i++) {
                setTimeout(() => {
                    api.removeUserFromGroup(mentionIDs[i], event.threadID, err => {
                        if (err) return api.sendMessage("⚠️ Bot cần quyền quản trị viên để kick", event.threadID, event.messageID);
                    });
                }, i * 1000);
            }
            return;
        }

        if (event.type === "message_reply") {
            const uid = event.messageReply.senderID;
            return api.removeUserFromGroup(uid, event.threadID, err => {
                if (err) return api.sendMessage("⚠️ Bot cần quyền quản trị viên để kick", event.threadID, event.messageID);
            });
        }

        if (!args[0]) {
            return api.sendMessage("⚠️ Vui lòng tag, reply người cần kick hoặc dùng 'all' để kick toàn bộ!", event.threadID, event.messageID);
        }

        if (args[0] === "all") {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const adminIDs = threadInfo.adminIDs.map(e => e.id);
    const isBotAdmin = adminIDs.includes(botID);

    if (!isBotAdmin) {
        return api.sendMessage("⚠️ Bot cần quyền quản trị viên để kick all", event.threadID, event.messageID);
    }

    const listUserID = threadInfo.participantIDs.filter(
        id => id !== botID && id !== event.senderID && !adminIDs.includes(id) 
    );

    if (listUserID.length === 0) {
        return api.sendMessage("⚠️ Không có ai để kick!", event.threadID, event.messageID);
    }

    api.sendMessage(`✅ Bắt đầu kick all thành viên...`, event.threadID, () => {
        listUserID.forEach((uid, i) => {
            setTimeout(() => {
                api.removeUserFromGroup(uid, event.threadID, err => {
                    if (err) {
                        console.error(`❌ Lỗi khi kick UID ${uid}:`, err);
                        api.sendMessage(`❌ Không thể kick UID: ${uid}`, event.threadID);
                    }
                });
            }, i * 1000);
        });
    });
}
    } catch (err) {
        console.error("[KICK] Lỗi xảy ra:", err);
    }
};