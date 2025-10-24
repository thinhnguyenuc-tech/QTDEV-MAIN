module.exports = function ({ api, models }) {
  setInterval(function () {
    if (global.config.NOTIFICATION) {
      require("./handle/handleNotification.js")({ api });
    }
  }, 1000 * 60);
  const fs = require("fs-extra");
  const path = require("path");
  const Users = require("./controllers/users.js")({ models, api }),
    Threads = require("./controllers/threads.js")({ models, api }),
    Currencies = require("./controllers/currencies.js")({ models });
  const logger = require("../utils/log.js");
  const moment = require('moment-timezone');
  const axios = require("axios");
  const config = require("../config.json");
  /////////////////////////////////////////////////////////////////////////////

  var day = moment.tz("Asia/Ho_Chi_Minh").day();
  const checkttDataPath = __dirname + "/../modules/commands/_checktt/";
  setInterval(async () => {
    try {
      const day_now = moment.tz("Asia/Ho_Chi_Minh").day();
      if (day != day_now) {
        day = day_now;
        const checkttData = fs.readdirSync(checkttDataPath);
        logger("[ CHECKTT ] - Đã gửi check tương tác ngày");
        checkttData.forEach(async (checkttFile) => {
          const checktt = JSON.parse(
            fs.readFileSync(checkttDataPath + checkttFile)
          );

          if (!checktt.last)
            checktt.last = {
              time: day_now,
              day: [],
              week: [],
            };

          let storage = [],
            count = 1;
          for (const item of checktt.day) {
            const userName =
              (await Users.getNameUser(item.id)) || "Người Dùng Facebook";
            const itemToPush = item;
            itemToPush.name = userName;
            storage.push(itemToPush);
          }
          storage.sort((a, b) => {
            if (a.count > b.count) {
              return -1;
            } else if (a.count < b.count) {
              return 1;
            } else {
              return a.name.localeCompare(b.name);
            }
          });
          let checkttBody = " [ Top 10 Tương Tác Ngày ]\n─────────────────\n";
          checkttBody += storage
            .slice(0, 10)
            .map((item) => {
              return `${count++}. ${item.name
                } - ${item.count} tin nhắn.`;
            })
            .join("\n");
          api.sendMessage(
            `${checkttBody}\n─────────────────\n💬 Tổng tin nhắn: ${storage.reduce((a, b) => a + b.count, 0)}\n✏️ Các bạn khác cố gắng tương tác nếu muốn lên top nha`,
            checkttFile.replace(".json", ""),
            (err) => (err ? logger(err) : "")
          );
          checktt.last.day = JSON.parse(JSON.stringify(checktt.day));
          checktt.day.forEach((e) => {
            e.count = 0;
          });
          checktt.time = day_now;

          fs.writeFileSync(
            checkttDataPath + checkttFile,
            JSON.stringify(checktt, null, 4)
          );
        });
        if (day_now == 1) {
          logger("[ CHECKTT ] - Đã gửi check tương tác tuần");
          checkttData.forEach(async (checkttFile) => {
            const checktt = JSON.parse(
              fs.readFileSync(checkttDataPath + checkttFile)
            );

            if (!checktt.last)
              checktt.last = {
                time: day_now,
                day: [],
                week: [],
              };

            let storage = [],
              count = 1;
            for (const item of checktt.week) {
              const userName =
                (await Users.getNameUser(item.id)) || "Người Dùng Facebook";
              const itemToPush = item;
              itemToPush.name = userName;
              storage.push(itemToPush);
            }
            storage.sort((a, b) => {
              if (a.count > b.count) {
                return -1;
              } else if (a.count < b.count) {
                return 1;
              } else {
                return a.name.localeCompare(b.name);
              }
            });
            let checkttBody = " [ Top 10 Tương Tác Tuần ]\n─────────────────\n";
            checkttBody += storage
              .slice(0, 10)
              .map((item) => {
                return `${count++}. ${item.name
                  } - ${item.count} tin nhắn.`;
              })
              .join("\n");
            api.sendMessage(
              `${checkttBody}\n─────────────────\n✏️ Các bạn khác cố gắng tương tác nếu muốn lên top nha`,
              checkttFile.replace(".json", ""),
              (err) => (err ? logger(err) : "")
            );
            checktt.last.week = JSON.parse(JSON.stringify(checktt.week));
            checktt.week.forEach((e) => {
              e.count = 0;
            });

            fs.writeFileSync(
              checkttDataPath + checkttFile,
              JSON.stringify(checktt, null, 4)
            );
          });
        }
        global.client.sending_top = true;
      }
    } catch (e) { }
  }, 1000 * 10);
  //////////////////////////////////////////////////////////////////////
  //========= Push all variable from database to environment =========//
  //////////////////////////////////////////////////////////////////////
  (async function () {
    try {
      logger(global.getText('listen', 'startLoadEnvironment'), '[ DATABASE ]');
      let threads = await Threads.getAll(),
        users = await Users.getAll(['userID', 'name', 'data']),
        currencies = await Currencies.getAll(['userID']);
      for (const data of threads) {
        const idThread = String(data.threadID);
        global.data.allThreadID.push(idThread),
          global.data.threadData.set(idThread, data['data'] || {}),
          global.data.threadInfo.set(idThread, data.threadInfo || {});
        if (data['data'] && data['data']['banned'] == !![])
          global.data.threadBanned.set(idThread,
            {
              'reason': data['data']['reason'] || '',
              'dateAdded': data['data']['dateAdded'] || ''
            });
        if (data['data'] && data['data']['commandBanned'] && data['data']['commandBanned']['length'] != 0)
          global['data']['commandBanned']['set'](idThread, data['data']['commandBanned']);
        if (data['data'] && data['data']['NSFW']) global['data']['threadAllowNSFW']['push'](idThread);
      }
      logger.loader(global.getText('listen', 'loadedEnvironmentThread'));
      for (const dataU of users) {
        const idUsers = String(dataU['userID']);
        global.data['allUserID']['push'](idUsers);
        if (dataU.name && dataU.name['length'] != 0) global.data.userName['set'](idUsers, dataU.name);
        if (dataU.data && dataU.data.banned == 1) global.data['userBanned']['set'](idUsers, {
          'reason': dataU['data']['reason'] || '',
          'dateAdded': dataU['data']['dateAdded'] || ''
        });
        if (dataU['data'] && dataU.data['commandBanned'] && dataU['data']['commandBanned']['length'] != 0)
          global['data']['commandBanned']['set'](idUsers, dataU['data']['commandBanned']);
      }
      for (const dataC of currencies) global.data.allCurrenciesID.push(String(dataC['userID']));
      logger.loader(global.getText("listen", "loadedEnvironmentUser"));
    } catch (error) {
      return logger.loader(global.getText('listen', 'failLoadEnvironment', error), 'error');
    }
  }());

  const admin = config.ADMINBOT;
  logger("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓", "[ KURUMI ]");
  for (let i = 0; i <= admin.length - 1; i++) {
    dem = i + 1
    logger(`  ID ADMIN ${dem}: ${(!admin[i]) ? "Trống" : admin[i]}`, "[ KURUMI ]");
  }
  logger(`  ID BOT: ${api.getCurrentUserID()}`, "[ KURUMI ]");
  logger(`  PREFIX: ${global.config.PREFIX}`, "[ KURUMI ]");
  logger(`  NAME BOT: ${(!global.config.BOTNAME) ? "KURUMI" : global.config.BOTNAME}`, "[ KURUMI ]");
  logger.loader(`  Commands Loaded: ${global.client.commands.size}`)
  logger.loader(`  Events Loaded: ${global.client.events.size}`)
  logger.loader('  Time start: ' + (Date.now() - global.client.timeStart) / 1000 + 's')
  logger("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛", "[ KURUMI ]");
  /////////////////////////////////////////////
  //========= Require all handle need =========//  /////////////////////////////////////////////
  const handleCommand = require("./handle/handleCommand.js")({ api, models, Users, Threads, Currencies });
  const handleCommandEvent = require("./handle/handleCommandEvent.js")({ api, models, Users, Threads, Currencies });
  const handleReply = require("./handle/handleReply.js")({ api, models, Users, Threads, Currencies });
  const handleReaction = require("./handle/handleReaction.js")({ api, models, Users, Threads, Currencies });
  const handleEvent = require("./handle/handleEvent.js")({ api, models, Users, Threads, Currencies });
  const handleRefresh = require("./handle/handleRefresh.js")({ api, models, Users, Threads, Currencies });
  const handleCreateDatabase = require("./handle/handleCreateDatabase.js")({ api, Threads, Users, Currencies, models });
  logger.loader(`Ping load source code: ${Date.now() - global.client.timeStart}ms`);
  //////////////////////////////////////////////////
  //========= Send event to handle need =========//
  ////////////////////////////////////////////////

  return async (event) => {
    const { threadID, author, image, type, logMessageType, logMessageBody, logMessageData } = event;
    const tm = process.uptime() + global.config.UPTIME, Tm = (require('moment-timezone')).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || DD/MM/YYYY')
    h = Math.floor(tm / (60 * 60)), H = h < 10 ? '0' + h : h,
      m = Math.floor((tm % (60 * 60)) / 60), M = m < 10 ? '0' + m : m,
      s = Math.floor(tm % 60), S = s < 10 ? '0' + s : s, $ = ':'
    var data_anti = JSON.parse(fs.readFileSync(global.anti, "utf8"));
    const { notiGroup, notiUnsend } = global.config;
    const botID = api.getCurrentUserID();
    const sendAndUnsend = async (message, threadID) => {
      api.sendMessage(message, threadID, async (err, info) => {
        if (notiUnsend && info?.messageID) {
          await new Promise(r => setTimeout(r, notiUnsend * 1000));
          api.unsendMessage(info.messageID);
        }
      });
    };

    if (type === "change_thread_image") {
      const threadInf = await api.getThreadInfo(threadID);
      const findAd = threadInf.adminIDs.find((el) => el.id === author);
      const findAnti = data_anti.boximage.find(
        (item) => item.threadID === threadID
      );

      if (findAnti) {
        if (findAd || botID.includes(author)) {
          if (notiGroup) {
            sendAndUnsend(`» [ CẬP NHẬT NHÓM ] «\n📝 ${event.snippet}`, event.threadID);
          }
          const options = {
            method: "POST",
            url: "https://api.imgbb.com/1/upload",
            headers: {
              "Content-Type": "multipart/form-data"
            },
            data: {
              image: image.url,
              key: "90a697e7b4a9f767392b8bf2df485ddb"
            }
          };

          const res = await axios(options);
          var data = res.data.data;
          var img = data.url;
          findAnti.url = img;
          return fs.writeFileSync(global.anti, JSON.stringify(data_anti, null, 4));
        } else {
          if (notiGroup) {
            sendAndUnsend(`❌ ANTI đang bật không thể đổi ảnh nhóm`, threadID);
          }
          try {
            const response = await axios.get(findAnti.url, { responseType: "stream" });
            return api.changeGroupImage(response.data, threadID);
          } catch (error) {
            console.error("Error restoring group image:", error);
            if (notiGroup) {
              sendAndUnsend(`❌ Không thể khôi phục ảnh nhóm`, threadID);
            }
          }
        }
      } else {
        if (notiGroup) {
          sendAndUnsend(`» [ CẬP NHẬT NHÓM ] «\n📝 ${event.snippet}`, event.threadID);
        }
        const options = {
          method: "POST",
          url: "https://api.imgbb.com/1/upload",
          headers: {
            "Content-Type": "multipart/form-data"
          },
          data: {
            image: image.url,
            key: "90a697e7b4a9f767392b8bf2df485ddb"
          }
        };

        const res = await axios(options);
        var data = res.data.data;
        var img = data.url;

        if (!data_anti.boximage) data_anti.boximage = [];
        data_anti.boximage.push({
          threadID: threadID,
          url: img
        });
        return fs.writeFileSync(global.anti, JSON.stringify(data_anti, null, 4));
      }
    }

    if (logMessageType === "log:thread-name") {
      const threadInf = await api.getThreadInfo(threadID);
      const findAd = threadInf.adminIDs.find((el) => el.id === author);
      const findAnti = data_anti.boxname.find(
        (item) => item.threadID === threadID
      );

      if (findAnti) {
        if (findAd || botID.includes(author)) {
          if (notiGroup) {
            sendAndUnsend(`» [ CẬP NHẬT NHÓM ] «\n📝 ${logMessageBody}`, event.threadID);
          }
          findAnti.name = logMessageData.name;
          const jsonData = JSON.stringify(data_anti, null, 4);
          return fs.writeFileSync(global.anti, jsonData);
        } else {
          if (notiGroup) {
            sendAndUnsend(`❌ ANTI đang bật không thể đổi tên nhóm`, threadID);
          }
          return api.setTitle(findAnti.name, threadID);
        }
      }
    }

    if (logMessageType === "log:thread-color") {
      const threadInf = await api.getThreadInfo(threadID);
      const findAd = threadInf.adminIDs.find((el) => el.id === author);
      const findAnti = data_anti.boxtheme?.find(item => item.threadID === threadID);

      if (findAnti) {
        if (findAd || botID.includes(author)) {
          if (notiGroup) {
            sendAndUnsend(`» [ CẬP NHẬT NHÓM ] «\n📝 ${logMessageBody}`, threadID);
          }

          let themeID = null;
          if (threadInf.threadTheme) {
            if (typeof threadInf.threadTheme === "object" && threadInf.threadTheme.id)
              themeID = String(threadInf.threadTheme.id);
            else if (typeof threadInf.threadTheme === "string")
              themeID = threadInf.threadTheme;
          }
          themeID = themeID ||
            (threadInf.theme_fbid && String(threadInf.theme_fbid)) ||
            (threadInf.thread_theme && String(threadInf.thread_theme)) ||
            (threadInf.theme && String(threadInf.theme)) ||
            (threadInf.themeID && String(threadInf.themeID)) ||
            null;

          let color = null;
          if (threadInf.threadTheme && typeof threadInf.threadTheme === "object" && threadInf.threadTheme.fallback_color)
            color = threadInf.threadTheme.fallback_color;
          else if (threadInf.theme_color)
            color = threadInf.theme_color;

          findAnti.themeID = themeID;
          findAnti.color = color;

          const emojiAnti = data_anti.boxemoji?.find(item => item.threadID === threadID);
          if (emojiAnti && (findAd || botID.includes(author))) {
            const threadInfoAfter = await api.getThreadInfo(threadID);
            const currentEmoji = threadInfoAfter.emoji;
            if (currentEmoji && emojiAnti.emoji !== currentEmoji) {
              emojiAnti.emoji = currentEmoji;
              fs.writeFileSync(global.anti, JSON.stringify(data_anti, null, 4));
            }
          }

          return fs.writeFileSync(global.anti, JSON.stringify(data_anti, null, 4));

        } else {
          if (notiGroup) {
            sendAndUnsend(`❌ ANTI đang bật không thể đổi theme nhóm`, threadID);
          }
          try {
            if (findAnti.themeID) {
              await api.setTheme(findAnti.themeID, threadID);
            } else if (findAnti.color) {
              await api.changeThreadColor('#' + findAnti.color.replace(/^FF/, ''), threadID);
            }
          } catch (error) {
            console.error("Không thể khôi phục theme nhóm:", error);
            sendAndUnsend(`❌ Không thể khôi phục theme nhóm!`, threadID);
          }
        }
      }
    }

    if (logMessageType === "log:user-nickname") {
      const threadInf = await api.getThreadInfo(threadID);
      const findAd = threadInf.adminIDs.find((el) => el.id === author);
      const findAnti = data_anti.antiNickname.find(
        (item) => item.threadID === threadID
      );

      if (findAnti) {
        if (findAd || botID.includes(author)) {
          if (notiGroup) {
            sendAndUnsend(`» [ CẬP NHẬT NHÓM ] «\n📝 ${logMessageBody}`, event.threadID);
          }
          findAnti.data[logMessageData.participant_id] =
            logMessageData.nickname;
          const jsonData = JSON.stringify(data_anti, null, 4);
          return fs.writeFileSync(global.anti, jsonData);
        } else {
          if (notiGroup) {
            sendAndUnsend(`❌ ANTI đang bật không thể đổi tên biệt danh`, threadID);
          }
          return api.changeNickname(
            findAnti.data[logMessageData.participant_id] || "",
            threadID,
            logMessageData.participant_id
          );
        }
      }
    }

    if (logMessageType === "log:unsubscribe") {
      const botID = api.getCurrentUserID();
      var threadInf = await api.getThreadInfo(threadID);
      const findAd = threadInf.adminIDs.find((el) => el.id === author);
      const findAnti = data_anti.antiout[threadID] ? true : false;
      if (findAnti) {
        const typeOut =
          author == logMessageData.leftParticipantFbId ? "out" : "kick";
        if (typeOut == "out") {
          api.addUserToGroup(
            logMessageData.leftParticipantFbId,
            threadID,
            (error, info) => {
              if (error) {
                api.sendMessage(
                  `❎ Thêm người dùng trở lại thất bại!\nhttps://www.facebook.com/profile.php?id=${logMessageData.leftParticipantFbId}\n[ 𝐌𝐎𝐃𝐄 ] → Đang kích hoạt chế độ cấm thoát nhóm!`,
                  threadID
                );
              } else
                api.sendMessage(
                  `✅ Đã thêm người dùng trở lại thành công!\nhttps://www.facebook.com/profile.php?id=${logMessageData.leftParticipantFbId}\n[ 𝐌𝐎𝐃𝐄 ] → Đang kích hoạt chế độ cấm thoát nhóm!`,
                  threadID
                );
            }
          );
        }
      }
    }

    if (logMessageType === "log:thread-icon") {
      const threadInf = await api.getThreadInfo(threadID);
      const findAd = threadInf.adminIDs.find((el) => el.id === author);
      const findAnti = data_anti.boxemoji?.find(item => item.threadID === threadID);

      if (findAnti) {
        if (findAd || botID.includes(author)) {
          findAnti.emoji = logMessageData.thread_quick_reaction_emoji;
          fs.writeFileSync(global.anti, JSON.stringify(data_anti, null, 4));
        } else {
          if (notiGroup) {
            sendAndUnsend(`❌ ANTI đang bật không thể đổi icon nhóm`, threadID);
          }
          try {
            await api.changeThreadEmoji(findAnti.emoji, threadID);
          } catch (error) {
            console.error("Không thể khôi phục icon nhóm:", error);
            sendAndUnsend(`❌ Không thể khôi phục icon nhóm!`, threadID);
          }
        }
      } else {
        if (notiGroup) {
          sendAndUnsend(`» [ CẬP NHẬT NHÓM ] «\n📝 ${logMessageBody}`, threadID);
        }
      }
    }

    ///////////////////////////////////////
    let form_mm_dd_yyyy = (input = '', split = input.split('/')) => `${split[1]}/${split[0]}/${split[2]}`;
    let prefix = (global.data.threadData.get(event.threadID) || {}).PREFIX || global.config.PREFIX;
    let send = (msg, callback) => api.sendMessage(msg, event.threadID, callback, event.messageID);
    if ((event.body || '').startsWith(prefix) && event.senderID != api.getCurrentUserID() && !global.config.ADMINBOT.includes(event.senderID) && !global.config.NDH.includes(event.senderID)) {
      let thuebot;
      try {
        thuebot = JSON.parse(require('fs').readFileSync(process.cwd() + '/modules/commands/data/thuebot.json'));
      } catch {
        thuebot = [];
      };
      let find_thuebot = thuebot.find($ => $.t_id == event.threadID);
      if (((global.data.threadData.get(event.threadID)?.PREFIX || global.config.PREFIX) + 'bank') != event.args[0]) {
        if (!find_thuebot) return api.shareContact("⛔ Thuê bot đi roi dùng\n📝 Chỉ 40k/1th thoii\n🙅 Liên hệ admin để thuê\n✧ Nhéeeee 🥹", 100040035856246, threadID);
        if (new Date(form_mm_dd_yyyy(find_thuebot.time_end)).getTime() <= Date.now() + 25200000) return api.shareContact("⛔ Đã hết hạn thue bot\n📝 Chỉ 40k/1th\n🙅 Liên hệ admin để gia hạn\n✧ Nhéeeee 🥹", 100040035856246, threadID);
      };
    };

    if (event.type === "message" || event.type === "message_reply") {
      const isAntiTagAll = data_anti.tagall?.some(i => i.threadID === event.threadID);
      if (isAntiTagAll && event.mentions) {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const botID = api.getCurrentUserID();
        const allMemberIDs = threadInfo.participantIDs.filter(id => id != botID && id != event.senderID);
        const mentionIDs = Object.keys(event.mentions);
        const isTagAllMessenger = mentionIDs.includes('everyone') ||
          (event.body && (
            event.body.toLowerCase().includes('@everyone') ||
            event.body.toLowerCase().includes('@mọi người')
          ));
        if (isTagAllMessenger) {
          const isAdmin = threadInfo.adminIDs.some(ad => ad.id == event.senderID);
          if (!isAdmin && event.senderID != botID) {
            try {
              await api.removeUserFromGroup(event.senderID, event.threadID);
              api.sendMessage("✅ Đã kick thành viên do tag all!", event.threadID);
            } catch (e) {
              api.sendMessage("❌ Bot cần quyền quản trị viên nhóm!", event.threadID);
            }
          }
        }
      }
    }

    ///////////////////////////////////////////
    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        handleCreateDatabase({ event });
        handleCommand({ event });
        handleReply({ event });
        handleCommandEvent({ event });
        break;
      case "event":
        handleEvent({ event });
        handleRefresh({ event });
        if (global.config.notiGroup) {
          const ignoredEvents = [
            "log:subscribe",
            "log:unsubscribe",
            "log:thread-poll"
          ];

          if (!ignoredEvents.includes(event.logMessageType)) {
            var msg = '» [ CẬP NHẬT NHÓM ] «\n📝 ';
            msg += event.logMessageBody;

            if (event.author == api.getCurrentUserID()) {
              msg = msg.replace('Bạn', global.config.BOTNAME);
            }


            api.sendMessage({
              body: msg
            }, event.threadID, async (error, info) => {
              if (!error && global.config.notiUnsend > 0) {
                await new Promise(resolve => setTimeout(resolve, global.config.notiUnsend * 1000));
                api.unsendMessage(info.messageID);
              }
            });
          }
        }
        break;
      case "message_reaction":
        var { iconUnsend } = global.config
        if (iconUnsend.status && event.senderID == api.getCurrentUserID() && event.reaction == iconUnsend.icon) {
          api.unsendMessage(event.messageID)
        }
        handleReaction({ event });
        break;
      default:
        break;
    }
  };
};

/////////////////////////////////
///// Code lại by qt newbie/////
///////////////////////////////