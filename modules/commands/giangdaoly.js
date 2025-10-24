  module.exports.config = {
      name: "giangdaoly",
      version: "1.0.0",
      hasPermssion: 1,
      credits: "HungCTer",
      description: "Giảng đạo lý cho mấy thằng ăn xin",
      commandCategory: "War",
      usages: "giangdaoly @mention",
      cooldowns: 90,
      dependencies: {
          "fs-extra": "",
          "axios": ""
      }
  }
  
  module.exports.run = async function({ api, args, Users, event}) {
      var mention = Object.keys(event.mentions)[0];
      if(!mention) return api.sendMessage("Cần phải tag 1 người bạn muốn giảng đạo lý", event.threadID);
      let name =  event.mentions[mention];
      var arraytag = [];
          arraytag.push({id: mention, tag: name});
      var a = function (a) { api.sendMessage(a, event.threadID); }
  a("Còn em thì em chỉ muốn nói với anh như này thôi");
  setTimeout(() => {a({body: "Ra xã hội làm ăn bươn chải" + " " + name, mentions: arraytag})}, 4000);
  setTimeout(() => {a({body: "Liều thì ăn nhiều, không liều thì ăn ít" + " " + name, mentions: arraytag})}, 6000);
  setTimeout(() => {a({body: "Muốn thành công thì phải chấp nhận trải qua đắng cay ngọt bùi" + " " + name, mentions: arraytag})}, 8000);
  setTimeout(() => {a({body: "Làm ăn muốn kiếm được tiền" + " " + name, mentions: arraytag})}, 11000);
  setTimeout(() => {a({body: "Phải chấp nhận mạo hiểm nguy hiểm 1 tí nhưng trong tầm kiểm soát" + " " + name, mentions: arraytag})}, 13000);
  setTimeout(() => {a({body: "Anh hiểu chưa" + " " + name, mentions: arraytag})}, 17000);
  setTimeout(() => {a({body: "Sau này..." + " " + name, mentions: arraytag})}, 18000);
  setTimeout(() => {a({body: "Chỉ có làm, chịu khó, cần cù thì bù siêng năng" + " " + name, mentions: arraytag})}, 19000);
  setTimeout(() => {a({body: "Chỉ có làm thì mới có ăn" + " " + name, mentions: arraytag})}, 22000);
  setTimeout(() => {a({body: "Những cái loại" + " " + name, mentions: arraytag})}, 24000);
  setTimeout(() => {a({body: "Không làm mà đòi có ăn" + " " + name, mentions: arraytag})}, 25000);
  setTimeout(() => {a({body: "Thì ăn đầu buồi" + " " + name, mentions: arraytag})}, 27000);
  setTimeout(() => {a({body: "Nhá" + " " + name, mentions: arraytag})}, 28000);
  setTimeout(() => {a({body: "Ăn cứt" + " " + name, mentions: arraytag})}, 29000);
  setTimeout(() => {a({body: "Thế cho nó dễ" + " " + name, mentions: arraytag})}, 31000);
  setTimeout(() => {a({body: "Xã hội này không làm chỉ có ăn cứt thôi" + " " + name, mentions: arraytag})}, 34000);
  setTimeout(() => {a({body: "Nói thế cho nó nhanh cho nó dễ hiểu" + " " + name, mentions: arraytag})}, 36000);
   }