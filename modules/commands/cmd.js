module.exports.config = {
    name: "cmd",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Mirai Team(fix by qt)", //qtdzs1tg newbie
    description: "Quản lý/Kiểm soát toàn bộ module của bot",
    commandCategory: "Admin",
    usePrefix: false,
    usages: "[load/unload/loadAll/unloadAll/create/delete/info] [tên module]",
    cooldowns: 2,
    dependencies: {
        "fs-extra": "",
        "child_process": "",
        "path": ""
    }
};

const loadCommand = function ({ moduleList, threadID, messageID }) {

    const { execSync } = require('child_process');
    const { writeFileSync, unlinkSync, readFileSync } = global.nodemodule['fs-extra'];
    const { join } = global.nodemodule['path'];
    const { configPath, mainPath, api } = global.client;
    const logger = require(mainPath + '/utils/log');

    var errorList = [];
    delete require['resolve'][require['resolve'](configPath)];
    var configValue = require(configPath);
    writeFileSync(configPath + '.temp', JSON.stringify(configValue, null, 2), 'utf8');
    for (const nameModule of moduleList) {
        try {
            const dirModule = __dirname + '/' + nameModule + '.js';
            delete require['cache'][require['resolve'](dirModule)];
            const command = require(dirModule);
            global.client.commands.delete(nameModule);
            if (!command.config || !command.run || !command.config.commandCategory) 
                throw new Error('[ 𝗖𝗠𝗗 ] - Module không đúng định dạng!');
            global.client['eventRegistered'] = global.client['eventRegistered']['filter'](info => info != command.config.name);
            if (command.config.dependencies && typeof command.config.dependencies == 'object') {
                const listPackage = JSON.parse(readFileSync('./package.json')).dependencies,
                    listbuiltinModules = require('module')['builtinModules'];
                for (const packageName in command.config.dependencies) {
                    var tryLoadCount = 0,
                        loadSuccess = ![],
                        error;
                    const moduleDir = join(global.client.mainPath, 'nodemodules', 'node_modules', packageName);
                    try {
                        if (listPackage.hasOwnProperty(packageName) || listbuiltinModules.includes(packageName)) global.nodemodule[packageName] = require(packageName);
                        else global.nodemodule[packageName] = require(moduleDir);
                    } catch {
                        logger.loader('[ 𝗖𝗠𝗗 ] - Không tìm thấy package ' + packageName + ' hỗ trợ cho lệnh ' + command.config.name+ 'tiến hành cài đặt...', 'warn');
                        const insPack = {};
                        insPack.stdio = 'inherit';
                        insPack.env = process.env ;
                        insPack.shell = !![];
                        insPack.cwd = join(global.client.mainPath,'nodemodules')
                        execSync('npm --package-lock false --save install ' + packageName + (command.config.dependencies[packageName] == '*' || command.config.dependencies[packageName] == '' ? '' : '@' + command.config.dependencies[packageName]), insPack);
                        for (tryLoadCount = 1; tryLoadCount <= 3; tryLoadCount++) {
                            require['cache'] = {};
                            try {
                                if (listPackage.hasOwnProperty(packageName) || listbuiltinModules.includes(packageName)) global.nodemodule[packageName] = require(packageName);
                                else global.nodemodule[packageName] = require(moduleDir);
                                loadSuccess = !![];
                                break;
                            } catch (erorr) {
                                error = erorr;
                            }
                            if (loadSuccess || !error) break;
                        }
                        if (!loadSuccess || error) throw 'Không thể tải package ' + packageName + (' cho lệnh ') + command.config.name +', lỗi: ' + error + ' ' + error['stack'];
                    }
                }
                logger.loader('[ 𝗖𝗠𝗗 ] -  Đã tải thành công toàn bộ package cho lệnh' + command.config.name);
            }
            if (command.config.envConfig && typeof command.config.envConfig == 'Object') try {
                for (const [key, value] of Object['entries'](command.config.envConfig)) {
                    if (typeof global.configModule[command.config.name] == undefined) 
                        global.configModule[command.config.name] = {};
                    if (typeof configValue[command.config.name] == undefined) 
                        configValue[command.config.name] = {};
                    if (typeof configValue[command.config.name][key] !== undefined) 
                        global.configModule[command.config.name][key] = configValue[command.config.name][key];
                    else global.configModule[command.config.name][key] = value || '';
                    if (typeof configValue[command.config.name][key] == undefined) 
                        configValue[command.config.name][key] = value || '';
                }
                logger.loader('Loaded config' + ' ' + command.config.name);
            } catch (error) {
                throw new Error('[ 𝗖𝗠𝗗 ] » Không thể tải config module, Lỗi: ' + JSON.stringify(error));
            }
            if (command['onLoad']) try {
                const onLoads = {};
                onLoads['configValue'] = configValue;
                command['onLoad'](onLoads);
            } catch (error) {
                throw new Error('[ 𝗖𝗠𝗗 ] » Không thể onLoad module, Lỗi: ' + JSON.stringify(error), 'error');
            }
            if (command.handleEvent) global.client.eventRegistered.push(command.config.name);
            (global.config.commandDisabled.includes(nameModule + '.js') || configValue.commandDisabled.includes(nameModule + '.js')) 
            && (configValue.commandDisabled.splice(configValue.commandDisabled.indexOf(nameModule + '.js'), 1),
            global.config.commandDisabled.splice(global.config.commandDisabled.indexOf(nameModule + '.js'), 1))
            global.client.commands.set(command.config.name, command)
            logger.loader('Loaded command ' + command.config.name + '!');
        } catch (error) {
            errorList.push('- ' + nameModule + ' reason:' + error + ' at ' + error['stack']);
        };
    }
    if (errorList.length != 0) api.sendMessage('[ 𝗖𝗠𝗗 ] » Những lệnh vừa xảy ra sự cố khi hệ thống loading: ' + errorList.join(' '), threadID, messageID);
    api.sendMessage('[ 𝗖𝗠𝗗 ] » 𝘁𝗮̉𝗶 𝘁𝗵𝗮̀𝗻𝗵 𝗰𝗼̂𝗻𝗴 ' + (moduleList.length - errorList.length) +' 𝗹𝗲̣̂𝗻𝗵', threadID, messageID) 
    writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8')
    unlinkSync(configPath + '.temp');
    return;
}

