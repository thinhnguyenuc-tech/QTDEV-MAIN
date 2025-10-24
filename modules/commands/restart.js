module.exports.config = {
	name: "rs",
	version: "1.0.0",
	hasPermssion: 3,
	credits: "manhIT",
	description: "Khởi động lại Bot",
	commandCategory: "Admin",
	usages: "",
	cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
	const { threadID, messageID } = event;
	return api.sendMessage(`🔄 𝐊𝐡𝐨̛̉𝐢 đ𝐨̣̂𝐧𝐠 𝐥𝐚̣𝐢...`, 
		threadID, () => process.exit(1))
}