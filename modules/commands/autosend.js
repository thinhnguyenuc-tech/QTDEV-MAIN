const moment = require('moment-timezone');

module.exports.config = {
    name: 'autosend',
    version: '1.0.0',
    hasPermssion: 3,
    credits: 'qt',
    description: 'Tự động gửi tin nhắn theo giờ đã cài!',
    commandCategory: 'Admin',
    usages: 'Auto Send',
    cooldowns: 3,
    images: [],
};

const nam = [
    {
        timer: '06:00:00',
        message: ['Chúc mọi người buổi sáng vui vẻ 😉', 'Chúc mn buổi sáng vv ❤️', 'Buổi sáng đầy năng lượng nha các bạn 😙']
    },
    {
        timer: '10:00:00',
        message: ['Nấu cơm nhớ bật nút nha mọi người 😙']
    },
    {
        timer: '11:00:00',
        message: ['Cả sáng mệt mỏi rùi, nghỉ ngơi nạp năng lượng nào để kiếm xèng thue bot nào!! 😴']
    },
    {
        timer: '12:00:00',
        message: ['Chúc mọi người buổi trưa vui vẻ 😋', 'Chúc mọi người bữa trưa ngon miệng 😋']
    },
    {
        timer: '13:00:00',
        message: ['Chúc mọi người buổi chiều đầy năng lượng 😼', 'Chúc mọi người buổi chiều vui vẻ 🙌']
    },
    {
        timer: '17:00:00',
        message: ['Chuẩn bị nấu cơm thui nào 😋', 'Nấu cơm nhớ bật nút nha mọi người 😙']
    },
    {
        timer: '18:00:00',
        message: ['Chúc mọi người ăn tối vui vẻ 😊']
    },
    {
        timer: '19:30:00',
        message: ['Đến Giờ Học Bài Rồi Đó 📚']
    },
    {
        timer: '23:00:00',
        message: ['Đi Ngủ Thôi Mai Còn Đi Học 💤']
    },
    {
        timer: '00:30:00',
        message: ['Chúc mọi người ngủ ngon 😴', 'Khuya rùi ngủ ngon nhé các bạn 😇']
    }
];

module.exports.onLoad = o => setInterval(async () => {
    const r = a => a[Math.floor(Math.random() * a.length)];
    const currentTime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss');

    if (á = nam.find(i => i.timer === currentTime)) {
        const msg = {
            body: r(á.message)
        };
        global.data.allThreadID.forEach(i => o.api.sendMessage(msg, i));
    }
}, 1000);

module.exports.run = () => {};