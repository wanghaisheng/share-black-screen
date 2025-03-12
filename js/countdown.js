document.addEventListener('DOMContentLoaded', function() {
    const heroCountdown = document.getElementById('heroCountdown');
    const pricingCountdown = document.getElementById('pricingCountdown');
    
    // 预约功能相关元素
    const scheduleTimeInput = document.getElementById('scheduleTime');
    const scheduleButton = document.getElementById('scheduleButton');
    const scheduleStatus = document.getElementById('scheduleStatus');
    let scheduleTimer = null;
    
    // 倒计时显示控制
    const showCountdownToggle = document.getElementById('showCountdownToggle');
    const previewTimer = document.getElementById('previewTimer');
    
    // 初始化倒计时显示状态
    if (showCountdownToggle && previewTimer) {
        // 从本地存储获取设置，默认为不显示
        const savedShowCountdown = localStorage.getItem('showCountdown');
        if (savedShowCountdown !== null) {
            showCountdownToggle.checked = savedShowCountdown === 'true';
        } else {
            showCountdownToggle.checked = false;
            localStorage.setItem('showCountdown', 'false');
        }
        
        // 应用设置
        applyCountdownVisibility();
        
        // 监听切换事件
        showCountdownToggle.addEventListener('change', applyCountdownVisibility);
    }
    
    // 应用倒计时显示设置
    function applyCountdownVisibility() {
        if (!showCountdownToggle || !previewTimer) return;
        
        if (showCountdownToggle.checked) {
            previewTimer.style.display = 'block';
        } else {
            previewTimer.style.display = 'none';
        }
        
        // 保存设置到本地存储
        localStorage.setItem('showCountdown', showCountdownToggle.checked);
    }
    
    // 设置倒计时结束日期（当前时间 + 2天）
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 2);
    
    // 修复显示为NaN的内容
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = endDate - now;
        
        // 计算时间
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // 格式化时间
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 更新所有倒计时元素
        if (heroCountdown) {
            if (distance < 0) {
                heroCountdown.innerHTML = "优惠已结束";
            } else {
                heroCountdown.innerHTML = formattedTime;
            }
        }
        
        if (pricingCountdown) {
            if (distance < 0) {
                pricingCountdown.innerHTML = "优惠已结束";
            } else {
                pricingCountdown.innerHTML = formattedTime;
            }
        }
        
        // 如果倒计时未结束，继续更新
        if (distance > 0) {
            requestAnimationFrame(updateCountdown);
        }
    }
    
    // 预约功能实现
    if (scheduleButton && scheduleTimeInput) {
        scheduleButton.addEventListener('click', function() {
            if (scheduleTimer) {
                // 如果已有预约，取消预约
                clearTimeout(scheduleTimer);
                scheduleTimer = null;
                scheduleButton.textContent = '预约启动';
                scheduleStatus.textContent = '预约已取消';
                scheduleStatus.style.color = '#ff4757';
                setTimeout(() => {
                    scheduleStatus.textContent = '';
                }, 3000);
                return;
            }
            
            const minutes = parseInt(scheduleTimeInput.value);
            if (isNaN(minutes) || minutes <= 0) {
                scheduleStatus.textContent = '请输入有效的时间';
                scheduleStatus.style.color = '#ff4757';
                setTimeout(() => {
                    scheduleStatus.textContent = '';
                }, 3000);
                return;
            }
            
            // 设置预约
            const milliseconds = minutes * 60 * 1000;
            scheduleStatus.textContent = `将在 ${minutes} 分钟后自动启动`;
            scheduleStatus.style.color = '#2ed573';
            scheduleButton.textContent = '取消预约';
            
            // 显示倒计时
            let remainingSeconds = minutes * 60;
            const countdownInterval = setInterval(() => {
                remainingSeconds--;
                const mins = Math.floor(remainingSeconds / 60);
                const secs = remainingSeconds % 60;
                scheduleStatus.textContent = `将在 ${mins}:${secs.toString().padStart(2, '0')} 后自动启动`;
                
                if (remainingSeconds <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);
            
            // 设置定时器
            scheduleTimer = setTimeout(() => {
                // 启动专注模式
                if (typeof startFocusTimer === 'function') {
                    const focusMinutes = parseInt(document.getElementById('customTime')?.value || '25');
                    startFocusTimer(focusMinutes * 60);
                    
                    // 更新UI
                    const startTimerButton = document.getElementById('startTimer');
                    if (startTimerButton) {
                        startTimerButton.textContent = '停止专注';
                    }
                }
                
                // 重置预约状态
                scheduleTimer = null;
                scheduleButton.textContent = '预约启动';
                scheduleStatus.textContent = '专注模式已启动';
                setTimeout(() => {
                    scheduleStatus.textContent = '';
                }, 3000);
                
                clearInterval(countdownInterval);
            }, milliseconds);
        });
    }
    
    // 开始倒计时
    if (heroCountdown || pricingCountdown) {
        updateCountdown();
    }
});


