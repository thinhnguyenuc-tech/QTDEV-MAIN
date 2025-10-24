const axios = require('axios');

module.exports.config = {
  name: "info",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "qt",
  description: "Xem thông tin người dùng Facebook",
  commandCategory: "Thông Tin",
  usages: "[uid/reply/tag]",
  cooldowns: 3,
};

module.exports.run = async function ({ api, event, args }) {
  let uid;
  if (Object.keys(event.mentions).length > 0) {
    uid = Object.keys(event.mentions)[0];
  } else if (event.type == "message_reply") {
    uid = event.messageReply.senderID;
  } else if (args[0]) {
    uid = await api.getUID(args[0]);
  } else {
    uid = event.senderID;
  }

  const apikey = "apikeysumi";
  const url = `https://adidaphat.site/facebook/getinfov2?uid=${uid}&apikey=${apikey}`;

  try {
    api.setMessageReaction("⌛", event.messageID, () => { }, true);
    const res = await axios.get(url);
    const data = res.data;
    if (!data) return api.sendMessage("❎ Không tìm thấy thông tin!", event.threadID, event.messageID);
    let msg = `👤 Thông tin Facebook:\n\n`;
    msg += `• Tên: ${data.name || "Không công khai"}\n`;
    msg += `• Username: ${data.username || "Không có"}\n`;
    msg += `• Mô tả work: ${data.work?.find(i => i.description)?.description || "Không rõ"}\n`;
    msg += `• Đã xác minh: ${(data.is_verified === true) ? "Có" : (data.is_verified === false ? "Không" : "Không công khai")}\n`;
    msg += `• Làm việc tại: ${data.work?.[0]?.employer?.name || "Không công khai"}\n`;
    msg += `• Học tại: ${data.education?.[0]?.school?.name || "Không công khai"}\n`;
    msg += `• Giới tính: ${data.gender || "Không công khai"}\n`;
    msg += `• Ngày sinh: ${data.birthday || "Không công khai"}\n`;
    msg += `• Quê quán: ${data.hometown?.name || "Không công khai"}\n`;
    msg += `• Nơi ở: ${data.location?.name || "Không công khai"}\n`;
    msg += `• Mối quan hệ: ${data.relationship_status || "Không công khai"}${data.significant_other ? ` với ${data.significant_other.name} (https://facebook.com/${data.significant_other.id})` : ""}\n`;
    msg += `• Số bạn bè: ${data.friends || "Không công khai"}\n`;
    msg += `• Số người theo dõi: ${data.subscribers?.summary?.total_count?.toLocaleString() || "Không công khai"}\n`;
    msg += `• Link Facebook: ${data.link}\n`;
    msg += `\n• Cập nhật lần cuối: ${data.updated_time ? new Date(data.updated_time).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : "Không công khai"}`;
    msg += `\n\n👉 Thả cảm xúc vào tin nhắn này để xem bài viết gần nhất của người dùng!`;
    let avatarUrl = data.avatar;
    if (!avatarUrl) {
      avatarUrl = `https://graph.facebook.com/${uid}/picture?width=1500&height=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    }
    try {
      const imgRes = await axios.get(avatarUrl, { responseType: 'stream' });
      api.setMessageReaction("✅", event.messageID, () => { }, true);
      return api.sendMessage({ body: msg, attachment: imgRes.data }, event.threadID, (err, info) => {
        if (!err && info) {
          if (!global.client.handleReaction) global.client.handleReaction = [];
          global.client.handleReaction.push({ name: this.config.name, messageID: info.messageID, uid });
        }
      });
    } catch (e) {
      api.setMessageReaction("✅", event.messageID, () => { }, true);
      return api.sendMessage(msg, event.threadID, (err, info) => {
        if (!err && info) {
          if (!global.client.handleReaction) global.client.handleReaction = [];
          global.client.handleReaction.push({ name: this.config.name, messageID: info.messageID, uid });
        }
      });
    }
  } catch (e) {
    api.setMessageReaction("❌", event.messageID, () => { }, true);
    return api.sendMessage("Lỗi khi lấy thông tin Facebook qua API", event.threadID, event.messageID);
  }
};

module.exports.handleReaction = async function ({ api, event, handleReaction }) {
  try {
    const uid = handleReaction.uid;
    const apikey = "apikeysumi";
    const url = `https://adidaphat.site/facebook/getinfov2?uid=${uid}&apikey=${apikey}`;
    const res = await axios.get(url);
    const data = res.data;

    if (!data || !data.posts || !Array.isArray(data.posts.data) || data.posts.data.length === 0) {
      return api.sendMessage("Người dùng này không có bài viết công khai nào!", event.threadID, event.messageID);
    }

    const post = data.posts.data[0];
    let msg = `📝 Bài viết gần nhất của ${data.name || 'người dùng'}:\n\n`;
    if (post.message) msg += `"${post.message}"\n`;
    if (post.permalink_url) msg += `🔗 Link: ${post.permalink_url}\n`;
    if (post.created_time) msg += `🕒 Thời gian: ${new Date(post.created_time).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n`;

    if (post.comments?.data?.length > 0) {
      const topComments = post.comments.data
        .filter(cmt => cmt.message && cmt.from?.name)
        .sort((a, b) => b.like_count - a.like_count)
        .slice(0, 3);
      if (topComments.length > 0) {
        msg += '\n💬 Top bình luận nổi bật:';
        topComments.forEach((cmt, idx) => {
          msg += `\n${idx + 1}. ${cmt.from.name}: ${cmt.message} (${cmt.like_count} 👍)`;
        });
      }
    }
    const attachments = [];
    if (post.type === 'video' && post.source) {
      try {
        const videoRes = await axios.get(post.source, { responseType: 'stream' });
        attachments.push(videoRes.data);
      } catch (err) {
        console.error(`Không tải được video: ${err.message}`);
      }
    } else {
      if (post.picture) {
        try {
          let highResPic = post.picture.replace(/([sp])\\d+x\\d+/g, '$1720x720');
          const imgRes = await axios.get(highResPic, { responseType: 'stream' });
          attachments.push(imgRes.data);
        } catch (err) {
          console.error(`Không tải được ảnh đại diện bài viết: ${err.message}`);
        }
      }
      if (post.attachments?.data?.length > 0) {
        for (const item of post.attachments.data) {
          const imgUrl = item.media?.image?.src;
          if (imgUrl) {
            try {
              const imgRes = await axios.get(imgUrl, { responseType: 'stream' });
              attachments.push(imgRes.data);
            } catch (err) {
              console.error(`Không tải được ảnh ${imgUrl}: ${err.message}`);
            }
          }
        }
      }
    }
    return api.sendMessage({ body: msg, attachment: attachments }, event.threadID, event.messageID);
  } catch (e) {
    console.error(e);
    return api.sendMessage("Đã xảy ra lỗi khi lấy bài viết gần nhất!", event.threadID, event.messageID);
  }
};