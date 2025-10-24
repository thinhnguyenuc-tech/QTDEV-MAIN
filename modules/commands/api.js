const fs = require("fs");
const path = require("path");
const axios = require("axios");
const pLimit = require("p-limit");
const limit = pLimit(15);

const pathApi = path.join(__dirname, "../../includes/datajson/");

module.exports.config = {
  name: "api",
  version: "1.0.0",
  hasPermssion: 3,
  credits: "qt",
  description: "Quản lý và upload api video, ảnh, audio (tiktok, catbox + nhiều link một lần)",
  commandCategory: "Admin",
  usages: "api [add/cr/rm/gf/check] [tên file]",
  cooldowns: 1,
};

const CL = (filePath) =>
  fs.readFileSync(filePath, "utf-8").split(/\r\n|\r|\n/).length;

async function checkLinkAlive(url, timeout = 8000) {
  const cfg = { timeout, maxRedirects: 5, validateStatus: () => true };
  try {
    let res = await axios.head(url, cfg);
    if (
      res.status >= 200 && res.status < 400 &&
      res.headers['content-length'] > 0 &&
      (
        (res.headers['content-type'] || '').includes('video') ||
        (res.headers['content-type'] || '').includes('image') ||
        (res.headers['content-type'] || '').includes('audio')
      )
    ) {
      return null;
    }
    return url;
  } catch {
    return url;
  }
}

