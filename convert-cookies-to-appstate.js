// convert-cookies-to-appstate.js
// Node.js script: đọc cookies.json (xuất từ C3C hoặc DevTools đã chuyển thành JSON)
// và tạo appstate.json với cấu trúc { key, value, domain, path, hostOnly, creation, lastAccessed }

const fs = require('fs');
const path = require('path');

const inputFile = path.resolve(__dirname, 'cookies.json'); // input: cookies exported
const outputFile = path.resolve(__dirname, 'appstate.json');

if (!fs.existsSync(inputFile)) {
  console.error('❌ Không tìm thấy cookies.json. Vui lòng xuất cookie từ C3C/DevTools và lưu thành cookies.json trong cùng thư mục.');
  process.exit(1);
}

let raw = fs.readFileSync(inputFile, 'utf8');
let cookies;
try {
  cookies = JSON.parse(raw);
} catch (e) {
  console.error('❌ cookies.json không phải JSON hợp lệ. Hãy đảm bảo file có dạng mảng JSON.');
  console.error(e.message);
  process.exit(1);
}

const nowISO = new Date().toISOString();

const appstate = cookies.map(c => {
  const key = c.key || c.name || c.Name || c.Key;
  const value = c.value || c.Value || '';
  const domain = c.domain || c.Domain || (c.host ? c.host : 'facebook.com');
  const pathVal = c.path || c.Path || '/';
  const hostOnly = (typeof c.hostOnly === 'boolean') ? c.hostOnly : false;

  return {
    key: String(key),
    value: String(value),
    domain: String(domain),
    path: String(pathVal),
    hostOnly: !!hostOnly,
    creation: c.creation || nowISO,
    lastAccessed: c.lastAccessed || nowISO
  };
});

fs.writeFileSync(outputFile, JSON.stringify(appstate, null, 2), 'utf8');
console.log('✅ Đã tạo appstate.json với', appstate.length, 'cookie(s).');
console.log('📄 File:', outputFile);