// 移除或注释掉整个倒计时逻辑
/*
// 限时优惠倒计时
function startCountdown() {
    const countdownElements = document.querySelectorAll('.countdown-timer');
    if (countdownElements.length === 0) return;
    
    // 设置倒计时结束时间（24小时后）
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);
    
    // 更新倒计时
    function updateCountdown() {
        const now = new Date();
        const diff = endTime - now;
        
        if (diff <= 0) {
            // 倒计时结束，重置为24小时
            endTime.setHours(endTime.getHours() + 24);
        }
        
        // 计算剩余时间
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // 更新所有倒计时显示
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        countdownElements.forEach(element => {
            element.textContent = timeString;
        });
    }
    
    // 立即更新一次
    updateCountdown();
    
    // 每秒更新一次
    setInterval(updateCountdown, 1000);
}

// 页面加载完成后启动倒计时
document.addEventListener('DOMContentLoaded', function() {
    startCountdown();
});
*/

// 替换为空函数，以防其他代码调用
function startCountdown() {
    // 倒计时功能已移除
    console.log('倒计时功能已移除');
}

// 确保在playground.js中更新计时器显示时检查显示设置
function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const displayText = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    // 更新预览屏幕中的计时器显示
    const previewTimer = document.getElementById('previewTimer');
    if (previewTimer) {
        previewTimer.textContent = displayText;
        
        // 检查是否应该显示计时器
        const showCountdown = localStorage.getItem('showCountdown') === 'true';
        previewTimer.style.display = showCountdown ? 'block' : 'none';
    }
}

// 添加全局变量跟踪计时器状态
let isTimerRunning = false;
let timerInterval = null;

// 修复开始专注功能，确保多次点击不会导致显示异常
function startFocusTimer(seconds) {
    // 停止之前的计时器
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // 设置计时器状态
    isTimerRunning = true;
    remainingTime = seconds;
    
    // 更新显示
    updateTimerDisplay(remainingTime);
    
    // 显示专注模式启动提示，并设置3秒后自动消失
    const previewMessage = document.querySelector('.preview-message');
    if (previewMessage) {
        previewMessage.textContent = '专注模式已启动';
        previewMessage.style.display = 'block';
        
        // 3秒后自动隐藏提示
        setTimeout(() => {
            previewMessage.style.display = 'none';
        }, 3000);
    }
    
    // 启动计时器
    timerInterval = setInterval(function() {
        remainingTime--;
        
        if (remainingTime <= 0) {
            // 停止计时器
            clearInterval(timerInterval);
            timerInterval = null;
            isTimerRunning = false;
            
            // 播放提示音
            if (typeof playAlarm === 'function') {
                playAlarm();
            }
            
            // 显示提示
            alert('专注时间结束！');
            
            // 更新统计数据
            const focusMinutes = Math.floor(seconds / 60);
            if (typeof updateFocusStats === 'function') {
                updateFocusStats(focusMinutes);
            }
            
            // 重置UI
            const startTimerButton = document.getElementById('startTimer');
            if (startTimerButton) {
                startTimerButton.textContent = '开始专注';
            }
            
            // 重置显示
            const customTimeInput = document.getElementById('customTime');
            if (customTimeInput) {
                const minutes = parseInt(customTimeInput.value);
                updateTimerDisplay(minutes * 60);
            }
        } else {
            updateTimerDisplay(remainingTime);
        }
    }, 1000);
}

// 停止专注计时器
function stopFocusTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    isTimerRunning = false;
    
    // 更新UI
    const startTimerButton = document.getElementById('startTimer');
    if (startTimerButton) {
        startTimerButton.textContent = '开始专注';
    }
    
    // 重置显示
    const customTimeInput = document.getElementById('customTime');
    if (customTimeInput) {
        const minutes = parseInt(customTimeInput.value);
        updateTimerDisplay(minutes * 60);
    }
}

// 导出函数，使其在全局可用
window.startFocusTimer = startFocusTimer;
window.stopFocusTimer = stopFocusTimer;
window.updateTimerDisplay = updateTimerDisplay;