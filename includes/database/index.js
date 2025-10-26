'use strict';

/* eslint-disable linebreak-style */

// ✅ Sửa: đường dẫn utils đúng vị trí thư mục f/utils.js
const utils = require('../../f/utils');

// ✅ Sửa: dùng require thay vì import để tương thích Node 18
const got = require('got');

global.Fca = {
    isThread: [],
    isUser: [],
    startTime: Date.now(),
    Setting: new Map(),
    Require: {
        fs: require("fs"),
        Fetch: got,
        log: require("npmlog"),
        // ⚙️ Sửa đường dẫn các module phụ về đúng vị trí
        utils: require('../../f/utils.js'),
        logger: require('../../f/logger.js'),
        languageFile: require('../../f/Language/index.json'),
        Security: require('../../f/Extra/Src/uuid.js')
    },
    getText: function (...Data) {
        let Main = (Data.splice(0, 1)).toString();
        for (let i = 0; i < Data.length; i++) Main = Main.replace(RegExp(`%${i + 1}`, 'g'), Data[i]);
        return Main;
    },
    Data: {
        ObjFastConfig: {
            Language: "vi",
            MainColor: "#9900FF",
            MainName: "[ FCA-SATORU ]",
            Uptime: false,
            Config: "default",
            DevMode: false,
            ResetDataLogin: false,
            AutoRestartMinutes: 0,
            RestartMQTT_Minutes: 60,
            AntiGetInfo: {
                Database_Type: "default",
                AntiGetThreadInfo: true,
                AntiGetUserInfo: true
            },
            Stable_Version: {
                Accept: false,
                Version: ""
            },
            AntiStuckAndMemoryLeak: {
                AutoRestart: {
                    Use: true,
                    Explain: "When this feature is turned on, the system will continuously check and confirm that if memory usage reaches 90%, it will automatically restart to avoid freezing or stopping."
                },
                LogFile: {
                    Use: false,
                    Explain: "Record memory usage logs to fix errors. Default location: gojo/memory.logs"
                }
            }
        },
        CountTime: function () {
            const fs = global.Fca.Require.fs;
            let hours = 0;
            try {
                if (fs.existsSync(__dirname + '/CountTime.json')) {
                    const data = Number(fs.readFileSync(__dirname + '/CountTime.json', 'utf8'));
                    hours = Math.floor(data / (60 * 60));
                }
            } catch {
                fs.writeFileSync(__dirname + '/CountTime.json', 0);
            }
            return `${hours} Hours`;
        }
    }
};

try {
    const fs = global.Fca.Require.fs;
    const logger = global.Fca.Require.log;
    const Boolean_Fca = ["Uptime", "ResetDataLogin", "DevMode"];
    const String_Fca = ["MainName", "Language", "Config"];
    const Number_Fca = ["AutoRestartMinutes", "RestartMQTT_Minutes"];
    const Object_Fca = ["Stable_Version", "AntiGetInfo", "AntiStuckAndMemoryLeak"];
    const All_Variable = [...Boolean_Fca, ...String_Fca, ...Number_Fca, ...Object_Fca];

    const configPath = process.cwd() + '/FastConfigFca.json';
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(global.Fca.Data.ObjFastConfig, null, "\t"));
        process.exit(1);
    }

    let Data_Setting = require(configPath);

    for (let i of All_Variable) {
        if (Data_Setting[i] === undefined) {
            Data_Setting[i] = global.Fca.Data.ObjFastConfig[i];
            fs.writeFileSync(configPath, JSON.stringify(Data_Setting, null, "\t"));
        }
    }

    for (let i of Object_Fca) {
        const All_Paths = utils.getPaths(global.Fca.Data.ObjFastConfig[i]);
        for (let j of All_Paths) {
            if (Data_Setting[i] === undefined) {
                Data_Setting[i] = global.Fca.Data.ObjFastConfig[i];
                fs.writeFileSync(configPath, JSON.stringify(Data_Setting, null, "\t"));
            }
            const User_Data = utils.getData_Path(Data_Setting[i], j, 0);
            const User_Data_Type = utils.getType(User_Data);
            if (User_Data_Type === "Number") {
                const Mission_Path = User_Data === 0 ? j : j.slice(0, User_Data);
                const Mission_Obj = utils.getData_Path(global.Fca.Data.ObjFastConfig[i], Mission_Path, 0);
                Data_Setting[i] = utils.setData_Path(Data_Setting[i], Mission_Path, Mission_Obj);
                fs.writeFileSync(configPath, JSON.stringify(Data_Setting, null, "\t"));
            }
        }
    }

    if (!global.Fca.Require.languageFile.some((i) => i.Language === Data_Setting.Language)) {
        logger.warn("Not Support Language: " + Data_Setting.Language + " Only 'en' and 'vi'");
        process.exit(0);
    }

    global.Fca.Require.Language = global.Fca.Require.languageFile.find((i) => i.Language === Data_Setting.Language).Folder;
    global.Fca.Require.FastConfig = Data_Setting;
} catch (e) {
    console.error("⚠️ Error while loading config:", e);
}

module.exports = function (loginData, options, callback) {
    const Language = global.Fca.Require.languageFile.find(
        i => i.Language == global.Fca.Require.FastConfig.Language
    ).Folder.Index;

    let login;
    try {
        login = require('../../f/Main');
        if (typeof login !== 'function') {
            throw new Error("Module './Main' không export ra hàm login");
        }
    } catch (e) {
        console.error("❌ Lỗi khi load './Main':", e);
        return callback(e);
    }

    try {
        return login(loginData, options, callback);
    } catch (e) {
        console.error("❌ Lỗi khi gọi hàm login:", e);
        return callback(e);
    }
};
