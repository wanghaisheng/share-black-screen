/**
 * 自动检测用户浏览器语言并切换
 */
(function() {
    // 如果用户已经选择了语言，则不进行自动切换
    if (localStorage.getItem('selectedLanguage')) {
        console.log('用户已选择语言:', localStorage.getItem('selectedLanguage'));
        return;
    }
    
    // 获取浏览器语言
    const browserLang = navigator.language || navigator.userLanguage;
    console.log('浏览器语言:', browserLang);
    
    // 支持的语言列表
    const supportedLanguages = ['zh-CN', 'en', 'ja', 'ko'];
    
    // 语言映射（将浏览器语言映射到我们支持的语言）
    const languageMap = {
        'zh': 'zh-CN',
        'zh-TW': 'zh-CN',
        'zh-HK': 'zh-CN',
        'en': 'en',
        'en-US': 'en',
        'en-GB': 'en',
        'ja': 'ja',
        'ko': 'ko'
    };
    
    // 获取语言代码的前两个字符
    const shortLang = browserLang.split('-')[0];
    
    // 尝试匹配完整语言代码
    let targetLang = languageMap[browserLang];
    
    // 如果没有匹配到完整代码，尝试匹配短代码
    if (!targetLang) {
        targetLang = languageMap[shortLang];
    }
    
    console.log('目标语言:', targetLang);
    
    // 如果找到匹配的语言，并且不是当前语言，则切换
    if (targetLang && supportedLanguages.includes(targetLang)) {
        // 等待DOM加载完成
        document.addEventListener('DOMContentLoaded', function() {
            // 等待i18n模块加载完成
            setTimeout(function() {
                if (window.i18n && typeof window.i18n.changeLanguage === 'function') {
                    console.log('自动切换语言到:', targetLang);
                    window.i18n.changeLanguage(targetLang);
                } else {
                    console.error('i18n模块未加载或changeLanguage方法不存在');
                }
            }, 500);
        });
    }
})();