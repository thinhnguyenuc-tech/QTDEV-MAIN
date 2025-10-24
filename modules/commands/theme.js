const themeList = [
  { "id": "1508524016651271", "name": "Quả Bơ" },
  { "id": "741311439775765", "name": "Love" },
  { "id": "275041734441112", "name": "Yêu thương" },
  { "id": "2154203151727239", "name": "Heart Drive" },
  { "id": "680612308133315", "name": "Summer Vibes" },
  { "id": "1299135724598332", "name": "Cà phê" },
  { "id": "378568718330878", "name": "Khúc côn cầu" },
  { "id": "3527450920895688", "name": "Karol G" },
  { "id": "6026716157422736", "name": "Bóng rổ" },
  { "id": "1485402365695859", "name": "Sổ tay" },
  { "id": "1667467154651262", "name": "J-Hope" },
  { "id": "3162266030605536", "name": "Benson Boone" },
  { "id": "845097890371902", "name": "Bóng chày" },
  { "id": "1546877592664773", "name": "The White Lotus" },
  { "id": "1602001344083693", "name": "Giấy kẻ ô vuông" },
  { "id": "3082966625307060", "name": "Chiêm tinh học" },
  { "id": "339021464972092", "name": "Nhạc" },
  { "id": "638495565535814", "name": "Tate McRae" },
  { "id": "1034356938326914", "name": "Addison Rae" },
  { "id": "2897414437091589", "name": "Chú Chó Murphy" },
  { "id": "3650637715209675", "name": "Besties" },
  { "id": "1079303610711048", "name": "Bạn cùng đi lễ hội" },
  { "id": "1137551661432540", "name": "LISA" },
  { "id": "1198771871464572", "name": "Lilo & Stitch" },
  { "id": "539927563794799", "name": "Đồng quê" },
  { "id": "194982117007866", "name": "Bóng bầu dục" },
  { "id": "1040328944732151", "name": "Chó" },
  { "id": "611878928211423", "name": "Thả Thính" },
  { "id": "617395081231242", "name": "Hà mã Moo Deng" },
  { "id": "625675453790797", "name": "Valentino Garavani Cherryfic" },
  { "id": "765710439035509", "name": "Impact Through Art" },
  { "id": "1027214145581698", "name": "Khóa 2025" },
  { "id": "1144968664009431", "name": "Nhớ Mong" },
  { "id": "969895748384406", "name": "Can't Rush Greatness" },
  { "id": "527564631955494", "name": "Đại dương" },
  { "id": "1335872111020614", "name": "The Last of Us" },
  { "id": "1743641112805218", "name": "Bóng đá" },
  { "id": "638124282400208", "name": "Một bộ phim Minecraft" },
  { "id": "968524435055801", "name": "Tự hào" },
  { "id": "1120591312525822", "name": "Năm Ất Tỵ" },
  { "id": "418793291211015", "name": "Mèo" },
  { "id": "1060619084701625", "name": "Lo-fi" },
  { "id": "1171627090816846", "name": "Bơi lội" },
  { "id": "230032715012014", "name": "Loang Màu" },
  { "id": "195296273246380", "name": "Trà sữa trân châu" },
  { "id": "375805881509551", "name": "Pickleball" },
  { "id": "788274591712841", "name": "Đơn sắc" },
  { "id": "1633544640877832", "name": "Tán lá" },
  { "id": "1135895321099254", "name": "Mắt trố" },
  { "id": "704702021720552", "name": "Pizza" },
  { "id": "955795536185183", "name": "Đại tiệc ăn vặt" },
  { "id": "1019162843417894", "name": "Hồng may mắn" },
  { "id": "810978360551741", "name": "Làm cha mẹ" },
  { "id": "1207811064102494", "name": "Selena Gomez và Benny Blanco" },
  { "id": "3190514984517598", "name": "Bầu trời" },
  { "id": "292955489929680", "name": "Kẹo mút" },
  { "id": "976389323536938", "name": "Lặp lại" },
  { "id": "627144732056021", "name": "Chúc mừng" },
  { "id": "909695489504566", "name": "Sushi" },
  { "id": "582065306070020", "name": "Tên lửa" },
  { "id": "280333826736184", "name": "Kẹo mút mặc định" },
  { "id": "271607034185782", "name": "Bóng râm" },
  { "id": "1257453361255152", "name": "Hoa hồng" },
  { "id": "571193503540759", "name": "Tím oải hương" },
  { "id": "2873642949430623", "name": "Hoa tulip" },
  { "id": "3273938616164733", "name": "Cổ điển" },
  { "id": "403422283881973", "name": "Táo" },
  { "id": "672058580051520", "name": "Mật ong" },
  { "id": "3151463484918004", "name": "Kiwi" },
  { "id": "736591620215564", "name": "Đại dương" },
  { "id": "193497045377796", "name": "Tím nho" },
  { "id": "3259963564026002", "name": "Mặc định" },
  { "id": "724096885023603", "name": "Quả mọng" },
  { "id": "624266884847972", "name": "Kẹo ngọt" },
  { "id": "273728810607574", "name": "Kỳ lân" },
  { "id": "2533652183614000", "name": "Màu lá phong" }
];

