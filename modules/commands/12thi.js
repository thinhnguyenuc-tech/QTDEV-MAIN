module.exports.config = {
  name: "12thi",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "qt",
  description: "Hiển thị chi tiết 12 thì tiếng Anh",
  commandCategory: "Giải Trí",
  usages: "",
  cooldowns: 5,
};

const explanations = {
  1: `➤ 𝗛𝗶𝗲̣̂𝗻 𝘁𝗮̣𝗶 đ𝗼̛𝗻 (Present Simple)
• Cấu trúc:
(+) S + V(s/es) + O
(-) S + do/does not + V + O
(?) Do/Does + S + V + O?
• Cách dùng: Diễn tả thói quen, sự thật hiển nhiên.
• Dấu hiệu: always, usually, often, every day...`,

  2: `➤ 𝗛𝗶𝗲̣̂𝗻 𝘁𝗮̣𝗶 𝘁𝗶𝗲̂́𝗽 𝗱𝗶𝗲̂̃𝗻 (Present Continuous)
• Cấu trúc:
(+) S + am/is/are + V-ing + O
(-) S + am/is/are + not + V-ing + O
(?) Am/Is/Are + S + V-ing + O?
• Cách dùng: Diễn tả hành động đang diễn ra tại thời điểm nói.
• Dấu hiệu: now, at the moment, right now...`,

  3: `➤ 𝗛𝗶𝗲̣̂𝗻 𝘁𝗮̣𝗶 𝗵𝗼𝗮̀𝗻 𝘁𝗵𝗮̀𝗻𝗵 (Present Perfect)
• Cấu trúc:
(+) S + have/has + P2 + O
(-) S + have/has not + P2 + O
(?) Have/Has + S + P2 + O?
• Cách dùng: Diễn tả hành động xảy ra trong quá khứ và kéo dài đến hiện tại.
• Dấu hiệu: already, just, yet, since, for, ever, never...`,

  4: `➤ 𝗛𝗶𝗲̣̂𝗻 𝘁𝗮̣𝗶 𝗵𝗼𝗮̀𝗻 𝘁𝗵𝗮̀𝗻𝗵 𝘁𝗶𝗲̂́𝗽 𝗱𝗶𝗲̂̃𝗻 (Present Perfect Continuous)
• Cấu trúc:
(+) S + have/has been + V-ing + O
(-) S + have/has not been + V-ing + O
(?) Have/Has + S + been + V-ing + O?
• Cách dùng: Nhấn mạnh hành động bắt đầu trong quá khứ và còn tiếp diễn.
• Dấu hiệu: since, for, all day, all week...`,

  5: `➤ 𝗤𝘂𝗮́ 𝗸𝗵𝘂̛́ đ𝗼̛𝗻 (Past Simple)
• Cấu trúc:
(+) S + V2/ed + O
(-) S + did not + V + O
(?) Did + S + V + O?
• Cách dùng: Diễn tả hành động đã xảy ra và kết thúc trong quá khứ.
• Dấu hiệu: yesterday, last week, ago, in 1990...`,

  6: `➤ 𝗤𝘂𝗮́ 𝗸𝗵𝘂̛́ 𝘁𝗶𝗲̂́𝗽 𝗱𝗶𝗲̂̃𝗻 (Past Continuous)
• Cấu trúc:
(+) S + was/were + V-ing + O
(-) S + was/were not + V-ing + O
(?) Was/Were + S + V-ing + O?
• Cách dùng: Diễn tả hành động đang diễn ra tại một thời điểm trong quá khứ.
• Dấu hiệu: while, when, at 5pm yesterday...`,

  7: `➤ 𝗤𝘂𝗮́ 𝗸𝗵𝘂̛́ 𝗵𝗼𝗮̀𝗻 𝘁𝗵𝗮̀𝗻𝗵 (Past Perfect)
• Cấu trúc:
(+) S + had + P2 + O
(-) S + had not + P2 + O
(?) Had + S + P2 + O?
• Cách dùng: Diễn tả hành động xảy ra trước một hành động khác trong quá khứ.
• Dấu hiệu: before, after, by the time...`,

  8: `➤ 𝗤𝘂𝗮́ 𝗸𝗵𝘂̛́ 𝗵𝗼𝗮̀𝗻 𝘁𝗵𝗮̀𝗻𝗵 𝘁𝗶𝗲̂́𝗽 𝗱𝗶𝗲̂̃𝗻 (Past Perfect Continuous)
• Cấu trúc:
(+) S + had been + V-ing + O
(-) S + had not been + V-ing + O
(?) Had + S + been + V-ing + O?
• Cách dùng: Nhấn mạnh hành động kéo dài trước một thời điểm trong quá khứ.
• Dấu hiệu: for, since, how long...`,

  9: `➤ 𝗧𝘂̛𝗼̛𝗻𝗴 𝗹𝗮𝗶 đ𝗼̛𝗻 (Future Simple)
• Cấu trúc:
(+) S + will + V + O
(-) S + will not + V + O
(?) Will + S + V + O?
• Cách dùng: Diễn tả hành động sẽ xảy ra trong tương lai.
• Dấu hiệu: tomorrow, next week, soon...`,

  10: `➤ 𝗧𝘂̛𝗼̛𝗻𝗴 𝗹𝗮𝗶 𝘁𝗶𝗲̂́𝗽 𝗱𝗶𝗲̂̃𝗻 (Future Continuous)
• Cấu trúc:
(+) S + will be + V-ing + O
(-) S + will not be + V-ing + O
(?) Will + S + be + V-ing + O?
• Cách dùng: Diễn tả hành động đang diễn ra tại một thời điểm trong tương lai.
• Dấu hiệu: at this time tomorrow, next week...`,

  11: `➤ 𝗧𝘂̛𝗼̛𝗻𝗴 𝗹𝗮𝗶 𝗵𝗼𝗮̀𝗻 𝘁𝗵𝗮̀𝗻𝗵 (Future Perfect)
• Cấu trúc:
(+) S + will have + P2 + O
(-) S + will not have + P2 + O
(?) Will + S + have + P2 + O?
• Cách dùng: Diễn tả hành động sẽ hoàn thành trước một thời điểm trong tương lai.
• Dấu hiệu: by the time, before...`,

  12: `➤ 𝗧𝘂̛𝗼̛𝗻𝗴 𝗹𝗮𝗶 𝗵𝗼𝗮̀𝗻 𝘁𝗵𝗮̀𝗻𝗵 𝘁𝗶𝗲̂́𝗽 𝗱𝗶𝗲̂̃𝗻 (Future Perfect Continuous)
• Cấu trúc:
(+) S + will have been + V-ing + O
(-) S + will not have been + V-ing + O
(?) Will + S + have been + V-ing + O?
• Cách dùng: Nhấn mạnh khoảng thời gian của hành động đến một thời điểm trong tương lai.
• Dấu hiệu: for, since, by the time...`
};

