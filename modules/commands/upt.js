const os = require("os");
const moment = require("moment-timezone");
const si = require('systeminformation');

module.exports = {
  config: {
    name: "upt",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "qt",
    description: "Xem thông tin uptime bot",
    commandCategory: "Admin",
    usages: "upt",
    usePrefix: false,
    cooldowns: 5
  },

  run: async ({ api, event }) => {
    const userInfo = await api.getUserInfo(event.senderID);
    const name = userInfo[event.senderID]?.name || "Null";
    const start = Date.now();
 
    const arch = os.arch();
    const cpus = os.cpus()[0].model;
    const platform = os.platform();
    const hdh = os.type();
    const sv = os.release();
    const db = os.cpus().length;
    const qt = `${hdh} ${sv} (${platform})`;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usedMemPercent = ((usedMem / totalMem) * 100).toFixed(1);

    const totalMemGB = (totalMem / (1024 ** 3)).toFixed(2);
    const usedMemGB = (usedMem / (1024 ** 3)).toFixed(2);
    const freeMemGB = (freeMem / (1024 ** 3)).toFixed(2);
    
    const heap = process.memoryUsage();
      const heapTotal = Math.round(heap.heapTotal / 1024 / 1024);
      const heapUsed = Math.round(heap.heapUsed / 1024 / 1024);

    const ramBar = (() => {
      const barLength = 10;
      const filled = Math.round((usedMemPercent / 100) * barLength);
      return "█".repeat(filled) + "░".repeat(barLength - filled);
    })();

    let cpuPercent = "Không thể đo";
    const load = await si.currentLoad();
    cpuPercent = load.currentLoad.toFixed(1);
    const cpuBar = (() => {
      const barLength = 10;
      const filled = Math.round((cpuPercent / 100) * barLength);
      return "█".repeat(filled) + "░".repeat(barLength - filled);
    })();

    const uptimeMs = Date.now() - global.client.timeStart;
    const totalSeconds = Math.floor(uptimeMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

function pad(n) {
  return String(n).padStart(2, '0');
}

let uptimeStr = '';
if (days > 0) uptimeStr += `${pad(days)}:`;
if (days > 0 || hours > 0) uptimeStr += `${pad(hours)}:`;
uptimeStr += `${pad(minutes)}:${pad(seconds)}`;
const ping = Date.now() - start;
const status = ping < 200 ? "Fast 🚀" : ping < 800 ? "Normal ✅" : "Lag ⚠️";


    const msg = `👾 𝗨𝗽𝘁𝗶𝗺𝗲 𝗜𝗻𝗳𝗼𝗺𝗮𝘁𝗶𝗼𝗻 👾
⏰ Time: ${moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss - DD/MM/YYYY')}
⌛ Uptime: ${uptimeStr}
🔮 Ping: ${ping}ms - ${status}

🖥️ HDH: ${qt}
🔧 Core: ${db} core
⚙️ Cấu trúc: ${arch}
💽 CPU: ${cpus}
• 𝐓𝐇𝐎̂𝐍𝐆 𝐓𝐈𝐍 •
Heap: ${heapUsed}MB / ${heapTotal}MB
CPU đang sử dụng: ${cpuPercent}%
${cpuBar}
RAM đang sử dụng: ${usedMemPercent}%
${ramBar}
Ram gốc: ${totalMemGB}GB
Ram sử dụng: ${usedMemGB}GB
Ram còn lại: ${freeMemGB}GB
👤 Người dùng: ${name}`;

    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};