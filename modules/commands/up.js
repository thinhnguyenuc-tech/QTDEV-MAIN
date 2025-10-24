const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "up",
    version: "1.0.0",
    hasPermssion: 3,
    description: "Bật hoặc tắt usePrefix cho một lệnh",
    usePrefix: true,
    credits: "TKDEV",
    cooldowns: 5,
    commandCategory: "Admin",
};

module.exports.run = async function ({ api, event, args }) {
    const { senderID } = event;
    const splitArgs = args.join(" ").split(" ").map(arg => arg.trim());
    const commandName = splitArgs[0];
    const usePrefixValue = splitArgs[1];

    if (!commandName || (usePrefixValue !== "true" && usePrefixValue !== "false")) {
        return api.sendMessage("📝 Cách sử dụng: usePrefix [tên lệnh] [true/false]", event.threadID, event.messageID);
    }

    const commandFilePath = path.join(__dirname, `${commandName}.js`);

    try {
        if (!fs.existsSync(commandFilePath)) {
            return api.sendMessage(`❌ Lệnh "${commandName}" không tồn tại.`, event.threadID, event.messageID);
        }

        let fileContent = fs.readFileSync(commandFilePath, 'utf-8');
        const usePrefixRegex = /usePrefix\s*:\s*(true|false)/;
        const currentUsePrefix = usePrefixRegex.exec(fileContent);

        if (currentUsePrefix && currentUsePrefix[1] === usePrefixValue) {
            return api.sendMessage(`❗ Lệnh "${commandName}" đã được thiết lập thành ${usePrefixValue}.`, event.threadID, event.messageID);
        }

        if (usePrefixRegex.test(fileContent)) {
            fileContent = fileContent.replace(usePrefixRegex, `usePrefix: ${usePrefixValue}`);
        } else {
            const configRegex = /module\.exports\.config\s*=\s*{([^}]*)}/;
            const match = fileContent.match(configRegex);
            if (match) {
                const configBlock = match[1];
                const newConfigBlock = configBlock.trim().endsWith(',')
                    ? `${configBlock}\n    usePrefix: ${usePrefixValue},`
                    : `${configBlock},\n    usePrefix: ${usePrefixValue},`;
                fileContent = fileContent.replace(configRegex, `module.exports.config = {${newConfigBlock}}`);
            }
        }

        fs.writeFileSync(commandFilePath, fileContent, 'utf-8');
        api.sendMessage(`✅ Đã cập nhật thành công usePrefix cho lệnh "${commandName}" sang ${usePrefixValue}.\n📝 Load Command "${commandName} "để sử dụng`, event.threadID, event.messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage(`Đã xảy ra lỗi khi cập nhật usePrefix cho lệnh "${commandName}". Kiểm tra console để biết lỗi.`, event.threadID);
    }
};