module.exports.config = {
  name: "màu",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "qt",
  description: "Chọn màu và đặt cược tiền",
  commandCategory: "Trò Chơi",
  usages: "[màu] [số tiền cược]",
  cooldowns: 3
};

const colorMap = {
  "lam": "💙", blue: "💙",
  "cam": "🧡", orange: "🧡",
  "lục": "💚", green: "💚",
  "vàng": "💛", yellow: "💛",
  "tím": "💜", violet: "💜",
  "đen": "🖤", black: "🖤"
};

const emojiList = ["💙", "🧡", "💚", "💛", "💜", "🖤"];

module.exports.run = async function ({ event, api, args, Currencies }) {
  const { senderID, threadID, messageID } = event;
  const userColorInput = args[0]?.toLowerCase();
  const betAmount = parseInt(args[1]);

  if (!userColorInput || !colorMap[userColorInput] || isNaN(betAmount))
    return api.sendMessage(
      `🎨 Cách chơi:\n→ !màu [màu] [số tiền cược]\n\nVí dụ: !màu vàng 5000\n🎨 Tất cả màu có sẵn:\n💙 lam/blue\n🧡 cam/orange\n💚 lục/green\n💛 vàng/yellow\n💜 tím/violet\n🖤 đen/black`,
      threadID, messageID
    );

  const userColor = colorMap[userColorInput];
  const userMoney = (await Currencies.getData(senderID)).money;

  if (betAmount < 1000) return api.sendMessage("⚠️ Cược tối thiểu là 1,000 VND", threadID, messageID);
  if (userMoney < betAmount) return api.sendMessage(`❌ Bạn không đủ ${betAmount} VND để cược.`, threadID, messageID);

  const randomColor = emojiList[Math.floor(Math.random() * emojiList.length)];

  if (randomColor === userColor) {
    const reward = betAmount * 2;
    await Currencies.increaseMoney(senderID, betAmount);
    return api.sendMessage(
      `🎉 Màu xuất hiện: ${randomColor}\n✅ Bạn đã thắng!\n💰 Nhận + ${betAmount} VND\n💸 Còn thở là còn thắng\n🎉 Chúc bạn may mắn.!`,
      threadID, messageID
    );
  } else {
    await Currencies.decreaseMoney(senderID, betAmount);
    return api.sendMessage(
      `💥 Màu xuất hiện: ${randomColor}\n❌ Bạn đã thua\n💰 Mất - ${betAmount} VND\n💸 Còn thở là còn thắng\n🎉 Chúc bạn may mắn.!`,
      threadID, messageID
    );
  }
};