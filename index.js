const { spawn } = require("child_process");
const { readFileSync } = require("fs-extra");
//let http = require('http');
const fs = require("fs"); 
const axios = require("axios");
var deviceID = require('uuid');
var adid = require('uuid');
const totp = require('totp-generator');
const semver = require("semver");
const logger = require("./utils/log");
const chalk = require('chalk');
const chalk1 = require('chalkercli');
const CFonts = require('cfonts');
const moment = require("moment-timezone");
const gradient = require('gradient-string');
const con = require("./config.json");
const theme = con.DESIGN.Theme;
let co;
let error;
if (theme.toLowerCase() === 'blue') {
  co = gradient([{color: "#1affa3", pos: 0.2},{color:"cyan",pos:0.4},{color:"pink",pos:0.6},{color:"cyan",pos:0.8},{color:'#1affa3',pos:1}]);
  error = chalk.red.bold;
}
else if (theme=="dream2") 
{
  cra = gradient("blue","pink") 
  co = gradient("#a200ff","#21b5ff","#a200ff")
}
  else if (theme.toLowerCase() === 'dream') {
  co = gradient([{color: "blue", pos: 0.2},{color:"pink",pos:0.3},{color:"gold",pos:0.6},{color:"pink",pos:0.8},{color: "blue", pos:1}]);
  error = chalk.red.bold;
}
    else if (theme.toLowerCase() === 'test') {
  co = gradient("#243aff", "#4687f0", "#5800d4","#243aff", "#4687f0", "#5800d4","#243aff", "#4687f0", "#5800d4","#243aff", "#4687f0", "#5800d4");
  error = chalk.red.bold;
}
else if (theme.toLowerCase() === 'fiery') {
  co = gradient("#fc2803", "#fc6f03", "#fcba03");
  error = chalk.red.bold;
}
else if (theme.toLowerCase() === 'rainbow') {
  co = gradient.rainbow
  error = chalk.red.bold;}
  else if (theme.toLowerCase() === 'pastel') {
  co = gradient.pastel
  error = chalk.red.bold;}
  else if (theme.toLowerCase() === 'cristal') {
  co = gradient.cristal
  error = chalk.red.bold;
}else if (theme.toLowerCase() === 'red') {
  co = gradient("red", "orange");
  error = chalk.red.bold;
} else if (theme.toLowerCase() === 'aqua') {
  co = gradient("#0030ff", "#4e6cf2");
  error = chalk.blueBright;
} else if (theme.toLowerCase() === 'pink') {
  cra = gradient('purple', 'pink');
  co = gradient("#d94fff", "purple");
} else if (theme.toLowerCase() === 'retro') {
  cra = gradient("#d94fff", "purple");
  co = gradient.retro;
} else if (theme.toLowerCase() === 'sunlight') {
  cra = gradient("#f5bd31", "#f5e131");
  co = gradient("orange", "#ffff00", "#ffe600");
} else if (theme.toLowerCase() === 'teen') {
  cra = gradient("#00a9c7", "#853858","#853858","#00a9c7");
  co = gradient.teen;
} else if (theme.toLowerCase() === 'summer') {
  cra = gradient("#fcff4d", "#4de1ff");
  co = gradient.summer;
} else if (theme.toLowerCase() === 'flower') {
  cra = gradient("blue", "purple", "yellow", "#81ff6e");
  co = gradient.pastel;
} else if (theme.toLowerCase() === 'ghost') {
  cra = gradient("#0a658a", "#0a7f8a", "#0db5aa");
  co = gradient.mind;
} else if (theme === 'hacker') {
  cra = chalk.hex('#4be813');
  co = gradient('#47a127', '#0eed19', '#27f231');
}
else {
  co = gradient("#243aff", "#4687f0", "#5800d4");
  error = chalk.red.bold;
}
var job = [
"FF9900","FFFF33","33FFFF","FF99FF","FF3366","FFFF66","FF00FF","66FF99","00CCFF","FF0099","FF0066","0033FF","FF9999","00FF66","00FFFF","CCFFFF","8F00FF","FF00CC","FF0000","FF1100","FF3300","FF4400","FF5500","FF6600","FF7700","FF8800","FF9900","FFaa00","FFbb00","FFcc00","FFdd00","FFee00","FFff00","FFee00","FFdd00","FFcc00","FFbb00","FFaa00","FF9900","FF8800","FF7700","FF6600","FF5500","FF4400","FF3300","FF2200","FF1100"
];
var random = 
job[Math.floor(Math.random() * job.length)]      
fs.readFile('package.json', 'utf8', (err, data) => {
  if (err) {   
    return;
  }
try {
    const packageJson = JSON.parse(data);
    const dependencies = packageJson.dependencies || {};
    const totalDependencies = Object.keys(dependencies).length;
logger(`Hiện tại tổng có ${totalDependencies} Package`, '[ PACKAGE ]');
  } catch (parseError) {
      };

///////////////////////////////////////
////////// CHECK LỖI MODULES //////////
///////////////////////////////////////
try {
  var files = fs.readdirSync('./modules/commands');
  files.forEach(file => {
    if (file.endsWith('.js')) {     require(`./modules/commands/${file}`);
    }
}); 
logger('Tiến Hành Check Lỗi', '[ AUTO-CHECK ]');
logger('Các Modules Hiện Không Có Lỗi', '[ AUTO-CHECK ]');
   } catch (error) {
logger('Đã Có Lỗi Tại Lệnh:', '[ AUTO-CHECK ]');
console.log(error);
   }
});

