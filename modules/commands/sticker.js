const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');
const { image } = require('image-downloader');
const { createCanvas, loadImage } = require('canvas');

module.exports.config = {
  name: 'sticker',
  version: '1.0.2',
  hasPermssion: 0,
  credits: 'Bảo',
  description: 'Tách nền và tạo sticker có viền',
  commandCategory: 'Tiện Ích',
  usages: 'Reply ảnh để tạo sticker',
  cooldowns: 2,
  dependencies: {
    'form-data': '',
    'image-downloader': ''
  }
};

const COLORS = [
  { name: "Trắng", code: "#ffffff" },
  { name: "Đen", code: "#000000" },
  { name: "Đỏ", code: "#ff0000" },
  { name: "Xanh dương", code: "#007bff" },
  { name: "Vàng", code: "#ffc107" },
  { name: "Tím", code: "#9b59b6" },
  { name: "Hồng", code: "#ff69b4" },
  { name: "Xanh lá", code: "#2ecc71" },
  { name: "Cam", code: "#ff7f00" }
];

module.exports.run = async function({ api, event }) {
  if (event.type !== "message_reply") return api.sendMessage("⚠️ Vui lòng reply một ảnh bất kỳ.", event.threadID, event.messageID);
  if (!event.messageReply.attachments || event.messageReply.attachments.length == 0) return api.sendMessage("⚠️ Vui lòng reply một ảnh bất kỳ.", event.threadID, event.messageID);
  if (event.messageReply.attachments[0].type != "photo") return api.sendMessage("⚠️ File bạn reply không phải ảnh.", event.threadID, event.messageID);

  const imageUrl = event.messageReply.attachments[0].url;
  const KeyApi = ["Trug5SQwGYqrkRS5feFkTQtf"];
  const inputPath = path.join(__dirname, "cache", `${Date.now()}_input.png`);

  await image({ url: imageUrl, dest: inputPath });

  const form = new FormData();
  form.append("size", "auto");
  form.append("image_file", fs.createReadStream(inputPath));

  axios({
    method: 'post',
    url: 'https://api.remove.bg/v1.0/removebg',
    data: form,
    responseType: 'arraybuffer',
    headers: {
      ...form.getHeaders(),
      'X-Api-Key': KeyApi[Math.floor(Math.random() * KeyApi.length)],
    }
  }).then(res => {
    if (res.status !== 200) return api.sendMessage("❌ API RemoveBG lỗi!", event.threadID, event.messageID);
    fs.writeFileSync(inputPath, res.data);
    let msg = '🌈 Vui lòng chọn màu viền:\n';
    COLORS.forEach((c, i) => msg += `${i}. ${c.name} (${c.code})\n`);
    msg += '\n👉 Reply số tương ứng để chọn.';
    api.sendMessage(msg, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID,
        inputPath,
        threadID: event.threadID
      });
    });
  }).catch(() => {
    return api.sendMessage("❌ Đã xảy ra lỗi khi tách nền.", event.threadID, event.messageID);
  });
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  if (event.senderID !== handleReply.author) return;

  const index = parseInt(event.body);
  if (isNaN(index) || index < 0 || index >= COLORS.length)
    return api.sendMessage("❌ Vui lòng chọn số trong danh sách!", event.threadID, event.messageID);

  const colorCode = COLORS[index].code;
  const inputPath = handleReply.inputPath;
  const outputPath = inputPath.replace('.png', '_sticker.png');
  const outlineSize = 6;

  try {
    const img = await loadImage(inputPath);
    const width = img.width + outlineSize * 2;
    const height = img.height + outlineSize * 2;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const temp = createCanvas(width, height);
    const tempCtx = temp.getContext('2d');
    tempCtx.drawImage(img, outlineSize, outlineSize);
    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const r = parseInt(colorCode.slice(1, 3), 16);
    const g = parseInt(colorCode.slice(3, 5), 16);
    const b = parseInt(colorCode.slice(5, 7), 16);

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 0) {
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 255;
      } else {
        data[i + 3] = 0;
      }
    }
    tempCtx.putImageData(imageData, 0, 0);

    for (let dx = -outlineSize; dx <= outlineSize; dx++) {
      for (let dy = -outlineSize; dy <= outlineSize; dy++) {
        if (Math.sqrt(dx * dx + dy * dy) < outlineSize)
          ctx.drawImage(temp, dx, dy);
      }
    }

    ctx.drawImage(img, outlineSize, outlineSize);

    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on('finish', async () => {
      const catboxForm = new FormData();
      catboxForm.append('reqtype', 'fileupload');
      catboxForm.append('fileToUpload', fs.createReadStream(outputPath));

      const upload = await axios.post('https://catbox.moe/user/api.php', catboxForm, {
        headers: catboxForm.getHeaders()
      });

      const url = upload.data;
      api.sendMessage({
        body: `✅ Sticker đã sẵn sàng!\n📎 Link PNG trong suốt:\n${url}`,
        attachment: fs.createReadStream(outputPath)
      }, handleReply.threadID, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    });
  } catch (err) {
    console.log(err);
    return api.sendMessage("❌ Lỗi khi tạo sticker.", event.threadID);
  }
};