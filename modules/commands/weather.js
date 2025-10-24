const axios = require('axios');

module.exports.config = {
  name: 'weather',
  version: '2.0.0',
  hasPermission: 0,
  credits: "qt",
  description: 'Xem thời tiết hiện tại và dự báo chi tiết',
  commandCategory: 'Thông Tin',
  usages: '<tên thành phố>',
  cooldowns: 3,
};

module.exports.run = async ({ api, event, args }) => {
  const location = args.join(" ");
if (!location) {
  return api.sendMessage("❗ Vui lòng nhập tên địa điểm để xem thời tiết.\nVí dụ: !weather Hà Nội", event.threadID, event.messageID);
}
  const apiKey = 'e7c190ccc3217d6223083b4848761871';
  const urlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric&lang=vi`;
  const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric&lang=vi`;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(urlCurrent),
      axios.get(urlForecast)
    ]);

    const current = currentRes.data;
    const forecastData = forecastRes.data;
    const now = new Date();
    const weekday = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'][now.getDay()];
    const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;

    const desc = current.weather[0].description;
    const temp = current.main.temp;
    const humidity = current.main.humidity;
    const wind = current.wind.speed;
    const city = `${current.name}, ${current.sys.country}`;

    // Tìm thống kê hôm nay
    const grouped = {};
    forecastData.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(item);
    });
    const todayDateStr = now.toISOString().split('T')[0];
    const todayForecast = grouped[todayDateStr];
    let detailedToday = '';

    if (todayForecast) {
      const periods = {
        'Sáng': todayForecast.filter(i => i.dt_txt.includes("06:00") || i.dt_txt.includes("09:00")),
        'Trưa': todayForecast.filter(i => i.dt_txt.includes("12:00")),
        'Chiều': todayForecast.filter(i => i.dt_txt.includes("15:00") || i.dt_txt.includes("18:00")),
        'Tối': todayForecast.filter(i => i.dt_txt.includes("21:00")),
      };

      detailedToday += `\n\n🕒 Thống kê khung giờ hôm nay:\n`;
      for (const [label, block] of Object.entries(periods)) {
        if (block.length === 0) continue;
        const info = block[0];
        detailedToday += `  • ${label}: ${info.weather[0].description}, ${info.main.temp}°C, ẩm ${info.main.humidity}%, gió ${info.wind.speed} m/s\n`;
      }
    }

    const message =
`✅ Thời tiết hôm nay ${weekday}, ngày ${dateStr} tại ${city}:
🗺️ Tình trạng: ${desc.charAt(0).toUpperCase() + desc.slice(1)}
🌡 Nhiệt độ: ${temp}°C
♒ Độ ẩm: ${humidity}%
💨 Gió: ${wind} m/s${detailedToday}

Thả cảm xúc ❤️ để xem dự báo chi tiết cho 3 ngày tới theo từng buổi.`;

    api.sendMessage(message, event.threadID, (err, info) => {
      global.client.handleReaction.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID,
        forecastData,
        location: city
      });
    });

  } catch (error) {
    console.error(error);
    return api.sendMessage("Không lấy được dữ liệu thời tiết. Kiểm tra lại tên địa điểm hoặc API.", event.threadID);
  }
};

module.exports.handleReaction = async ({ api, event, handleReaction }) => {
  if (event.userID !== handleReaction.author) return;
  if (event.reaction !== "❤") return;

  const { forecastData, location } = handleReaction;
  const grouped = {};

  forecastData.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });

  const days = Object.keys(grouped).slice(0, 3);
  let message = `Dự báo chi tiết trong 3 ngày tới tại ${location}:\n\n`;

  for (let i = 0; i < days.length; i++) {
    const date = days[i];
    const items = grouped[date];

    const temps = items.map(i => i.main.temp);
    const humidities = items.map(i => i.main.humidity);
    const winds = items.map(i => i.wind.speed);
    const rains = items.map(i => i.pop * 100);
    const descs = items.map(i => i.weather[0].description);

    const minTemp = Math.min(...temps).toFixed(1);
    const maxTemp = Math.max(...temps).toFixed(1);
    const avgHum = (humidities.reduce((a, b) => a + b) / humidities.length).toFixed(0);
    const avgWind = (winds.reduce((a, b) => a + b) / winds.length).toFixed(1);
    const avgRain = (rains.reduce((a, b) => a + b) / rains.length).toFixed(0);
    const commonDesc = descs.sort((a, b) =>
      descs.filter(v => v === a).length - descs.filter(v => v === b).length
    ).pop();

    const summary =
      commonDesc.includes('nắng') ? 'Trời chủ yếu nắng.' :
      commonDesc.includes('mưa') ? 'Có mưa trong ngày.' :
      commonDesc.includes('mây') ? 'Trời nhiều mây, dịu mát.' : 'Trạng thái thời tiết thay đổi.';

    const [year, month, day] = date.split('-');

    message += `${i + 1}. Ngày ${day}/${month}/${year}:\n`;
    message += `🗺️ Thời tiết: ${commonDesc}\n`;
    message += `🌡 Nhiệt độ: ${minTemp}°C ➝ ${maxTemp}°C\n`;
    message += `♒ Độ ẩm TB: ${avgHum}% | 💨 Gió TB: ${avgWind} m/s\n`;
    message += `🌧 Mưa TB: ${avgRain}%\n`;
    message += `📌 Tóm tắt: ${summary}\n`;

    const periods = {
      'Sáng': items.filter(i => i.dt_txt.includes("06:00") || i.dt_txt.includes("09:00")),
      'Trưa': items.filter(i => i.dt_txt.includes("12:00")),
      'Chiều': items.filter(i => i.dt_txt.includes("15:00") || i.dt_txt.includes("18:00")),
      'Tối': items.filter(i => i.dt_txt.includes("21:00")),
    };

    for (const [label, block] of Object.entries(periods)) {
      if (block.length === 0) continue;
      const info = block[0];
      message += `  ⏰ ${label}: ${info.weather[0].description}, ${info.main.temp}°C, độ ẩm ${info.main.humidity}%, gió ${info.wind.speed} m/s\n`;
    }

    message += `\n`;
  }

  return api.sendMessage(message.trim(), event.threadID);
};
