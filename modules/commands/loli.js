module.exports.config = {
  name: "loli",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Vtuan",
  description: "Xem ảnh",
  commandCategory: "Ảnh",
  usages: "",
  cooldowns: 2
};

module.exports.run = async ({ api, event ,Users}) => {
  const axios = require('axios');
  const request = require('request');
  const fs = require("fs");
  const girl = require('./../../includes/datajson/loli.json');
  var image1 = girl[Math.floor(Math.random() * girl.length)].trim();
  var image2 = girl[Math.floor(Math.random() * girl.length)].trim();
  var image3 = girl[Math.floor(Math.random() * girl.length)].trim();
  var image4 = girl[Math.floor(Math.random() * girl.length)].trim();
  function downloadAndSendImage(image,fileName,callback){
    request(image).pipe(fs.createWriteStream(__dirname + `/`+fileName)).on("close", callback);
  }
  let callback = function () {
    return api.sendMessage({
      body: 'Bé loli: 300tr/1 đứa',
      attachment: [
       fs.createReadStream(__dirname + `/cache/5.png`), 
       fs.createReadStream(__dirname + `/cache/6.png`), 
       fs.createReadStream(__dirname + `/cache/7.png`), 
       fs.createReadStream(__dirname + `/cache/8.png`)
      ]
    }, event.threadID, () => {
      fs.unlinkSync(__dirname + `/cache/5.png`);
      fs.unlinkSync(__dirname + `/cache/6.png`);
      fs.unlinkSync(__dirname + `/cache/7.png`);
      fs.unlinkSync(__dirname + `/cache/8.png`);
    }, event.messageID);
  };
  downloadAndSendImage(image1,'cache/5.png',()=>{
    downloadAndSendImage(image2,'cache/6.png',()=>{
      downloadAndSendImage(image3,'cache/7.png',()=>{
        downloadAndSendImage(image4,'cache/8.png',callback)
      })
    })
  }) 
}