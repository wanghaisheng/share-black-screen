document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const screenPreview = document.getElementById('screenPreview');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    const previewTimer = document.getElementById('previewTimer');
    const customTime = document.getElementById('customTime');
    const startTimer = document.getElementById('startTimer');
    const startPomodoro = document.getElementById('startPomodoro');
    const pomodoroStatus = document.getElementById('pomodoroStatus');
    const pomodoroTime = document.getElementById('pomodoroTime');
    const shareTime = document.getElementById('shareTime');
    const modeButtons = document.querySelectorAll('.mode-button');
    const timerPresets = document.querySelectorAll('.timer-preset');
    const sharePlatforms = document.querySelectorAll('.share-platform');
    
    // 统计数据元素
    const todayFocus = document.getElementById('todayFocus');
    const weekFocus = document.getElementById('weekFocus');
    const focusCount = document.getElementById('focusCount');
    
    // 初始化变量
    let currentMode = 'black';
    let currentOpacity = 100;
    let timerInterval = null;
    let pomodoroInterval = null;
    let isTimerRunning = false;
    let isPomodoroRunning = false;
    let remainingTime = 0;
    let pomodoroPhase = 'work'; // 'work' 或 'break'
    let totalFocusTime = 0;
    let focusCounter = 0;
    
    // 初始化本地存储数据
    initStats();
    
    // 屏幕模式切换
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            modeButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的active类
            this.classList.add('active');
            
            // 获取并设置当前模式
            currentMode = this.getAttribute('data-mode');
            updateScreenPreview();
        });
    });
    
    // 透明度调节
    opacitySlider.addEventListener('input', function() {
        currentOpacity = this.value;
        opacityValue.textContent = `${currentOpacity}%`;
        updateScreenPreview();
    });
    
    // 时间预设
    timerPresets.forEach(preset => {
        preset.addEventListener('click', function() {
            const presetTime = parseInt(this.getAttribute('data-time'));
            customTime.value = presetTime;
            shareTime.textContent = presetTime;
            updateTimerDisplay(presetTime * 60);
        });
    });
    
    // 自定义时间输入
    customTime.addEventListener('input', function() {
        if (this.value < 1) this.value = 1;
        // if (this.value > 120) this.value = 120;
        shareTime.textContent = this.value;
    });
    
    // 开始计时器
    startTimer.addEventListener('click', function() {
        if (isTimerRunning) {
            stopTimer();
            this.textContent = '开始专注';
        } else {
            const minutes = parseInt(customTime.value);
            if (minutes > 0) {
                startFocusTimer(minutes * 60);
                this.textContent = '停止专注';
                
                // 更新统计数据
                focusCounter++;
                focusCount.textContent = `${focusCounter}次`;
                localStorage.setItem('focusCount', focusCounter);
            }
        }
    });
    
    // 开始番茄工作法
    startPomodoro.addEventListener('click', function() {
        if (isPomodoroRunning) {
            stopPomodoro();
            this.textContent = '开始番茄工作法';
        } else {
            startPomodoroTimer();
            this.textContent = '停止番茄工作法';
        }
    });
    
    // 社交分享
    sharePlatforms.forEach(platform => {
        platform.addEventListener('click', function() {
            const platformName = this.getAttribute('data-platform');
            const shareText = `我正在使用 ShareBlackScreen 专注工作 ${shareTime.textContent} 分钟！`;
            
            // 模拟分享功能
            alert(`已分享到${getPlatformName(platformName)}：${shareText}`);
        });
    });
    
    // 更新屏幕预览
    function updateScreenPreview() {
        // 重置样式
        screenPreview.style.background = '';
        
        // 根据当前模式设置样式
        switch (currentMode) {
            case 'black':
                screenPreview.style.backgroundColor = '#000';
                break;
            case 'white':
                screenPreview.style.backgroundColor = '#fff';
                break;
            case 'blue':
                screenPreview.style.backgroundColor = '#1a73e8';
                break;
            case 'green':
                screenPreview.style.backgroundColor = '#0f9d58';
                break;
            case 'gradient':
                screenPreview.style.background = 'linear-gradient(135deg, #6c5ce7, #00cec9)';
                break;
        }
        
        // 设置透明度
        screenPreview.style.opacity = currentOpacity / 100;
    }
    
    // 开始专注计时器
    function startFocusTimer(seconds) {
        // 停止之前的计时器
        if (timerInterval) clearInterval(timerInterval);
        if (pomodoroInterval) {
            clearInterval(pomodoroInterval);
            isPomodoroRunning = false;
            pomodoroStatus.textContent = '准备就绪';
            startPomodoro.textContent = '开始番茄工作法';
        }
        
        remainingTime = seconds;
        isTimerRunning = true;
        
        // 更新显示
        updateTimerDisplay(remainingTime);
        
        // 启动计时器
        timerInterval = setInterval(function() {
            remainingTime--;
            
            if (remainingTime <= 0) {
                stopTimer();
                playAlarm();
                alert('专注时间结束！');
                
                // 更新统计数据
                const focusMinutes = Math.floor(seconds / 60);
                updateFocusStats(focusMinutes);
            } else {
                updateTimerDisplay(remainingTime);
            }
        }, 1000);
    }
    
    // 停止计时器
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        isTimerRunning = false;
        startTimer.textContent = '开始专注';
        
        // 如果中途停止，仍然计入部分专注时间
        if (remainingTime > 0) {
            const originalTime = parseInt(customTime.value) * 60;
            const focusedTime = originalTime - remainingTime;
            const focusMinutes = Math.floor(focusedTime / 60);
            if (focusMinutes > 0) {
                updateFocusStats(focusMinutes);
            }
        }
        
        // 重置显示
        const minutes = parseInt(customTime.value);
        updateTimerDisplay(minutes * 60);
    }
    
    // 开始番茄工作法
    function startPomodoroTimer() {
        // 停止之前的计时器
        if (timerInterval) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            startTimer.textContent = '开始专注';
        }
        if (pomodoroInterval) clearInterval(pomodoroInterval);
        
        // 初始化番茄工作法
        pomodoroPhase = 'work';
        remainingTime = 25 * 60; // 25分钟工作时间
        isPomodoroRunning = true;
        
        // 更新显示
        pomodoroStatus.textContent = '工作阶段';
        updatePomodoroDisplay(remainingTime);
        
        // 更新统计数据
        focusCounter++;
        focusCount.textContent = `${focusCounter}次`;
        localStorage.setItem('focusCount', focusCounter);
        
        // 启动番茄计时器
        pomodoroInterval = setInterval(function() {
            remainingTime--;
            
            if (remainingTime <= 0) {
                // 切换阶段
                if (pomodoroPhase === 'work') {
                    // 工作阶段结束，进入休息阶段
                    pomodoroPhase = 'break';
                    remainingTime = 5 * 60; // 5分钟休息时间
                    pomodoroStatus.textContent = '休息阶段';
                    playAlarm();
                    alert('工作阶段结束，开始休息！');
                    
                    // 更新统计数据
                    updateFocusStats(25);
                } else {
                    // 休息阶段结束，进入工作阶段
                    // 休息阶段结束，进入工作阶段
                    pomodoroPhase = 'work';
                    remainingTime = 25 * 60; // 25分钟工作时间
                    pomodoroStatus.textContent = '工作阶段';
                    playAlarm();
                    alert('休息阶段结束，开始工作！');
                    
                    // 更新统计数据
                    focusCounter++;
                    focusCount.textContent = `${focusCounter}次`;
                    localStorage.setItem('focusCount', focusCounter);
                }
            }
            
            updatePomodoroDisplay(remainingTime);
        }, 1000);
    }
    
    // 停止番茄工作法
    function stopPomodoro() {
        if (pomodoroInterval) {
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
        }
        isPomodoroRunning = false;
        pomodoroStatus.textContent = '准备就绪';
        pomodoroTime.textContent = '25:00';
    }
    
    // 更新计时器显示
    function updateTimerDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const displayText = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        // 更新主计时器显示
        if (timerDisplay) {
            timerDisplay.textContent = displayText;
        }
        
        // 更新预览屏幕中的计时器显示
        if (previewTimer) {
            previewTimer.textContent = displayText;
            
            // 检查是否应该显示计时器
            const showCountdown = localStorage.getItem('showCountdown') === 'true';
            previewTimer.style.display = showCountdown ? 'block' : 'none';
        }
    }
    
    // 更新番茄工作法显示
    function updatePomodoroDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        pomodoroTime.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // 播放提示音
    function playAlarm() {
        // 创建音频上下文
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建振荡器
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // 设置振荡器参数
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5音
        
        // 设置音量
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        // 连接节点
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 播放声音
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);
    }
    
    // 获取平台名称
    function getPlatformName(platform) {
        switch (platform) {
            case 'wechat': return '微信';
            case 'weibo': return '微博';
            case 'qq': return 'QQ';
            case 'twitter': return 'Twitter';
            default: return platform;
        }
    }
    
    // 初始化统计数据
    function initStats() {
        // 从本地存储获取数据
        const storedTodayFocus = localStorage.getItem('todayFocus');
        const storedWeekFocus = localStorage.getItem('weekFocus');
        const storedFocusCount = localStorage.getItem('focusCount');
        const lastUpdateDate = localStorage.getItem('lastUpdateDate');
        
        // 检查是否需要重置每日数据
        const today = new Date().toDateString();
        if (lastUpdateDate !== today) {
            localStorage.setItem('todayFocus', '0');
            localStorage.setItem('lastUpdateDate', today);
            
            // 检查是否需要重置每周数据
            const currentDay = new Date().getDay();
            if (currentDay === 0) { // 周日重置每周数据
                localStorage.setItem('weekFocus', '0');
            }
        }
        
        // 设置初始值
        totalFocusTime = parseInt(storedTodayFocus || '0');
        const weekFocusTime = parseInt(storedWeekFocus || '0');
        focusCounter = parseInt(storedFocusCount || '0');
        
        // 更新显示
        todayFocus.textContent = `${totalFocusTime}分钟`;
        weekFocus.textContent = `${weekFocusTime}分钟`;
        focusCount.textContent = `${focusCounter}次`;
    }
    
    // 更新专注统计数据
    function updateFocusStats(minutes) {
        // 更新今日专注时间
        totalFocusTime += minutes;
        todayFocus.textContent = `${totalFocusTime}分钟`;
        localStorage.setItem('todayFocus', totalFocusTime.toString());
        
        // 更新本周专注时间
        const weekFocusTime = parseInt(localStorage.getItem('weekFocus') || '0') + minutes;
        weekFocus.textContent = `${weekFocusTime}分钟`;
        localStorage.setItem('weekFocus', weekFocusTime.toString());
        
        // 更新最后更新日期
        localStorage.setItem('lastUpdateDate', new Date().toDateString());
    }
    
    // 初始化屏幕预览
    updateScreenPreview();
});