function startBot(message) {
    (message) ? logger(message, "[ Bắt đầu ]") : "";

    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });
    child.on("close", (codeExit) => {
        if (codeExit != 0 || global.countRestart && global.countRestart < 5) {
            startBot("Tiến Hành Khởi Động Lại...");
            global.countRestart += 1;
            return;
        } else return;
    });

    child.on("error", function (error) {
        logger("Đã xảy ra lỗi: " + JSON.stringify(error), "[ Bắt đầu ]");
    });
};

const config = require('./config.json');

/////////////////////////////////////
const logo = `
 ██████╗  ████████╗██████╗  ██╗   ██╗███╗   ██╗ ██████╗ 
██╔═══ ██╗╚══██╔══╝██╔══██╗ ██║   ██║████╗  ██║██╔════╝ 
██║    ██║   ██║   ██████╔╝ ██╔   ██║██╔██╗ ██║██║  ███╗
██║  █ ██║   ██║   ██╔══██╗ ██╔═══██║██║ ██║██╗██║   ██║
╚████ ██╔╝   ██║   ██║  ██║ ████████╔██║ ╚████║╚██████╔╝
 ╚═════╝█    ╚═╝   ╚═╝  ╚═╝ ╚══════╝ ╚═╝  ╚═══╝ ╚═════╝
`;

function getRandomColors() {
  const colors1 = [
  "FF0000", 
  "FF7F00", // Cam
  "FFFF00", // Vàng
  "00FF00", // Xanh lá
  "0000FF", // Xanh dương
  "4B0082", // Chàm
  "9400D3"
  ];
  
  const randomColors = [];
  while (randomColors.length < 7) {
    const randomIndex = Math.floor(Math.random() * colors1.length);
    const randomColor = colors1[randomIndex];
    if (!randomColors.includes(randomColor)) {
      randomColors.push(randomColor);
    }
  }
  return randomColors;
}

const randomColors = getRandomColors();
const coloredData = gradient(...randomColors).multiline(logo);
console.log(chalk(coloredData));
////////////////////////////////////////////
async function startb(){
  if(config.ACCESSTOKEN !== "") {
    startBot();
  } else {
    setTimeout(()=>{
      startBot();
    },7000)
  }
}
startb()