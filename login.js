// login.js — tạo appstate.json cho bot Kurumi (bản dùng facebook-chat-api)
const login = require("facebook-chat-api");
const fs = require("fs");

// ⚠️ NHẬP EMAIL/SĐT và MẬT KHẨU của nick bot (nick phụ Facebook)
const email = "0377753513";
const password = "Thinhngan123";

// Bắt đầu đăng nhập
login({ email, password }, (err, api) => {
  if (err) {
    console.error("❌ Lỗi đăng nhập:", err);
    return;
  }

  // Lưu session vào appstate.json
  fs.writeFileSync("appstate.json", JSON.stringify(api.getAppState(), null, 2));
  console.log("✅ Đăng nhập thành công và đã tạo file appstate.json!");
});
