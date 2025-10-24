const axios = require("axios");
 var request = require("request");
 const fs = require("fs");
 const { readdirSync, readFileSync, writeFileSync, existsSync, copySync, createWriteStream, createReadStream } = require("fs-extra");

module.exports.config = {
    name: "keobo",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "qt",
    description: "kéo bò, làm giàu ko khó",
    commandCategory: "Trò Chơi",
    usages: "",
    cooldowns: 5
};

module.exports.onLoad = async function () {
        if (!existsSync(__dirname + '/cache/keobo.png')) {
            request('https://i.postimg.cc/L63cgRgf/hu4t0u.png').pipe(createWriteStream(__dirname + '/cache/keobo.png'));
        }
        if (!existsSync(__dirname + '/cache/5conbo.jpg')) {
            request('https://i.postimg.cc/C1dhm5DW/converted-1753195001172-246dfut2u.jpg').pipe(createWriteStream(__dirname + '/cache/5conbo.jpg'));
        }
}

module.exports.run = async ({ api, event, args, Currencies }) => {
const { threadID, messageID, senderID } = event;
  if (!args[0]) {
      return api.sendMessage({ body: `🐮==== [ 𝐊𝐄́𝐎 𝐁𝐎̀ ] ====🐮\n\n𝗡𝗲̂́𝘂 𝗺𝘂𝗼̂́𝗻 𝗰𝗵𝗼̛𝗶 𝗯𝗮̣𝗻 𝗵𝗮̃𝘆 𝗻𝗵𝗮̣̂𝗽 𝗹𝗲̣̂𝗻𝗵 𝗻𝗵𝘂̛ 𝘀𝗮𝘂:\n!𝗸𝗲𝗼𝗯𝗼 [𝘀𝗼̂́ 𝘁𝗶𝗲̂̀𝗻]\n𝗟𝘂̛𝘂 𝘆́: 𝘁𝗶̉ 𝗹𝗲̣̂ 𝗰𝗮̀𝗻𝗴 𝗰𝗮𝗼 𝘁𝗵𝗶̀ 𝗰𝗮̀𝗻𝗴 𝗱𝗲̂̃ 𝘁𝗿𝘂́𝗻𝗴 𝘁𝗵𝘂̛𝗼̛̉𝗻𝗴 ❤️`,
attachment: fs.createReadStream(__dirname + "/cache/keobo.png") 
}, threadID, messageID)
  };
  const cuoc = parseInt(args[0]);
  if (isNaN(cuoc) || cuoc < 1000) {
    return api.sendMessage('𝙎𝒐̂́ 𝙙𝒖̛ 𝙘𝒖̉𝙖 𝙗𝒂̣𝙣 𝙠𝙝𝒐̂𝙣𝙜 đ𝒖̉ (𝙩𝒐̂́𝙞 𝙩𝙝𝙞𝒆̂̉𝙪 1,000 𝙑𝙉𝘿) đ𝒆̂̉ 𝙠𝒆́𝙤 𝙗𝒐̀ 🐮', threadID, messageID)
  }
     const moneyUser = (await Currencies.getData(event.senderID)).money;
     if (moneyUser < cuoc) {
    return api.sendMessage(`💰 𝗦𝗼̂́ 𝘁𝗶𝗲̂̀𝗻 𝗯𝗮̣𝗻 đ𝗮̣̆𝘁 𝗹𝗼̛́𝗻 𝗵𝗼̛𝗻 𝘀𝗼̂́ 𝗱𝘂̛ 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻!`, threadID, messageID);
  }
  await Currencies.decreaseMoney(senderID, cuoc);
var tile_1 = Math.floor(Math.random() * 100)
    var tile_2 = Math.floor(Math.random() * 100)
    var tile_3 = Math.floor(Math.random() * 100)
    var tile_4 = Math.floor(Math.random() * 100)
    var tile_5 = Math.floor(Math.random() * 100)
  var sotien_1 = cuoc;
  var sotien_2 = cuoc * 2;
  var sotien_3 = cuoc * 12;
  var sotien_4 = cuoc * 144;
  var sotien_5 = cuoc * 2880;
  return api.sendMessage({body: `🐮==== [ 𝐊𝐄́𝐎 𝐁𝐎̀ ] ====🐮

𝟭. 𝗕𝗼̀ 𝟭 (${sotien_1} VND) || 𝗧𝘆̉ 𝗟𝗲̣̂ ${tile_1}%
𝟮. 𝗕𝗼̀ 𝟮 (${sotien_2} VND) || 𝗧𝘆̉ 𝗟𝗲̣̂ ${tile_2}%
𝟯. 𝗕𝗼̀ 𝟯 (${sotien_3} VND) || 𝗧𝘆̉ 𝗟𝗲̣̂ ${tile_3}%
𝟰. 𝗕𝗼̀ 𝟰 (${sotien_4} VND) || 𝗧𝘆̉ 𝗟𝗲̣̂ ${tile_4}%
𝟱. 𝗕𝗼̀ 𝟱 (${sotien_5} VND) || 𝗧𝘆̉ 𝗟𝗲̣̂ ${tile_5}%

𝐑𝐞𝐩𝐥𝐲 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 𝐧𝐚̀𝐲 𝐤𝐞̀𝐦 𝐒𝐓𝐓 𝐜𝐮̉𝐚 𝐜𝐨𝐧 𝐛𝐨̀ 𝐦𝐚̀ 𝐛𝐚̣𝐧 𝐦𝐮𝗼̂́𝗻 𝐛𝐚̆́𝐭 𝐧𝐡𝐞́ 🐮`, attachment: fs.createReadStream(__dirname + '/cache/5conbo.jpg')
}, threadID, (err, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            cuoc
        });
    }, messageID);
}