module.exports.run = async function ({ api, event }) {
  const msg = "📚 𝟏𝟐 𝐓𝐡𝐢̀ 𝐓𝐫𝐨𝐧𝐠 𝐓𝐢𝐞̂́𝐧𝐠 𝐀𝐧𝐡 📚\n\n" +
                "𝟏. 𝐓𝐡𝐞 𝐏𝐫𝐞𝐬𝐞𝐧𝐭 𝐒𝐢𝐦𝐩𝐥𝐞 (𝐓𝐡𝐢̀ 𝐇𝐢𝐞̣̂𝐧 𝐓𝐚̣𝐢 Đ𝐨̛𝐧) 📓\n" +
                "𝟐. 𝐓𝐡𝐞 𝐏𝐫𝐞𝐬𝐞𝐧𝐭 𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐨𝐮𝐬(𝐓𝐡𝐢̀ 𝐇𝐢𝐞̣̂𝐧 𝐓𝐚̣𝐢 𝐓𝐢𝐞̂́𝐩 𝐃𝐢𝐞̂̃𝐧) 📔\n" +
                "𝟑. 𝐓𝐡𝐞 𝐏𝐫𝐞𝐬𝐞𝐧𝐭 𝐏𝐞𝐫𝐟𝐞𝐜𝐭 (𝐓𝐡𝐢̀ 𝐇𝐢𝐞̣̂𝐧 𝐓𝐚̣𝐢 𝐇𝐨𝐚̀𝐧 𝐓𝐡𝐚̀𝐧𝐡) 📒\n" +
                "𝟒. 𝐓𝐡𝐞 𝐏𝐫𝐞𝐬𝐞𝐧𝐭 𝐏𝐞𝐫𝐟𝐞𝐜𝐭 𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐨𝐮𝐬 (𝐓𝐡𝐢̀ 𝐇𝐢𝐞̣̂𝐧 𝐓𝐚̣𝐢 𝐇𝐨𝐚̀𝐧 𝐓𝐡𝐚̀𝐧𝐡 𝐓𝐢𝐞̂́𝐩 𝐃𝐢𝐞̂̃𝐧) 📕\n" +
                "𝟓. 𝐓𝐡𝐞 𝐒𝐢𝐦𝐩𝐥𝐞 𝐏𝐚𝐬𝐭 (𝐓𝐡𝐢̀ 𝐐𝐮𝐚́ 𝐊𝐡𝐮̛́ Đ𝐨̛𝐧) 📗\n" +
                "𝟔. 𝐓𝐡𝐞 𝐏𝐚𝐬𝐭 𝐂𝐨𝐧𝐭𝐢𝐧𝐨𝐮𝐬 (𝐓𝐡𝐢̀  𝐐𝐮𝐚́ 𝐊𝐡𝐮̛́ 𝐓𝐢𝐞̂́𝐩 𝐃𝐢𝐞̂̃𝐧) 📘\n" +
                "𝟕. 𝐓𝐡𝐞 𝐏𝐚𝐬𝐭 𝐏𝐞𝐫𝐟𝐞𝐜𝐭 (𝐓𝐡𝐢̀ 𝐐𝐮𝐚́ 𝐊𝐡𝐮̛́ 𝐇𝐨𝐚̀𝐧 𝐓𝐡𝐚̀𝐧𝐡) 📙\n" +
                "𝟖. 𝐓𝐡𝐞 𝐏𝐚𝐬𝐭 𝐏𝐞𝐫𝐟𝐞𝐜𝐭 𝐂𝐨𝐧𝐭𝐢𝐧𝐨𝐮𝐬 (𝐓𝐡𝐢̀ 𝐐𝐮𝐚́ 𝐊𝐡𝐮̛́ 𝐇𝐨𝐚̀𝐧 𝐓𝐡𝐚̀𝐧𝐡 𝐓𝐢𝐞̂́𝐩 𝐃𝐢𝐞̂̃𝐧) 📚\n" +
                "𝟗. 𝐓𝐡𝐞 𝐒𝐢𝐦𝐩𝐥𝐞 𝐅𝐮𝐭𝐮𝐫𝐞 – (𝐓𝐡𝐢̀ 𝐓𝐮̛𝐨̛𝐧𝐠 𝐋𝐚𝐢 Đ𝐨̛𝐧) 📖\n" +
                "𝟏𝟎. 𝐓𝐡𝐞 𝐅𝐮𝐭𝐮𝐫𝐞 𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐨𝐮𝐬 (𝐓𝐡𝐢̀ 𝐓𝐮̛𝐨̛𝐧𝐠 𝐋𝐚𝐢 𝐓𝐢𝐞̂́𝐩 𝐃𝐢𝐞̂̃𝐧) 📝\n" +
                "𝟏𝟏. 𝐓𝐡𝐞 𝐅𝐮𝐭𝐮𝐫𝐞 𝐏𝐞𝐫𝐟𝐞𝐜𝐭 ( 𝐓𝐡𝐢̀ 𝐓𝐮̛𝐨̛𝐧𝐠 𝐋𝐚𝐢 𝐇𝐨𝐚̀𝐧 𝐓𝐡𝐚̀𝐧𝐡) 📰\n" +
                "𝟏𝟐. 𝐓𝐡𝐞 𝐅𝐮𝐭𝐮𝐫𝐞 𝐏𝐞𝐫𝐟𝐞𝐜𝐭 𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐨𝐮𝐬 (𝐓𝐡𝐢̀ 𝐓𝐮̛𝐨̛𝐧𝐠 𝐋𝐚𝐢 𝐇𝐨𝐚̀𝐧 𝐓𝐡𝐚̀𝐧𝐡 𝐓𝐢𝐞̂́𝐩 𝐃𝐢𝐞̂̃𝐧) 🗞\n\n" + 
                "📌 𝐑𝐞𝐩𝐥𝐲 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 𝐭𝐡𝐞𝐨 𝐬𝐨̂́ 𝐧𝐞̂́𝐮 𝐦𝐮𝐨̂́𝐧 𝐱𝐞𝐦 𝐭𝐡𝐞̂𝐦 𝐯𝐞̂̀ 𝐭𝐮̛̀𝐧𝐠 𝐭𝐡𝐢̀ 𝐧𝐡𝐚";

  return api.sendMessage(msg, event.threadID, (err, info) => {
    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: event.senderID,
      type: "choosee"
    });
  });
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  if (handleReply.type === "choosee" && event.senderID === handleReply.author) {
    const index = parseInt(event.body);
    if (!explanations[index]) {
      return api.sendMessage("💟 𝐕𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐧𝐡𝐚̣̂𝐩 𝟏 𝐜𝐨𝐧 𝐬𝐨̂́ 𝐧𝐚̆̀𝐦 𝐭𝐫𝐨𝐧𝐠 𝐝𝐚𝐧𝐡 𝐬𝐚́𝐜𝐡.", event.threadID);
    }
    api.unsendMessage(handleReply.messageID);
     return api.sendMessage(explanations[index], event.threadID);
  }
};