const unloadModule = function ({ moduleList, threadID, messageID }) {
    const { writeFileSync, unlinkSync } = global.nodemodule["fs-extra"];
    const { configPath, mainPath, api } = global.client;
    const logger = require(mainPath + "/utils/log").loader;

    delete require.cache[require.resolve(configPath)];
    var configValue = require(configPath);
    writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 4), 'utf8');

    for (const nameModule of moduleList) {
        global.client.commands.delete(nameModule);
        global.client.eventRegistered = global.client.eventRegistered.filter(item => item !== nameModule);
        configValue["commandDisabled"].push(`${nameModule}.js`);
        global.config["commandDisabled"].push(`${nameModule}.js`);
        logger(`Unloaded command ${nameModule}!`);
    }

    writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8');
    unlinkSync(configPath + ".temp");

    return api.sendMessage(`[ 𝗖𝗠𝗗 ] » Đã hủy thành công ${moduleList.length} lệnh ✨`, threadID, messageID);
}

module.exports.run = function ({ event, args, api }) {
     const permission = ["100051439970359"];
      if (!permission.includes(event.senderID)) return api.sendMessage("[ 𝗗𝗘𝗩 𝗠𝗢𝗗𝗘 ] Lệnh này chỉ dành cho 𝗡𝗵𝗮̀ 𝗣𝗵𝗮́𝘁 𝗧𝗿𝗶𝗲̂̉𝗻 💻", event.threadID, event.messageID);
    const { readdirSync } = global.nodemodule["fs-extra"];
    const { threadID, messageID } = event;

    var moduleList = args.splice(1, args.length);

    switch (args[0]) {
      case "count":
      case "c": {
      let commands = client.commands.values();
		  let infoCommand = "";
			api.sendMessage("[ 𝗖𝗠𝗗 ] - Hiện tại gồm có " + client.commands.size + " lệnh có thể sử dụng 💌"+ infoCommand, event.threadID, event.messageID);
      break;
		}
        case "load":
        case "l": {
            if (moduleList.length == 0) return api.sendMessage("[ 𝗖𝗠𝗗 ] » Tên module không cho phép bỏ trống ⚠️", threadID, messageID);
            else return loadCommand({ moduleList, threadID, messageID });
        }
        case "unload":
        case "ul": {
            if (moduleList.length == 0) return api.sendMessage("[ 𝗖𝗠𝗗 ] » Tên module không cho phép bỏ trống ⚠️", threadID, messageID);
            else return unloadModule({ moduleList, threadID, messageID });
        }
        case "loadAll":
        case "all":  {
            moduleList = readdirSync(__dirname).filter((file) => file.endsWith(".js") && !file.includes('example'));
            moduleList = moduleList.map(item => item.replace(/\.js/g, ""));
            return loadCommand({ moduleList, threadID, messageID });
        }
        case "unloadAll":
        case "uall":  {
            moduleList = readdirSync(__dirname).filter((file) => file.endsWith(".js") && !file.includes('example') && !file.includes("command"));
            moduleList = moduleList.map(item => item.replace(/\.js/g, ""));
            return unloadModule({ moduleList, threadID, messageID });
        }
        case "info":
        case "i":  {
            const command = global.client.commands.get(moduleList.join("") || "");

            if (!command) return api.sendMessage("[ 𝗖𝗠𝗗 ] » Module bạn nhập không tồn tại ⚠️", threadID, messageID);

            const { name, version, hasPermssion, credits, cooldowns, dependencies } = command.config;

            return api.sendMessage(
                "=== " + name.toUpperCase() + " ===\n" +
                "- Được code bởi: " + credits + "\n" +
                "- Phiên bản: " + version + "\n" +
                "- Yêu cầu quyền hạn: " + ((hasPermssion == 0) ? "Người dùng" : (hasPermssion == 1) ? "Quản trị viên" : (hasPermssion == 2) ? "Người Thuê Bot" : (hasPermssion == 3) ? "Admin Bot" : "null" ) + "\n" +
                "- Thời gian chờ: " + cooldowns + " giây(s)\n" +
                `- Các package yêu cầu: ${(Object.keys(dependencies || {})).join(", ") || "Không có"}`,
                threadID, messageID
            );
        }
        case "cre":
        case "create":
        case "new": {
            const nameModule = moduleList[0];
            if (!nameModule) return api.sendMessage("[ 𝗖𝗠𝗗 ] » Tên file không được bỏ trống ⚠️", threadID, messageID);

            const { writeFileSync, existsSync } = global.nodemodule["fs-extra"];
            const { join } = global.nodemodule["path"];
            const filePath = join(__dirname, `${nameModule}.js`);

            if (existsSync(filePath))
                return api.sendMessage(`[ 𝗖𝗠𝗗 ] » File ${nameModule} đã tồn tại ⚠️`, threadID, messageID);

            writeFileSync(filePath, "", "utf8");
            api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage(`[ 𝗖𝗠𝗗 ] » Đã tạo file ${nameModule}.js thành công`, threadID, messageID);
        }
        case "delete":
        case "del": {
            const nameModule = moduleList[0];
            if (!nameModule) return api.sendMessage("[ 𝗖𝗠𝗗 ] » Bạn cần nhập tên file muốn xóa ⚠️", threadID, messageID);

            const { unlinkSync, existsSync } = global.nodemodule["fs-extra"];
            const { join } = global.nodemodule["path"];
            const filePath = join(__dirname, `${nameModule}.js`);

            if (!existsSync(filePath))
                return api.sendMessage(`[ 𝗖𝗠𝗗 ] » Thư mục ${nameModule} không tồn tại ❌`, threadID, messageID);

            try {
                unlinkSync(filePath);
                api.setMessageReaction("✅", messageID, () => {}, true);
                return api.sendMessage(`[ 𝗖𝗠𝗗 ] » Đã xóa file ${nameModule}.js thành công ✅`, threadID, messageID);
            } catch (err) {
                api.setMessageReaction("❌", messageID, (err) => {}, true);
                return api.sendMessage(`[ 𝗖𝗠𝗗 ] » Xảy ra lỗi khi xóa file ${nameModule}`, threadID, messageID);
            }
        }
        default: {
            return global.utils.throwError(this.config.name, threadID, messageID);
        }
    }
      }