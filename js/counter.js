document.addEventListener('DOMContentLoaded', function() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    // 检查元素是否在视口中
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // 数字增长动画
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000; // 动画持续时间（毫秒）
        const startTime = performance.now();
        const startValue = 0;
        
        function updateCounter(currentTime) {
            const elapsedTime = currentTime - startTime;
            
            if (elapsedTime < duration) {
                const progress = elapsedTime / duration;
                const easedProgress = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2; // 缓动函数
                
                const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);
                el.textContent = currentValue.toLocaleString();
                
                requestAnimationFrame(updateCounter);
            } else {
                el.textContent = target.toLocaleString();
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
    
    // 处理所有统计数字
    function handleStatNumbers() {
        statNumbers.forEach(statNumber => {
            if (isElementInViewport(statNumber) && !statNumber.classList.contains('animated')) {
                statNumber.classList.add('animated');
                animateCounter(statNumber);
            }
        });
    }
    
    // 初始检查
    handleStatNumbers();
    
    // 滚动时检查
    window.addEventListener('scroll', handleStatNumbers);
    
    // 多语言支持 - 语言切换功能
    const languageSelector = document.getElementById('languageSelect');
    if (languageSelector) {
        // 从localStorage获取当前语言或使用默认语言
        const currentLang = localStorage.getItem('selectedLanguage') || 'zh-CN';
        languageSelector.value = currentLang;
        
        // 初始化页面语言
        loadLanguage(currentLang);
        
        // 监听语言切换
        languageSelector.addEventListener('change', function() {
            const selectedLang = this.value;
            localStorage.setItem('selectedLanguage', selectedLang);
            loadLanguage(selectedLang);
        });
    }
});

// 加载语言文件并应用翻译
function loadLanguage(lang) {
    // 加载全局翻译
    fetch(`d:/Download/audio-visual/heytcm/jujue/v10/locale/${lang}.json`)
        .then(response => response.json())
        .then(globalTranslations => {
            // 加载当前风格特有的翻译
            fetch(`d:/Download/audio-visual/heytcm/jujue/v10/i18n/${lang}.json`)
                .then(response => response.json())
                .then(styleTranslations => {
                    // 合并翻译
                    const translations = { ...globalTranslations, ...styleTranslations };
                    // 应用翻译到页面
                    applyTranslations(translations);
                })
                .catch(error => {
                    console.error('加载风格翻译失败:', error);
                    // 如果风格翻译加载失败，仍然应用全局翻译
                    applyTranslations(globalTranslations);
                });
        })
        .catch(error => {
            console.error('加载全局翻译失败:', error);
        });
}

// 应用翻译到页面元素
function applyTranslations(translations) {
    // 查找所有带有data-i18n属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            // 根据元素类型设置翻译文本
            if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                element.placeholder = translations[key];
            } else if (element.tagName === 'IMG') {
                element.alt = translations[key];
            } else {
                element.textContent = translations[key];
            }
        }
    });
    
    // 更新专注统计文本
    updateFocusStatsText(translations);
}

// 更新专注统计相关的文本
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

// 修复统计数据，防止NaN显示
function updateFocusStats(minutes) {
    if (!minutes || isNaN(minutes)) minutes = 0;
    
    // 获取今日专注时间
    let todayFocus = parseInt(localStorage.getItem('todayFocus') || 0);
    todayFocus += minutes;
    localStorage.setItem('todayFocus', todayFocus);
    
    // 获取本周专注时间
    let weekFocus = parseInt(localStorage.getItem('weekFocus') || 0);
    weekFocus += minutes;
    localStorage.setItem('weekFocus', weekFocus);
    
    // 获取专注次数
    let focusCount = parseInt(localStorage.getItem('focusCount') || 0);
    focusCount += 1;
    localStorage.setItem('focusCount', focusCount);
    
    // 更新显示
    const todayFocusElement = document.getElementById('todayFocus');
    const weekFocusElement = document.getElementById('weekFocus');
    const focusCountElement = document.getElementById('focusCount');
    
    // 获取当前语言的翻译
    const currentLang = localStorage.getItem('selectedLanguage') || 'zh-CN';
    fetch(`d:/Download/audio-visual/heytcm/jujue/v10/locale/${currentLang}.json`)
        .then(response => response.json())
        .then(translations => {
            const minutesText = translations['minutes'] || '分钟';
            const timesText = translations['times'] || '次';
            
            if (todayFocusElement) todayFocusElement.textContent = `${todayFocus}${minutesText}`;
            if (weekFocusElement) weekFocusElement.textContent = `${weekFocus}${minutesText}`;
            if (focusCountElement) focusCountElement.textContent = `${focusCount}${timesText}`;
        })
        .catch(() => {
            // 如果翻译加载失败，使用默认文本
            if (todayFocusElement) todayFocusElement.textContent = `${todayFocus}分钟`;
            if (weekFocusElement) weekFocusElement.textContent = `${weekFocus}分钟`;
            if (focusCountElement) focusCountElement.textContent = `${focusCount}次`;
        });
}