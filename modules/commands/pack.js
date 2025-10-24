const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');

module.exports.config = {
  name: "pack",
  version: "1.0.0",
  hasPermission: 3,
  credits: "DongDev",
  description: "Thông tin package đã cài đặt",
  commandCategory: "Admin",
  usages: "[]",
  cooldowns: 5,
  images: [],
};

module.exports.run = async ({ api, event, args }) => {
  if (args.length === 0) {
    api.sendMessage("⚠️ Vui lòng nhập tên package cần xem thông tin", event.threadID, event.messageID);
    return;
  }

  const packname = args.join(" ");
  const nodeModulesPath = path.join(__dirname, '../../node_modules', packname);

  try {
    const registryUrl = `https://registry.npmjs.org/${packname}`;
    const { data: packageInfo } = await axios.get(registryUrl);

    const packageJsonPath = path.join(__dirname, '../../package.json');
    const installedPackageJson = require(packageJsonPath);

    if (!installedPackageJson.dependencies || !installedPackageJson.dependencies[packname]) {
      api.sendMessage(`⚠️ Package "${packname}" chưa được cài đặt`, event.threadID, event.messageID);
      return;
    }

    let totalSizeInBytes = 0;
    await processFiles(nodeModulesPath);

    const { fileCount, folderCount } = await getFilesAndFoldersCount(nodeModulesPath);
    const formattedPublishTime = moment(packageInfo.time[packageInfo['dist-tags'].latest]).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss - DD/MM/YYYY');

    api.sendMessage(`[ Thông Tin Package ]\n────────────────────\n
      Tên Package: ${packageInfo.name}\n
      Phiên Bản: ${packageInfo['dist-tags'].latest}\n
      Thời Gian Publish: ${formattedPublishTime}\n
      Tên Người Publish: ${packageInfo.maintainers[0].name}\n
      Email Người Publish: ${packageInfo.maintainers[0].email}\n
      Link Source Package: ${packageInfo.repository.url}\n
      Trang Chủ: ${packageInfo.homepage}\n
      Hỗ Trợ Các Dạng: ${packageInfo.keywords.join(', ')}\n
      Dung Lượng Package: ${totalSizeInBytes} bytes\n
      Số Lượng File: ${fileCount}\n
      Số Lượng Folder: ${folderCount}\n
      Publish lần cuối: ${moment(packageInfo.time.modified).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss - DD/MM/YYYY')}\n
      DownLoad Source: ${packageInfo.versions[packageInfo['dist-tags'].latest].repository.url}\n
      Install: npm i ${packname}`, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage(`❎ Không thể lấy thông tin của package "${packname}", Lỗi: ${error.message}`, event.threadID, event.messageID);
  }
};

async function getFilesAndFoldersCount(directory) {
  let fileCount = 0;
  let folderCount = 0;

  async function countFilesAndFolders(dir) {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        folderCount++;
        await countFilesAndFolders(itemPath);
      } else {
        fileCount++;
      }
    }
  }

  await countFilesAndFolders(directory);
  return { fileCount, folderCount };
}

async function calculateSize(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size;
}

async function processFiles(dir) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      await processFiles(filePath);
    } else {
      totalSizeInBytes += await calculateSize(filePath);
    }
  }
}