module.exports.run = async function ({ api, event, args }) {
  try {
    if (args.length > 0) {
      const subCommand = args[0].toLowerCase();

      if (subCommand === "add") {
        api.setMessageReaction("⌛", event.messageID, () => { }, true);

        let fileName = "api.json";
        const replyMessage = event.messageReply;
        const inputLinks = args.slice(1).filter(arg => arg.startsWith("http"));

        const fileNameArg = args.slice(1).find(arg => !arg.startsWith("http"));
        if (fileNameArg) fileName = fileNameArg + ".json";

        if ((!replyMessage || replyMessage.attachments.length === 0) && inputLinks.length === 0) {
          api.setMessageReaction("❌", event.messageID, () => { }, true);
          return api.sendMessage(
            `⚠️ Vui lòng reply ảnh, video, hoặc nhập link (có thể nhiều) + tên file để lưu.\nNếu không nhập tên file, mặc định sẽ lưu vào: ${fileName}`,
            event.threadID
          );
        }

        const filePath = path.join(pathApi, fileName);
        if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf-8");

        let allLinks = [];

        if (replyMessage?.attachments?.length > 0) {
          for (let item of replyMessage.attachments) {
            try {
              const res = await axios.get(`https://catbox-mnib.onrender.com/upload?url=${encodeURIComponent(item.url)}`);
              if (res?.data?.url) allLinks.push(res.data.url);
            } catch (e) {
              console.error("❌ Upload từ media lỗi:", e.message);
            }
          }
        }

        for (let link of inputLinks) {
          try {
            let realVideoURL = link;

            if (link.includes("tiktok.com")) {
              try {
                const res = await axios.get(`https://tikwm.com/api?url=${encodeURIComponent(link)}`);
                if (res.data?.data?.play) {
                  realVideoURL = res.data.data.play;
                } else {
                  console.error("❌ Không lấy được video từ TikTok:", link);
                  continue;
                }
              } catch (e) {
                console.error("❌ Lỗi khi gọi API:", e.message);
                continue;
              }
            }

            const resUpload = await axios.get(`https://catbox-mnib.onrender.com/upload?url=${encodeURIComponent(realVideoURL)}`);
            if (resUpload?.data?.url) allLinks.push(resUpload.data.url);
          } catch (e) {
            console.error("❌ Upload link lỗi:", e.message);
          }
        }

        if (allLinks.length === 0) {
          return api.sendMessage("⚠️ Không có link hợp lệ nào được thêm.", event.threadID);
        }

        let existingData = [];
        try {
          existingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch (err) {
          console.error("Lỗi đọc file JSON:", err);
        }

        existingData = existingData.concat(allLinks);
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), "utf-8");

        api.setMessageReaction("✅", event.messageID, () => { }, true);
        return api.sendMessage(`✅ Đã thêm ${allLinks.length} link vào ${fileName}`, event.threadID);
      } else if (subCommand === "cr") {
        if (args.length === 1) {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          return api.sendMessage(
            `➣ Bạn cần nhập tên file để tạo!`,
            event.threadID
          );
        }

        let fileName = args.slice(1).join("_") + ".json";
        const filePath = pathApi + fileName;

        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, "[]", "utf-8");
          api.setMessageReaction("✅", event.messageID, () => { }, true);
          return api.sendMessage(`➣ Đã tạo file ${fileName}`, event.threadID);
        } else {
          return api.sendMessage(
            `➣ File ${fileName} đã tồn tại`,
            event.threadID
          );
        }
      } else if (subCommand === "rm") {
        if (args.length === 1) {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          return api.sendMessage(
            `➣ Bạn cần nhập tên file để xóa!`,
            event.threadID
          );
        }

        let fileName = args.slice(1).join("_") + ".json";
        const filePath = pathApi + fileName;

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          api.setMessageReaction("✅", event.messageID, () => { }, true);
          return api.sendMessage(`➣ Đã xóa file ${fileName}`, event.threadID);
        } else {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          return api.sendMessage(
            `➣ File ${fileName}.json không tồn tại`,
            event.threadID
          );
        }
      } else if (subCommand === "gf") {
        if (args.length === 1) {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          return api.sendMessage(
            `➣ Bạn cần nhập tên file để share!`,
            event.threadID
          );
        }

        const fileName = args[1].toLowerCase() + ".json";
        const filePath = pathApi + fileName;
        if (fs.existsSync(filePath)) {

          try {
            const uuid = require("uuid").v4();
            const fileContent = fs.readFileSync(filePath, "utf8");
            await axios.put(`https://qt-dev.vercel.app/api/note/${uuid}`, fileContent);
            const rawUrl = `https://qt-dev.vercel.app/api/note/${uuid}?raw=true`;

            api.setMessageReaction("✅", event.messageID, () => { }, true);
            return api.sendMessage(`➣ ${fileName}: ${rawUrl}`, event.threadID);
          } catch (err) {
            console.error("Lỗi khi upload file:", err);
            api.setMessageReaction("❎", event.messageID, () => { }, true);
            return api.sendMessage("❌ Đã xảy ra lỗi khi xử lý!", event.threadID);
          }
        } else {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          return api.sendMessage(
            `➣ File ${fileName} không tồn tại`,
            event.threadID
          );
        }
      } else if (subCommand === "check") {
        if (args.length < 2) {
          const files = fs.readdirSync(pathApi);
          const jsonFiles = files.filter(
            (file) => path.extname(file).toLowerCase() === ".json"
          );

          if (jsonFiles.length > 0) {
            const fileListArray = jsonFiles.map((file, index) => ({
              index: index + 1,
              fileName: path.basename(file, ".json"),
              filePath: pathApi + file,
              lineCount: CL(pathApi + file),
            }));

            const fileList = fileListArray
              .map(
                (item) =>
                  `${item.index}. ${item.fileName} (${item.lineCount} lines)`
              )
              .join("\n");
            api.setMessageReaction("✅", event.messageID, () => { }, true);
            const messageInfo = await api.sendMessage(
              `➣ Danh sách các link api:\n${fileList}\n\nReply tin nhắn này: rm/cr/gf/check + stt`,
              event.threadID
            );

            const replyInfo = {
              name: module.exports.config.name,
              messageID: messageInfo.messageID,
              author: event.senderID,
              fileListArray,
              type: "list",
            };
            global.client.handleReply.push(replyInfo);

            return;
          } else {
            return api.sendMessage(`➣ Thư mục rỗng`, event.threadID);
          }
        }
      }
    }


    else {
      const files = fs.readdirSync(pathApi);
      const jsonFiles = files.filter(
        (file) => path.extname(file).toLowerCase() === ".json"
      );
      const tong = jsonFiles.length;
      let tsdong = 0;
      for (const file of jsonFiles) {
        const filePath = pathApi + file;
        tsdong += CL(filePath);
      }
      api.setMessageReaction("✅", event.messageID, () => { }, true);
      const cachsudung = `
➣ check: xem toàn bộ danh sách api
➣ check + tên file muốn kiểm tra
➣ rm + tên file json muốn xóa
➣ cr + tên file json để tạo file mới
➣ gf + tên file để share file api
➣ add: reply ảnh/video/audio muốn làm api! 
   ➛ add + tên file cụ thể
   ➛ add + để trống
➣ add + tên file + link(nhiều link 1 lần) catbox/tiktok
          `;

      return api.sendMessage(
        `
${cachsudung}
➣ Tổng số file api hiện có: ${tong}
➣ Tổng số dòng: ${tsdong}
➣ Reply tin nhắn này: cr + tên file để tạo file json mới`,
        event.threadID,
        async (error, info) => {
          if (error) {
            console.error(error);
          } else {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "api",
            });
          }
        }
      );
    }
  } catch (error) {
    console.error("Error in run function:", error);
    api.setMessageReaction("❎", event.messageID, () => { }, true);
    return api.sendMessage(
      "Đã xảy ra lỗi trong quá trình xử lý!",
      event.threadID
    );
  }
};
module.exports.handleReply = async ({ api, handleReply, event }) => {
  try {
    const { threadID, body, messageID } = event;
    const { fileListArray, type } = handleReply;
    const args = body.split(" ");

    const getPath = (fileName) => pathApi + fileName + ".json";

    const NVNH = (message) => api.sendMessage(message, threadID);

    if (type === "list") {
      if (args[0].toLowerCase() === "rm") {
        const fileIndices = args.slice(1).map((index) => parseInt(index));

        for (const fileIndex of fileIndices) {
          if (fileIndex >= 1 && fileIndex <= fileListArray.length) {
            const selectedFile = fileListArray[fileIndex - 1];
            const filePath = getPath(selectedFile.fileName);

            fs.unlink(filePath, (err) => {
              if (err) console.error(`Error deleting file ${filePath}:`, err);
            });
            api.setMessageReaction("✅", event.messageID, () => { }, true);
            NVNH(`Đã xóa file ${selectedFile.fileName}`);
          } else {
            api.setMessageReaction("❎", event.messageID, () => { }, true);
            NVNH(`Tên ${fileIndex} không hợp lệ`);
          }
        }
      } else if (args[0].toLowerCase() === "cr") {
        if (args.length === 1) {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          return NVNH(`➣ Bạn cần nhập tên file để tạo!`);
        }

        let fileName = args.slice(1).join("_") + ".json";
        const filePath = getPath(fileName);

        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, "[]", "utf-8");
          api.setMessageReaction("✅", event.messageID, () => { }, true);
          NVNH(`Đã tạo file ${fileName}`);
        } else {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          NVNH(`File ${fileName} đã tồn tại`);
        }
      } else if (args[0].toLowerCase() === "gf") {
        const fileIndices = args.slice(1).map((index) => parseInt(index));

        for (const fileIndex of fileIndices) {
          if (fileIndex >= 1 && fileIndex <= fileListArray.length) {
            const selectedFile = fileListArray[fileIndex - 1];
            const filePath = getPath(selectedFile.fileName);

            try {
              const uuid = require("uuid").v4();
              const fileContent = fs.readFileSync(filePath, "utf8");
              await axios.put(`https://qt-dev.vercel.app/api/note/${uuid}`, fileContent);
              const rawUrl = `https://qt-dev.vercel.app/api/note/${uuid}?raw=true`;

              api.setMessageReaction("✅", event.messageID, () => { }, true);
              NVNH(`➣ ${selectedFile.fileName}: ${rawUrl}`);
            } catch (err) {
              console.error("Lỗi khi upload file:", err);
              api.setMessageReaction("❎", event.messageID, () => { }, true);
              NVNH("❌ Đã xảy ra lỗi khi xử lý!");
            }
          } else {
            api.setMessageReaction("❎", event.messageID, () => { }, true);
            NVNH(`❌ Số thứ tự ${fileIndex} không hợp lệ`);
          }
        }
      } else if (args[0].toLowerCase() === "check") {
        const fileIndices = args.slice(1).map((index) => parseInt(index));

        for (const fileIndex of fileIndices) {
          if (fileIndex >= 1 && fileIndex <= fileListArray.length) {
            const selectedFile = fileListArray[fileIndex - 1];
            const filePath = getPath(selectedFile.fileName);
            api.setMessageReaction("⌛", event.messageID, () => { }, true);
            try {
              const fileContent = fs.readFileSync(filePath, "utf-8");
              const jsonData = JSON.parse(fileContent);

              
              const checkResults = await Promise.all(
                jsonData.map((link) => limit(() => checkLinkAlive(link)))
              );
              
              const deadLinks = checkResults.filter(Boolean);
              const liveLinks = jsonData.length - deadLinks.length;
              api.setMessageReaction("✅", event.messageID, () => { }, true);
              const message = `===𝐂𝐡𝐞𝐜𝐤 𝐋𝐢𝐧𝐤===\n➣ 𝐋𝐢𝐧𝐤 𝐝𝐢𝐞: ${deadLinks.length}\n➣ 𝐋𝐢𝐧𝐤 𝐬𝐨̂́𝐧𝐠: ${liveLinks}\n➣ Thả cảm xúc bất kì vào tin nhắn này để xóa link die`;
              api.sendMessage(message, event.threadID, (error, info) => {
                if (error) {
                  console.error(error);
                } else {
                  global.client.handleReaction.push({
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    type: "check",
                    deadLinks: deadLinks,
                    filePath,
                  });
                }
              });
            } catch (error) {
              console.error(
                `Error reading or parsing JSON file ${selectedFile.fileName}:`,
                error,
              );
              api.setMessageReaction("❎", event.messageID, () => { }, true);
              api.sendMessage(
                `Đã xảy ra lỗi khi đọc hoặc phân tích tệp JSON ${selectedFile.fileName}`,
                event.threadID,
              );
            }
          } else {
            api.setMessageReaction("❎", event.messageID, () => { }, true);
            NVNH(`➣ Tên ${fileIndex} không hợp lệ`);
          }
        }
      }
    } else if (type === "api" && args[0].toLowerCase() === "cr") {
      if (args.length === 1) {
        api.setMessageReaction("❎", event.messageID, () => { }, true);
        return NVNH(`➣ Bạn cần nhập tên file để tạo!`);
      }

      let fileName = args.slice(1).join("_") + ".json";
      const filePath = getPath(fileName);

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]", "utf-8");
        api.setMessageReaction("✅", event.messageID, () => { }, true);
        NVNH(`✅ Đã tạo file ${fileName}`);
      } else {
        api.setMessageReaction("❎", event.messageID, () => { }, true);
        NVNH(`➣ File ${fileName} đã tồn tại`);
      }
    }
  } catch (error) {
    console.error("Lỗi: ", error);
  }
};
module.exports.handleReaction = async function ({
  api,
  event,
  handleReaction,
}) {
  if (event.userID != handleReaction.author) return;
  try {
    const { filePath, deadLinks } = handleReaction;

    if (filePath && Array.isArray(deadLinks) && deadLinks.length > 0) {
      let fileContent = fs.readFileSync(filePath, "utf-8");
      let jsonData = JSON.parse(fileContent);
      const l = jsonData.length;
      jsonData = jsonData.filter((link) => !deadLinks.includes(link));
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");

      const d = l - jsonData.length;

      api.sendMessage(`✅ Đã xóa thành công ${d} link die`, event.threadID);
    }
  } catch (error) {
    console.error("Error handling reaction:", error);
  }
};
