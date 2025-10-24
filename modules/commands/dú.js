module.exports.config = {
 name: "dú",
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
 const girl = require('../../includes/datajson/du.json');
 var image1 = girl[Math.floor(Math.random() * girl.length)].trim();
 var image2 = girl[Math.floor(Math.random() * girl.length)].trim();
 var image3 = girl[Math.floor(Math.random() * girl.length)].trim();
 var image4 = girl[Math.floor(Math.random() * girl.length)].trim();
 function downloadAndSendImage(image,fileName,callback){
 request(image).pipe(fs.createWriteStream(__dirname + `/`+fileName)).on("close", callback);
 }
 let callback = function () {
 return api.sendMessage({
 body: 'Xem xong thả "😾" vào tin nhắn bot để gỡ dùm admin!',
 attachment: [
 fs.createReadStream(__dirname + `/cache/1.png`), 
 fs.createReadStream(__dirname + `/cache/2.png`), 
 fs.createReadStream(__dirname + `/cache/3.png`), 
 fs.createReadStream(__dirname + `/cache/4.png`)
 ]
 }, event.threadID, () => {
 fs.unlinkSync(__dirname + `/cache/1.png`);
 fs.unlinkSync(__dirname + `/cache/2.png`);
 fs.unlinkSync(__dirname + `/cache/3.png`);
 fs.unlinkSync(__dirname + `/cache/4.png`);
 }, event.messageID);
 };
 downloadAndSendImage(image1,'cache/1.png',()=>{
 downloadAndSendImage(image2,'cache/2.png',()=>{
 downloadAndSendImage(image3,'cache/3.png',()=>{
 downloadAndSendImage(image4,'cache/4.png',callback)
 })
 })
 }) 
}