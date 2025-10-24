module.exports.config = {
    name: "slot",
    version: "1.0.5",
    hasPermssion: 0,
    credits: "qt",
    description: "Đánh bạc bằng hình thức hoa quả có hũ jackpot",
    commandCategory: "Trò Chơi",
    usages: "slot [nho/dưa/táo/777/dâu/đào] + số tiền cược hoặc slot hũ/jackpot",
    cooldowns: 5,
  };

const fs = require('fs-extra');
const request = require('request');
const axios = require('axios');
const { readdirSync, readFileSync, writeFileSync, existsSync, copySync, createWriteStream, createReadStream } = require("fs-extra");

// Create cache directory if it doesn't exist
if (!existsSync(__dirname + '/cache')) {
  fs.mkdirSync(__dirname + '/cache');
}

// Download all images at startup
const images = {
  '777': 'https://i.postimg.cc/44SsPpJP/slakz1.jpg',
  'dao': 'https://i.postimg.cc/SK6xtRZs/384ary.jpg',
  'dau': 'https://i.postimg.cc/y8Sdcvc0/mixlg8.jpg',
  'duahau': 'https://i.postimg.cc/59n6VHfQ/0yx6lw.jpg',
  'nho': 'https://i.postimg.cc/Y0q0F7zS/2npckt.jpg',
  'tao': 'https://i.postimg.cc/1XH6xMJ8/0vvrhk.jpg',
  'slot': 'https://i.postimg.cc/Z5qPmtk4/o0jka0.gif'
};

Object.entries(images).forEach(([name, url]) => {
  const path = __dirname + `/cache/${name}.${name === 'slot' ? 'gif' : 'jpg'}`;
  if (!existsSync(path)) {
    request(url).pipe(createWriteStream(path));
  }
});

