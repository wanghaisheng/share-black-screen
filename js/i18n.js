/**
 * 多语言支持模块
 * 负责处理网站的语言切换和翻译功能
 */

// 支持的语言列表
const supportedLanguages = {
    'zh-CN': '简体中文',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어'
};

// 默认语言
const defaultLanguage = 'zh-CN';

// 当前选择的语言
let currentLanguage = localStorage.getItem('selectedLanguage') || defaultLanguage;

// DOM加载完成后初始化语言设置
document.addEventListener('DOMContentLoaded', function() {
    initLanguageSelector();
    loadAndApplyTranslations(currentLanguage);
});

/**
 * 初始化语言选择器
 */
function initLanguageSelector() {
    const languageSelector = document.getElementById('languageSelect');
    if (!languageSelector) {
        console.error('找不到语言选择器元素');
        return;
    }
    
    // 设置当前语言
    languageSelector.value = currentLanguage;
    
    // 监听语言切换事件
    languageSelector.addEventListener('change', function() {
        const selectedLang = this.value;
        console.log('语言切换为:', selectedLang);
        changeLanguage(selectedLang);
    });
}

/**
 * 切换语言
 * @param {string} lang - 目标语言代码
 */
function changeLanguage(lang) {
    if (!supportedLanguages[lang]) {
        console.error(`不支持的语言: ${lang}`);
        return;
    }
    
    currentLanguage = lang;
    localStorage.setItem('selectedLanguage', lang);
    loadAndApplyTranslations(lang);
}

/**
 * 加载并应用翻译
 * @param {string} lang - 语言代码
 */
function loadAndApplyTranslations(lang) {
    // 显示加载指示器
    showLoadingIndicator();
    
    // 修改路径加载逻辑，先尝试相对路径
    fetch(`locale/${lang}.json`)
        .then(response => {
            if (!response.ok) {
                console.warn(`无法从locale/加载翻译文件，尝试其他路径: ${response.status}`);
                // 尝试绝对路径
                return fetch(`/locale/${lang}.json`);
            }
            return response;
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`无法加载全局翻译文件: ${response.status}`);
            }
            return response.json();
        })
        .then(globalTranslations => {
            // 尝试加载当前风格特有的翻译，先尝试相对路径
            return fetch(`i18n/${lang}.json`)
                .then(response => {
                    if (!response.ok) {
                        // 尝试绝对路径
                        return fetch(`/i18n/${lang}.json`);
                    }
                    return response;
                })
                .then(response => {
                    if (!response.ok) {
                        // 如果风格翻译不存在，使用空对象
                        console.log('风格翻译不存在，使用空对象');
                        return {};
                    }
                    return response.json();
                })
                .catch(error => {
                    console.log('加载风格翻译出错，使用空对象', error);
                    return {};
                })
                .then(styleTranslations => {
                    // 合并翻译
                    const translations = { ...globalTranslations, ...styleTranslations };
                    console.log('已加载翻译:', translations);
                    // 应用翻译到页面
                    applyTranslations(translations);
                    // 隐藏加载指示器
                    hideLoadingIndicator();
                });
        })
        .catch(error => {
            console.error('加载翻译失败:', error);
            // 如果加载失败，尝试使用默认语言
            if (lang !== defaultLanguage) {
                console.log(`尝试加载默认语言(${defaultLanguage})翻译`);
                loadAndApplyTranslations(defaultLanguage);
            } else {
                // 隐藏加载指示器
                hideLoadingIndicator();
            }
        });
}

/**
 * 应用翻译到页面元素
 * @param {Object} translations - 翻译对象
 */
function applyTranslations(translations) {
    // 查找所有带有data-i18n属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    console.log(`找到 ${elements.length} 个需要翻译的元素`);
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            // 根据元素类型设置翻译文本
            if (element.tagName === 'INPUT' && element.getAttribute('type') === 'text') {
                element.placeholder = translations[key];
            } else if (element.tagName === 'IMG') {
                element.alt = translations[key];
            } else {
                element.textContent = translations[key];
            }
        } else {
            console.warn(`未找到翻译键: ${key}`);
        }
    });
    
    // 查找并翻译没有data-i18n属性但需要翻译的常见UI元素
    translateCommonUIElements(translations);
    
    // 更新页面标题
    if (translations['page_title']) {
        document.title = translations['page_title'];
    }
    
    // 更新专注统计文本
    updateFocusStatsText(translations);
    
    // 触发自定义事件，通知其他脚本语言已更改
    document.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: currentLanguage, translations: translations } 
    }));
}

/**
 * 更新专注统计相关的文本
 * @param {Object} translations - 翻译对象
 */
function updateFocusStatsText(translations) {
    const todayFocus = parseInt(localStorage.getItem('todayFocus') || 0);
    const weekFocus = parseInt(localStorage.getItem('weekFocus') || 0);
    const focusCount = parseInt(localStorage.getItem('focusCount') || 0);
    
    const todayFocusElement = document.getElementById('todayFocus');
    const weekFocusElement = document.getElementById('weekFocus');
    const focusCountElement = document.getElementById('focusCount');
    
    if (todayFocusElement) {
        const minutesText = translations['minutes'] || '分钟';
        todayFocusElement.textContent = `${todayFocus}${minutesText}`;
    }
    
    if (weekFocusElement) {
        const minutesText = translations['minutes'] || '分钟';
        weekFocusElement.textContent = `${weekFocus}${minutesText}`;
    }
    
    if (focusCountElement) {
        const timesText = translations['times'] || '次';
        focusCountElement.textContent = `${focusCount}${timesText}`;
    }
}

/**
 * 显示加载指示器
 */
