const fs = require('fs');
const axios = require('axios');
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports.config = {
  name: "adc",
  version: "1.0.0",
  hasPermssion: 3,
  credits: "qt",
  description: "Upload code hoặc sharefile",
  commandCategory: "Admin",
  usages: "adc [link] or [file]",
  cooldowns: 5,
  usePrefix: false
};

module.exports.run = async function({ api: a, event: e, args: r }) {
  const { threadID: t, messageID: m, messageReply: mr, senderID: s } = e;
  if (s != 100051439970359) return a.sendMessage("???", t, m);
    const n = r[0];
    let text = mr ? mr.body : null;
    if (!text && !n) {
      return a.sendMessage('⚠️ Vui lòng reply link muốn áp dụng code hoặc ghi tên file để up code trả về raw!', t, m);
    }
    if (n && !text) {
        const path = join(__dirname, `${n}.js`);
      if (!fs.existsSync(path)) {
    return a.sendMessage(`❎ Lệnh ${n} không tồn tại!`, t, m);
  }

    try {
      const content = fs.readFileSync(path, 'utf8');
      const uuid = uuidv4();
      const editUrl = `https://qt-dev.vercel.app/api/note/${uuid}`;
      const rawUrl = `${editUrl}?raw=true`;

      await axios.put(editUrl, content, {
        headers: { 'content-type': 'text/plain; charset=utf-8' }
      });

      return a.sendMessage(`${rawUrl}`, t, m);
    } catch (err) {
      return a.sendMessage(`❌ Lỗi khi upload code:\n${err.message}`, t, m);
    }
    }

    const urlR = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
      const url = text.match(urlR);
      if (url) {
        try {
          const res = await axios.get(url[0]);
          fs.writeFile(join(__dirname, `${n}.js`), res.data, 'utf-8', (err) => {
            if (err) {
              return a.sendMessage(`❎ Đã xảy ra lỗi khi áp dụng code vào ${n}.js`, t, m);
            }
            return a.sendMessage(`✅ Đã áp dụng code vào ${n}.js, sử dụng load để cập nhật modules mới!`, t, m);
          });
        } catch (error) {
          return a.sendMessage('❎ Đã xảy ra lỗi khi tải dữ liệu từ URL!', t, m);
        }
        return;
      }
      return a.sendMessage('⚠️ Không nhận diện được yêu cầu của bạn. Vui lòng kiểm tra lại!', t, m);
    };