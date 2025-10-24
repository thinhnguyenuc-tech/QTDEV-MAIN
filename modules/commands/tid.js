module.exports.config = {
	name: "tid",	
  version: "1.0.0", 
	hasPermssion: 0,
	credits: "NTKhang",
	description: "Lấy id box", 
	commandCategory: "Box Chat",
	usages: "tid",
	cooldowns: 5, 
  usePrefix: false,
	dependencies: '',
};

module.exports.run = async function({ api, event }) {
  api.sendMessage(event.threadID, event.threadID);
};