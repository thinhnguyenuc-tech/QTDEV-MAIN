module.exports.config = {
  name: "tx",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "qt",
  description: "Tài xỉu toàn sever",
  commandCategory: "Trò Chơi",
  usages: "tx",
  cooldowns: 1,
};

const fs = require("fs");
const path = "./modules/commands/game/taixiu/";
const axios = require("axios");

const diceImageLinks = {
  1: "http://dkupload.site/uploads/files-1752992648222-289827521.png",
  2: "http://dkupload.site/uploads/files-1752992648237-742032126.png",
  3: "http://dkupload.site/uploads/files-1752992648244-117528428.png",
  4: "http://dkupload.site/uploads/files-1752992648269-585231449.png",
  5: "http://dkupload.site/uploads/files-1752992648277-387412299.png",
  6: "http://dkupload.site/uploads/files-1752992716066-577520179.png"
};

const diceDir = __dirname + "/cache";
if (!fs.existsSync(diceDir)) fs.mkdirSync(diceDir);
async function downloadDiceImages() {
  for (let i = 1; i <= 6; i++) {
    const filePath = `${diceDir}/tx${i}.png`;
    if (!fs.existsSync(filePath)) {
      const response = await axios.get(diceImageLinks[i], { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    }
  }
}
downloadDiceImages();

if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });

const data = path + 'data/'
if (!fs.existsSync(data)) fs.mkdirSync(data, { recursive: true });

const lichsugiaodich = data + 'lichsugiaodich/'
if (!fs.existsSync(lichsugiaodich)) fs.mkdirSync(lichsugiaodich, { recursive: true });

const betHistoryPath = data + 'betHistory/';
if (!fs.existsSync(betHistoryPath)) fs.mkdirSync(betHistoryPath, { recursive: true });

const moneyFile = path + 'money.json';
const phiênFile = path + 'phiên.json';
const fileCheck = path + 'file_check.json';

if (!fs.existsSync(moneyFile)) fs.writeFileSync(moneyFile, "[]", "utf-8");
if (!fs.existsSync(phiênFile)) fs.writeFileSync(phiênFile, "[]", "utf-8");
if (!fs.existsSync(fileCheck)) fs.writeFileSync(fileCheck, "[]", "utf-8");

const depositHistoryFile = path + 'tx_lsnap.json';
const withdrawHistoryFile = path + 'tx_lsrut.json';
if (!fs.existsSync(depositHistoryFile)) fs.writeFileSync(depositHistoryFile, "[]", "utf-8");
if (!fs.existsSync(withdrawHistoryFile)) fs.writeFileSync(withdrawHistoryFile, "[]", "utf-8");

const huFile = path + 'tx_hu.json';
if (!fs.existsSync(huFile)) fs.writeFileSync(huFile, "0", "utf-8");

const huHistoryFile = path + 'tx_hu_history.json';
if (!fs.existsSync(huHistoryFile)) fs.writeFileSync(huHistoryFile, "[]", "utf-8");

class Command {
  constructor(config) {
      this.config = config;
      this.count_req = 0;
  }

  run({ messageID, text, api, threadID }) {
      mqttClient.publish('/ls_req', JSON.stringify({
          "app_id": "2220391788200892",
          "payload": JSON.stringify({
              tasks: [{
                  label: '742',
                  payload: JSON.stringify({
                      message_id: messageID,
                      text: text,
                  }),
                  queue_name: 'edit_message',
                  task_id: Math.random() * 1001 << 0,
                  failure_count: null,
              }],
              epoch_id: this.generateOfflineThreadingID(),
              version_id: '6903494529735864',
          }),
          "request_id": ++this.count_req,
          "type": 3
      }));
  }

  generateOfflineThreadingID() {
      var ret = Date.now();
      var value = Math.floor(Math.random() * 4294967295);
      var str = ("0000000000000000000000" + value.toString(2)).slice(-22);
      var msgs = ret.toString(2) + str;
      return this.binaryToDecimal(msgs);
  }

