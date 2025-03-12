document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const createTimePlanBtn = document.getElementById('createTimePlan');
    const savedPlansContainer = document.getElementById('savedPlans');
    
    // 从本地存储加载已保存的时间方案
    let savedTimePlans = JSON.parse(localStorage.getItem('timePlans') || '[]');
    
    // 初始化显示已保存的方案
    renderSavedPlans();
    
    // 创建时间方案按钮点击事件
    if (createTimePlanBtn) {
        createTimePlanBtn.addEventListener('click', function() {
            showTimePlanModal();
        });
    }
    
    // 显示创建时间方案的模态框
    function showTimePlanModal() {
        // 创建模态框元素
        const modal = document.createElement('div');
        modal.className = 'time-plan-modal';
        
        // 模态框内容
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>创建个性化时间方案</h3>
                    <button class="close-button">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="plan-name-input">
                        <label for="planName">方案名称</label>
                        <input type="text" id="planName" placeholder="例如：深度工作" maxlength="20">
                    </div>
                    
                    <div class="time-segments">
                        <h4>时间段设置</h4>
                        <p class="hint">添加工作和休息时间段，创建适合您的专注节奏</p>
                        
                        <div class="segments-container" id="segmentsContainer">
                            <!-- 默认添加一个工作时间段 -->
                            <div class="segment-item" data-type="work">
                                <div class="segment-header">
                                    <span class="segment-type work">工作</span>
                                    <button class="remove-segment">&times;</button>
                                </div>
                                <div class="segment-time">
                                    <input type="number" class="segment-minutes" min="1" max="120" value="25">
                                    <span>分钟</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="add-segment-buttons">
                            <button id="addWorkSegment" class="add-segment work">
                                <i class="fas fa-plus"></i> 添加工作时间段
                            </button>
                            <button id="addBreakSegment" class="add-segment break">
                                <i class="fas fa-plus"></i> 添加休息时间段
                            </button>
                        </div>
                    </div>
                    
                    <div class="repeat-settings">
                        <h4>重复设置</h4>
                        <div class="repeat-option">
                            <input type="checkbox" id="repeatPlan" checked>
                            <label for="repeatPlan">循环重复</label>
                        </div>
                        <div class="repeat-count" id="repeatCountContainer">
                            <label for="repeatCount">重复次数</label>
                            <input type="number" id="repeatCount" min="1" max="10" value="3">
                        </div>
                    </div>
                    
                    <div class="plan-summary">
                        <h4>方案摘要</h4>
                        <div class="summary-content" id="planSummary">
                            <p>总时长: <span id="totalDuration">25</span> 分钟</p>
                            <p>包含: <span id="segmentsSummary">1个工作时间段</span></p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="cancelPlan" class="secondary-button">取消</button>
                    <button id="savePlan" class="primary-button">保存方案</button>
                </div>
            </div>
        `;
        
        // 添加模态框到页面
        document.body.appendChild(modal);
        
        // 获取模态框内的元素
        const closeButton = modal.querySelector('.close-button');
        const cancelButton = modal.querySelector('#cancelPlan');
        const saveButton = modal.querySelector('#savePlan');
        const addWorkSegmentBtn = modal.querySelector('#addWorkSegment');
        const addBreakSegmentBtn = modal.querySelector('#addBreakSegment');
        const segmentsContainer = modal.querySelector('#segmentsContainer');
        const repeatPlanCheckbox = modal.querySelector('#repeatPlan');
        const repeatCountContainer = modal.querySelector('#repeatCountContainer');
        const planNameInput = modal.querySelector('#planName');
        
        // 关闭模态框的事件
        closeButton.addEventListener('click', closeModal);
        cancelButton.addEventListener('click', closeModal);
        
        // 添加工作时间段
        addWorkSegmentBtn.addEventListener('click', function() {
            addSegment('work');
            updatePlanSummary();
        });
        
        // 添加休息时间段
        addBreakSegmentBtn.addEventListener('click', function() {
            addSegment('break');
            updatePlanSummary();
        });
        
        // 重复设置变化事件
        repeatPlanCheckbox.addEventListener('change', function() {
            repeatCountContainer.style.display = this.checked ? 'flex' : 'none';
            updatePlanSummary();
        });
        
        // 监听时间段变化
        segmentsContainer.addEventListener('input', function(e) {
            if (e.target.classList.contains('segment-minutes')) {
                updatePlanSummary();
            }
        });
        
        // 监听删除时间段
        segmentsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-segment')) {
                const segmentItem = e.target.closest('.segment-item');
                if (segmentItem && segmentsContainer.children.length > 1) {
                    segmentItem.remove();
                    updatePlanSummary();
                } else if (segmentsContainer.children.length <= 1) {
                    showNotification('至少需要保留一个时间段', 'error');
                }
            }
        });
        
        // 保存方案
        saveButton.addEventListener('click', function() {
            const planName = planNameInput.value.trim();
            if (!planName) {
                showNotification('请输入方案名称', 'error');
                return;
            }
            
            // 收集所有时间段
            const segments = [];
            const segmentItems = segmentsContainer.querySelectorAll('.segment-item');
            
            segmentItems.forEach(item => {
                const type = item.getAttribute('data-type');
                const minutes = parseInt(item.querySelector('.segment-minutes').value);
                
                if (minutes > 0) {
                    segments.push({
                        type: type,
                        minutes: minutes
                    });
                }
            });
            
            if (segments.length === 0) {
                showNotification('请至少添加一个有效的时间段', 'error');
                return;
            }
            
            // 创建方案对象
            const timePlan = {
                id: Date.now().toString(),
                name: planName,
                segments: segments,
                repeat: repeatPlanCheckbox.checked,
                repeatCount: repeatPlanCheckbox.checked ? parseInt(document.getElementById('repeatCount').value) : 1,
                createdAt: new Date().toISOString()
            };
            
            // 保存到本地存储
            savedTimePlans.push(timePlan);
            localStorage.setItem('timePlans', JSON.stringify(savedTimePlans));
            
            // 更新显示
            renderSavedPlans();
            
            // 关闭模态框
            closeModal();
            
            // 显示成功通知
            showNotification('时间方案已保存', 'success');
        });
        
        // 添加时间段
        function addSegment(type) {
            const segmentItem = document.createElement('div');
            segmentItem.className = 'segment-item';
            segmentItem.setAttribute('data-type', type);
            
            segmentItem.innerHTML = `
                <div class="segment-header">
                    <span class="segment-type ${type}">${type === 'work' ? '工作' : '休息'}</span>
                    <button class="remove-segment">&times;</button>
                </div>
                <div class="segment-time">
                    <input type="number" class="segment-minutes" min="1" max="120" value="${type === 'work' ? '25' : '5'}">
                    <span>分钟</span>
                </div>
            `;
            
            segmentsContainer.appendChild(segmentItem);
        }
        
        // 更新方案摘要
        function updatePlanSummary() {
            const totalDurationSpan = document.getElementById('totalDuration');
            const segmentsSummarySpan = document.getElementById('segmentsSummary');
            
            let totalMinutes = 0;
            let workCount = 0;
            let breakCount = 0;
            
            // 计算所有时间段
            const segmentItems = segmentsContainer.querySelectorAll('.segment-item');
            segmentItems.forEach(item => {
                const type = item.getAttribute('data-type');
                const minutes = parseInt(item.querySelector('.segment-minutes').value) || 0;
                
                totalMinutes += minutes;
                
                if (type === 'work') {
                    workCount++;
                } else if (type === 'break') {
                    breakCount++;
                }
            });
            
            // 考虑重复次数
            const repeatCount = repeatPlanCheckbox.checked ? parseInt(document.getElementById('repeatCount').value) : 1;
            totalMinutes *= repeatCount;
            
            // 更新摘要显示
            totalDurationSpan.textContent = totalMinutes;
            
            let summaryText = '';
            if (workCount > 0) {
                summaryText += `${workCount}个工作时间段`;
            }
            if (breakCount > 0) {
                if (summaryText) summaryText += '，';
                summaryText += `${breakCount}个休息时间段`;
            }
            if (repeatCount > 1) {
                summaryText += `，重复${repeatCount}次`;
            }
            
            segmentsSummarySpan.textContent = summaryText;
        }
        
        // 关闭模态框
        function closeModal() {
            document.body.removeChild(modal);
        }
        
        // 初始化摘要
        updatePlanSummary();
    }
    
    // 渲染已保存的时间方案
    function renderSavedPlans() {
        if (!savedPlansContainer) return;
        
        // 清空容器
        savedPlansContainer.innerHTML = '';
        
        // 如果没有保存的方案，显示提示
        if (savedTimePlans.length === 0) {
            savedPlansContainer.innerHTML = '<p class="no-plans">暂无保存的时间方案</p>';
            return;
        }
        
        // 添加每个方案
        savedTimePlans.forEach(plan => {
            const planItem = document.createElement('div');
            planItem.className = 'plan-item';
            planItem.setAttribute('data-id', plan.id);
            
            // 计算总时长
            let totalMinutes = 0;
            plan.segments.forEach(segment => {
                totalMinutes += segment.minutes;
            });
            totalMinutes *= plan.repeat ? plan.repeatCount : 1;
            
            // 创建时间段指示器
            let segmentIndicators = '';
            plan.segments.forEach(segment => {
                segmentIndicators += `<span class="segment-indicator ${segment.type}"></span>`;
            });
            
            // 如果重复，添加重复指示
            if (plan.repeat && plan.repeatCount > 1) {
                segmentIndicators += `<span class="repeat-indicator">×${plan.repeatCount}</span>`;
            }
            
            planItem.innerHTML = `
                <div class="plan-info">
                    <h4 class="plan-name">${plan.name}</h4>
                    <div class="plan-duration">${totalMinutes}分钟</div>
                </div>
                <div class="plan-segments">
                    ${segmentIndicators}
                </div>
                <div class="plan-actions">
                    <button class="start-plan" data-id="${plan.id}">启动</button>
                    <button class="delete-plan" data-id="${plan.id}">删除</button>
                </div>
            `;
            
            savedPlansContainer.appendChild(planItem);
        });
        
        // 添加启动方案事件
        const startPlanButtons = savedPlansContainer.querySelectorAll('.start-plan');
        startPlanButtons.forEach(button => {
            button.addEventListener('click', function() {
                const planId = this.getAttribute('data-id');
                startTimePlan(planId);
            });
        });
        
        // 添加删除方案事件
        const deletePlanButtons = savedPlansContainer.querySelectorAll('.delete-plan');
        deletePlanButtons.forEach(button => {
            button.addEventListener('click', function() {
                const planId = this.getAttribute('data-id');
                deleteTimePlan(planId);
            });
        });
    }
    
    // 启动时间方案
    function startTimePlan(planId) {
        // 查找方案
        const plan = savedTimePlans.find(p => p.id === planId);
        if (!plan) return;
        
        // 显示确认对话框
        if (confirm(`确定要启动"${plan.name}"时间方案吗？`)) {
            // 停止当前正在运行的计时器
            if (typeof stopTimer === 'function' && typeof isTimerRunning !== 'undefined' && isTimerRunning) {
                stopTimer();
            }
            
            // 停止当前正在运行的番茄钟
            if (typeof stopPomodoro === 'function' && typeof isPomodoroRunning !== 'undefined' && isPomodoroRunning) {
                stopPomodoro();
            }
            
            // 创建时间方案会话
            const planSession = {
                planId: plan.id,
                planName: plan.name,
                segments: JSON.parse(JSON.stringify(plan.segments)),
                repeat: plan.repeat,
                repeatCount: plan.repeatCount,
                currentSegmentIndex: 0,
                currentRepeat: 1,
                startTime: new Date().toISOString(),
                status: 'running'
            };
            
            // 保存当前会话到本地存储
            localStorage.setItem('currentPlanSession', JSON.stringify(planSession));
            
            // 启动第一个时间段
            startNextSegment(planSession);
            
            // 显示通知
            showNotification(`已启动"${plan.name}"时间方案`, 'success');
        }
    }
    
    // 启动下一个时间段
    function startNextSegment(session) {
        // 检查是否已完成所有重复
        if (session.currentRepeat > session.repeatCount) {
            completePlanSession(session);
            return;
        }
        
        // 获取当前时间段
        const currentSegment = session.segments[session.currentSegmentIndex];
        if (!currentSegment) {
            // 如果当前重复已完成所有时间段，进入下一个重复
            session.currentSegmentIndex = 0;
            session.currentRepeat++;
            
            // 保存更新后的会话
            localStorage.setItem('currentPlanSession', JSON.stringify(session));
            
            // 递归调用启动下一个时间段
            startNextSegment(session);
            return;
        }
        
        // 更新UI显示当前时间段
        updateCurrentSegmentUI(currentSegment, session);
        
        // 启动计时器
        if (typeof startFocusTimer === 'function') {
            startFocusTimer(currentSegment.minutes * 60);
            
            // 设置计时器结束回调
            window.onTimerComplete = function() {
                // 播放提示音
                if (typeof playAlarm === 'function') {
                    playAlarm();
                }
                
                // 更新会话状态
                session.currentSegmentIndex++;
                localStorage.setItem('currentPlanSession', JSON.stringify(session));
                
                // 显示通知
                const segmentType = currentSegment.type === 'work' ? '工作' : '休息';
                showNotification(`${segmentType}时间段已完成`, 'info');
                
                // 如果是工作时间段，更新专注统计
                if (currentSegment.type === 'work' && typeof updateFocusStats === 'function') {
                    updateFocusStats(currentSegment.minutes);
                }
                
                // 延迟一秒后启动下一个时间段
                setTimeout(() => {
                    startNextSegment(session);
                }, 1000);
            };
        }
    }
    
    // 更新当前时间段UI
    function updateCurrentSegmentUI(segment, session) {
        const segmentType = segment.type === 'work' ? '工作' : '休息';
        const minutes = segment.minutes;
        
        // 更新状态显示
        const statusElement = document.getElementById('planStatus');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="current-plan">
                    <h4>${session.planName}</h4>
                    <div class="plan-progress">
                        <span class="segment-type ${segment.type}">${segmentType}</span>
                        <span class="segment-time">${minutes}分钟</span>
                        <span class="repeat-info">第${session.currentRepeat}/${session.repeatCount}轮</span>
                    </div>
                </div>
            `;
        } else {
            // 如果状态元素不存在，创建一个
            const planStatusDiv = document.createElement('div');
            planStatusDiv.id = 'planStatus';
            planStatusDiv.className = 'plan-status';
            planStatusDiv.innerHTML = `
                <div class="current-plan">
                    <h4>${session.planName}</h4>
                    <div class="plan-progress">
                        <span class="segment-type ${segment.type}">${segmentType}</span>
                        <span class="segment-time">${minutes}分钟</span>
                        <span class="repeat-info">第${session.currentRepeat}/${session.repeatCount}轮</span>
                    </div>
                </div>
                <button id="stopPlan" class="stop-plan">停止方案</button>
            `;
            
            // 添加到已保存方案容器之前
            if (savedPlansContainer && savedPlansContainer.parentNode) {
                savedPlansContainer.parentNode.insertBefore(planStatusDiv, savedPlansContainer);
                
                // 添加停止方案事件
                document.getElementById('stopPlan').addEventListener('click', function() {
                    stopCurrentPlan();
                });
            }
        }
        
        // 更新屏幕预览
        const previewMessage = document.getElementById('previewMessage');
        if (previewMessage) {
            const segmentTypeText = segment.type === 'work' ? '专注工作' : '休息时间';
            previewMessage.textContent = `${session.planName} - ${segmentTypeText}`;
        }
    }
    
    // 完成时间方案会话
    function completePlanSession(session) {
        // 清除当前会话
        localStorage.removeItem('currentPlanSession');
        
        // 更新UI
        const planStatusElement = document.getElementById('planStatus');
        if (planStatusElement && planStatusElement.parentNode) {
            planStatusElement.parentNode.removeChild(planStatusElement);
        }
        
        // 重置屏幕预览
        const previewMessage = document.getElementById('previewMessage');
        if (previewMessage) {
            previewMessage.textContent = '准备就绪';
        }
        
        // 显示通知
        showNotification(`"${session.planName}"时间方案已完成`, 'success');
        
        // 播放完成提示音
        if (typeof playAlarm === 'function') {
            playAlarm();
        }
        
        // 弹出完成提示
        setTimeout(() => {
            alert(`恭喜！您已完成"${session.planName}"时间方案。`);
        }, 500);
    }
    
    // 停止当前时间方案
    function stopCurrentPlan() {
        // 获取当前会话
        const sessionJson = localStorage.getItem('currentPlanSession');
        if (!sessionJson) return;
        
        const session = JSON.parse(sessionJson);
        
        // 确认停止
        if (confirm(`确定要停止"${session.planName}"时间方案吗？`)) {
            // 停止当前计时器
            if (typeof stopTimer === 'function') {
                stopTimer();
            }
            
            // 清除当前会话
            localStorage.removeItem('currentPlanSession');
            
            // 更新UI
            const planStatusElement = document.getElementById('planStatus');
            if (planStatusElement && planStatusElement.parentNode) {
                planStatusElement.parentNode.removeChild(planStatusElement);
            }
            
            // 重置屏幕预览
            const previewMessage = document.getElementById('previewMessage');
            if (previewMessage) {
                previewMessage.textContent = '准备就绪';
            }
            
            // 显示通知
            showNotification(`已停止"${session.planName}"时间方案`, 'info');
        }
    }
    
    // 删除时间方案
    function deleteTimePlan(planId) {
        // 查找方案
        const planIndex = savedTimePlans.findIndex(p => p.id === planId);
        if (planIndex === -1) return;
        
        const plan = savedTimePlans[planIndex];
        
        // 确认删除
        if (confirm(`确定要删除"${plan.name}"时间方案吗？`)) {
            // 检查是否正在运行该方案
            const currentSessionJson = localStorage.getItem('currentPlanSession');
            if (currentSessionJson) {
                const currentSession = JSON.parse(currentSessionJson);
                if (currentSession.planId === planId) {
                    // 如果正在运行，先停止
                    stopCurrentPlan();
                }
            }
            
            // 从数组中移除
            savedTimePlans.splice(planIndex, 1);
            
            // 更新本地存储
            localStorage.setItem('timePlans', JSON.stringify(savedTimePlans));
            
            // 更新显示
            renderSavedPlans();
            
            // 显示通知
            showNotification(`已删除"${plan.name}"时间方案`, 'info');
        }
    }
    
    // 显示通知
    function showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动关闭
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // 检查是否有未完成的时间方案会话
    function checkForUnfinishedSession() {
        const sessionJson = localStorage.getItem('currentPlanSession');
        if (!sessionJson) return;
        
        try {
            const session = JSON.parse(sessionJson);
            
            // 确认是否继续
            if (confirm(`发现未完成的"${session.planName}"时间方案，是否继续？`)) {
                // 启动下一个时间段
                startNextSegment(session);
            } else {
                // 清除会话
                localStorage.removeItem('currentPlanSession');
            }
        } catch (e) {
            console.error('解析未完成会话出错:', e);
            localStorage.removeItem('currentPlanSession');
        }
    }
    
    // 页面加载时检查未完成会话
    checkForUnfinishedSession();
});