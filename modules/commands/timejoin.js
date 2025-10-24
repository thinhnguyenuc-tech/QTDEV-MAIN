exports.config = {
  name: 'timejoin',
  version: '0.0.1',
  hasPermssion: 0,
  credits: 'qt',
  description: 'Xem thời gian tham gia nhóm',
  commandCategory: 'Box Chat',
  usages: 'timejoin',
  cooldowns: 3,
  images: [],
};
let now = ()  =>  Date.now();
let link_avatar_fb = id  =>  `https://graph.facebook.com/${id}/picture?height=2000&width=2000&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
let stream_url = (url, ext)  =>  require('axios').get(url, {
  responseType: 'stream',
}).then(res  =>  {
    if (!!ext)  res.data.path = 'tmp.'  +  ext;

    return res.data;
});
let _0 = x  =>  x  <  10  ?  '0'  +  x  :  x;
let days_s = (_1, _2)  =>  Math.floor((_1  -  _2)  /  (1000  *  60  *  60  *  24));
let time_str = time  =>  (d  =>  `${_0(d.getHours())}:${_0(d.getMinutes())}:${_0(d.getSeconds())} - ${_0(d.getDate())}/${_0(d.getMonth()  +  1)}/${d.getFullYear()} (Thứ ${d.getDay()  ==  0  ?  'Chủ Nhật'  :  d.getDay()  +  1})`)(new Date(time));
let name = uid  =>  global.data.userName.get(uid);
let __ = l  =>  ''.repeat(l  ||  15);

const fs = require('fs');
const pathTimejoin = __dirname + "/data/timejoin.json";
const getTimeJoinData = () => {
  try {
    return JSON.parse(fs.readFileSync(pathTimejoin, 'utf8'));
  } catch (e) {
    return {};
  }
};
const saveTimeJoinData = (data) => {
  fs.writeFileSync(pathTimejoin, JSON.stringify(data, null, 2), 'utf8');
};

exports.run = async  (o)  => {
  let {
    threadID: tid,
    senderID: sid,
    messageID: mid,
    mentions,
    messageReply: msgr = {},
    participantIDs = [],
  } = o.event;
  let target_id = msgr.senderID || Object.keys(mentions)[0] || sid;
  let send = msg => o.api.sendMessage(msg, tid, mid);  
  if (!o.event.isGroup)  return send(`Chỉ Hoạt Động Trong Nhóm.`);
  
  let timejoinData = getTimeJoinData();
  if (Object.keys(timejoinData).length === 0)  return send(`⚠️ Database chưa có dữ liệu về thời gian all user tham gia nhóm, vui lòng thử lại`);
  
  if (o.args[0] == 'list')  {
    let thread = await o.Threads.getData(tid);
    let avatar_box = thread.threadInfo.imageSrc;
    let form_msg = {};
    if (!!avatar_box)  form_msg.attachment = await stream_url(avatar_box, 'jpg');
    const threadData = timejoinData[tid] || {};
    const perPage = 40;
    const page = parseInt(o.args[1]) || 1;
    const totalPages = Math.ceil(participantIDs.length / perPage);
    const idsPage = participantIDs.slice((page - 1) * perPage, page * perPage);
    form_msg.body = `[ Danh Sách Tham Gia Nhóm ]\n──────────────────\n${idsPage.map((id, ix)  =>  {
      const time_join_ = threadData[id] || now();
      return `${(ix + 1) + (page - 1) * perPage}. ${name(id)}\n⏰ Time Join: ${time_str(time_join_)}\n📜 Đã Tham Gia Được ${days_s(now(), time_join_)} Ngày\n${__()}`;
    }).join('\n')}\n${totalPages > 1 ? `• Page [${page}/${totalPages}]\nReply số trang vào tin nhắn này để xem tiếp!` : ''}`;
    return o.api.sendMessage(form_msg, tid, (err, info) => {
      if (totalPages > 1 && info) {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: o.event.senderID,
          type: 'page',
          participantIDs,
          pageSize: perPage,
          threadData
        });
      }
    });
  };

  let threadData = timejoinData[tid] || {};
  let time_join_ = threadData[target_id];

  if (!time_join_)  return send(`⚠️ Hiện tại chưa có dữ liệu về user này.`);

  let thread = await o.Threads.getData(tid);
  send({
    body: `[ Thời Gian Tham Gia Nhóm ]\n──────────────────\n👤 Tên: ${name(target_id)}\n👨‍💻 Nhóm: ${thread.threadInfo.threadName}\n⏰ Time Join: ${time_str(time_join_)}\n⏳ Tính Đến Hiện Tại Là Đã Qua ${days_s(now(), time_join_)} Ngày.\n\n📌 Dùng "!timejoin list" để thời gian tham gia của tất cả thành viên.`,
    attachment: await stream_url(link_avatar_fb(target_id), 'jpg'),
  });
};


exports.handleEvent = async o  => {
  if (!o.event.isGroup)  return;
  let {
    threadID: tid,
    participantIDs = [],
  } = o.event;
  let timejoinData = getTimeJoinData();
  if (!timejoinData[tid]) timejoinData[tid] = {};
  for (let id of participantIDs)  {
    if (!timejoinData[tid][id])  {
      timejoinData[tid][id] = now();
    }
  }
  saveTimeJoinData(timejoinData);
};

// Thêm handleReply để xử lý reply số trang
exports.handleReply = async function({ event, handleReply, api }) {
  if (event.senderID != handleReply.author) return;
  let page = 1;
  const match = event.body.trim().toLowerCase().match(/^page\s*(\d+)$/);
  if (match) {
    page = parseInt(match[1]);
  } else {
    page = parseInt(event.body);
  }
  if (isNaN(page) || page < 1) return;
  const { participantIDs, pageSize, threadData } = handleReply;
  const totalPages = Math.ceil(participantIDs.length / pageSize);
  if (page > totalPages) return api.sendMessage(`Chỉ có ${totalPages} trang!`, event.threadID, event.messageID);
  const idsPage = participantIDs.slice((page - 1) * pageSize, page * pageSize);
  let msg = `[ Danh Sách Tham Gia Nhóm ]\n──────────────────\n${idsPage.map((id, ix)  =>  {
    const time_join_ = threadData[id] || now();
    return `${(ix + 1) + (page - 1) * pageSize}. ${name(id)}\n⏰ Time Join: ${time_str(time_join_)}\n📜 Đã Tham Gia Được ${days_s(now(), time_join_)} Ngày\n${__()}`;
  }).join('\n')}\n• Page [${page}/${totalPages}]\nReply số trang vào tin nhắn này để xem tiếp!`;
  api.sendMessage(msg, event.threadID, event.messageID);
};