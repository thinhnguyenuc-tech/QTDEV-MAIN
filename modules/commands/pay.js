module.exports.config = {
  name: "pay",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "qt",
  description: "Chuyển tiền cho người khác",
  commandCategory: "Money",
  usages: "Reply hoặc tag người nhận + số tiền",
  cooldowns: 5,
};

module.exports.run = async ({ event, api, Currencies, args, Users }) => {
  const { threadID, messageID, senderID, messageReply, mentions } = event;

  let recipientID = null;
  let recipientName = null;

  if (messageReply) {
    recipientID = messageReply.senderID;
    recipientName = await Users.getNameUser(recipientID);
  } else if (Object.keys(mentions).length > 0) {
    recipientID = Object.keys(mentions)[0];
    recipientName = mentions[recipientID].replace(/@/g, "");
  } else {
    return api.sendMessage("⚠️ Vui lòng tag hoặc reply người mà bạn muốn chuyển tiền.", threadID, messageID);
  }


  const amount = parseInt(args[args.length - 1]);
  if (isNaN(amount) || amount <= 0)
    return api.sendMessage("⚠️ Số tiền không hợp lệ!", threadID, messageID);


  const userData = await Currencies.getData(senderID);
  if (amount > userData.money)
    return api.sendMessage("💸 Số tiền bạn muốn chuyển lớn hơn số dư hiện tại.", threadID, messageID);


  await Currencies.decreaseMoney(senderID, amount);
  await Currencies.increaseMoney(recipientID, amount);

  return api.sendMessage({
    body: `💸 Đã chuyển cho ${recipientName} ${amount.toLocaleString('vi-VN')} VND.`,
    mentions: [{
      tag: recipientName,
      id: recipientID
    }]
  }, threadID, messageID);
};