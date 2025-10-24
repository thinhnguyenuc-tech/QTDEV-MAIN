module.exports.config = {
    name: "prefix",	
    version: "4.0.0", 
    hasPermssion: 0,
    credits: "qt",
    description: "prefix", 
    commandCategory: "Box Chat",
    usages: "",
    cooldowns: 0
  };
  
module.exports.handleEvent = async function ({ api, event, Threads }) {
    const request = require('request');
    const fs = require("fs");
    var { threadID, messageID, body } = event,{ PREFIX } = global.config;
    let threadSetting = global.data.threadData.get(threadID) || {};
    let prefix = threadSetting.PREFIX || PREFIX;
    const timeStart = Date.now();
    if (body == "Prefix" || (body == "prefix")) {
            api.sendMessage(`ㅤㅤㅤ『 ${global.config.BOTNAME} 』ㅤㅤㅤ\n❥❥ Prefix của nhóm:  ${prefix}\n❥❥ Prefix của hệ thống:  ${global.config.PREFIX}`,event.threadID,event.messageID);
   }
  }
module.exports.run = async ({ api, event, args, Threads }) => {}
  
  
  