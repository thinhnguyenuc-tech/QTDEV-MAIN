module.exports.config = {
  name: "fixspam",
  version: "1.0.0",
  hasPermssion: 3,
  credits: "ManhG",
  description: "Người chửi bot sẽ tự động bị ban khỏi hệ thống <3",
  commandCategory: "Admin",
  usages: "",
  cooldowns: 0,
  denpendencies: {}
};

module.exports.handleReply = async function ({ api, args, Users, event, handleReply }) {
  const { threadID, messageID } = event;
  const { reason } = handleReply;
  var name = await Users.getNameUser(event.senderID);
  var arg = event.body.split(" ");
  var uidUser = handleReply.author;
  var nameU = handleReply.nameU;
  switch (handleReply.type) {
    case "reply":
      {
        var idad = global.config.ADMINBOT;
        for (let ad of idad) {
          api.sendMessage({
            body: "‎➝ 𝐋𝐨̛̀𝐢 𝐜𝐡𝐚̆𝐧𝐠 𝐜𝐡𝐨̂́𝐢 𝐭𝐮̛̀ 𝐭𝐡𝐚̆̀𝐧𝐠 𝐤𝐡𝐨̂́𝐧 𝐯𝐮̛̀𝐚 𝐜𝐡𝐮̛̉𝐢 𝐛𝐨𝐭: " + name + ":\n " + event.body,
            mentions: [{
              id: event.senderID,
              tag: name
            }]
          }, ad, (e, data) => global.client.handleReply.push({
            name: this.config.name,
            messageID: data.messageID,
            messID: event.messageID,
            author: event.senderID,
            id: event.threadID,
            nameU: name,
            type: "banU"
          }))
        }
        break;
      }

    case "banU":
      {
        if (arg[0] == "unban" || arg[0] == "Unban") {

          let data = (await Users.getData(uidUser)).data || {};
          data.banned = 0;
          data.reason = null;
          data.dateAdded = null;
          await Users.setData(uidUser, { data });
          global.data.userBanned.delete(uidUser, 1);

          api.sendMessage(`‎➝ 𝐓𝐡𝐨̂𝐧𝐠 𝐛𝐚́𝐨 𝐭𝐮̛̀ 𝐀𝐝𝐦𝐢𝐧  ${name}\n\n ${nameU}\n‎➝ 𝐁𝐚̣𝐧 Đ𝐚̃ Đ𝐮̛𝐨̛̣𝐜 𝐆𝐨̛̃ 𝐁𝐚𝐧\n‎➝ 𝐂𝐨́ 𝐭𝐡𝐞̂̉ 𝐬𝐮̛̉ 𝐝𝐮̣𝐧𝐠 𝐛𝐨𝐭 𝐧𝐠𝐚𝐲 𝐛𝐚̂𝐲 𝐠𝐢𝐨̛̀🥳`, uidUser, () =>
            api.sendMessage(`${global.data.botID}`, () =>
              api.sendMessage(`★★UnBanSuccess★★\n\n🔷${nameU} \n✅TID:${uidUser} `, threadID)));
        } else {
          api.sendMessage({ body: `‎👑Lời cứu vớt từ Admin đến bạn:\n\n${event.body}\n\n‎Reply tin nhắn này để gửi lời tới Admin`, mentions: [{ tag: name, id: event.senderID }] }, handleReply.id, (e, data) => global.client.handleReply.push({
            name: this.config.name,
            author: event.senderID,
            messageID: data.messageID,
            type: "reply"
          }), handleReply.messID);
          break;
          
        }
      }

    case "chuibot":
      {
        api.sendMessage({ body: `‎👑Admin phản hồi:\n\n${event.body}\n\n 👉🏻Reply tin nhắn này để gửi lời trăn trối tới Admin`, mentions: [{ tag: name, id: event.senderID }] }, handleReply.id, (e, data) => global.client.handleReply.push({
          name: this.config.name,
          author: event.senderID,
          messageID: data.messageID,
          type: "reply"
        }), handleReply.messID);
        break;
      }
  }
};

