module.exports.config = {
  name: "banbe",
  version: "1.0.0",
  hasPermssion: 3,
  credits: "ManhG",
  description: "Xem thông tin bạn bè/Xoá bạn bè bằng cách reply",
  commandCategory: "Admin",
  usages: "",
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, args, Users, handleReply, event, Threads }) {
  const { threadID, messageID } = event;
  if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;

  switch (handleReply.type) {
    case "reply":
      {
        var msg ="" , name, urlUser, uidUser;
        var arrnum = event.body.split(" ");
        var nums = arrnum.map(n => parseInt(n));
        for (let num of nums) {
          name = handleReply.nameUser[num - 1];
          urlUser = handleReply.urlUser[num - 1];
          uidUser = handleReply.uidUser[num - 1];

          api.unfriend(uidUser);
          msg += '- ' + name + '\n🌐ProfileUrl: ' + urlUser + "\n";
          //console.log(msg);
        }

        api.sendMessage(`💢Thực thi xoá bạn bè💢\n\n${msg}`, threadID, () =>
          api.unsendMessage(handleReply.messageID));
      }
      break;
  }
};


module.exports.run = async function ({ event, api, args }) {
  const { threadID, messageID, senderID } = event;
  //var unfriend =  await api.unfriend();
  try {
    var listFriend = [];
    var dataFriend = await api.getFriendsList();
    var countFr = dataFriend.length;

    for (var friends of dataFriend) {
      listFriend.push({
        name: friends.fullName || "Chưa đặt tên",
        uid: friends.userID,
        gender: friends.gender,
        vanity: friends.vanity,
        profileUrl: friends.profileUrl
      });
    }
    var nameUser = [], urlUser = [], uidUser = [];
    var page = 1;
    page = parseInt(args[0]) || 1;
    page < -1 ? page = 1 : "";
    var limit = 10;
    var msg = `🎭𝗗𝗦 𝗚𝗢̂̀𝗠 ${countFr} 𝗕𝗔̣𝗡 𝗕𝗘̀🎭\n\n`;
    var numPage = Math.ceil(listFriend.length / limit);

    for (var i = limit * (page - 1); i < limit * (page - 1) + limit; i++) {
      if (i >= listFriend.length) break;
      let infoFriend = listFriend[i];
      msg += `${i + 1}. ${infoFriend.name}\n→ 𝗜𝗗: ${infoFriend.uid}\n→ 𝗚𝗲𝗻𝗱𝗲𝗿: ${infoFriend.gender}\n→ 𝗩𝗮𝗻𝗶𝘁𝘆: ${infoFriend.vanity}\n→ 𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗨𝗿𝗹: ${infoFriend.profileUrl}\n\n`;
      nameUser.push(infoFriend.name);
      urlUser.push(infoFriend.profileUrl);
      uidUser.push(infoFriend.uid);
    }
    msg += `✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏\n→ 𝗧𝗿𝗮𝗻𝗴 ${page}/${numPage} <--\n𝗗𝘂̀𝗻𝗴 ?𝗯𝗮𝗻𝗯𝗲 + 𝘀𝗼̂́ 𝘁𝗿𝗮𝗻𝗴/𝗮𝗹𝗹\n\n`;

    return api.sendMessage(msg + '→ 𝗥𝗲𝗽𝗹𝘆 𝘀𝗼̂́ 𝘁𝗵𝘂̛́ 𝘁𝘂̛̣(𝘁𝘂̛̀ 𝟭->𝟭𝟬), 𝗰𝗼́ 𝘁𝗵𝗲̂̉ 𝗿𝗲𝗽 𝗻𝗵𝗶𝗲̂̀𝘂 𝘀𝗼̂́, 𝗰𝗮́𝗰𝗵 𝗻𝗵𝗮𝘂 𝗯𝗮̆̀𝗻𝗴 𝗱𝗮̂́𝘂 𝗰𝗮́𝗰𝗵 đ𝗲̂̉ 𝘅𝗼𝗮́ 𝗯𝗮̣𝗻 𝗯𝗲̀ đ𝗼́ 𝗸𝗵𝗼̉𝗶 𝗱𝗮𝗻𝗵 𝘀𝗮́𝗰𝗵!', event.threadID, (e, data) =>
      global.client.handleReply.push({
        name: this.config.name,
        author: event.senderID,
        messageID: data.messageID,
        nameUser,
        urlUser,
        uidUser,
        type: 'reply'
      })
    )
  }
  catch (e) {
    return console.log(e)
  }
      }