// 添加结束时间设置功能
const endTimeBtn = document.getElementById('endTimeBtn');
const endTimePicker = document.getElementById('endTimePicker');
const endTimeInput = document.getElementById('endTimeInput');
const setEndTimeBtn = document.getElementById('setEndTime');

// 设置默认结束时间为当前时间后1小时
function setDefaultEndTime() {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    endTimeInput.value = `${hours}:${minutes}`;
}

// 初始化结束时间
setDefaultEndTime();

// 结束时间按钮点击事件
if (endTimeBtn) {
    endTimeBtn.addEventListener('click', function() {
        if (endTimePicker.style.display === 'none') {
            endTimePicker.style.display = 'flex';
            setDefaultEndTime();
        } else {
            endTimePicker.style.display = 'none';
        }
    });
}

// 设置结束时间按钮点击事件
if (setEndTimeBtn) {
    setEndTimeBtn.addEventListener('click', function() {
        const endTimeValue = endTimeInput.value;
        if (!endTimeValue) {
            alert('请选择有效的结束时间');
            return;
        }
        
        // 计算从现在到结束时间的分钟数
        const now = new Date();
        const [hours, minutes] = endTimeValue.split(':').map(Number);
        const endTime = new Date();
        endTime.setHours(hours, minutes, 0);
        
        // 如果结束时间已经过去，则设置为明天的这个时间
        if (endTime <= now) {
            endTime.setDate(endTime.getDate() + 1);
        }
        
        // 计算时间差（分钟）
        const diffMinutes = Math.round((endTime - now) / 60000);
        
        if (diffMinutes <= 0) {
            alert('结束时间必须在当前时间之后');
            return;
        }
        
        // 设置倒计时并开始
        document.getElementById('customTime').value = diffMinutes;
        startFocusTimer(diffMinutes * 60);
        
        // 隐藏结束时间选择器
        endTimePicker.style.display = 'none';
        
        // 显示通知
        showNotification(`已设置专注到 ${endTimeValue}`, 'success');
    });
}

