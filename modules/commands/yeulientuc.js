module.exports.config = {
  name: "yeulientuc",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "VanHung, NTKhang + GPT-Fix",
  description: "Tag liên tục người bạn tag 15 lần - gọi hồn cute ♥️",
  commandCategory: "War",
  usages: "yeulientuc @tag",
  cooldowns: 5,
  dependencies: { "fs-extra": "", "axios": "" }
};

module.exports.run = async function ({ api, event }) {
  const mention = Object.keys(event.mentions)[0];
  if (!mention) return api.sendMessage("💌 Cần phải tag một người bạn yêu!", event.threadID, event.messageID);

  const name = event.mentions[mention];
  const arraytag = [{ id: mention, tag: name }];
  const say = (msg, delay = 0) => setTimeout(() => api.sendMessage(msg, event.threadID), delay);

  say(`💖 Tớ bắt đầu thấy yêu ${name} rồi đấy`);
  say({ body: `yêu cậu♥️ ${name}`, mentions: arraytag }, 3000);
  say({ body: `yêu cậu lắm♥️ ${name}`, mentions: arraytag }, 4000);
  say({ body: `yêu cậu cực nhiều♥️♥️ ${name}`, mentions: arraytag }, 5000);
  say({ body: `yêu cậu lắm luôn ý♥️♥️ ${name}`, mentions: arraytag }, 6000);
  say({ body: `tớ yêu cậu♥️ ${name}`, mentions: arraytag }, 6500);
  say({ body: `yêu cục cưng♥️♥️ ${name}`, mentions: arraytag }, 7000);
  say({ body: `tớ yêu cậu hơn chính bản thân tớ♥️ ${name}`, mentions: arraytag }, 8000);
  say({ body: `yêu bae♥️ ${name}`, mentions: arraytag }, 8500);
  say({ body: `yêu cực nợ♥️ ${name}`, mentions: arraytag }, 9000);
  say({ body: `yêu bae cute nhất♥️ ${name}`, mentions: arraytag }, 9500);
  say({ body: `bae ơi yêu bae nhiều lắm♥️♥️ ${name}`, mentions: arraytag }, 10000);
  say({ body: `yêu bé♥️ ${name}`, mentions: arraytag }, 15000);
  say({ body: `yêu bé lắm♥️ ${name}`, mentions: arraytag }, 20000);
  say({ body: `bé ơi yêu yêu nà♥️ ${name}`, mentions: arraytag }, 25000);
  say({ body: `yêu bae lắm♥️ ${name}`, mentions: arraytag }, 30000);
};
