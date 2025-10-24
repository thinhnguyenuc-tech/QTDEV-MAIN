const { readdirSync, readFileSync, writeFileSync, existsSync } = require("fs-extra");
const { resolve } = require("path");

module.exports.config = {
    name: "admin",
    version: "1.0.6",
    hasPermssion: 0,
    credits: "qt", // qtdzs1tg newbie
    description: "Quản lý cấu hình Admin",
    commandCategory: "QTV",
    usages: "< list/add/remove/addntb/delntb/qtvonly/only/ntbonly/ibrieng >",
    cooldowns: 2,
    dependencies: {
        "fs-extra": ""
    }
};

module.exports.languages = {
    "vi": {
        "listAdmin": `=== [ ADMIN BOT ] ===\n━━━━━━━━━━━━━━━━━━\n%1\n\n\n=== [ NGƯỜI THUÊ BOT ] ===\n━━━━━━━━━━━━━━━━━━\n%2\n\nReply số thứ tự để xóa đối tượng tương ứng.`,
        "notHavePermssion": '[ ADMIN ] → Bạn không đủ quyền hạn để có thể sử dụng chức năng "%1"',
        "addedSuccess": '[ ADMIN ] → Đã thêm %1 người dùng trở thành %2:\n\n%3',
        "removedSuccess": '[ ADMIN ] → Đã gỡ vai trò %1 của %2 người dùng:\n\n%3',
        "removedByIndex": '[ ADMIN ] → Đã gỡ thành công %1:\n%2',
        "invalidIndex": '[ ADMIN ] → Số thứ tự không hợp lệ!'
    }
};

module.exports.onLoad = function() {
    const pathData = resolve(__dirname, 'data', 'dataAdbox.json');
    if (!existsSync(pathData)) {
        const obj = {
            adminbox: {}
        };
        writeFileSync(pathData, JSON.stringify(obj, null, 4));
    }
};

module.exports.handleReply = async function({ api, event, handleReply, getText, Users }) {
    const { threadID, messageID, senderID, body } = event;
    const { configPath } = global.client;
    const config = require(configPath);

    
    if (!config.ADMINBOT.includes(senderID)) {
        return api.sendMessage("⚠️ Chỉ ADMIN BOT mới có quyền thực hiện thao tác này!", threadID, messageID);
    }

    const index = parseInt(body);
    if (isNaN(index)) return api.sendMessage(getText("invalidIndex"), threadID, messageID);

    let targetArray, targetIndex, roleText;
    const adminLength = config.ADMINBOT.length;

    if (index <= adminLength) {
        targetArray = config.ADMINBOT;
        targetIndex = index - 1;
        roleText = "ADMIN BOT";
    } else {
        targetArray = config.NDH;
        targetIndex = index - adminLength - 1;
        roleText = "NGƯỜI THUÊ BOT";
    }

    if (targetIndex < 0 || targetIndex >= targetArray.length) {
        return api.sendMessage(getText("invalidIndex"), threadID, messageID);
    }

    const removedUID = targetArray[targetIndex];
    const name = await Users.getNameUser(removedUID);

    
    targetArray.splice(targetIndex, 1);

    
    writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');

    return api.sendMessage(
        getText("removedByIndex", roleText, `${removedUID} - ${name}`),
        threadID,
        messageID
    );
};

