module.exports.config = {
  name: "age",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Orson",
  description: "age no api =))",
  commandCategory: "Trò Chơi",
  usages: "[ngày/tháng/năm sinh]",
  cooldowns: 0
};

module.exports.run = function ({ event, args, api, getText }) {
  const moment = require("moment-timezone");
  var date = new Date();
  var yearin = moment.tz("Asia/Ho_Chi_Minh").format("YYYY");
  var dayin = moment.tz("Asia/Ho_Chi_Minh").format("DD");
  var monthin = moment.tz("Asia/Ho_Chi_Minh").format("MM");
  var input = args[0];
  if (!input) return api.sendMessage("𝐒𝐚𝐢 đ𝐢̣𝐧𝐡 𝐝𝐚̣𝐧𝐠", event.threadID);
  var content = input.split("/");
  var dayout = parseInt(content[0]);
  if (!dayout || isNaN(dayout) || dayout > 31 || dayout < 1) { return api.sendMessage("𝐍𝐠𝐚̀𝐲 𝐬𝐢𝐧𝐡 𝐤𝐡𝐨̂𝐧𝐠 𝐡𝐨̛̣𝐩 𝐥𝐞̣̂!", event.threadID)}
  var monthout = parseInt(content[1]);
  if (!monthout || isNaN(monthout) || monthout > 12 || monthout < 1) { return api.sendMessage("𝐓𝐡𝐚́𝐧𝐠 𝐬𝐢𝐧𝐡 𝐤𝐡𝐨̂𝐧𝐠 𝐡𝐨̛̣𝐩 𝐥𝐞̣̂!", event.threadID)}
  var yearout = parseInt(content[2]);
  if (!yearout || isNaN(yearout) || yearout > yearin || yearout < 1) { return api.sendMessage("𝐍𝐚̆𝐦 𝐬𝐢𝐧𝐡 𝐤𝐡𝐨̂𝐧𝐠 𝐡𝐨̛̣𝐩 𝐥𝐞̣̂", event.threadID)}
  var tuoi = yearin - yearout
  var tuoii = yearin - yearout - 1
  var msg = `𝐇𝐨̂𝐦 𝐍𝐚𝐲 𝐋𝐚̀ 𝐒𝐢𝐧𝐡 𝐍𝐡𝐚̣̂𝐭 𝐓𝐡𝐮̛́ ${tuoi} 𝐂𝐮̉𝐚 𝐁𝐚̣𝐧. 𝐇𝐚𝐩𝐩𝐲 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲`
    if (monthout > monthin) {var aftermonth = monthout - monthin; var msg = `𝐍𝐚̆𝐦 𝐧𝐚𝐲 𝐛𝐚̣𝐧 ${tuoii}  𝐭𝐮𝐨̂̉𝐢. 𝐂𝐨̀𝐧  ${aftermonth} 𝐭𝐡𝐚́𝐧𝐠 𝐧𝐮̛̃𝐚 𝐥𝐚̀ 𝐛𝐚̣𝐧 𝐬𝐞̃ 𝐭𝐫𝐨̀𝐧 ${tuoi}  𝐭𝐮𝐨̂̉𝐢`};
  if (monthin == monthout && dayin < dayout) {var afterday = dayout - dayin; var msg = ` 𝐍𝐚̆𝐦 𝐧𝐚𝐲 𝐛𝐚̣𝐧 ${tuoii} 𝐭𝐮𝐨̂̉𝐢. 𝐂𝐨̀𝐧 ${afterday} 𝐧𝐠𝐚̀𝐲 𝐧𝐮̛̃𝐚 𝐥𝐚̀ 𝐛𝐚̣𝐧 𝐬𝐞̃ 𝐭𝐫𝐨̀𝐧 ${tuoi} 𝐭𝐮𝐨̂̉𝐢`};
  return api.sendMessage(msg, event.threadID)
}