const fs = require("fs");
const request = require("request");
module.exports.config = {
	name: "boxinfo",
	version: "1.0.0", 
	hasPermssion: 0,
	credits: "qt",
	description: "Xem thông tin box của bạn",
	commandCategory: "QTV", 
	usages: "boxinfo", 
	cooldowns: 0,
	dependencies: [] 
};

module.exports.run = async function({ api, event, args }) {
	let threadInfo = await api.getThreadInfo(event.threadID);
	var memLength = threadInfo.participantIDs.length;
	let threadMem = threadInfo.participantIDs.length;
	var nameMen = [];
    var gendernam = [];
    var gendernu = [];
    var nope = [];
     for (let z in threadInfo.userInfo) {
     	var gioitinhone = threadInfo.userInfo[z].gender;
     	var nName = threadInfo.userInfo[z].name;
        if(gioitinhone == "MALE"){gendernam.push(z+gioitinhone)}
        else if(gioitinhone == "FEMALE"){gendernu.push(gioitinhone)}
            else{nope.push(nName)}
    };
	var nam = gendernam.length;
    var nu = gendernu.length;
	let qtv = threadInfo.adminIDs.length;
	let sl = threadInfo.messageCount;
	let u = threadInfo.nicknames;
	let icon = threadInfo.emoji;
	let threadName = threadInfo.threadName;
	let id = threadInfo.threadID;
	let sex = threadInfo.approvalMode;
	let themeID = null;
	if (threadInfo.threadTheme) {
	  if (typeof threadInfo.threadTheme === "object" && threadInfo.threadTheme.id) themeID = String(threadInfo.threadTheme.id);
	  else if (typeof threadInfo.threadTheme === "string") themeID = threadInfo.threadTheme;
	}
	themeID = themeID || (threadInfo.theme_fbid && String(threadInfo.theme_fbid)) || (threadInfo.thread_theme && String(threadInfo.thread_theme)) || (threadInfo.theme && String(threadInfo.theme)) || (threadInfo.themeID && String(threadInfo.themeID)) || null;
	const themeList = [
	  { id: "1508524016651271", name: "Quả bơ" },
	  { id: "741311439775765", name: "Tình yêu" },
	  { id: "275041734441112", name: "Yêu thương" },
	  { id: "2154203151727239", name: "Trái tim" },
	  { id: "680612308133315", name: "Rung cảm mùa hè" },
	  { id: "1299135724598332", name: "Cà phê" },
	  { id: "378568718330878", name: "Khúc côn cầu" },
	  { id: "3527450920895688", name: "Karol G" },
	  { id: "6026716157422736", name: "Bóng rổ" },
	  { id: "1485402365695859", name: "Sổ tay" },
	  { id: "1667467154651262", name: "J-Hope" },
	  { id: "3162266030605536", name: "Benson Boone" },
	  { id: "845097890371902", name: "Bóng chày" },
	  { id: "1546877592664773", name: "The White Lotus" },
	  { id: "1602001344083693", name: "Giấy kẻ ô vuông" },
	  { id: "3082966625307060", name: "Chiêm tinh học" },
	  { id: "339021464972092", name: "Nhạc" },
	  { id: "638495565535814", name: "Tate McRae" },
	  { id: "1034356938326914", name: "Addison Rae" },
	  { id: "2897414437091589", name: "Chó Murphy" },
	  { id: "3650637715209675", name: "Bạn thân" },
	  { id: "1079303610711048", name: "Bạn đi lễ hội" },
	  { id: "1137551661432540", name: "LISA" },
	  { id: "1198771871464572", name: "Lilo & Stitch" },
	  { id: "539927563794799", name: "Đồng quê" },
	  { id: "194982117007866", name: "Bóng bầu dục" },
	  { id: "1040328944732151", name: "Chó" },
	  { id: "611878928211423", name: "Thả thính" },
	  { id: "617395081231242", name: "Hà mã Moo Deng" },
	  { id: "625675453790797", name: "Valentino Garavani Cherryfic" },
	  { id: "765710439035509", name: "Nghệ thuật truyền cảm hứng" },
	  { id: "1027214145581698", name: "Khóa 2025" },
	  { id: "1144968664009431", name: "Nhớ mong" },
	  { id: "969895748384406", name: "Không thể vội vàng vĩ đại" },
	  { id: "527564631955494", name: "Đại dương" },
	  { id: "1335872111020614", name: "The Last of Us" },
	  { id: "1743641112805218", name: "Bóng đá" },
	  { id: "638124282400208", name: "Phim Minecraft" },
	  { id: "968524435055801", name: "Tự hào" },
	  { id: "1120591312525822", name: "Năm Ất Tỵ" },
	  { id: "418793291211015", name: "Mèo" },
	  { id: "1060619084701625", name: "Lo-fi" },
	  { id: "1171627090816846", name: "Bơi lội" },
	  { id: "230032715012014", name: "Loang màu" },
	  { id: "195296273246380", name: "Trà sữa trân châu" },
	  { id: "375805881509551", name: "Pickleball" },
	  { id: "788274591712841", name: "Đơn sắc" },
	  { id: "1633544640877832", name: "Tán lá" },
	  { id: "1135895321099254", name: "Mắt trố" },
	  { id: "704702021720552", name: "Pizza" },
	  { id: "955795536185183", name: "Tiệc ăn vặt" },
	  { id: "1019162843417894", name: "Hồng may mắn" },
	  { id: "810978360551741", name: "Làm cha mẹ" },
	  { id: "1207811064102494", name: "Selena Gomez & Benny Blanco" },
	  { id: "3190514984517598", name: "Bầu trời" },
	  { id: "292955489929680", name: "Kẹo mút" },
	  { id: "976389323536938", name: "Lặp lại" },
	  { id: "627144732056021", name: "Chúc mừng" },
	  { id: "909695489504566", name: "Sushi" },
	  { id: "582065306070020", name: "Tên lửa" },
	  { id: "280333826736184", name: "Kẹo mút mặc định" },
	  { id: "271607034185782", name: "Bóng râm" },
	  { id: "1257453361255152", name: "Hoa hồng" },
	  { id: "571193503540759", name: "Tím oải hương" },
	  { id: "2873642949430623", name: "Hoa tulip" },
	  { id: "3273938616164733", name: "Cổ điển" },
	  { id: "403422283881973", name: "Táo" },
	  { id: "672058580051520", name: "Mật ong" },
	  { id: "3151463484918004", name: "Kiwi" },
	  { id: "736591620215564", name: "Đại dương" },
	  { id: "193497045377796", name: "Tím nho" },
	  { id: "3259963564026002", name: "Mặc định" },
	  { id: "724096885023603", name: "Quả mọng" },
	  { id: "624266884847972", name: "Kẹo ngọt" },
	  { id: "273728810607574", name: "Kỳ lân" },
	  { id: "2533652183614000", name: "Lá phong" }
	];
	let themeName = "Không xác định";
	if (themeID) {
	  const found = themeList.find(t => t.id === themeID);
	  if (found) themeName = found.name;
	}
			var pd = sex == false ? 'tắt' : sex == true ? 'bật' : 'null';
			let adminNames = [];
			if (Array.isArray(threadInfo.adminIDs) && Array.isArray(threadInfo.userInfo)) {
			  for (const admin of threadInfo.adminIDs) {
				const user = threadInfo.userInfo.find(u => u.id == admin.id);
				if (user) adminNames.push(user.name);
			  }
			}
			let adminNamesStr = adminNames.length ? adminNames.join("\n🔹 ") : "Không xác định";

			let thuebot = "Không xác định";
			try {
			  const path = require("path");
			  const thuebotPath = path.join(__dirname, "data", "thuebot.json");
			  if (fs.existsSync(thuebotPath)) {
				const pathData = JSON.parse(fs.readFileSync(thuebotPath));
				const matchingEntry = pathData.find(entry => entry.t_id == event.threadID);
				if (matchingEntry) {
				  const moment = require("moment");
				  const currentDate = moment();
				  const hethan = moment(matchingEntry.time_end, 'DD/MM/YYYY');
				  const daysRemaining = hethan.diff(currentDate, 'days');
				  thuebot = daysRemaining <= 0
					? "Đã hết thời hạn thuê ⚠️"
					: `Bot còn hạn đến ${hethan.format('DD/MM/YYYY')} (còn ${daysRemaining} ngày)`;
				} else {
				  thuebot = "Nhóm chưa thuê bot ❎";
				}
			  }
			} catch (e) { thuebot = "Không xác định"; }

			function TX(rank) {
			  if (!rank) return '';
			  if (rank >= 1 && rank <= 10) return `💬 Nhóm hiện tại Top ${rank} server`;
			  return `💬 Nhóm hiện tại Hạng ${rank} server`;
			}
			function CC(n) {
			  return n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
			}
			let userRank = null, isInTop10 = false;
			try {
			  if (typeof api.getThreadList === 'function') {
				const data = await api.getThreadList(100, null, ["INBOX"]);
				const topGroups = data
				  .filter(thread => thread.isGroup && typeof thread.messageCount === 'number')
				  .map(thread => ({
					threadName: thread.name || "Không tên",
					threadID: thread.threadID,
					messageCount: thread.messageCount || 0,
				  })).sort((a, b) => b.messageCount - a.messageCount);
				const seenThreadIDs = new Set();
				const uniqueTopGroups = [];
				topGroups.forEach(group => {
				  if (!seenThreadIDs.has(group.threadID)) {
					seenThreadIDs.add(group.threadID);
					uniqueTopGroups.push(group);
				  }
				});
				userRank = uniqueTopGroups.findIndex(group => group.threadID === threadInfo.threadID) + 1;
				isInTop10 = userRank > 0 && userRank <= 10;
			  }
			} catch (e) {}
			var callback = (info) =>
				api.sendMessage(
					{
						body: `⭐️Tên: ${threadName}\n👨‍💻 ID Box: ${id}\n👀 Phê duyệt: ${pd}\n🧠 Emoji: ${icon}\n🎨 Chủ đề: ${themeName}\n👉 Thông tin: gồm ${threadMem} thành viên\n🔹 Số tv nam 🧑‍🦰: ${nam} thành viên\n🔹 Số tv nữ 👩‍🦰: ${nu} thành viên\n👑 Với ${qtv} quản trị viên:\n🔹 ${adminNamesStr}\n━━━━━━━━━━━━━━━━━━\n📌 Tình trạng thuê bot: ${thuebot}\n${TX(isInTop10 ? userRank : null)} với ${CC(threadInfo.messageCount)} tin nhắn\n━━━━━━━━━━━━━━━━━━\n🔹 Thả icon "👍" vào tin nhắn bot nếu muốn xem sơ đồ tương tác giữa các nhóm!`,
						attachment: fs.createReadStream(__dirname + '/cache/boxinfo.png')
					},
					event.threadID,
					(err, info) => {
					  if (!err && info) {
					    global.client = global.client || {};
					    global.client.handleReaction = global.client.handleReaction || [];
					    global.client.handleReaction.push({
					      name: module.exports.config.name,
					      messageID: info.messageID,
					      author: event.senderID,
					    });
					  }
					  fs.unlinkSync(__dirname + '/cache/boxinfo.png');
					},
					event.messageID
				);
			return request(encodeURI(`${threadInfo.imageSrc}`))
				.pipe(fs.createWriteStream(__dirname + '/cache/boxinfo.png'))
				.on('close', () => callback());
	    }