// 添加全屏模式功能
// 添加全屏模式功能
const fullscreenBtn = document.querySelector('.screen-mode[data-mode="fullscreen"]');
if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', function() {
        // 修改这里：使用screenPreview而不是previewScreen
        const screenPreview = document.getElementById('screenPreview');
        if (!screenPreview) return;
        
        if (!document.fullscreenElement) {
            // 进入全屏
            if (screenPreview.requestFullscreen) {
                screenPreview.requestFullscreen();
            } else if (screenPreview.webkitRequestFullscreen) {
                screenPreview.webkitRequestFullscreen();
            } else if (screenPreview.msRequestFullscreen) {
                screenPreview.msRequestFullscreen();
            }
            
            // 更新按钮状态
            document.querySelectorAll('.screen-mode').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        } else {
            // 退出全屏
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    });
    
    // 监听全屏变化事件
    document.addEventListener('fullscreenchange', updateFullscreenButtonState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonState);
    document.addEventListener('msfullscreenchange', updateFullscreenButtonState);
    
    function updateFullscreenButtonState() {
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.msFullscreenElement) {
            fullscreenBtn.classList.remove('active');
        }
    }
}

// 添加倒计时显示控制功能
const showCountdownToggle = document.getElementById('showCountdownToggle');
const timerDisplay = document.getElementById('timerDisplay');
const previewTimer = document.getElementById('previewTimer'); // 获取预览屏幕中的计时器元素

if (showCountdownToggle && timerDisplay) {
    // 初始化时应用当前设置
    applyCountdownVisibility();
    
    // 监听切换事件
    showCountdownToggle.addEventListener('change', applyCountdownVisibility);
    
    function applyCountdownVisibility() {
        if (showCountdownToggle.checked) {
            timerDisplay.style.display = 'block';
            if (previewTimer) previewTimer.style.display = 'block'; // 同时控制预览屏幕中的计时器显示
        } else {
            timerDisplay.style.display = 'none';
            if (previewTimer) previewTimer.style.display = 'none'; // 同时控制预览屏幕中的计时器显示
        }
        
        // 保存设置到本地存储
        localStorage.setItem('showCountdown', showCountdownToggle.checked);
    }
    
    // 页面加载时从本地存储恢复设置，默认为false（不显示倒计时）
    const savedShowCountdown = localStorage.getItem('showCountdown');
    if (savedShowCountdown !== null) {
        showCountdownToggle.checked = savedShowCountdown === 'true';
    } else {
        // 如果没有保存的设置，默认为不显示
        showCountdownToggle.checked = false;
        localStorage.setItem('showCountdown', 'false');
    }
    
    // 应用设置
    applyCountdownVisibility();
}