module.exports.handleReply = async ({ api, Currencies, event, handleReply }) => {
const { threadID, senderID, messageID, body } = event;
  const { cuoc, author } = handleReply;
   const dataMoney = await Currencies.getData(senderID);
    const moneyUser = dataMoney.money;
if (author !== senderID) { return api.sendMessage('𝐁𝐚̣𝐧 𝐤𝐡𝐨̂𝐧𝐠 𝐩𝐡𝐚̉𝐢 𝐥𝐚̀ 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐨̛𝐢 𝐧𝐞̂𝐧 𝐤𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐜𝐡𝐨̣𝐧 🐮', threadID, messageID)};
 if(!("keobo" in global.client)) global.client.keobo = {}
 if(isNaN(body)) return api.sendMessage("𝐁𝐚̣𝐧 𝐩𝐡𝐚̉𝐢 𝐧𝐡𝐚̣̂𝐩 𝐦𝐨̣̂𝐭 𝐬𝐨̂́ 🐮", threadID);
if(1 > body || body > 5) return api.sendMessage("𝐁𝐚̣𝐧 𝐜𝐡𝐢̉ 𝐜𝐨́ 𝐭𝐡𝐞̂̉ 𝐜𝐡𝐨̣𝐧 𝐭𝐮̛̀ 𝟏 𝐭𝐨̛́𝐢 𝟓 🐮", threadID, messageID);
  if(body == "1"){
    var tienan = cuoc,
    win = "https://i.postimg.cc/rzGRMsff/2z9ese.jpg",
      losse = "https://i.postimg.cc/MvWMTw4q/jibr5o.jpg"
  }
  else if(body == "2"){
    var tienan = cuoc * 2,
    win = "https://i.postimg.cc/62rLvXXw/raxijw.jpg",
      losse = "https://i.postimg.cc/p5PQQ6Wj/s6dxd1.jpg"
  }
  else if(body == "3"){
    var tienan = cuoc * 12,
    win = "https://i.postimg.cc/QVDqrHQM/0726y4.jpg",
      losse = "https://i.postimg.cc/6Thf6tcf/f4if6h.jpg"
  }
  else if(body == "4"){
    var tienan = cuoc * 144,
    win = "https://i.postimg.cc/bsNHsWFc/gkjdhu.jpg",
      losse = "https://i.postimg.cc/tss3zPjB/nuif9a.jpg"
  }
  else if(body == "5"){
    var tienan = cuoc * 2880,
    win = "https://i.postimg.cc/Lqfjcphf/8pwj9m.jpg",
      losse = "https://i.postimg.cc/hzBVg57Y/nnuq2g.jpg"
  }
  if( moneyUser < tienan){
    return api.sendMessage(`Bạn Không Đủ Tiền Để Chọn Con Bò Số ${body} với số tiền là ${tienan} và bạn còn thiếu ${tienan - moneyUser}`, threadID)
  } else {
  
var msg = `𝐁𝐚̣𝐧 𝐯𝐮̛̀𝐚 𝐜𝐡𝐨̣𝐧 𝐛𝐨̀ ${body} 𝐯𝐚̀ 𝐬𝐨̂́ 𝐭𝐢𝐞̂̀𝐧 𝐜𝐨́ 𝐭𝐡𝐞̂̉ 𝐛𝐚̣𝐧 𝐧𝐡𝐚̣̂𝐧 𝐯𝐞̂̀ 𝐥𝐚̀ ${tienan}\n𝐍𝐡𝐚̣̂𝐩 "𝐤𝐞́𝐨" 𝐧𝐞̂́𝐮 𝐦𝐮𝐨̂́𝐧 𝐛𝐚̆́𝐭 𝐜𝐨𝐧 𝐛𝐨̀\n𝐕𝐚̀ 𝐥𝐢𝐞̂𝐧 𝐭𝐮̣𝐜 𝐧𝐡𝐚̣̂𝐩 "𝐤𝐞́𝐨" 𝐭𝐫𝐨𝐧𝐠 𝟏𝟎𝐬 𝐬𝐚𝐮 `;

const keobo = (msg, bo) => api.sendMessage(msg, threadID, (err, info) => {
        global.client.keobo[senderID] = {
            spam: 10,
            count: 0,
            bo,
            stt: body,
            author: senderID,
            tienan: tienan,
          win: win,
          lose: losse
        }
    })
keobo(msg, body.trim())
}
}
module.exports.handleEvent = async({ api, event, Currencies, Users }) => {
  const { threadID, senderID, body } = event;
    if(!("keobo" in global.client)) global.client.keobo = {};
    if (!([senderID] in global.client.keobo)) return;
    const { increaseMoney, decreaseMoney } = Currencies;
  if(body == "kéo" || body == "Kéo") {
        global.client.keobo[senderID].count++;
     if (global.client.keobo[senderID].count > 1) return;
    setTimeout(async () => {
      let name1 = await Users.getNameUser(senderID)
      let reward = global.client.keobo[senderID].tienan * 2
      let type_bo = global.client.keobo[senderID].stt
       let type_bo_win = global.client.keobo[senderID].win
      let type_bo_lose = global.client.keobo[senderID].lose
      if( type_bo == '1'){
        var choose = ["true", "false"]
      var ans = choose[Math.floor(Math.random() * choose.length)]
      if( ans == "false" || global.client.keobo[senderID].count < 5){
        let imag = (await axios.get(type_bo_lose, {
        responseType: "stream"
      })).data;
        var msg = { body: `${name1} 𝐁𝐚̣𝐧 𝐯𝐮̛̀𝐚 𝐤𝐞́𝐨 𝐡𝐮̣𝐭 𝐯𝐚̀ 𝐛𝐢̣ 𝐛𝐨̀ 𝐪𝐮𝐚̣̂𝐭 𝐥𝐚̣𝐢\n𝐌𝐚̂́𝐭 ${global.client.keobo[senderID].tienan} VND 🐮`, attachment: imag }
        return api.sendMessage(msg, threadID, async () => {
                delete global.client.keobo[senderID];
            })
      } else {
         let imag = (await axios.get(type_bo_win, {
        responseType: "stream"
      })).data;
        var msg = { body: `𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 ${name1} 𝐯𝐮̛̀𝐚 𝐤𝐞́𝐨 𝐭𝐫𝐮́𝐧𝐠\n𝐍𝐡𝐚̣̂𝐧 𝐯𝐞̂̀ ${reward} VND 🐮`, attachment: imag }
        return api.sendMessage(msg, threadID, async () => {
          await increaseMoney(senderID, parseInt(reward));
                delete global.client.keobo[senderID];
            })
      }  
      } else if( type_bo == '2'){
        var choose = ["true", "false", "false", "false","false","true"]
      var ans = choose[Math.floor(Math.random() * choose.length)]
      if( ans == "false" || global.client.keobo[senderID].count < 7){
         let imag = (await axios.get(type_bo_lose, {
        responseType: "stream"
      })).data;
        var msg = { body: `${name1} 𝐁𝐚̣𝐧 𝐯𝐮̛̀𝐚 𝐤𝐞́𝐨 𝐡𝐮̣𝐭 𝐯𝐚̀ 𝐛𝐢̣ 𝐛𝐨̀ 𝐪𝐮𝐚̣̂𝐭 𝐥𝐚̣𝐢\n𝐌𝐚̂́𝐭 ${global.client.keobo[senderID].tienan} VND 🐮`, attachment: imag }
        return api.sendMessage(msg, threadID, async () => {
                delete global.client.keobo[senderID];
            })
      } else {
         let imag = (await axios.get(type_bo_win, {
        responseType: "stream"
      })).data;
        var msg = { body: `𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 ${name1} 𝐯𝐮̛̀𝐚 𝐤𝐞́𝐨 𝐭𝐫𝐮́𝐧𝐠\n𝐍𝐡𝐚̣̂𝐧 𝐯𝐞̂̀ ${reward} VND 🐮`, attachment: imag }
        return api.sendMessage(msg, threadID, async () => {
          await increaseMoney(senderID, parseInt(reward));
                delete global.client.keobo[senderID];
            })
      }  
      } 
      else if( type_bo == '3'){
        var choose = ["true", "false", "false", "false","false","true","false","false"]
      var ans = choose[Math.floor(Math.random() * choose.length)]
      if( ans == "false" || global.client.keobo[senderID].count < 8){
let imag = (await axios.get(type_bo_lose, {
        responseType: "stream"
      })).data;
        var msg = { body: `${name1} 𝐁𝐚̣𝐧 𝐯𝐮̛̀𝐚 𝐤𝐞́𝐨 𝐡𝐮̣𝐭 𝐯𝐚̀ 𝐛𝐢̣ 𝐛𝐨̀ 𝐪𝐮𝐚̣̂𝐭 𝐥𝐚̣𝐢\n𝐌𝐚̂́𝐭 ${global.client.keobo[senderID].tienan} VND 🐮`, attachment: imag }
        return api.sendMessage(msg, threadID, async () => {
                delete global.client.keobo[senderID];
            })
      } else {
         let imag = (await axios.get(type_bo_win, {
        responseType: "stream"
      })).data;
        var msg = { body: `𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 ${name1} 𝐯𝐮̛̀𝐚 𝐤𝐞́𝐨 𝐭𝐫𝐮́𝐧𝐠\n𝐍𝐡𝐚̣̂𝐧 𝐯𝐞̂̀ ${reward} VND 🐮`, attachment: imag }
        return api.sendMessage(msg, threadID, async () => {
          await increaseMoney(senderID, parseInt(reward));
                delete global.client.keobo[senderID];
            })
      }  
      } else if( type_bo == '4'){
        var choose = ["true", "false", "false", "false","false","true","false","false","false","false","false","false","false","true"]
      var ans = choose[Math.floor(Math.random() * choose.length)]
      if( ans == "false" || global.client.keobo[senderID].count < 9){
      let imag = (await axios.get(type_bo_lose, {
        responseType: "stream"
      })).data;
        var msg = { body: `${name1} 𝐁𝐚̣𝐧 𝐯𝐮̛̀𝐚 𝐤𝐞́𝐨 𝐡𝐮̣𝐭 𝐯𝐚̀ 𝐛𝐢̣ 𝐛𝐨̀ 𝐪𝐮𝐚̣̂𝐭 𝐥𝐚̣𝐢\n𝐌𝐚̂́𝐭 ${global.client.keobo[senderID].tienan} VND 🐮`, attachment: imag }
        return api.sendMessage(msg, threadID, async () => {
                delete global.client.keobo[senderID];
            })
      } else {
         let imag = (await axios.get(type_bo_win, {
        responseType: "stream"
      })).data;
        var msg = { body: `𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 ${name1} 𝐯𝐮̛̀𝐚 𝐤𝐞́𝐨 𝐭𝐫𝐮́𝐧𝐠\n𝐍𝐡𝐚̣̂𝐧 𝐯𝐞̂̀ ${reward} VND 🐮`, attachment: imag }
        return api.sendMessage(msg, threadID, async () => {
          await increaseMoney(senderID, parseInt(reward));
                delete global.client.keobo[senderID];
            })
      }  
      }
      else if( type_bo == '5'){
        var choose = ["true", "false", "false", "false","false","true","false","false","false","false","false","false","false", "false","false", "true", "false","false","false","false","false","false","false","true", "false","false","false","true","true","false","false","false"]
      var ans = choose[Math.floor(Math.random() * choose.length)]
      if( ans == "false" || global.client.keobo[senderID].count < 10){
       let imag = (await axios.get(type_bo_lose, {
        responseType: "stream"
      })).data;
        var msg = { body: `${name1} 𝐁𝐚̣𝐧 𝐯𝐮̛̀𝐚 𝐤𝐞́𝐨 𝐡𝐮̣𝐭 𝐯𝐚̀ 𝐛𝐢̣ 𝐛𝐨̀ 𝐪𝐮𝐚̣̂𝐭 𝐥𝐚̣𝐢\n𝐌𝐚̂́𝐭 ${global.client.keobo[senderID].tienan} VND 🐮`, attachment: imag }
        return api.sendMessage(msg, threadID, async () => {
                delete global.client.keobo[senderID];
            })
      } else {
         let imag = (await axios.get(type_bo_win, {
        responseType: "stream"
      })).data;
        var msg = { body: `𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 ${name1} 𝐯𝐮̛̀𝐚 𝐤𝐞́𝐨 𝐭𝐫𝐮́𝐧𝐠\n𝐍𝐡𝐚̣̂𝐧 𝐯𝐞̂̀ ${reward} VND 🐮`, attachment: imag }
        return api.sendMessage(msg, threadID, async () => {
          await increaseMoney(senderID, parseInt(reward));
                delete global.client.keobo[senderID];
            })
        }}}, 10000);
    }
  }