module.exports.handleReaction = async ({ event, api, handleReaction }) => {
  try {
    const axios = require("axios");
    const { createReadStream, unlinkSync, writeFileSync } = require("fs-extra");
    const { threadID, messageID, userID } = event;

    if (event.userID != handleReaction.author) return;
    if (event.reaction != "👍") return;

    const data = await api.getThreadInfo(event.threadID);
    const KMath = (data) => data.reduce((a, b) => a + b, 0);
    const inbox = await api.getThreadList(100, null, ['INBOX']);

    let xx = [...inbox].filter(group => group.isSubscribed && group.isGroup);
    let kho = [], search = [], count = [];

    for (let n of xx) {
      let threadInfo = n.name;
      let threadye = n.messageCount;
      kho.push({"name": threadInfo, "exp": (typeof threadye === "undefined") ? 0 : threadye});
    }

    kho.sort((a, b) => b.exp - a.exp);

    for (let i = 0; i < kho.length; i++) {
      if (kho[i]) {
        search.push("'" + kho[i].name + "'");
        count.push(kho[i].exp);
      }
    }

    const path = __dirname + `/cache/chart.png`;
    const full = KMath(count);
    const url = `https://quickchart.io/chart?c={type:'doughnut',data:{labels:[${encodeURIComponent(search)}],datasets:[{label:'${encodeURIComponent('Tương Tác')}',data:[${encodeURIComponent(count)}]}]},options:{plugins:{doughnutlabel:{labels:[{text:'${full}',font:{size:26}},{text:'${encodeURIComponent('Tổng')}'}]}}}}`;
    api.unsendMessage(handleReaction.messageID);

    const { data: stream } = await axios.get(url, { method: 'GET', responseType: 'arraybuffer' });
    writeFileSync(path, Buffer.from(stream, 'utf-8'));

    api.sendMessage({ body: '', attachment: createReadStream(path) }, event.threadID, event.messageID);
  } catch (error) {}
};