  binaryToDecimal(data) {
      var ret = "";
      while (data !== "0") {
          var end = 0;
          var fullName = "";
          var i = 0;
          for (; i < data.length; i++) {
              end = 2 * end + parseInt(data[i], 10);
              if (end >= 10) {
                  fullName += "1";
                  end -= 10;
              } else {
                  fullName += "0";
              }
          }
          ret = end.toString() + ret;
          data = fullName.slice(fullName.indexOf("1"));
      }
      return ret;
  }
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function getDiceImage(diceNumber) {
  return `${diceDir}/tx${diceNumber}.png`;
}

function isJackpot(dice1, dice2, dice3, phien) {
  const lastDigit = phien % 10;
  if (dice1 === 1 && dice2 === 1 && dice3 === 1) {
    return lastDigit % 2 === 1;
  }
  if (dice1 === 6 && dice2 === 6 && dice3 === 6) {
    return lastDigit % 2 === 0;
  }
  return false;
}

function playGame() {
  const dice1 = rollDice();
  const dice2 = rollDice();
  const dice3 = rollDice();
  const total = dice1 + dice2 + dice3;
  const result = (total >= 4 && total <= 10) ? 'xỉu' : 'tài';
  return {
      total,
      result,
      dice1,
      dice2,
      dice3
  };
}

function qt(api, content, threadID) {
  return new Promise((resolve, reject) => {
      api.sendMessage(content, threadID, (e, i) => {
          if (e) return reject(e);
          resolve(i);
      });
  });
}

let i = 0;
if (!global.currentPhien) global.currentPhien = null;

module.exports.onLoad = async function ({ api, model }) {
  let results = null;
  setInterval(async () => {
      i += 1;
      const phiênData = JSON.parse(fs.readFileSync(phiênFile, "utf-8"));
      const checkData = JSON.parse(fs.readFileSync(fileCheck, "utf-8"));
      let phiên = phiênData.length ? phiênData[phiênData.length - 1].phien : 1;
      let betTime = 50;

      if (i == 1) {
          global.currentPhien = Math.floor(Math.random() * 900000) + 100000;
          results = playGame();
          for (let threadID of checkData) {
              const startMessage = `🔄 Bắt đầu phiên #${global.currentPhien}!\n⏳ Bạn có ${betTime} giây để đặt cược.`;
              api.sendMessage(startMessage, threadID);
          }
      } else if (i == 45) {
          for (let threadID of checkData) {
              const message = await qt(api, `⚠️Hết thời gian đặt cược!!\nChuẩn bị lắc...\nCòn 5 giây`, threadID);
              for (let num = 4; num >= 0; num--) {
                  setTimeout(async () => {
                      if (num > 0) {
                          let response = await new Command().run({
                              messageID: message.messageID,
                              text: `⚠️Hết thời gian đặt cược!!\nChuẩn bị lắc...\nCòn ${num} giây`,
                              api,
                              threadID
                          });
                          if (num == 1) {
                              setTimeout(() => {
                                  api.unsendMessage(message.messageID);
                              }, 1000);
                          }
                      }
                  }, (4 - num) * 1000);
              }
          }
      } else if (i == 50) {
          const randomPhien = global.currentPhien;
          const checkmn = JSON.parse(fs.readFileSync(moneyFile, "utf-8"));
          let winList = [];
          let loseList = [];

          for (let user of checkmn) {
              const userBetFile = betHistoryPath + `${user.senderID}.json`;
              if (!fs.existsSync(userBetFile)) continue;
              const userBetData = JSON.parse(fs.readFileSync(userBetFile, "utf-8"));

              userBetData.forEach(entry => {
                  if (entry.phien === randomPhien) {
                      const total = results.dice1 + results.dice2 + results.dice3;
                      const result = (total >= 3 && total <= 10) ? 'xỉu' : 'tài';
                      if (entry.choice === result) {
                          const winAmount = Math.floor(entry.betAmount * 0.94);
                          const triethau = entry.betAmount - winAmount;
                          user.input += winAmount;
                          let hu = parseInt(fs.readFileSync(huFile, "utf-8"));
                          hu += triethau;
                          fs.writeFileSync(huFile, hu.toString(), "utf-8");
                          winList.push(user.senderID);
                      } else {
                          let hu = parseInt(fs.readFileSync(huFile, "utf-8"));
                          hu += entry.betAmount;
                          fs.writeFileSync(huFile, hu.toString(), "utf-8");
                          loseList.push(user.senderID);
                      }
                  }
              });
              fs.writeFileSync(userBetFile, JSON.stringify(userBetData, null, 4), 'utf-8');
          }

          fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');


          let last9Phien = [];

          if (phiênData.length > 9) {
              last9Phien = phiênData.slice(phiênData.length - 9);
          } else {
              last9Phien = phiênData;
          }
          const messagesMapping = {
              'tài': '⚫️',
              'xỉu': '⚪️'
          };
          let msgs = '';
          last9Phien.forEach(phi => {
              msgs += messagesMapping[phi.result] || '';
          });

          let dcm = ``
          if (results.result == 'tài') {
              dcm = `⚫️`
          } else {
              dcm = `⚪️`
          }

          for (let threadID of checkData) {
              const isJackpotResult = isJackpot(results.dice1, results.dice2, results.dice3, randomPhien);
              let hu = parseInt(fs.readFileSync(huFile, "utf-8"));
              if (isJackpotResult && winList.length > 0) {
                  let totalBet = 0;
                  let winBets = [];
                  for (let userID of winList) {
                      const userBetFile = betHistoryPath + `${userID}.json`;
                      const userBetData = JSON.parse(fs.readFileSync(userBetFile, "utf-8"));
                      const bet = userBetData.find(e => e.phien === randomPhien && e.choice === results.result);
                      if (bet) {
                          winBets.push({ userID, betAmount: bet.betAmount });
                          totalBet += bet.betAmount;
                      }
                  }
                  let huMsg = `🎉🎉🎉 𝗡𝗢̂̉ 𝗛𝗨̃ 🎉🎉🎉\n💰 𝗧𝗼̂̉𝗻𝗴 𝗵𝘂̃: ${hu.toLocaleString()} VND\n`;
                  let huWinners = [];
                  if (winBets.length === 1) {
                      let user = checkmn.find(u => u.senderID == winBets[0].userID);
                      if (user) user.input += hu;
                      huMsg += `👑 Người nhận toàn bộ hũ: ${winBets[0].userID} (+${hu.toLocaleString()} VND)`;
                      huWinners.push({userID: winBets[0].userID, amount: hu});
                  } else if (winBets.length > 1 && hu > 0) {
                      for (let wb of winBets) {
                          let user = checkmn.find(u => u.senderID == wb.userID);
                          const amount = Math.floor(hu * wb.betAmount / totalBet);
                          if (user) user.input += amount;
                          huMsg += `👤 ${wb.userID}: +${amount.toLocaleString()} VND\n`;
                          huWinners.push({userID: wb.userID, amount});
                      }
                  }
                  let huHistory = JSON.parse(fs.readFileSync(huHistoryFile, "utf-8"));
                  for (let winner of huWinners) {
                      huHistory.push({
                          userID: winner.userID,
                          amount: winner.amount,
                          threadID,
                          time: Date.now()
                      });
                  }
                  fs.writeFileSync(huHistoryFile, JSON.stringify(huHistory, null, 2), "utf-8");
                  hu = 0;
                  fs.writeFileSync(huFile, hu.toString(), "utf-8");
                  for (let threadID of checkData) {
                      api.sendMessage(huMsg, threadID);
                  }
              }
              let message =
                `╔════════════════╗\n` +
                `            🎲 𝗧𝗔̀𝗜 𝗫𝗜̉𝗨 🎲   \n` +
                `╚════════════════╝\n` +
                `📅 𝗣𝗵𝗶𝗲̂𝗻: #${randomPhien}\n` +
                `🎲 𝗫𝘂́𝗰 𝘅𝗮̆́𝗰: [ ${results.dice1} | ${results.dice2} | ${results.dice3} ]\n` +
                `⭐ 𝗞𝗲̂́𝘁 𝗾𝘂𝗮̉:  ${results.result.toUpperCase()} - ${results.dice1 + results.dice2 + results.dice3}\n` +
                `🏆 𝗧𝗵𝗮̆́𝗻𝗴: ${winList.length} người\n` +
                `💔 𝗧𝗵𝘂𝗮: ${loseList.length} người\n` +
                `💰 𝐇𝐮̃ 𝐡𝐢𝐞̣̂𝐧 𝘁𝗮̣𝐢: ${hu.toLocaleString()} VND\n` +
                `📈 𝐏𝐡𝐢𝐞̂𝐧 𝗴𝗮̂̀𝗻 𝗻𝗵𝗮̂́𝘁:\n` +
                `${msgs}${dcm}`;
              const diceImages = [
                  getDiceImage(results.dice1),
                  getDiceImage(results.dice2),
                  getDiceImage(results.dice3)
              ];
              try {
                  const attachments = diceImages.map(path => fs.createReadStream(path));
                  api.sendMessage({
                      body: message,
                      attachment: attachments
                  }, threadID);
              } catch (error) {
                  api.sendMessage(message, threadID);
              }
          }
          phiênData.push({
              phien: randomPhien,
              result: results.result,
              dice1: results.dice1,
              dice2: results.dice2,
              dice3: results.dice3,
          });
          fs.writeFileSync(phiênFile, JSON.stringify(phiênData, null, 4), 'utf-8');
      } else if (i == 60) {
          i = 0;
      }
  }, 1000);
}

module.exports.run = async function ({ api, event, args, Users, Currencies }) {
  const { senderID, threadID, messageReply, mentions } = event;
  const checkmn = JSON.parse(fs.readFileSync(moneyFile, "utf-8"));

  const phiênData = JSON.parse(fs.readFileSync(phiênFile, "utf-8"));
  const checkData = JSON.parse(fs.readFileSync(fileCheck, "utf-8"));

  let currentPhien = global.currentPhien;
  if (!currentPhien) {
    currentPhien = Math.floor(Math.random() * 900000) + 100000;
  }

  if (args[0] === 'nạp') {
      let amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) return api.sendMessage('Số tiền nạp không hợp lệ!', threadID);
      if (amount < 20000) return api.sendMessage('Số tiền nạp tối thiểu là 20,000 VND!', threadID);
      
      try {
          const userData = await Currencies.getData(senderID);
          const currentMoney = userData ? userData.money : 0;
          
          if (currentMoney < amount) {
              return api.sendMessage('Ví chính không đủ tiền!', threadID);
          }
          
          await Currencies.decreaseMoney(senderID, amount);
          let e = checkmn.findIndex(entry => entry.senderID == senderID);
          if (e !== -1) {
              checkmn[e].input += amount;
          } else {
              checkmn.push({ senderID: senderID, input: amount });
          }
          fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');
          let depositHistory = JSON.parse(fs.readFileSync(depositHistoryFile, "utf-8"));
          depositHistory.push({ senderID, amount, time: Date.now() });
          fs.writeFileSync(depositHistoryFile, JSON.stringify(depositHistory, null, 2), "utf-8");
          
          return api.sendMessage(`✅ Bạn đã nạp thành công ${amount.toLocaleString()} VND vào tài khoản tài xỉu!`, threadID);
      } catch (error) {
          console.error('Lỗi khi nạp tiền:', error);
          return api.sendMessage('Có lỗi xảy ra khi nạp tiền!', threadID);
      }
  } else if (args[0] === 'rút') {
      let amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) return api.sendMessage('Số tiền rút không hợp lệ!', threadID);
      if (amount < 200000) return api.sendMessage('Số tiền rút tối thiểu là 200,000 VND!', threadID);
      
