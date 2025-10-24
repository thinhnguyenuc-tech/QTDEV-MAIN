const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "keobuabao",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "qt",
  description: "Oẳn tù tì đặt cược",
  commandCategory: "Trò Chơi",
  usages: "[kéo|búa|bao] [số tiền cược]",
  cooldowns: 2
};

const choices = ["kéo", "búa", "bao"];
const emojis = { "kéo": "✌️", "búa": "👊", "bao": "✋" };

module.exports.onLoad = async function () {
  const axios = require("axios");
  const cachePath = path.join(__dirname, "cache");
  const images = {
    kéo: "https://files.catbox.moe/jyqfba.jpg",
    búa: "https://files.catbox.moe/jkp3ru.jpg",
    bao: "https://files.catbox.moe/ijcm1c.jpg"
  };

  for (const [name, url] of Object.entries(images)) {
    const imgPath = path.join(cachePath, `${name}.jpg`);
    if (!fs.existsSync(imgPath)) {
      const res = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(res.data));
    }
  }
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const userChoice = args[0]?.toLowerCase();
  const bet = parseInt(args[1]);
  const userMoney = (await Currencies.getData(senderID)).money;

  if (!choices.includes(userChoice))
    return api.sendMessage("⚠️ Vui lòng chọn kéo/búa/bao [số tiền đặt cược]", threadID, messageID);
  if (isNaN(bet) || bet < 1000)
    return api.sendMessage("⚠️ Số tiền cược phải là số lớn hơn hoặc bằng 1,000 VND", threadID, messageID);
  if (userMoney < bet)
    return api.sendMessage(`⚠️ Bạn không đủ tiền (${bet} VND).`, threadID, messageID);
  const botChoice = choices[Math.floor(Math.random() * 3)];

  let resultText, resultType;
  if (userChoice === botChoice) {
    resultText = ` [ 🤝 Hòa! ]\n👤 Bạn: ${emojis[userChoice]}\n🤖 Bot: ${emojis[botChoice]}`;
    resultType = 3;
  } else if (
    (userChoice === "kéo" && botChoice === "bao") ||
    (userChoice === "búa" && botChoice === "kéo") ||
    (userChoice === "bao" && botChoice === "búa")
  ) {
    resultText = ` [ 🎉 Bạn thắng! ]\n👤 Bạn: ${emojis[userChoice]}\n🤖 Bot: ${emojis[botChoice]}\n💸 +${bet} VND`;
    resultType = 0;
  } else {
    resultText = ` [ 💥 Bạn thua! ]\n👤 Bạn: ${emojis[userChoice]}\n🤖 Bot: ${emojis[botChoice]}\n💸 -${bet} VND`;
    resultType = 1;
  }

  if (resultType === 0) await Currencies.increaseMoney(senderID, bet);
  else if (resultType === 1) await Currencies.decreaseMoney(senderID, bet);

  const imagePaths = [
    fs.createReadStream(path.join(__dirname, "cache", `${botChoice}.jpg`)),
    fs.createReadStream(path.join(__dirname, "cache", `${userChoice}.jpg`))
  ];

  return api.sendMessage({ body: resultText, attachment: imagePaths }, threadID, messageID);
};