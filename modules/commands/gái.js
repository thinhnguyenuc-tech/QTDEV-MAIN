module.exports.config = {
  name: "gái",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Vtuan",
  description: "Xem ảnh gái",
  commandCategory: "Ảnh",
  usages: "",
  usePrefix: true,
  cooldowns: 2
};

module.exports.run = async ({ api, event ,Users}) => {
  const axios = require('axios');
  const request = require('request');
  const fs = require("fs");
  const girl = require('./../../includes/datajson/gaivip.json');
  var image1 = girl[Math.floor(Math.random() * girl.length)].trim();
  var image2 = girl[Math.floor(Math.random() * girl.length)].trim();
  var image3 = girl[Math.floor(Math.random() * girl.length)].trim();
  var image4 = girl[Math.floor(Math.random() * girl.length)].trim();
  function downloadAndSendImage(image,fileName,callback){
    request(image).pipe(fs.createWriteStream(__dirname + `/`+fileName)).on("close", callback);
  }
  let callback = function () {
    return api.sendMessage({
      body: 'Gái Đó Ngắm Đi=))',
      attachment: [
       fs.createReadStream(__dirname + `/cache/9.png`), 
       fs.createReadStream(__dirname + `/cache/10.png`), 
       fs.createReadStream(__dirname + `/cache/11.png`), 
       fs.createReadStream(__dirname + `/cache/12.png`)
      ]
    }, event.threadID, () => {
      fs.unlinkSync(__dirname + `/cache/9.png`);
      fs.unlinkSync(__dirname + `/cache/10.png`);
      fs.unlinkSync(__dirname + `/cache/11.png`);
      fs.unlinkSync(__dirname + `/cache/12.png`);
    }, event.messageID);
  };
  downloadAndSendImage(image1,'cache/9.png',()=>{
    downloadAndSendImage(image2,'cache/10.png',()=>{
      downloadAndSendImage(image3,'cache/11.png',()=>{
        downloadAndSendImage(image4,'cache/12.png',callback)
      })
    })
  }) 
}