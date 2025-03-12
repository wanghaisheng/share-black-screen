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
    
    // 修复：使用绝对路径加载翻译文件
    fetch(`/locale/${lang}.json`)
        .then(response => {
            if (!response.ok) {
                // 修复：尝试使用相对路径
                return fetch(`locale/${lang}.json`);
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
            // 加载当前风格特有的翻译
            return fetch(`i18n/${lang}.json`)
                .then(response => {
                    if (!response.ok) {
                        // 如果风格翻译不存在，使用空对象
                        console.warn(`风格翻译不存在: ${lang}`);
                        return {};
                    }
                    return response.json();
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