module.exports.handleEvent = async ({ event, api, Users, Threads }) => {
  var { threadID, messageID, body, senderID, reason } = event;
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss D/MM/YYYY");
  
    var { threadID, messageID, body, senderID } = event; const thread = global.data.threadData.get(threadID) || {};
    if (typeof thread["fixspam"] !== "undefined" && thread["fixspam"] == false) return;

  if (senderID == global.data.botID) return;
  let name = await Users.getNameUser(event.senderID);
  var idbox = event.threadID;
  var threadInfo = (await Threads.getData(threadID)).threadInfo;
  //trả lời
  var msg = {
    body: `━━━━━━━━━━━━━━━━━━\n➝  [ AUTO BAN ] \n━━━━━━━━━━━━━━━━━━\n➝ ${name}, bạn thật ngu lồn khi chửi bot, vì vậy bạn đã bị ban khỏi hệ thống của qtBot🌸\n━━━━━━━━━━━━━━━━━━\n➝  Liên hệ Admin: https://www.facebook.com/qtmatnick để được ân xá nhé ><`
  }
  // Gọi bot
  const arr = ["bot óc chó","admin lồn", "bot lồn","bot lỏ", "bot ngu", "bot gà", "bot lol", "bot cc", "bot như cặc", "bot chó", "bot ngu lồn", "bot chó", "dm bot", "dmm bot", "Clm bot", "bot ghẻ", "đmm bot", "đb bot", "bot điên", "bot dở", "bot khùng", "đĩ bot", "bot nguu", "con bot lòn", "cmm bot", "clap bot", "bot ncc", "bot oc", "bot óc", "bot óc chó", "cc bot", "bot tiki", "lozz bottt", "lol bot", "loz bot", "lồn bot", "bot hãm", "bot lon", "bot cac", "bot nhu lon", "bot như cc", "bot như bìu", "bot sida", "bot xàm", "bot fake", "bot súc vật", "bot shoppee", "bot đểu", "bot như lồn", "bot dởm","hùng ngu","bos ngu","bos ncc"];

  arr.forEach(i => {
    let str = i[0].toUpperCase() + i.slice(1);
    if (body === i.toUpperCase() | body === i | str === body) {
      const uidUser = event.senderID;
      modules = "chui bot:"
      console.log(name, modules, i);
      const data = Users.getData(uidUser).data || {};
      Users.setData(uidUser, { data });
      data.banned = 1;
      data.reason = 'Chửi '+ i || null;
      data.dateAdded = time;
      global.data.userBanned.set(uidUser, { reason: data.reason, dateAdded: data.dateAdded });

      api.sendMessage(msg, threadID, () => {
        var listAdmin = global.config.ADMINBOT;
        for (var idad of listAdmin) {
          let namethread = threadInfo.threadName;
          api.sendMessage(`⚠️ ${name} đã bị ban khỏi hệ thống bot vì phát ngôn mất kiểm soát của mình.\n👤UID : ${uidUser}\n📜Box: ${namethread}\n Lời súc phạm: ${data.reason}.`, idad, (error, info) =>
              global.client.handleReply.push({
                name: this.config.name,
                author: senderID,
                messageID: info.messageID,
                messID: messageID,
                id: idbox,
                type: "chuibot"
              })
          );
        }
      });
    }
  });

};

module.exports.languages = {
  "vi": {"on": "Bật","off": "Tắt","successText": "autoban nhóm này thành công",},
  "en": {"on": "on","off": "off","successText": "autoban success!",}
}

module.exports.run = async function ({ api, event, Threads, getText }) {
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;

  if (typeof data["autoban"] == "undefined" || data["autoban"] == true) data["autoban"] = false;
  else data["autoban"] = true;

  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);
  return api.sendMessage(`${(data["autoban"] == false) ? getText("off") : getText("on")} ${getText("successText")}`, threadID, messageID);
    }