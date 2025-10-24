"use strict";

const { generateOfflineThreadingID, getCurrentTimestamp } = require("../utils");

function isCallable(func) {
  try {
    Reflect.apply(func, null, []);
    return true;
  } catch (error) {
    return false;
  }
}

const themes = [
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

module.exports = function (defaultFuncs, api, ctx) {
  function setThemeMqtt(themeID, threadID, callback) {
  try {
    ctx.wsReqNumber = (ctx.wsReqNumber || 0) + 1;
    ctx.wsTaskNumber = (ctx.wsTaskNumber || 0) + 1;
    let selectedThemeID;
    if (!themeID) {
      const randomIndex = Math.floor(Math.random() * themes.length);
      selectedThemeID = themes[randomIndex].id;
    } else {
      selectedThemeID = themeID;
    }
    const taskPayload = {
      thread_key: threadID,
      theme_fbid: selectedThemeID,
      source: null,
      sync_group: 1,
      payload: null,
    };
    const task = {
      failure_count: null,
      label: "43",
      payload: JSON.stringify(taskPayload),
      queue_name: "thread_theme",
      task_id: ctx.wsTaskNumber,
    };
    const content = {
      app_id: "2220391788200892",
      payload: JSON.stringify({
        data_trace_id: null,
        epoch_id: parseInt(generateOfflineThreadingID()),
        tasks: [task],
        version_id: "25095469420099952",
      }),
      request_id: ctx.wsReqNumber,
      type: 3,
    };

    // ---- SỬA Ở ĐÂY ----
    if (!ctx.callback_Task) ctx.callback_Task = {};
    ctx.callback_Task[content.request_id] = {
      type: "change_thread_theme",
      callback: callback
    };
    ctx.mqttClient.publish("/ls_req", JSON.stringify(content), { qos: 1, retain: false });
  } catch (err) {
    if (typeof callback === 'function') return callback(err);
  }
}

  function setThemeGraphQL(themeID, threadID, callback) {
    let selectedThemeID = themeID;
    if (!themeID) {
      const randomIndex = Math.floor(Math.random() * themes.length);
      selectedThemeID = themes[randomIndex].id;
    }
    const form = {
      dpr: 1,
      queries: JSON.stringify({
        o0: {
          doc_id: "1727493033983591",
          query_params: {
            data: {
              actor_id: ctx.i_userID || ctx.userID,
              client_mutation_id: "0",
              source: "SETTINGS",
              theme_id: selectedThemeID,
              thread_id: threadID
            }
          }
        }
      })
    };
    defaultFuncs
      .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form)
      .then(require("../utils").parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData[resData.length - 1].error_results > 0) {
          // Log chi tiết lỗi trả về từ Facebook
          const fbError = resData[0].o0.errors || resData[0].o0.error || resData[0].o0;
          console.error('[setTheme.js][GraphQL] Facebook trả về lỗi:', fbError);
          throw new (require("../utils").CustomError)(fbError);
        }
        if (typeof callback === 'function') return callback(null, { method: 'graphql' });
      })
      .catch(function (err) {
        // Log lỗi chi tiết
        console.error('[setTheme.js][GraphQL] Lỗi khi đổi theme:', err);
        if (typeof callback === 'function') return callback(err);
      });
  }

  return function setTheme(themeID, threadID, callback) {
  if (ctx.mqttClient) {
    setThemeMqtt(themeID, threadID, function (err, info) {
      if (err) {
        setThemeGraphQL(themeID, threadID, callback);
      } else {
        if (typeof callback === 'function') return callback(null, info);
      }
    });
  } else {
    setThemeGraphQL(themeID, threadID, callback);
  }
  };
};