/**
 * 更新i18n和locale目录下的JSON文件
 * 根据index.html中的data-i18n属性提取键值，并更新翻译文件
 */

// 读取index.html文件
const fs = require('fs');
const path = require('path');

// 文件路径
const indexPath = path.join(__dirname, '..', 'index.html');
const i18nDir = path.join(__dirname, '..', 'i18n');
const localeDir = path.join(__dirname, '..', 'locale');

// 读取index.html内容
const indexContent = fs.readFileSync(indexPath, 'utf8');

// 使用正则表达式提取所有data-i18n属性的值
const regex = /data-i18n="([^"]+)"/g;
let match;
const i18nKeys = new Set();

while ((match = regex.exec(indexContent)) !== null) {
    i18nKeys.add(match[1]);
}

console.log(`从index.html中提取了 ${i18nKeys.size} 个i18n键值`);

// 读取现有的翻译文件
function readJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`读取文件 ${filePath} 失败:`, error.message);
        return {};
    }
}

// 写入JSON文件
function writeJsonFile(filePath, data) {
    try {
        const content = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`成功更新文件: ${filePath}`);
    } catch (error) {
        console.error(`写入文件 ${filePath} 失败:`, error.message);
    }
}

// 更新i18n目录下的文件
function updateI18nFiles() {
    // 获取i18n目录下的所有JSON文件
    const i18nFiles = fs.readdirSync(i18nDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(i18nDir, file));

    // 读取中文翻译文件作为基准
    const zhCNPath = path.join(i18nDir, 'zh-CN.json');
    const zhCNData = readJsonFile(zhCNPath);

    // 将提取的键值添加到中文翻译文件中
    let updated = false;
    i18nKeys.forEach(key => {
        if (!zhCNData[key]) {
            // 从index.html中提取默认值
            const defaultValueMatch = new RegExp(`data-i18n="${key}">([^<]+)<`, 'i').exec(indexContent);
            const defaultValue = defaultValueMatch ? defaultValueMatch[1].trim() : key;
            zhCNData[key] = defaultValue;
            updated = true;
            console.log(`添加新键值到zh-CN.json: ${key} = ${defaultValue}`);
        }
    });

    // 更新中文翻译文件
    if (updated) {
        writeJsonFile(zhCNPath, zhCNData);
    }

    // 更新其他语言文件
    i18nFiles.forEach(filePath => {
        if (filePath === zhCNPath) return; // 跳过中文文件

        const langData = readJsonFile(filePath);
        let langUpdated = false;

        // 添加缺失的键值
        i18nKeys.forEach(key => {
            if (!langData[key] && zhCNData[key]) {
                langData[key] = zhCNData[key]; // 暂时使用中文作为占位符
                langUpdated = true;
                console.log(`添加新键值到${path.basename(filePath)}: ${key}`);
            }
        });

        // 更新语言文件
        if (langUpdated) {
            writeJsonFile(filePath, langData);
        }
    });
}

// 更新locale目录下的文件
function updateLocaleFiles() {
    // 获取locale目录下的所有JSON文件
    const localeFiles = fs.readdirSync(localeDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(localeDir, file));

    // 读取中文翻译文件作为基准
    const zhCNPath = path.join(localeDir, 'zh-CN.json');
    const zhCNData = readJsonFile(zhCNPath);

    // 将提取的键值添加到中文翻译文件中
    let updated = false;
    i18nKeys.forEach(key => {
        if (!zhCNData[key]) {
            // 从index.html中提取默认值
            const defaultValueMatch = new RegExp(`data-i18n="${key}">([^<]+)<`, 'i').exec(indexContent);
            const defaultValue = defaultValueMatch ? defaultValueMatch[1].trim() : key;
            zhCNData[key] = defaultValue;
            updated = true;
            console.log(`添加新键值到locale/zh-CN.json: ${key} = ${defaultValue}`);
        }
    });

    // 更新中文翻译文件
    if (updated) {
        writeJsonFile(zhCNPath, zhCNData);
    }

    // 更新其他语言文件
    localeFiles.forEach(filePath => {
        if (filePath === zhCNPath) return; // 跳过中文文件

        const langData = readJsonFile(filePath);
        let langUpdated = false;

        // 添加缺失的键值
        i18nKeys.forEach(key => {
            if (!langData[key] && zhCNData[key]) {
                langData[key] = zhCNData[key]; // 暂时使用中文作为占位符
                langUpdated = true;
                console.log(`添加新键值到${path.basename(filePath)}: ${key}`);
            }
        });

        // 更新语言文件
        if (langUpdated) {
            writeJsonFile(filePath, langData);
        }
    });
}

// 执行更新
updateI18nFiles();
updateLocaleFiles();

console.log('i18n和locale目录下的JSON文件更新完成！');