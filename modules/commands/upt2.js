const os = require("os");
const moment = require("moment-timezone");

module.exports.config = {
  name: "upt2",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "qt",
  description: "Hiển thị thời gian hoạt động của bot",
  commandCategory: "Admin",
  usages: "upt",
  cooldowns: 0,
  usePrefix: false
}

module.exports.run = async function ({ api, event }) {
  const start = Date.now();

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
      const heap = process.memoryUsage();
      const heapTotal = Math.round(heap.heapTotal / 1024 / 1024);
      const heapUsed = Math.round(heap.heapUsed / 1024 / 1024);    

  const uptimeMs = Date.now() - global.client.timeStart;
  const totalSeconds = Math.floor(uptimeMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const uptimeStr = `${days ? days + " ngày " : ""}${hours ? hours + " giờ " : ""}${minutes ? minutes + " phút " : ""}${seconds} giây`;

  const ping = Date.now() - start;
  const status = ping < 200 ? "Fast 🚀" : ping < 800 ? "Normal ✅" : "Lag ⚠️";

  return api.sendMessage({body:
      `
╭───────────────╮
│  ⚙️  𝗛𝗘̣̂ 𝗧𝗛𝗢̂́𝗡𝗚 𝗕𝗢𝗧   │
╰───────────────╯\n` +
      `⏰ 𝐓𝐢𝐦𝐞: ${moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss - DD/MM/YYYY')}\n` +
      `⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptimeStr}\n` +
      `🌐 𝐏𝐫𝐞𝐟𝐢𝐱: ${global.config.PREFIX}\n` +
      `🧠 𝗛𝗲𝗮𝗽: ${heapUsed}MB / ${heapTotal}MB\n` +
      `💾 𝗥𝗔𝗠: ${Math.round(usedMem / 1024 / 1024)}MB / ${Math.round(totalMem / 1024 / 1024)}MB\n` +
      `🔧 𝗖𝗣𝗨: ${os.cpus().length} core\n` +
      `🖥️ 𝗛𝗗𝗛: ${os.type()} ${os.release()} (${os.arch()})\n` +
      `🔮 𝐏𝐢𝐧𝐠: ${ping}ms - ${status}`}, event.threadID, event.messageID);
};