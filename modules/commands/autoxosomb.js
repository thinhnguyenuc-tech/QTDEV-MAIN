const axios = require("axios");
const schedule = require("node-schedule");

module.exports.config = {
  name: "autoxosomb",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "qt",
  description: "Tự động gửi kết quả xổ số miền Bắc mỗi ngày",
  commandCategory: "Tiện Ích",
  usages: "Tự động",
  cooldowns: 5
};

async function layKetQuaXSMB() {
  try {
    const res = await axios.get("https://api-xsmb-today.onrender.com/api/v1");
    const response = res.data;

    if (!response || !response.results) {
      return "❌ Không lấy được kết quả xổ số Miền Bắc hôm nay.";
    }

    const data = response.results;
    const date = response.time || "Không rõ";

    let msg = `🎯 𝐗𝐒𝐌𝐁 𝐍𝐆𝐀̀𝐘 ${date}\n\n`;
    msg += `💥 𝐌ã đ𝐚̣̆𝐜 𝐛𝐢𝐞̣̂𝐭: ${data["MDB"] || data["MĐB"] || "Chưa có"}\n`;
    msg += `💥 𝐆𝐢𝐚̉𝐢 đ𝐚̣̆𝐜 𝐛𝐢𝐞̣̂𝐭: ${data["ĐB"].join(" - ")}\n`;
    msg += `🥇 𝐆𝐢𝐚̉𝐢 𝐧𝐡𝐚̂́𝐭: ${data["G1"].join(" - ")}\n`;
    msg += `🥈 𝐆𝐢𝐚̉𝐢 𝐧𝐡𝐢̀: ${data["G2"].join(" - ")}\n`;
    msg += `🥉 𝐆𝐢𝐚̉𝐢 𝐛𝐚: ${data["G3"].join(" - ")}\n`;
    msg += `🏅 𝐆𝐢𝐚̉𝐢 𝐭𝐮̛: ${data["G4"].join(" - ")}\n`;
    msg += `🏅 𝐆𝐢𝐚̉𝐢 𝐧𝐚̆𝐦: ${data["G5"].join(" - ")}\n`;
    msg += `🎖️ 𝐆𝐢𝐚̉𝐢 𝐬𝐚́𝐮: ${data["G6"].join(" - ")}\n`;
    msg += `🎗️ 𝐆𝐢𝐚̉𝐢 𝐛𝐚̉𝐲: ${data["G7"].join(" - ")}\n`;
    msg += `\n📌 Dữ liệu được cập nhật tự động.`;

    return msg;
  } catch (err) {
    return "❌ Không lấy được kết quả xổ số Miền Bắc hôm nay.";
  }
}

async function guiXSMBToanBoNhom(api) {
  const ketQua = await layKetQuaXSMB();
  if (!ketQua) return;

  api.getThreadList(50, null, ["INBOX"], (err, threads) => {
    if (err || !threads) return;

    threads.forEach(thread => {
      if (thread.isGroup) {
        api.sendMessage(ketQua, thread.threadID);
      }
    });
  });
}

function khoiDongAuto(api) {
  schedule.scheduleJob("31 18 * * *", () => {
    guiXSMBToanBoNhom(api);
  });
}

module.exports.onLoad = ({ api }) => {
  khoiDongAuto(api);
};

module.exports.run = () => {};