module.exports.config = {
  name: "theme",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "qt",
  description: "Đổi chủ đề (theme) cuộc trò chuyện",
  commandCategory: "Tiện ích",
  usages: "theme <tên hoặc ID theme>",
  cooldowns: 3,
};

module.exports.run = async function ({ api, event, args }) {
  if (!args[0]) {
    let msg = "Hướng dẫn đổi chủ đề (theme):\n";
    msg += "theme <tên hoặc ID theme>\n";
    msg += "Ví dụ: theme Love, theme 741311439775765\n";
    return api.sendMessage(msg, event.threadID, event.messageID);
  }

  let input = args.join(" ").toLowerCase();
  let theme =
    themeList.find(t => t.name.toLowerCase() === input) ||
    themeList.find(t => t.id === args[0]);
  let themeID = theme ? theme.id : args[0];

  if (!theme) {
    const suggest = themeList.filter(t => t.name.toLowerCase().includes(input));
    let msg = "Không tìm thấy theme phù hợp!";
    if (suggest.length) {
      msg += "\nBạn có muốn chọn một trong các theme sau?\n" +
        suggest.map(t => `- ${t.name} (${t.id})`).join("\n");
    }
    return api.sendMessage(msg, event.threadID, event.messageID);
  }

  function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

  async function checkThemeChanged(threadID, themeID) {
    try {
      await sleep(1200); 
      const info = await api.getThreadInfo(threadID);
      themeID = String(themeID);
      return (
        String(info.threadTheme) === themeID ||
        String(info.theme_fbid) === themeID ||
        (info.threadTheme && String(info.threadTheme.id) === themeID) ||
        String(info.thread_theme) === themeID
      );
    } catch {
      return false;
    }
  }

  try {
    await new Promise((resolve, reject) => {
      api.setTheme(themeID, event.threadID, async (err, info) => {
        if (err) return reject(err);
        let changed = await checkThemeChanged(event.threadID, themeID);
        if (changed) return resolve(info);
        else if (info && info.method === "mqtt") {
          api.setTheme(themeID, event.threadID, async (err2, info2) => {
            if (err2) return reject(err2);
            let changed2 = await checkThemeChanged(event.threadID, themeID);
            if (changed2) return resolve(info2);
            else return reject(new Error("Theme not changed after both MQTT and GraphQL."));
          });
        } else return reject(new Error("Theme not changed."));
      });
    }).then((info) => {
      let msg = `✅ Đã đổi chủ đề thành công thành: ${theme.name}`;
      api.sendMessage(msg, event.threadID, event.messageID);
    });
  } catch (e) {
    let errMsg = typeof e === "object" && (e.error || e.message) ? e.error || e.message : e.toString();
    return api.sendMessage("❌ Đổi chủ đề thất bại!\n" + errMsg, event.threadID, event.messageID);
  }
};