module.exports.run = async function({ api, event, args, Users, permssion, getText }) {
    const { threadID, messageID, mentions, senderID } = event;
    const { configPath } = global.client;
    const config = require(configPath);
    const mention = Object.keys(mentions);
    
    if (!args[0]) {
        return api.sendMessage(
            `=== [ Hướng Dẫn ] ===\n━━━━━━━━━━━━━━━━━━\n\n` +
            `→ admin list: Xem danh sách admin và người thuê bot\n` +
            `→ admin add: Thêm admin bot\n` +
            `→ admin remove: Gỡ admin bot\n` +
            `→ admin addntb: Thêm người thuê bot\n` +
            `→ admin delntb: Gỡ người thuê bot\n` +
            `→ admin qtvonly: Bật/tắt chế độ QTV\n` +
            `→ admin only: Bật/tắt chế độ Admin\n` +
            `→ admin ntbonly: Bật/tắt chế độ chỉ Người Thuê Bot\n` +
            `→ admin ibrieng: Bật/tắt chat riêng\n\n` +
            `━━━━━━━━━━━━━━━━━━`,
            threadID, messageID
        );
    }

    const getUids = async (type) => {
        let uids = [];
        if (event.type === "message_reply") {
            uids.push(event.messageReply.senderID);
        } else if (mention.length > 0) {
            uids = mention;
        } else if (args[1] && !isNaN(args[1])) {
            uids.push(args[1]);
        }
        return uids;
    };

    const addUsers = async (uids, type) => {
        const added = [];
        for (const uid of uids) {
            const name = global.data.userName.get(uid) || await Users.getNameUser(uid);
             if (type === "ADMIN" && !global.config.ADMINBOT.includes(uid)) {
            global.config.ADMINBOT.push(uid);
            added.push(`${uid} - ${name}`);
        } else if (type === "NDH" && !global.config.NDH.includes(uid)) {
            global.config.NDH.push(uid);
            added.push(`${uid} - ${name}`);
        }
    }

    return added;
};

    const removeUsers = async (uids, type) => {
        const removed = [];
        for (const uid of uids) {
            const name = global.data.userName.get(uid) || await Users.getNameUser(uid);
            if (type === "ADMIN") {
                const index = config.ADMINBOT.indexOf(uid);
                if (index !== -1) {
                    config.ADMINBOT.splice(index, 1);
                    global.config.ADMINBOT.splice(global.config.ADMINBOT.indexOf(uid), 1);
                    removed.push(`${uid} - ${name}`);
                }
            } else if (type === "NDH") {
                const index = config.NDH.indexOf(uid);
                if (index !== -1) {
                    config.NDH.splice(index, 1);
                    global.config.NDH.splice(global.config.NDH.indexOf(uid), 1);
                    removed.push(`${uid} - ${name}`);
                }
            }
        }
        return removed;
    };
    
    switch (args[0]) {
    case "list": {
    let adminList = [], ndhList = [];
    let count = 1;

    for (const id of config.ADMINBOT) {
        const name = global.data.userName.get(id) || await Users.getNameUser(id);
        adminList.push(`${count++}. ${name}\n→ ID: ${id}`);
    }

    for (const id of config.NDH) {
        const name = global.data.userName.get(id) || await Users.getNameUser(id);
        ndhList.push(`${count++}. ${name}\n→ ID: ${id}`);
    }

    return api.sendMessage(
        getText("listAdmin", adminList.join("\n\n"), ndhList.join("\n\n")),
        threadID,
        (error, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID  
            });
        },
        messageID
    );
}
             
        case "add": {
            if (permssion !== 3) return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);
            const uids = await getUids("ADMIN");
            const added = await addUsers(uids, "ADMIN");
            if (added.length > 0) {
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("addedSuccess", added.length, "ADMIN BOT", added.join("\n")), threadID, messageID);
            }
            break;
        }

        case "addntb": {
            if (permssion !== 3) return api.sendMessage(getText("notHavePermssion", "addndh"), threadID, messageID);
            const uids = await getUids("NDH");
            const added = await addUsers(uids, "NDH");
            if (added.length > 0) {
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("addedSuccess", added.length, "NGƯỜI THUÊ BOT", added.join("\n")), threadID, messageID);
            }
            break;
        }

        case "r":
        case "remove": {
            if (permssion !== 3) return api.sendMessage(getText("notHavePermssion", "remove"), threadID, messageID);
            const uids = await getUids("ADMIN");
            const removed = await removeUsers(uids, "ADMIN");
            if (removed.length > 0) {
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedSuccess", "ADMIN BOT", removed.length, removed.join("\n")), threadID, messageID);
            }
            break;
        }

        case "delntb": {
            if (permssion !== 3) return api.sendMessage(getText("notHavePermssion", "removendh"), threadID, messageID);
            const uids = await getUids("NDH");
            const removed = await removeUsers(uids, "NDH");
            if (removed.length > 0) {
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedSuccess", "NGƯỜI THUÊ BOT", removed.length, removed.join("\n")), threadID, messageID);
            }
            break;
        }

        case "qtvonly": {
            const pathData = resolve(__dirname, 'data', 'dataAdbox.json');
            const database = require(pathData);
            if (permssion < 1) return api.sendMessage("[ ADMIN ] → Cần quyền Quản trị viên trở lên", threadID, messageID);
            
            database.adminbox[threadID] = !database.adminbox[threadID];
            writeFileSync(pathData, JSON.stringify(database, null, 4));
            
            return api.sendMessage(
                `[ ADMIN ] → ${database.adminbox[threadID] ? 
                    "Bật chế độ QTV Only thành công" : 
                    "Tắt chế độ QTV Only thành công"}`,
                threadID, messageID
            );
        }

        case "only": {
          if (event.senderID != 100051439970359) return api.sendMessage("Quyền lồn biên giới?", event.threadID, event.messageID);
            if (config.adminOnly == false) {
                config.adminOnly = true;
                api.setMessageReaction("✅",event.messageID, () => {}, true);
            } else {
                config.adminOnly = false;
                api.setMessageReaction("✅", event.messageID, () => {} , true);
            }
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                break;
        }

        case "ntbonly": {
          if (permssion < 2) return api.sendMessage("[ NTB ONLY ] → Cần quyền Người Thuê Bot để thực hiện", threadID, messageID);
            if (config.ndhOnly == false) {
                config.ndhOnly = true;
                api.sendMessage("[ NTB ONLY ] → Bật thành công chế độ chỉ Người Thuê Bot dùng", threadID, messageID);
            } else {
                config.ndhOnly = false;
                api.sendMessage("[ NTB ONLY ] → Tắt thành công chế độ chỉ Người Thuê Bot dùng", threadID, messageID);
            }
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                break;
            }            

        case "ibrieng": {
          if (event.senderID != 100051439970359) return api.sendMessage("Quyền lồn biên giới?", event.threadID, event.messageID);
            if (config.adminPaseOnly == false) {
                config.adminPaseOnly = true;
                api.sendMessage("[ ADMIN ] → Bật thành công chế độ chat riêng", threadID, messageID);
                api.setMessageReaction("✅",event.messageID, () => {}, true);
            } else {
                config.adminPaseOnly = false;
                api.sendMessage("[ ADMIN ] → Tắt thành công chế độ chat riêng", threadID, messageID);
                api.setMessageReaction("✅", event.messageID, () => {} , true);
            }
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                break;
        }

        default: {
            return api.sendMessage("→ Lệnh không hợp lệ! Gõ 'admin' để xem hướng dẫn", threadID, messageID);
        }
    }
};