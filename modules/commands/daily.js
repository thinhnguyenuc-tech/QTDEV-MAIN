module.exports.config = {
    name: "daily",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "Mirai Team",
    description: "Nhận 500.000 VND mỗi ngày!",
    commandCategory: "Kiếm Tiền",
    cooldowns: 5,
    images: [],
   };
   
   module.exports.run = ({ event, api, Currencies }) => {
    const rewardCoin = 500000;
    const cooldownTime = 12 * 60 * 60 * 1000;
   
    const { senderID, threadID, messageID } = event;
   
    return Currencies.getData(senderID)
    .then(data => {
    data = data.data || {};
    const timeRemaining = cooldownTime - (Date.now() - (data.dailyCoolDown || 0));
   
    if (timeRemaining > 0) {
    const seconds = Math.floor((timeRemaining / 1000) % 60);
    const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
    const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
    const formattedSeconds = (seconds < 10 ? "0" : "") + seconds;
   
    return api.sendMessage(`⏱️ Bạn đang trong thời gian chờ\n🔄 Vui lòng quay lại sau: ${hours} giờ ${minutes} phút ${formattedSeconds} giây!`, threadID, messageID);
    } else {
    Currencies.increaseMoney(senderID, rewardCoin);
    data.dailyCoolDown = Date.now();
    return Currencies.setData(senderID, { data })
    .then(() => api.sendMessage(`☑️ Bạn đã nhận ${rewardCoin} VND, để có thể tiếp tục nhận, vui lòng quay lại sau 12 tiếng`, threadID, messageID));
    }
    });
   }