      try {
          let e = checkmn.findIndex(entry => entry.senderID == senderID);
          if (e === -1 || checkmn[e].input < amount) {
              return api.sendMessage('Bạn không đủ tiền để rút!', threadID);
          }
          
          checkmn[e].input -= amount;
          
          await Currencies.increaseMoney(senderID, amount);
          fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');
          let withdrawHistory = JSON.parse(fs.readFileSync(withdrawHistoryFile, "utf-8"));
          withdrawHistory.push({ senderID, amount, time: Date.now() });
          fs.writeFileSync(withdrawHistoryFile, JSON.stringify(withdrawHistory, null, 2), "utf-8");
          
          return api.sendMessage(`✅ Bạn đã rút thành công ${amount.toLocaleString()} VND`, threadID);
      } catch (error) {
          return api.sendMessage('Có lỗi xảy ra khi rút tiền!', threadID);
      }
  } else if (args[0] === 'tài' || args[0] === 'xỉu') {
      if (!checkData.includes(threadID)) {
          return api.sendMessage(`Nhóm chưa bật bàn tài xỉu!`, threadID);
      }
      if (i >= 45) {
          return api.sendMessage(`⌛ Hết thời gian đặt cược`, threadID);
      }

      let betAmount;
      const player = checkmn.find(entry => entry.senderID == senderID);
      
      if (args[1] === "all") {
          if (!player || player.input <= 0) return api.sendMessage(`⚠️ Xin lỗi, bạn không có tiền!`, threadID);
          betAmount = player.input;
      } else {
          betAmount = parseInt(args[1]);
          if (isNaN(betAmount)) {
              return api.sendMessage(`⚠️ Xin lỗi, số tiền đặt cược phải là một số hợp lệ!`, threadID);
          }
          if (!player || player.input < betAmount) {
              return api.sendMessage(`⚠️ Xin lỗi, số tiền của bạn không đủ`, threadID);
          }
      }
      
      if (betAmount < 1000) {
          return api.sendMessage(`⚠️ Xin lỗi, số tiền đặt cược phải lớn hơn 1,000 VND!`, threadID);
      }

      // Trừ tiền ngay khi đặt cược
      player.input -= betAmount;
      fs.writeFileSync(moneyFile, JSON.stringify(checkmn, null, 4), 'utf-8');

      const userBetFile = betHistoryPath + `${senderID}.json`;
      let userBetData = [];
      if (fs.existsSync(userBetFile)) {
          userBetData = JSON.parse(fs.readFileSync(userBetFile, "utf-8"));
      }

      const hasBet = userBetData.some(entry => entry.senderID === senderID && entry.phien === currentPhien);
      if (hasBet) {
          return api.sendMessage(`⚠️ Bạn chỉ được đặt cược một lần mỗi phiên.`, threadID);
      }

      userBetData.push({
          senderID: senderID,
          choice: args[0],
          betAmount: betAmount,
          phien: currentPhien,
          time: Date.now()
      });
      fs.writeFileSync(userBetFile, JSON.stringify(userBetData, null, 4), 'utf-8');

      return api.sendMessage(`✅ Bạn đã đặt ${args[0]} với số tiền ${betAmount.toLocaleString()} VND cho phiên #${currentPhien}!
Time còn lại: ${50-i}`, threadID);
  } else if (args[0] === 'on' || args[0] === 'off') {
      const dataThread = global.data.threadInfo.get(threadID) || await Threads.getInfo(threadID);
      if (!dataThread.adminIDs.some(item => item.id === senderID)) {
          return api.sendMessage('❎ Bạn không đủ quyền hạn để sử dụng!', threadID, event.messageID);
      }
      if (args[0] === 'on') {
          if (!checkData.includes(threadID)) {
              checkData.push(threadID);
              fs.writeFileSync(fileCheck, JSON.stringify(checkData, null, 4), 'utf-8');
              return api.sendMessage(`✅ Đã bật trò chơi cho nhóm này!`, threadID);
          }
      } else if (args[0] === 'off') {
          const index = checkData.indexOf(threadID);
          if (index > -1) {
              checkData.splice(index, 1);
              fs.writeFileSync(fileCheck, JSON.stringify(checkData, null, 4), 'utf-8');
              return api.sendMessage(`Đã tắt trò chơi cho nhóm này!`, threadID);
          }
      }
  } else if (args[0] == 'check') {
      const uid = messageReply && messageReply.senderID || (mentions && Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : event.senderID);
      const player = checkmn.find(entry => entry.senderID == uid);
  
      if (!player) {
          return api.sendMessage(`❌ Người chơi chưa có dữ liệu tài xỉu!`, threadID);
      }

      const playerName = await Users.getNameUser(uid);
      let msg = `👤 𝗧𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝘁𝗮̀𝗶 𝘅𝗶̉𝘂\n━━━━━━━━━━━━━━━━━━\n`;
      msg += `👑 𝗧𝗲̂𝗻: ${playerName}\n🆔 𝗨𝗜𝗗: ${uid}\n💰 𝗦𝗼̂́ 𝗱𝘂̛ 𝘁𝗮̀𝗶 𝘅𝗶̉𝘂: ${player.input.toLocaleString()} VND\n`;
      msg += `━━━━━━━━━━━━━━━━━━`;
      api.sendMessage(msg, threadID);
  }
  else if (args[0] === 'lsnap') {
    let depositHistory = JSON.parse(fs.readFileSync(depositHistoryFile, "utf-8"));
    let userHistory = depositHistory.filter(item => item.senderID == senderID);
    if (userHistory.length === 0) return api.sendMessage("Bạn chưa từng nạp tiền vào tài xỉu.", threadID);
    let msg = `📥 𝗟𝗶̣𝗰𝗵 𝘀𝘂̛̉ 𝗡𝗮̣𝗽 𝗧𝗶𝗲̂̀𝗻 𝗧𝗮̀𝗶 𝗫𝗶̉𝘂\n━━━━━━━━━━━━━━━━━━\n`;
    msg += userHistory.slice(-10).reverse().map(
      (item, idx) => `#${idx+1} ┃ +${item.amount.toLocaleString()} VND\n🕒 ${new Date(item.time).toLocaleString()}\n━━━━━━━━━━━━━━━━━━`
    ).join('\n');
    return api.sendMessage(msg, threadID);
  }
  else if (args[0] === 'lsrut') {
    let withdrawHistory = JSON.parse(fs.readFileSync(withdrawHistoryFile, "utf-8"));
    let userHistory = withdrawHistory.filter(item => item.senderID == senderID);
    if (userHistory.length === 0) return api.sendMessage("Bạn chưa từng rút tiền từ tài xỉu.", threadID);
    let msg = `📤 𝗟𝗶̣𝗰𝗵 𝘀𝘂̛̉ 𝗥𝘂́𝘁 𝗧𝗶𝗲̂̀𝗻 𝗧𝗮̀𝗶 𝗫𝗶̉𝘂\n━━━━━━━━━━━━━━━━━━\n`;
    msg += userHistory.slice(-10).reverse().map(
      (item, idx) => `#${idx+1} ┃ -${item.amount.toLocaleString()} VND\n🕒 ${new Date(item.time).toLocaleString()}\n━━━━━━━━━━━━━━━━━━`
    ).join('\n');
    return api.sendMessage(msg, threadID);
  }
  else if (args[0] === 'hũ' || args[0] === 'hu') {
    let hu = parseInt(fs.readFileSync(huFile, "utf-8"));
    let huHistory = JSON.parse(fs.readFileSync(huHistoryFile, "utf-8"));
    let msg = `💰 𝗛𝘂̃ 𝗵𝗶𝗲̣̂𝗻 𝘁𝗮̣𝗶: ${hu.toLocaleString()} VND\n`;
    if (huHistory.length > 0) {
        let last = huHistory[huHistory.length-1];
        let lastName = await Users.getNameUser(last.userID);
        msg += `👑 𝗡𝗴𝘂̛𝗼̛̀𝗶 𝗻𝗼̂̉ 𝗵𝘂̃ 𝗴𝗮̂̀𝗻 𝗻𝗵𝗮̂́𝘁: ${lastName} (UID: ${last.userID})\n`;
        msg += `💸 𝗦𝗼̂́ 𝘁𝗶𝗲̂̀𝗻 𝗻𝗼̂̉ 𝗵𝘂̃: ${last.amount.toLocaleString()} VND\n`;
        msg += `🕒 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻: ${new Date(last.time).toLocaleString()}\n`;
        msg += `🆔 𝗡𝗵𝗼́𝗺: ${last.threadID}\n`;
        let max = huHistory.reduce((a,b) => a.amount > b.amount ? a : b);
        let maxName = await Users.getNameUser(max.userID);
        msg += `
🏆 𝗡𝗼̂̉ 𝗵𝘂̃ 𝗹𝗼̛́𝗻 𝗻𝗵𝗮̂́𝘁 𝗹𝗶𝗰𝗵 𝘀𝘂̛̉: ${max.amount.toLocaleString()} VND\n`;
        msg += `👑 𝗡𝗴𝘂̛𝗼̛̀𝗶 𝗻𝗼̂̉ 𝗹𝗼̛́𝗻 𝗻𝗵𝗮̂́𝘁: ${maxName} (UID: ${max.userID})\n`;
        msg += `🕒 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻: ${new Date(max.time).toLocaleString()}\n`;
        msg += `🆔 𝗡𝗵𝗼́𝗺: ${max.threadID}\n`;
    }
    return api.sendMessage(msg, threadID);
}
  else if (args[0] === 'cầu') {
    if (!checkData.includes(threadID)) {
        return api.sendMessage(`Nhóm chưa bật bàn tài xỉu!`, threadID);
    }
    const phienData = JSON.parse(fs.readFileSync(phiênFile, "utf-8"));
    if (phienData.length === 0) return api.sendMessage("Chưa có dữ liệu cầu!", threadID);
    const last50 = phienData.slice(-50);
    const circledWhite = {
        3: '③', 4: '④', 5: '⑤', 6: '⑥', 7: '⑦', 8: '⑧', 9: '⑨', 10: '⑩'
    };
    const circledBlack = {
        11: '⓫', 12: '⓬', 13: '⓭', 14: '⓮', 15: '⓯', 16: '⓰', 17: '⓱', 18: '⓲'
    };
    let msg = `=== 『 𝐓𝐀̀𝐈 𝐗𝐈̉𝐔 𝐒𝐎𝐈 𝐂𝐀̂̀𝐔 』 ===\n━━━━━━━━━━━━━━━━━━\n`;
    for (let i = 0; i < 5; i++) {
        let line = last50.slice(i * 10, (i + 1) * 10).map(p => {
            const total = p.dice1 + p.dice2 + p.dice3;
            if (total >= 3 && total <= 10) return circledWhite[total] || total;
            else if (total >= 11 && total <= 18) return circledBlack[total] || total;
            else return total;
        }).join(' ');
        msg += line + '\n';
    }
    msg += `━━━━━━━━━━━━━━━━━━`;
    return api.sendMessage(msg, threadID);
}
  else if (args[0] === 'add') {
    if (!global.config.ADMINBOT || !global.config.ADMINBOT.includes(senderID)) {
        return api.sendMessage('❎ Chỉ admin bot mới được sử dụng lệnh này!', threadID, event.messageID);
    }
    let addAmount = parseInt(args[1]);
    if (isNaN(addAmount) || addAmount <= 0) return api.sendMessage('Số tiền add vào hũ không hợp lệ!', threadID);
    let hu = parseInt(fs.readFileSync(huFile, "utf-8"));
    hu += addAmount;
    fs.writeFileSync(huFile, hu.toString(), "utf-8");
    return api.sendMessage(`✅ Đã cộng ${addAmount.toLocaleString()} VND vào hũ.`, threadID);
}
  else {
      api.sendMessage(
        `🎲 𝗧𝗔̀𝗜 𝗫𝗜̉𝗨 𝐒𝐔𝐍𝐖𝐈𝐍 🎲\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🔹 𝗕𝗮̣̂𝘁/𝘁𝗮̆́𝘁: tx on/off\n` +
        `🔹 𝗖𝘂̛𝗼̛̣𝗰 𝘁𝗮̀𝗶/𝘅𝗶̉𝘂: tx tài/xỉu + số tiền/all\n` +
        `🔹 𝗡𝗮̣𝗽 𝘁𝗶𝗲̂̀𝗻: tx nạp + số tiền\n` +
        `🔹 𝗥𝘂́𝘁 𝘁𝗶𝗲̂̀𝗻: tx rút + số tiền\n` +
        `🔹 𝗞𝗶𝗲̂̉𝗺 𝘁𝗿𝗮 𝘀𝗼̂́ 𝐝𝐮̛: tx check\n` +
        `🔹 𝗟𝗶̣𝗰𝗵 𝘀𝘂̛̉ 𝗡𝗮̣𝗽 𝗧𝗶𝗲̂̀𝗻: tx lsnap\n` +
        `🔹 𝗟𝗶̣𝗰𝗵 𝘀𝘂̛̉ 𝗥𝘂́𝘁 𝗧𝗶𝗲̂̀𝗻: tx lsrut\n` +
        `🔹 𝗖𝗮̂̀𝘂 𝘁𝗮̀𝗶 𝐱𝐢̉𝐮: tx cầu\n` +
        `🔹 𝐓𝐡𝐨̂𝐧𝐠 𝐭𝐢𝐧 𝐡𝐮̃: tx hũ\n` +
        `🔹 𝐂𝐨̣̂𝐧𝐠 𝐭𝐢𝐞̂̀𝐧 𝐡𝐮̃: tx add + số tiền\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `⚠️ 𝗟𝘂̛𝘆́: 𝗦𝗲𝗿𝘃𝗲𝗿 𝗹𝗶𝗲̂𝗻 𝗸𝗲̂́𝘁 𝘁𝗮̂́𝘁 𝗰𝗮̉ 𝐜𝐚́𝐜 𝗻𝗵𝗼́𝗺!`,
        threadID
      );
  }
}