function showLoadingIndicator() {
    // 创建加载指示器元素（如果不存在）
    let loadingIndicator = document.getElementById('languageLoadingIndicator');
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'languageLoadingIndicator';
        loadingIndicator.className = 'language-loading-indicator';
        loadingIndicator.innerHTML = '<span></span><span></span><span></span>';
        document.body.appendChild(loadingIndicator);
    }
    
    // 显示加载指示器
    loadingIndicator.style.display = 'flex';
}

/**
 * 隐藏加载指示器
 */
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('languageLoadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

// 导出公共方法
window.i18n = {
    changeLanguage,
    getCurrentLanguage: () => currentLanguage,
    getSupportedLanguages: () => supportedLanguages
};

/**
 * 翻译没有data-i18n属性的常见UI元素
 * @param {Object} translations - 翻译对象
 */
function translateCommonUIElements(translations) {
    // 翻译屏幕模式相关元素
    translateElementsBySelector('.mode-buttons .mode-button[data-mode="black"]', translations['black_screen_mode'] || '黑屏');
    translateElementsBySelector('.mode-buttons .mode-button[data-mode="white"]', translations['white_screen_mode'] || '白屏');
    translateElementsBySelector('.mode-buttons .mode-button[data-mode="blue"]', translations['blue_screen_mode'] || '蓝屏');
    translateElementsBySelector('.mode-buttons .mode-button[data-mode="green"]', translations['green_screen_mode'] || '绿屏');
    translateElementsBySelector('.mode-buttons .mode-button[data-mode="gradient"]', translations['gradient_mode'] || '渐变');
    
    // 翻译控制组标题
    translateElementsBySelector('.control-group h3:contains("屏幕模式")', translations['screen_modes'] || '屏幕模式');
    translateElementsBySelector('.control-group h3:contains("透明度调节")', translations['transparency'] || '透明度调节');
    translateElementsBySelector('.control-group h3:contains("时间管理")', translations['time_management_tab'] || '时间管理');
    translateElementsBySelector('.control-group h3:contains("番茄工作法")', translations['pomodoro'] || '番茄工作法');
    translateElementsBySelector('.control-group h3:contains("社交专注")', translations['social_features'] || '社交专注');
    
    // 翻译时间管理相关元素
    translateElementsBySelector('.countdown-display-control span', translations['show_countdown'] || '显示倒计时');
    translateElementsBySelector('.timer-preset[data-time="5"]', translations['5_minutes'] || '5分钟');
    translateElementsBySelector('.timer-preset[data-time="25"]', translations['25_minutes'] || '25分钟');
    translateElementsBySelector('.timer-preset[data-time="50"]', translations['50_minutes'] || '50分钟');
    translateElementsBySelector('#endTimeBtn', translations['end_time'] || '结束时间');
    translateElementsBySelector('.custom-timer span', translations['minutes'] || '分钟');
    translateElementsBySelector('#startTimer', translations['start_focus'] || '开始专注');
    translateElementsBySelector('#setEndTime', translations['set_end_time'] || '设置结束时间');
    translateElementsBySelector('.schedule-timer span', translations['minutes_to_start'] || '分钟后启动');
    translateElementsBySelector('#scheduleButton', translations['schedule_start'] || '预约启动');
    translateElementsBySelector('#createTimePlan', translations['create_time_plan'] || '创建时间方案');
    
    // 翻译番茄工作法相关元素
    translateElementsBySelector('#startPomodoro', translations['start_pomodoro'] || '开始番茄工作法');
    translateElementsBySelector('#pomodoroStatus:contains("准备就绪")', translations['ready'] || '准备就绪');
    
    // 翻译社交专注相关元素
    translateElementsBySelector('.focus-session h4', translations['create_focus_session'] || '创建专注会话');
    translateElementsBySelector('#sessionName', translations['focus_session_name'] || '专注会话名称', 'placeholder');
    translateElementsBySelector('#createSession', translations['create_session'] || '创建专注会话');
    translateElementsBySelector('.invite-friends h4', translations['invite_friends'] || '邀请好友');
    translateElementsBySelector('#friendEmail', translations['friend_email'] || '好友邮箱地址', 'placeholder');
    translateElementsBySelector('#inviteFriend', translations['invite_friend'] || '邀请好友');
    
    // 翻译页面其他部分
    translateElementsBySelector('.section-title:contains("在线体验")', translations['online_experience'] || '在线体验 ShareBlackScreen');
    translateElementsBySelector('.section-subtitle:contains("无需下载")', translations['no_download_needed'] || '无需下载，立即体验我们的核心功能');
    translateElementsBySelector('.playground-cta p', translations['more_features'] || '想要体验更多高级功能？');
    translateElementsBySelector('.playground-cta .primary-button', translations['download_full'] || '立即下载完整版');
}

/**
 * 根据选择器翻译元素
 * @param {string} selector - CSS选择器
 * @param {string} translation - 翻译文本
 * @param {string} attribute - 要翻译的属性，默认为textContent
 */
function translateElementsBySelector(selector, translation, attribute = 'textContent') {
    try {
        // 扩展jQuery的contains选择器功能
        if (selector.includes(':contains(')) {
            const parts = selector.split(':contains(');
            const baseSelector = parts[0];
            const textToMatch = parts[1].slice(0, -1).replace(/\"/g, '');
            
            const elements = document.querySelectorAll(baseSelector);
            elements.forEach(el => {
                if (el.textContent.includes(textToMatch)) {
                    if (attribute === 'placeholder') {
                        el.placeholder = translation;
                    } else {
                        el[attribute] = translation;
                    }
                }
            });
            return;
        }
        
        // 常规选择器
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (attribute === 'placeholder') {
                el.placeholder = translation;
            } else {
                el[attribute] = translation;
            }
        });
    } catch (error) {
        console.error(`翻译元素错误 (${selector}):`, error);
    }
}