const jackpotPath = __dirname + "/data/jackpot.json";
const jackpot = {
  get: () => {
    try {
      if (!fs.existsSync(jackpotPath)) {
        fs.writeFileSync(jackpotPath, JSON.stringify({ 
          amount: 0,
          lastWin: null,
          totalWins: 0,
          todayPlays: 0,
          lastReset: new Date().toISOString()
        }));
        return 0;
      }
      const data = JSON.parse(fs.readFileSync(jackpotPath));
      return data.amount || 0;
    } catch (e) {
      console.error("Jackpot read error:", e);
      return 0;
    }
  },
  set: (value) => {
    try {
      const data = fs.existsSync(jackpotPath) ? 
        JSON.parse(fs.readFileSync(jackpotPath)) : 
        { amount: 0, lastWin: null, totalWins: 0, todayPlays: 0, lastReset: new Date().toISOString() };
      
      data.amount = value;
      fs.writeFileSync(jackpotPath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Jackpot write error:", e);
    }
  },
  recordWin: (userId, amount) => {
    try {
      const data = fs.existsSync(jackpotPath) ? 
        JSON.parse(fs.readFileSync(jackpotPath)) : 
        { amount: 0, lastWin: null, totalWins: 0, todayPlays: 0, lastReset: new Date().toISOString() };
      
      data.lastWin = {
        userId,
        amount,
        time: new Date().toISOString()
      };
      data.totalWins = (data.totalWins || 0) + 1;
      
      fs.writeFileSync(jackpotPath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Jackpot record win error:", e);
    }
  },
  incrementPlays: () => {
    try {
      const data = fs.existsSync(jackpotPath) ? 
        JSON.parse(fs.readFileSync(jackpotPath)) : 
        { amount: 0, lastWin: null, totalWins: 0, todayPlays: 0, lastReset: new Date().toISOString() };
      
      const lastReset = new Date(data.lastReset);
      const now = new Date();
      if (lastReset.getDate() !== now.getDate() || 
          lastReset.getMonth() !== now.getMonth() || 
          lastReset.getFullYear() !== now.getFullYear()) {
        data.todayPlays = 0;
        data.lastReset = now.toISOString();
      }
      
      data.todayPlays = (data.todayPlays || 0) + 1;
      fs.writeFileSync(jackpotPath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Jackpot increment plays error:", e);
    }
  },
  getStats: () => {
    try {
      if (!fs.existsSync(jackpotPath)) {
        return {
          amount: 0,
          lastWin: null,
          totalWins: 0,
          todayPlays: 0,
          lastReset: new Date().toISOString()
        };
      }
      const data = JSON.parse(fs.readFileSync(jackpotPath));
      return {
        amount: data.amount || 0,
        lastWin: data.lastWin || null,
        totalWins: data.totalWins || 0,
        todayPlays: data.todayPlays || 0,
        lastReset: data.lastReset || new Date().toISOString()
      };
    } catch (e) {
      console.error("Jackpot stats error:", e);
      return {
        amount: 0,
        lastWin: null,
        totalWins: 0,
        todayPlays: 0,
        lastReset: new Date().toISOString()
      };
    }
  }
};

module.exports.run = async function({ api, event, args, Currencies, getText, permssion }) {
  try { 
    const { threadID, messageID, senderID } = event;
    
    if (args[0] === "hũ" || args[0] === "hu" || args[0] === "jackpot" || args[0] === "jackpot") {
      const stats = jackpot.getStats();
      const amount = stats.amount || 0;
      const lastWin = stats.lastWin || null;
      const totalWins = stats.totalWins || 0;
      const todayPlays = stats.todayPlays || 0;

      let lastWinInfo = 'Chưa có';
      if (lastWin) {
        const userInfo = await api.getUserInfo(lastWin.userId);
        const userName = userInfo[lastWin.userId]?.name || 'Người chơi';
        lastWinInfo = `${lastWin.amount.toLocaleString()} VND (${userName})`;
      }

      const message = `📊 THỐNG KÊ JACKPOT 📊\n======================\n======================\n\n` +
        `💰 Hũ hiện tại: ${amount.toLocaleString()} VND\n` +
        `🏆 Người nổ hũ gần nhất: ${lastWinInfo}\n` +
        `📈 Tổng số lần nổ hũ: ${totalWins}\n` +
        `💎 Hũ cao nhất đã nổ: ${lastWin ? lastWin.amount.toLocaleString() : '0'} VND\n` +
        `🎮 Lượt chơi hôm nay: ${todayPlays}\n` +
        `💥 Trạng thái: ${amount >= 100000000 ? '🔥 Đang nóng' : amount >= 50000000 ? '⚡ Sắp nổ' : '💫 Bình thường'}`;
      
      return api.sendMessage(message, threadID, messageID);
    }

    if (args[0] === "add") {
      if (senderID !== "100051439970359") { 
        return api.sendMessage("❎ Bạn không có quyền sử dụng lệnh này!", threadID, messageID);
      }
      
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) {
        return api.sendMessage("❎ Vui lòng nhập số tiền hợp lệ!", threadID, messageID);
      }
      
      const currentAmount = jackpot.get();
      jackpot.set(currentAmount + amount);
      
      return api.sendMessage(`✅ Đã thêm ${amount.toLocaleString()} VND vào hũ jackpot!`, threadID, messageID);
    }

    const { getData, increaseMoney, decreaseMoney } = Currencies;
    const slotItems = ["nho", "duahau", "tao", "777", "dau","dao"];
    const money = (await getData(senderID)).money;
    if (isNaN(args[1]) == true) return api.sendMessage(`🎰 === [ 𝐒𝐋𝐎𝐓 𝐕𝐈𝐏 ] === 🎰

📌 𝐇𝐮̛𝐨̛́𝐧𝐠 𝐝𝐚̂̃𝐧 𝐬𝐮̛̉ 𝐝𝐮̣𝐧𝐠:

🔹 𝐐𝐮𝐚𝐲 𝐬𝐥𝐨𝐭 𝐭𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐮̛𝐨̛̀𝐧𝐠:
    ➣𝐕𝐢́ 𝐝𝐮̣:
➡️  ${global.config.PREFIX}${this.config.name} dưa 1000

🔹 𝐗𝐞𝐦 𝐭𝐡𝐨̂𝐧𝐠 𝐭𝐢𝐧 𝐡𝐮̃ (𝐉𝐚𝐜𝐤𝐩𝐨𝐭):
➡️  ${global.config.PREFIX}${this.config.name} hũ
➡️  ${global.config.PREFIX}${this.config.name} jackpot
➡️  ${global.config.PREFIX}${this.config.name} add

💡 𝐋𝐮̛𝐮 𝐲́: 𝐆𝐨̃ đ𝐮́𝐧𝐠 𝐜𝐮́ 𝐩𝐡𝐚́𝐩 đ𝐞̂̉ 𝐭𝐡𝐚𝐦 𝐠𝐢𝐚 𝐭𝐫𝐨̀ 𝐜𝐡𝐨̛𝐢!`, threadID, messageID);
    var moneyBet = parseInt(args[1]);
    if (isNaN(moneyBet) || moneyBet <= 1000) return api.sendMessage('❎ Số tiền đặt cược không được dưới 1,000 VND', threadID, messageID);
    if (moneyBet > money) return api.sendMessage('❎ Số tiền bạn đặt nhiều hơn số dư của bạn.', threadID, messageID);
    var number = [], list = [], listimg = [], win = false;
    var slot1 = slotItems[Math.floor(Math.random() * slotItems.length)];
    var slot2 = slotItems[Math.floor(Math.random() * slotItems.length)];
    var slot3 = slotItems[Math.floor(Math.random() * slotItems.length)];
    
    let content = args[0];
    var content1;
    if (content =='nho' || content == '🍇') {
      content1 = 'nho';
    }
    else if (content =='dưa' || content == "🍉" ) {
      content1 = 'duahau';
    }
    else if (content =='táo' || content =='🍏') {
      content1 = 'tao';
    }
    else if (content =='777' || content =='7️⃣') {
      content1 = '777';
    }
    else if (content =='dâu' || content =='🍓') {
      content1 = 'dau';
    }
    else if (content =='đào' || content =='🍑') {
      content1 = 'dao';
    }
    else {
      return api.sendMessage(`❎ Số cược mà bạn nhập phải là 1 con số hợp lệ\nVí dụ: ${global.config.PREFIX}${this.config.name} dưa 1000`, threadID, messageID);
    }
    
    list.push(slot1);
    list.push(slot2);
    list.push(slot3);
    
    const slotImages = {
      'nho': __dirname + '/cache/nho.jpg',
      'duahau': __dirname + '/cache/duahau.jpg',
      'tao': __dirname + '/cache/tao.jpg',
      '777': __dirname + '/cache/777.jpg',
      'dau': __dirname + '/cache/dau.jpg',
      'dao': __dirname + '/cache/dao.jpg'
    };

    const slotIcons = {
      'nho': '🍇',
      'duahau': '🍉',
      'tao': '🍏',
      '777': '7️⃣',
      'dau': '🍓',
      'dao': '🍑'
    };

    listimg.push(createReadStream(slotImages[slot1]));
    listimg.push(createReadStream(slotImages[slot2]));
    listimg.push(createReadStream(slotImages[slot3]));
    
    const icon1 = slotIcons[slot1];
    const icon2 = slotIcons[slot2];
    const icon3 = slotIcons[slot3];
    
    return api.sendMessage({
      body: '⏳ Đang quay....',
      attachment: createReadStream(__dirname + '/cache/slot.gif')
    }, threadID, (err, info) => {
      if (err) return api.sendMessage(err, threadID, messageID);
      setTimeout(() => {
        api.unsendMessage(info.messageID);
        var check = list.findIndex(i => i.toString() == content1);
        var check2 = list.includes(content1);
        const jackpotAmount = jackpot.get();
        
        jackpot.incrementPlays();
        
        if (slot1 === '777' && slot2 === '777' && slot3 === '777') {
          jackpot.set(0); 
          jackpot.recordWin(senderID, jackpotAmount); 
          return api.sendMessage({
            body: `🎉 NỔ HŨ 🎉\nQuay được: ${icon1} | ${icon2} | ${icon3}\n💥 Nhận toàn bộ hũ: ${jackpotAmount.toLocaleString()} VND\n💰 Hũ hiện tại: 0 VND`,
            attachment: listimg
          }, threadID, () => Currencies.increaseMoney(senderID, jackpotAmount), messageID);
        }
        
        else if (slot1 === slot2 && slot2 === slot3 && slot1 !== '777') {
          const reward = Math.floor(moneyBet * 5 * 0.95); 
          const fee = moneyBet * 5 - reward;
          jackpot.set(jackpotAmount + fee); 
          return api.sendMessage({
            body: `Quay được: ${icon1} | ${icon2} | ${icon3}\n🥳 Bạn thắng x5: + ${reward.toLocaleString()} VND\n💰 Hũ hiện tại: ${jackpot.get().toLocaleString()} VND`,
            attachment: listimg
          }, threadID, () => Currencies.increaseMoney(senderID, reward), messageID);
        }
        
        else if ((slot1 === content1 && slot2 === content1) || 
                 (slot2 === content1 && slot3 === content1) || 
                 (slot1 === content1 && slot3 === content1)) {
          const reward = Math.floor(moneyBet * 2 * 0.95); 
          const fee = moneyBet * 2 - reward;
          jackpot.set(jackpotAmount + fee); 
          return api.sendMessage({
            body: `Quay được: ${icon1} | ${icon2} | ${icon3}\n🎉 Bạn thắng x2: + ${reward.toLocaleString()} VND\n💰 Hũ hiện tại: ${jackpot.get().toLocaleString()} VND`,
            attachment: listimg
          }, threadID, () => Currencies.increaseMoney(senderID, reward), messageID);
        }
        
        else {
          jackpot.set(jackpotAmount + moneyBet); 
          return api.sendMessage({
            body: `Quay được: ${icon1} | ${icon2} | ${icon3}\n❌ Bạn đã thua - ${moneyBet.toLocaleString()} VND\n💰 Hũ hiện tại: ${jackpot.get().toLocaleString()} VND`,
            attachment: listimg
          }, threadID, () => Currencies.decreaseMoney(senderID, moneyBet), messageID);
        }
      }, 3000);
    }, messageID);
  }
  catch (err) {
    console.error(err);
    return api.sendMessage(err, event.threadID, event.messageID);
  }
}