const fs = require("fs");
const cookies = require("./cookies.json");

const appState = cookies.map(c => ({
    key: c.name,
    value: c.value,
    domain: c.domain
}));

fs.writeFileSync("appstate.json", JSON.stringify(appState, null, 4));
console.log("✅ Đã tạo appstate.json chuẩn!");
