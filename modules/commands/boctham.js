const fs = require("fs");
module.exports.config = {
    name: "boctham",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "⚡D-Jukie (qt fix 1 xí)", 
    description: "💴𝐁𝐨̂́𝐜 𝐓𝐡𝐚̆𝐦 𝐯𝐨̛́𝐢 𝐜𝐚́𝐜 𝐠𝐨́𝐢 𝟏𝟎𝐤 𝟐𝟎𝐤 𝟓𝟎𝐤 𝟏𝟎𝟎𝐤 𝟐𝟎𝟎𝐤 𝟓𝟎𝟎𝐤",
    commandCategory: "Kiếm Tiền",
    cooldowns: 5,
    usages: "boctham",
    envConfig: {
        cooldownTime: 12 * 60 * 60 * 1000
    },
    denpendencies: {
        "fs": "",
        "request": ""
}
};
module.exports.onLoad = () => {
    const fs = require("fs-extra");
    const request = require("request");
    const dirMaterial = __dirname + `/cache/`;
    if (!fs.existsSync(dirMaterial + "cache")) fs.mkdirSync(dirMaterial, { recursive: true });
    if (!fs.existsSync(dirMaterial + "baolixi1.png")) request("https://i.imgur.com/luFyD1C.jpg").pipe(fs.createWriteStream(dirMaterial + "baolixi1.png"));
}
module.exports.handleReply = async ({ 
    event:e, 
    api, 
    handleReply, 
    Currencies }) => {
    const { threadID, messageID, senderID } = e;
    let data = (await Currencies.getData(senderID)).data || {};
if (handleReply.author != e.senderID) 
return api.sendMessage("🎋𝐋𝐮̛𝐨̛̣𝐭 𝐛𝐨̂́𝐜 𝐭𝐡𝐚̆𝐦 𝐜𝐮̉𝐚 𝐚𝐢 𝐧𝐠𝐮̛𝐨̛̀𝐢 đ𝐨́ 𝐛𝐨̂́𝐜 𝐧𝐡𝐚́, 𝐛𝐚̣𝐧 𝐤𝐨 𝐧𝐞̂𝐧 𝐭𝐫𝐚𝐧𝐡 𝐥𝐮̛𝐨̛̣𝐭 𝐜𝐮̉𝐚 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐤𝐡𝐚́𝐜", e.threadID, e.messageID)

var a = Math.floor(Math.random() * 100000) + 9000; 
var b = Math.floor(Math.random() * 200000) + 8000; 
var c = Math.floor(Math.random() * 250000) + 7000; 
var x = Math.floor(Math.random() * 300000) + 8500; 
var y = Math.floor(Math.random() * 400000) + 8000; 
var f = Math.floor(Math.random() * 500000) + 5000;
  var msg = "";
    switch(handleReply.type) {
        case "choosee": {
            var t = Date.parse("February 17, 2026 00:00:00") - Date.parse(new Date()),
            m = Math.floor( (t/1000/60) % 60 ),
            h = Math.floor( (t/(1000*60*60)) % 24 ),
            d = Math.floor( t/(1000*60*60*24) ); 
           
            switch(e.body) {
                case "1": msg = `💷𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐠𝐨́𝐢 𝟏𝟎𝐤 𝐛𝐚̣𝐧 𝐦𝐮𝐚 đ𝐚̃ 𝐦𝐨̛̉ 𝐫𝐚 𝐝𝐜  ${a} VND 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐧𝐚̆𝐦 𝐦𝐨̛́𝐢 𝐚𝐧 𝐤𝐡𝐚𝐧𝐠 , 𝐯𝐚̣𝐧 𝐬𝐮̛̣ 𝐧𝐡𝐮̛ 𝐲́ 𝐧𝐞̀ <𝟑🎐\n🎀𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭🎋` ;
                await Currencies.increaseMoney(e.senderID, parseInt(a)); 
                break; 
                case "2": msg = `💷𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐠𝐨́𝐢 𝟐𝟎𝐤 𝐛𝐚̣𝐧 𝐦𝐮𝐚 đ𝐚̃ 𝐦𝐨̛̉ 𝐫𝐚 𝐝𝐜  ${b} VND 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐧𝐚̆𝐦 𝐦𝐨̛́𝐢 𝐚𝐧 𝐤𝐡𝐚𝐧𝐠 , 𝐯𝐚̣𝐧 𝐬𝐮̛̣ 𝐧𝐡𝐮̛ 𝐲́ 𝐧𝐞̀ <𝟑🎐\n🎀𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭🎋`; 
                await Currencies.increaseMoney(e.senderID, parseInt(b)); 
                break;
                case "3": msg = `💷𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐠𝐨́𝐢 𝟓𝟎𝐤 𝐛𝐚̣𝐧 𝐦𝐮𝐚 đ𝐚̃ 𝐦𝐨̛̉ 𝐫𝐚 𝐝𝐜  ${c} VND 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐧𝐚̆𝐦 𝐦𝐨̛́𝐢 𝐚𝐧 𝐤𝐡𝐚𝐧𝐠 , 𝐯𝐚̣𝐧 𝐬𝐮̛̣ 𝐧𝐡𝐮̛ 𝐲́ 𝐧𝐞̀ <𝟑🎐\n🎀𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭🎋`; 
                await Currencies.increaseMoney(e.senderID, parseInt(c)); 
                break;
                case "4": msg = `💷𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐠𝐨́𝐢 𝟏𝟎𝟎𝐤 𝐛𝐚̣𝐧 𝐦𝐮𝐚 đ𝐚̃ 𝐦𝐨̛̉ 𝐫𝐚 𝐝𝐜  ${x} VND 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐧𝐚̆𝐦 𝐦𝐨̛́𝐢 𝐚𝐧 𝐤𝐡𝐚𝐧𝐠 , 𝐯𝐚̣𝐧 𝐬𝐮̛̣ 𝐧𝐡𝐮̛ 𝐲́ 𝐧𝐞̀ <𝟑🎐\n🎀𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭🎋`; 
                await Currencies.increaseMoney(e.senderID, parseInt(x)); 
                break;
                case "5": msg = `💷𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐠𝐨́𝐢 𝟐𝟎𝟎𝐤 𝐛𝐚̣𝐧 𝐦𝐮𝐚 đ𝐚̃ 𝐦𝐨̛̉ 𝐫𝐚 𝐝𝐜  ${y} VND 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐧𝐚̆𝐦 𝐦𝐨̛́𝐢 𝐚𝐧 𝐤𝐡𝐚𝐧𝐠 , 𝐯𝐚̣𝐧 𝐬𝐮̛̣ 𝐧𝐡𝐮̛ 𝐲́ 𝐧𝐞̀ <𝟑🎐\n🎀𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭🎋`; 
                await Currencies.increaseMoney(e.senderID, parseInt(y)); 
                break;
                case "6": msg = `💷𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐠𝐨́𝐢 𝟓𝟎𝟎𝐤 𝐛𝐚̣𝐧 𝐦𝐮𝐚 đ𝐚̃ 𝐦𝐨̛̉ 𝐫𝐚 𝐝𝐜  ${f} VND 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐧𝐚̆𝐦 𝐦𝐨̛́𝐢 𝐚𝐧 𝐤𝐡𝐚𝐧𝐠 , 𝐯𝐚̣𝐧 𝐬𝐮̛̣ 𝐧𝐡𝐮̛ 𝐲́ 𝐧𝐞̀ <𝟑🎐\n🎀𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭🎋`; 
                await Currencies.increaseMoney(e.senderID, parseInt(f)); 
                break;
            };
            const choose = parseInt(e.body);
            if (isNaN(e.body)) 
            return api.sendMessage("💶𝐕𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐜𝐡𝐨̣𝐧 𝟏 𝐠𝐨́𝐢 𝐭𝐢𝐞̂̀𝐧 𝐜𝐨́ 𝐭𝐫𝐨𝐧𝐠 𝐛𝐚̉𝐧𝐠 🎀", e.threadID, e.messageID);
            if (choose > 6 || choose < 1) 
            return api.sendMessage("💶𝐋𝐮̛̣𝐚 𝐜𝐡𝐨̣𝐧 𝐤𝐡𝐨̂𝐧𝐠 𝐧𝐚̆̀𝐦 𝐭𝐫𝐨𝐧𝐠 𝐝𝐚𝐧𝐡 𝐬𝐚́𝐜𝐡🎀.", e.threadID, e.messageID); 
            api.unsendMessage(handleReply.messageID);
            return api.sendMessage(`${msg}`, threadID, async () => {
            await Currencies.setData(senderID, {
       data: {
    ...(await Currencies.getData(senderID)).data,
    work2Time: Date.now()
  }
});
            
        });

    };
}
}


