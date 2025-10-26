// merge-cookies.js
// Dùng để merge cookie (datr, presence, ps_l, ps_n, sb, ...) vào appstate.json
// Cách dùng:
// 1) Chuẩn bị file cookies_extra.txt hoặc cookies_extra.json trong cùng thư mục
// 2) Chạy: node merge-cookies.js

const fs = require('fs');
const path = require('path');

const APPSTATE = path.join(__dirname, 'appstate.json');
const BACKUP = path.join(__dirname, 'appstate.backup.json');
const EXTRA_TXT = path.join(__dirname, 'cookies_extra.txt');
const EXTRA_JSON = path.join(__dirname, 'cookies_extra.json');

function loadAppState() {
  if (!fs.existsSync(APPSTATE)) return [];
  try {
    return JSON.parse(fs.readFileSync(APPSTATE, 'utf8'));
  } catch (e) {
    console.error('Không thể đọc appstate.json:', e.message);
    process.exit(1);
  }
}

function saveAppState(arr) {
  fs.writeFileSync(APPSTATE, JSON.stringify(arr, null, 2), 'utf8');
}

function parseTabLines(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const out = [];
  for (const line of lines) {
    const parts = line.split(/\t+/);
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const value = parts[1].trim();
      if (name && value) out.push({ name, value });
    } else {
      const sp = line.split(/\s+/);
      if (sp.length >= 2) out.push({ name: sp[0].trim(), value: sp[1].trim() });
    }
  }
  return out;
}

function parseExtra() {
  if (fs.existsSync(EXTRA_JSON)) {
    try {
      const raw = fs.readFileSync(EXTRA_JSON, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(p => ({ name: p.name, value: p.value }));
    } catch (e) {
      console.warn('cookies_extra.json không parse được:', e.message);
    }
  }
  if (fs.existsSync(EXTRA_TXT)) {
    const raw = fs.readFileSync(EXTRA_TXT, 'utf8');
    if (raw.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(p => ({ name: p.name, value: p.value }));
      } catch (e) {}
    }
    return parseTabLines(raw);
  }
  console.error('Không tìm thấy cookies_extra.txt hoặc cookies_extra.json trong thư mục.');
  process.exit(1);
}

function ensureEntry(appStateArr, cookie) {
  const idx = appStateArr.findIndex(e => e.key === cookie.name);
  const now = new Date().toISOString();
  const entry = {
    key: cookie.name,
    value: cookie.value,
    domain: 'facebook.com',
    path: '/',
    hostOnly: false,
    creation: now,
    lastAccessed: now
  };
  if (idx >= 0) {
    const existing = appStateArr[idx];
    existing.value = entry.value;
    existing.lastAccessed = now;
  } else {
    appStateArr.push(entry);
  }
}

(function main() {
  const extra = parseExtra();
  if (!extra.length) {
    console.error('Không có cookie nào hợp lệ trong file bổ sung.');
    process.exit(1);
  }

  if (fs.existsSync(APPSTATE)) {
    fs.copyFileSync(APPSTATE, BACKUP);
    console.log('🔹 Đã tạo backup appstate.backup.json');
  }

  const app = loadAppState();
  for (const c of extra) {
    ensureEntry(app, c);
    console.log(`✅ Đã thêm hoặc cập nhật cookie: ${c.name}`);
  }

  saveAppState(app);
  console.log('🎉 Hoàn tất: appstate.json đã được cập nhật.');
})();
