module.exports.config = {
  name: "locbox",
  version: "1.0.0",
  hasPermssion: 3,
  credits: "chinhle",
  description: "Rời khỏi nhóm dưới 20",
  commandCategory: "Admin",
  usages: "Rời khỏi nhóm dưới 20",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
  const permission = ["100054416075122"];
  if (!permission.includes(event.senderID)) return api.sendMessage("ngu quá em ?", event.threadID, event.messageID);
  var inbox = await api.getThreadList(100, null, ['INBOX']);
  let list = [...inbox].filter(group => group.isSubscribed && group.isGroup);
  var msg = [];
  var lengthID = [];
  var members = args[0] || 20
    for (var groupInfo of list) {
      if(groupInfo.threadID != event.threadID) {
        if ( groupInfo.participants.length < members) {
            lengthID.push(groupInfo.name)
            api.removeUserFromGroup(api.getCurrentUserID(), groupInfo.threadID) 
        }
      }
    }
  msg = '=== 『 𝗟𝗼̣𝗰 𝗕𝗼𝘅 』 ====\n━━━━━━━━━━━━━━━━━━\n\n→ đ𝗮̃ 𝗟𝗼̣𝗰 𝘁𝗵𝗮̀𝗻𝗵 𝗰𝗼̂𝗻𝗴 ' + lengthID.length + ' 𝗻𝗵𝗼́𝗺 𝗱𝘂̛𝗼̛́𝗶 ' + members + ' 𝘁𝗵𝗮̀𝗻𝗵 𝘃𝗶𝗲̂𝗻';
  return api.sendMessage(msg, event.threadID, event.messageID)
}