module.exports.run = async ({  
    event:e, 
    api, 
    handleReply, 
    Currencies }) => {
    const { threadID, messageID, senderID } = e;
    const cooldown = this.config.envConfig.cooldownTime;
    let data = (await Currencies.getData(senderID)).data || {};
    var   t = Date.parse("February 17, 2026") - Date.parse(new Date()),
    d = Math.floor( t/(1000*60*60*24) ),
    h = Math.floor( (t/(1000*60*60)) % 24 ),
    m = Math.floor( (t/1000/60) % 60 );

    if (data.work2Time && cooldown - (Date.now() - data.work2Time) > 0) {
    const timeLeft = cooldown - (Date.now() - data.work2Time);
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        return api.sendMessage(`💎𝐁𝐚̣𝐧 đ𝐚̃ 𝐧𝐡𝐚̣̂𝐧 𝐛𝐨̂́𝐜 𝐭𝐡𝐚̆𝐦 𝐫𝐨̂̀𝐢, 𝐯𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐪𝐮𝐚𝐲 𝐥𝐚̣𝐢 𝐬𝐚𝐮 ${hours} 𝐠𝐢𝐨̛̀ ${minutes} 𝐩𝐡𝐮́𝐭 ${seconds} 𝐠𝐢𝐚̂𝐲\n🌸 𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭`, e.threadID, e.messageID); // Đoạn này ae có thể để quay lại sau ${housr}giờ ${minutes}phút ${seconds}giây
    }
    else {    
        var msg = {
            body: "🎋𝐁𝐨̂́𝐜 𝐭𝐡𝐚̆𝐦 𝐜𝐡𝐮́𝐧𝐠 𝐭𝐡𝐮̛𝐨̛̉𝐧𝐠🎋" +
                `\n🌸𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭` +
                "\n𝟏.   𝐆𝐨́𝐢 𝟏𝟎𝐤 💴 " +
                "\n𝟐.   𝐆𝐨́𝐢 𝟐𝟎𝐤 💶 " +
                "\n𝟑.   𝐆𝐨́𝐢 𝟓𝟎𝐤 💷 " +
                "\n𝟒.   𝐆𝐨́𝐢 𝟏𝟎𝟎𝐤💸 " +
                "\n𝟓.   𝐆𝐨́𝐢 𝟐𝟎𝟎𝐤💎 " +
                "\n𝟔.   𝐆𝐨́𝐢 𝟓𝟎𝟎𝐤💵 " +
                `\n\n🧨𝐇𝐚̃𝐲 𝐫𝐞𝐩𝐥𝐲 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 𝐜𝐡𝐨̣𝐧 𝐠𝐨́𝐢 𝐭𝐢𝐞̂̀𝐧 𝐛𝐚̣𝐧 𝐦𝐮𝐨̂́𝐧 𝐛𝐨̂́𝐜 𝐭𝐡𝐚̆𝐦.`,
                attachment: fs.createReadStream(__dirname + `/cache/baolixi1.png`)}
                return api.sendMessage(msg,e.threadID,  (error, info) => {
                data.work2Time = Date.now();
        global.client.handleReply.push({
            type: "choosee",
            name: this.config.name,
            author: e.senderID,
            messageID: info.messageID
          })  
        })
    }
}