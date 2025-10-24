const moment = require('moment-timezone');
const weather = require('weather-js');

module.exports.config = {
    name: 'autoweather',
    version: '1.0.0',
    hasPermission: 3,
    credits: 'qt',
    description: 'Tự động gửi thông tin thời tiết',
    commandCategory: 'Tiện Ích',
    usages: 'Auto Thời Tiết',
    cooldowns: 3,
    images: [],
};

const findWeather = (city, degreeType = 'C') => {
    return new Promise((resolve, reject) => {
        weather.find({
            search: city,
            degreeType
        }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const weatherTimers = [
    {
        timer: '05:00:00',
        message: ['\n{thoitiet}']
    },
    {
        timer: '12:30:00',
        message: ['\n{thoitiet}']
    },
    {
        timer: '19:00:00',
        message: ['\n{thoitiet}']
    },
    {
        timer: '23:30:00',
        message: ['\n{thoitiet}']
    }
];

module.exports.onLoad = o => setInterval(async () => {
    const currentTime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss');
    const timer = weatherTimers.find(i => i.timer === currentTime);

    if (timer) {
        const gio = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || DD/MM/YYYY');
        const tinh = [
            "Bắc Ninh", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Hải Dương", "Hà Nội",
            "Quảng Ninh", "Thái Bình", "Nam Định", "Ninh Bình", "Thái Nguyên", "Phú Thọ", "Vĩnh Phúc",
            "Bắc Giang", "Lạng Sơn", "Quảng Bình", "Quảng Trị", "Thừa Thiên Huế", "Quảng Nam", "Quảng Ngãi",
            "Bình Định", "Phú Yên", "Khánh Hòa", "Ninh Thuận", "Bình Thuận", "Kon Tum", "Gia Lai", "Đắk Lắk",
            "Đắk Nông", "Lâm Đồng", "Bình Phước", "Tây Ninh", "Bình Dương", "Đồng Nai", "Long An", "Đồng Tháp",
            "Tiền Giang", "An Giang", "Bà Rịa - Vũng Tàu", "Bến Tre", "Bạc Liêu", "Cà Mau", "Hậu Giang",
            "Kiên Giang", "Sóc Trăng", "Trà Vinh", "Vĩnh Long", "Thanh Hóa"
        ];

        const city = tinh[Math.floor(Math.random() * tinh.length)];
        const result = await findWeather(city);
        
        var skytext = result[0].current.skytext.toString();
        "Cloudy" == skytext ? skytext = "Mây" : 
        "Sunny" == skytext ? skytext = "Nắng" : 
        "Partly Cloudy" == skytext ? skytext = "Mây một phần" : 
        "Mostly Cloudy" == skytext ? skytext = "Mây rất nhiều" : 
        "Rain" == skytext ? skytext = "Mưa" : 
        "Thunderstorm" == skytext ? skytext = "Bão" : 
        "Snow" == skytext ? skytext = "Tuyết" : 
        "Fog" == skytext || "Haze" == skytext ? skytext = "Sương mù" : 
        "Clear" == skytext ? skytext = "Trời trong" : 
        "Light Rain" == skytext ? skytext = "Mưa nhẹ" : 
        "Mostly Clear" == skytext && (skytext = "Trời trong rất nhiều");

        var winddisplay = result[0].current.winddisplay.toString().split(" ")[2];
        "Northeast" == winddisplay && (winddisplay = "Hướng Đông Bắc");
        "Northwest" == winddisplay && (winddisplay = "Hướng Tây Bắc");
        "Southeast" == winddisplay && (winddisplay = "Hướng Đông Nam");
        "Southwest" == winddisplay && (winddisplay = "Hướng Tây Nam");
        "East" == winddisplay && (winddisplay = "Hướng Đông");
        "West" == winddisplay && (winddisplay = "Hướng Tây");
        "North" == winddisplay && (winddisplay = "Hướng Bắc");
        "South" == winddisplay && (winddisplay = "Hướng Nam");

        var thoitiet = `(~~[ ${gio} ]~~)\n──────────────────\n[🗺️] →⁠ Cập nhật thời tiết tại: ${result[0].location.name}\n[🌡] →⁠ Nhiệt độ: ${result[0].current.temperature}°${result[0].location.degreetype}\n[✏️] →⁠ Mô tả: ${skytext}\n[♒] →⁠ Độ ẩm: ${result[0].current.humidity}%\n[💨] →⁠ Hướng gió: ${result[0].current.windspeed} ${winddisplay}\n[⏰] →⁠ Ghi nhận vào: ${result[0].current.observationtime}\n[🗺️] →⁠ Từ trạm ${result[0].current.observationpoint}\n──────────────────\n🔄 Đây Là Tin Nhắn Tự Động`;

        const msg = {
            body: thoitiet
        };

        global.data.allThreadID.forEach(i => o.api.sendMessage(msg, i));
    }
}, 1000);

module.exports.run = () => {}; 