module.exports.config = {
    name: "spam2", 
    version: "1.0.0",
    hasPermssion: 3,
    credits: "TKhanh",
    description: "Spam tin nhắn theo chu kỳ cho đến khi stop",
    commandCategory: "War",
    usages: "[nội dung]",
    cooldowns: 3,
};

if (!global.spamThreads) {
    global.spamThreads = [];
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID }= event;
    const isStop = args[0]?.toLowerCase() === "stop";

    if (isStop) {
        const index = global.spamThreads.indexOf(threadID);
        if (index > -1) {
            global.spamThreads.splice(index, 1);
            return api.sendMessage("Bố Tao Tha Cho Chúng Mày Đó😂", threadID);
        } else {
            return api.sendMessage("Chưa Có Ngôn Để Treo Nha Đại Ca.", threadID);
        }
    }

    const spamContent = args.join(" ");
    if (!spamContent) {
        return api.sendMessage("Đại ca nhập thiếu context kìa!", threadID, messageID);
    }

    if (global.spamThreads.includes(threadID)) {
        return api.sendMessage("Đang Spam, Không Thể Thực Thi", threadID, messageID);
    }

    global.spamThreads.push(threadID);

    while (global.spamThreads.includes(threadID)) {
        api.sendMessage(spamContent, threadID, (err) => {
            if (err) console.error("Spam error:", err);
        });
        await new Promise(resolve => setTimeout(resolve, 1000)); // 3 giây
    }
}; 