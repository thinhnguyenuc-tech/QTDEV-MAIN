const fs = require("fs");

// Đọc cookies gốc
const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));

// Nếu cookie không có "name", cố gắng lấy từ trường khác
const appstate = cookies.map((cookie, index) => {
  let keyName = cookie.name || cookie.key || `cookie_${index}`;
  return {
    key: keyName,
    value: cookie.value
  };
});

// Ghi file appstate.json
fs.writeFileSync("appstate.json", JSON.stringify(appstate, null, 2), "utf8");

console.log("✅ Đã tạo appstate.json có key và value đầy đủ!");
