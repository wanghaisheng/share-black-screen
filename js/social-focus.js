document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const sessionNameInput = document.getElementById('sessionName');
    const createSessionBtn = document.getElementById('createSession');
    const friendEmailInput = document.getElementById('friendEmail');
    const inviteFriendBtn = document.getElementById('inviteFriend');
    const activeSessionDiv = document.getElementById('activeSession');
    const currentSessionNameSpan = document.getElementById('currentSessionName');
    const sessionCodeSpan = document.getElementById('sessionCode');
    const memberCountSpan = document.getElementById('memberCount');
    const membersListUl = document.getElementById('membersList');
    const leaveSessionBtn = document.getElementById('leaveSession');
    const copyInviteLinkBtn = document.getElementById('copyInviteLink');
    const joinCodeInput = document.getElementById('joinCode');
    const joinSessionBtn = document.getElementById('joinSession');
    
    // 会话状态
    let currentSession = null;
    let sessionMembers = [];
    let isHost = false;
    
    // 创建专注会话
    if (createSessionBtn) {
        createSessionBtn.addEventListener('click', function() {
            const sessionName = sessionNameInput.value.trim();
            if (!sessionName) {
                showNotification('请输入会话名称', 'error');
                return;
            }
            
            // 生成随机会话码
            const sessionCode = generateSessionCode();
            
            // 创建会话对象
            currentSession = {
                id: sessionCode,
                name: sessionName,
                host: '当前用户',
                createdAt: new Date().toISOString()
            };
            
            // 更新UI
            currentSessionNameSpan.textContent = sessionName;
            sessionCodeSpan.textContent = sessionCode;
            activeSessionDiv.style.display = 'block';
            
            // 重置会话成员列表
            sessionMembers = [{
                id: 'self',
                name: '我 (主持人)',
                status: '专注中',
                isHost: true
            }];
            updateMembersList();
            
            // 设置为主持人
            isHost = true;
            
            // 显示通知
            showNotification('专注会话已创建，可以邀请好友加入了！', 'success');
            
            // 模拟会话创建的网络请求
            simulateNetworkRequest('创建会话', {
                sessionCode: sessionCode,
                sessionName: sessionName
            });
        });
    }
    
    // 邀请好友
    if (inviteFriendBtn) {
        inviteFriendBtn.addEventListener('click', function() {
            if (!currentSession) {
                showNotification('请先创建专注会话', 'error');
                return;
            }
            
            const email = friendEmailInput.value.trim();
            if (!email || !validateEmail(email)) {
                showNotification('请输入有效的邮箱地址', 'error');
                return;
            }
            
            // 生成邀请链接
            const inviteLink = generateInviteLink(currentSession.id);
            
            // 模拟发送邀请邮件
            simulateNetworkRequest('发送邀请', {
                email: email,
                sessionCode: currentSession.id,
                sessionName: currentSession.name,
                inviteLink: inviteLink
            });
            
            // 显示通知
            showNotification(`邀请已发送至 ${email}`, 'success');
            
            // 清空输入框
            friendEmailInput.value = '';
            
            // 模拟好友加入
            setTimeout(() => {
                const friendName = email.split('@')[0];
                addMember({
                    id: 'friend-' + Math.floor(Math.random() * 1000),
                    name: friendName,
                    status: '已加入',
                    isHost: false
                });
                
                showNotification(`${friendName} 已加入专注会话`, 'info');
            }, 3000);
        });
    }
    
    // 复制邀请链接
    if (copyInviteLinkBtn) {
        copyInviteLinkBtn.addEventListener('click', function() {
            if (!currentSession) {
                showNotification('请先创建专注会话', 'error');
                return;
            }
            
            const inviteLink = generateInviteLink(currentSession.id);
            
            // 复制到剪贴板
            navigator.clipboard.writeText(inviteLink).then(() => {
                showNotification('邀请链接已复制到剪贴板', 'success');
            }).catch(err => {
                console.error('无法复制链接: ', err);
                showNotification('复制链接失败，请手动复制', 'error');
                
                // 显示链接供手动复制
                alert(`请手动复制邀请链接：${inviteLink}`);
            });
        });
    }
    
    // 加入会话
    if (joinSessionBtn) {
        joinSessionBtn.addEventListener('click', function() {
            const code = joinCodeInput.value.trim();
            if (!code) {
                showNotification('请输入会话码', 'error');
                return;
            }
            
            // 模拟验证会话码
            simulateNetworkRequest('验证会话码', {
                sessionCode: code
            });
            
            // 模拟加入会话
            setTimeout(() => {
                // 创建会话对象
                currentSession = {
                    id: code,
                    name: '好友的专注会话',
                    host: '好友',
                    createdAt: new Date().toISOString()
                };
                
                // 更新UI
                currentSessionNameSpan.textContent = currentSession.name;
                sessionCodeSpan.textContent = code;
                activeSessionDiv.style.display = 'block';
                
                // 设置会话成员
                sessionMembers = [
                    {
                        id: 'host',
                        name: '好友 (主持人)',
                        status: '专注中',
                        isHost: true
                    },
                    {
                        id: 'self',
                        name: '我',
                        status: '专注中',
                        isHost: false
                    }
                ];
                updateMembersList();
                
                // 设置为参与者
                isHost = false;
                
                // 显示通知
                showNotification('已成功加入专注会话', 'success');
                
                // 清空输入框
                joinCodeInput.value = '';
            }, 1500);
        });
    }
    
    // 退出会话
    if (leaveSessionBtn) {
        leaveSessionBtn.addEventListener('click', function() {
            if (!currentSession) {
                return;
            }
            
            // 确认退出
            if (confirm(isHost ? '作为主持人退出将结束整个会话，确定要退出吗？' : '确定要退出当前专注会话吗？')) {
                // 模拟退出会话
                simulateNetworkRequest('退出会话', {
                    sessionCode: currentSession.id,
                    isHost: isHost
                });
                
                // 重置会话状态
                currentSession = null;
                sessionMembers = [];
                isHost = false;
                
                // 更新UI
                activeSessionDiv.style.display = 'none';
                
                // 显示通知
                showNotification('已退出专注会话', 'info');
            }
        });
    }
    
    // 添加会话成员
    function addMember(member) {
        // 检查成员是否已存在
        const existingMemberIndex = sessionMembers.findIndex(m => m.id === member.id);
        if (existingMemberIndex >= 0) {
            // 更新现有成员状态
            sessionMembers[existingMemberIndex].status = member.status;
        } else {
            // 添加新成员
            sessionMembers.push(member);
        }
        
        // 更新UI
        updateMembersList();
    }
    
    // 更新成员列表UI
    function updateMembersList() {
        // 更新成员数量
        memberCountSpan.textContent = sessionMembers.length;
        
        // 清空列表
        membersListUl.innerHTML = '';
        
        // 添加成员
        sessionMembers.forEach(member => {
            const li = document.createElement('li');
            li.className = 'member-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'member-name';
            nameSpan.textContent = member.name;
            
            const statusSpan = document.createElement('span');
            statusSpan.className = 'member-status';
            statusSpan.textContent = member.status;
            
            li.appendChild(nameSpan);
            li.appendChild(statusSpan);
            membersListUl.appendChild(li);
        });
    }
    
    // 生成随机会话码
    function generateSessionCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    // 生成邀请链接
    function generateInviteLink(sessionCode) {
        return `https://shareblackscreen.com/join?code=${sessionCode}`;
    }
    
    // 验证邮箱格式
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
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
    
    // 模拟网络请求
    function simulateNetworkRequest(action, data) {
        console.log(`模拟${action}请求:`, data);
        // 在实际应用中，这里会发送真实的API请求
    }
    
    // 模拟会话状态更新
    function simulateSessionUpdates() {
        if (!currentSession) return;
        
        // 随机更新成员状态
        const statuses = ['专注中', '暂停', '已完成'];
        
        setInterval(() => {
            if (!currentSession || sessionMembers.length <= 1) return;
            
            // 随机选择一个非自己的成员
            const otherMembers = sessionMembers.filter(m => m.id !== 'self');
            if (otherMembers.length === 0) return;
            
            const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            // 更新状态
            const memberIndex = sessionMembers.findIndex(m => m.id === randomMember.id);
            if (memberIndex >= 0) {
                sessionMembers[memberIndex].status = randomStatus;
                updateMembersList();
            }
        }, 15000); // 每15秒更新一次
    }
    
    // 启动模拟更新
    simulateSessionUpdates();
    
    // 添加聊天功能
    const chatContainer = document.getElementById('chatContainer');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessage');
    
    // 聊天功能
    if (chatInput && sendMessageBtn) {
        // 发送消息
        sendMessageBtn.addEventListener('click', function() {
            sendChatMessage();
        });
        
        // 按Enter键发送消息
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            }
        });
        
        // 发送聊天消息
        function sendChatMessage() {
            const message = chatInput.value.trim();
            if (!message || !currentSession) return;
            
            // 添加消息到聊天窗口
            addChatMessage('我', message, true);
            
            // 清空输入框
            chatInput.value = '';
            
            // 模拟发送消息请求
            simulateNetworkRequest('发送消息', {
                sessionCode: currentSession.id,
                message: message,
                sender: '我'
            });
            
            // 模拟其他成员回复
            simulateMemberResponse();
        }
        
        // 添加聊天消息到窗口
        function addChatMessage(sender, message, isSelf = false) {
            if (!chatMessages) return;
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${isSelf ? 'self' : 'other'}`;
            
            const senderSpan = document.createElement('span');
            senderSpan.className = 'message-sender';
            senderSpan.textContent = sender;
            
            const contentP = document.createElement('p');
            contentP.className = 'message-content';
            contentP.textContent = message;
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'message-time';
            timeSpan.textContent = formatTime(new Date());
            
            messageDiv.appendChild(senderSpan);
            messageDiv.appendChild(contentP);
            messageDiv.appendChild(timeSpan);
            
            chatMessages.appendChild(messageDiv);
            
            // 滚动到底部
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // 模拟其他成员回复
        function simulateMemberResponse() {
            if (!currentSession || sessionMembers.length <= 1) return;
            
            // 随机选择一个非自己的成员
            const otherMembers = sessionMembers.filter(m => m.id !== 'self');
            if (otherMembers.length === 0) return;
            
            const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
            
            // 随机回复消息
            const responses = [
                '我也在专注中，加油！',
                '今天的任务真多，一起努力！',
                '专注模式真的很有效，感谢分享',
                '我们一起完成今天的目标吧',
                '休息一下再继续，别忘了喝水',
                '这个专注会话功能真棒',
                '我已经完成了一半的任务',
                '有问题可以随时讨论'
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            // 延迟显示回复
            setTimeout(() => {
                addChatMessage(randomMember.name, randomResponse, false);
            }, 2000 + Math.random() * 3000);
        }
    }
    
    // 添加会话同步功能
    const syncToggle = document.getElementById('syncToggle');
    
    if (syncToggle) {
        syncToggle.addEventListener('change', function() {
            const isSync = this.checked;
            
            if (!currentSession) {
                showNotification('请先创建或加入专注会话', 'error');
                this.checked = false;
                return;
            }
            
            if (isSync) {
                // 启用同步
                showNotification('已启用专注同步，您的专注状态将与会话成员共享', 'success');
                
                // 模拟启用同步请求
                simulateNetworkRequest('启用同步', {
                    sessionCode: currentSession.id,
                    syncEnabled: true
                });
                
                // 添加同步状态监听
                if (typeof startTimer !== 'undefined' && startTimer) {
                    const originalStartTimer = startTimer.onclick;
                    startTimer.onclick = function(e) {
                        // 调用原始点击处理函数
                        if (originalStartTimer) originalStartTimer.call(this, e);
                        
                        // 同步专注状态
                        if (currentSession) {
                            const status = isTimerRunning ? '专注中' : '暂停';
                            simulateNetworkRequest('同步状态', {
                                sessionCode: currentSession.id,
                                status: status
                            });
                            
                            // 更新自己的状态
                            const selfIndex = sessionMembers.findIndex(m => m.id === 'self');
                            if (selfIndex >= 0) {
                                sessionMembers[selfIndex].status = status;
                                updateMembersList();
                            }
                        }
                    };
                }
            } else {
                // 禁用同步
                showNotification('已禁用专注同步', 'info');
                
                // 模拟禁用同步请求
                simulateNetworkRequest('禁用同步', {
                    sessionCode: currentSession.id,
                    syncEnabled: false
                });
                
                // 恢复原始事件处理
                if (typeof startTimer !== 'undefined' && startTimer) {
                    startTimer.onclick = null;
                }
            }
        });
    }
    
    // 添加会话统计功能
    function updateSessionStats() {
        if (!currentSession) return;
        
        const statsContainer = document.getElementById('sessionStats');
        if (!statsContainer) return;
        
        // 计算会话统计数据
        const totalMembers = sessionMembers.length;
        const activeMembersCount = sessionMembers.filter(m => m.status === '专注中').length;
        const completedMembersCount = sessionMembers.filter(m => m.status === '已完成').length;
        
        // 更新统计显示
        const statsHTML = `
            <div class="stat-item">
                <span class="stat-value">${totalMembers}</span>
                <span class="stat-label">总成员</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${activeMembersCount}</span>
                <span class="stat-label">专注中</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${completedMembersCount}</span>
                <span class="stat-label">已完成</span>
            </div>
        `;
        
        statsContainer.innerHTML = statsHTML;
    }
    
    // 在成员列表更新时同步更新统计
    const originalUpdateMembersList = updateMembersList;
    updateMembersList = function() {
        originalUpdateMembersList();
        updateSessionStats();
    };
    
    // 格式化时间
    function formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // 添加会话提醒功能
    function setupSessionReminders() {
        if (!currentSession) return;
        
        // 设置定时提醒
        const reminderInterval = setInterval(() => {
            // 检查是否还在会话中
            if (!currentSession) {
                clearInterval(reminderInterval);
                return;
            }
            
            // 获取专注中的成员数量
            const focusingMembers = sessionMembers.filter(m => m.status === '专注中').length;
            const totalMembers = sessionMembers.length;
            
            // 如果大部分成员都在专注，但自己不是，发送提醒
            const selfMember = sessionMembers.find(m => m.id === 'self');
            if (selfMember && selfMember.status !== '专注中' && focusingMembers > totalMembers / 2) {
                showNotification('大家都在专注，你也开始吧！', 'info');
            }
            
        }, 5 * 60 * 1000); // 每5分钟检查一次
        
        // 存储定时器ID以便清理
        if (!window.sessionTimers) window.sessionTimers = [];
        window.sessionTimers.push(reminderInterval);
    }
    
    // 在创建或加入会话时设置提醒
    const originalCreateSession = createSessionBtn.onclick;
    createSessionBtn.onclick = function(e) {
        if (originalCreateSession) originalCreateSession.call(this, e);
        setupSessionReminders();
    };
    
    const originalJoinSession = joinSessionBtn.onclick;
    joinSessionBtn.onclick = function(e) {
        if (originalJoinSession) originalJoinSession.call(this, e);
        setupSessionReminders();
    };
    
    // 清理会话定时器
    const originalLeaveSession = leaveSessionBtn.onclick;
    leaveSessionBtn.onclick = function(e) {
        // 清理所有会话相关定时器
        if (window.sessionTimers) {
            window.sessionTimers.forEach(timer => clearInterval(timer));
            window.sessionTimers = [];
        }
        
        if (originalLeaveSession) originalLeaveSession.call(this, e);
    };
});

// 初始化专注排行榜
function initLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    if (!leaderboardList) return;
    
    // 模拟排行榜数据
    const leaderboardData = [
        { rank: 1, name: '张三', time: '320分钟' },
        { rank: 2, name: '李四', time: '285分钟' },
        { rank: 3, name: '王五', time: '260分钟' },
        { rank: 4, name: '赵六', time: '210分钟' },
        { rank: 5, name: '我', time: '180分钟' }
    ];
    
    // 清空现有数据
    leaderboardList.innerHTML = '';
    
    // 添加排行榜项目
    leaderboardData.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'leaderboard-item';
        
        // 高亮当前用户
        if (item.name === '我') {
            listItem.classList.add('current-user');
        }
        
        listItem.innerHTML = `
            <span class="rank-column">${item.rank}</span>
            <span class="name-column">${item.name}</span>
            <span class="time-column">${item.time}</span>
        `;
        
        leaderboardList.appendChild(listItem);
    });
}

// 页面加载完成后初始化排行榜
document.addEventListener('DOMContentLoaded', function() {
    initLeaderboard();
    
    // 添加专注小组相关功能
    const createSessionBtn = document.getElementById('createSession');
    const joinSessionBtn = document.getElementById('joinSession');
    const leaveSessionBtn = document.getElementById('leaveSession');
    const copyInviteLinkBtn = document.getElementById('copyInviteLink');
    
    if (createSessionBtn) {
        createSessionBtn.addEventListener('click', function() {
            const sessionName = document.getElementById('sessionName').value;
            if (!sessionName) {
                alert('请输入专注会话名称');
                return;
            }
            
            // 显示活动会话区域
            const activeSession = document.getElementById('activeSession');
            if (activeSession) {
                activeSession.style.display = 'block';
            }
            
            // 更新会话信息
            const currentSessionName = document.getElementById('currentSessionName');
            const sessionCode = document.getElementById('sessionCode');
            
            if (currentSessionName) {
                currentSessionName.textContent = sessionName;
            }
            
            if (sessionCode) {
                // 生成随机会话码
                const randomCode = Math.floor(100000 + Math.random() * 900000);
                sessionCode.textContent = randomCode;
            }
            
            // 显示成功通知
            showNotification('专注小组创建成功！', 'success');
        });
    }
    
    if (joinSessionBtn) {
        joinSessionBtn.addEventListener('click', function() {
            const joinCode = document.getElementById('joinCode').value;
            if (!joinCode) {
                alert('请输入会话码');
                return;
            }
            
            // 显示活动会话区域
            const activeSession = document.getElementById('activeSession');
            if (activeSession) {
                activeSession.style.display = 'block';
            }
            
            // 更新会话信息
            const currentSessionName = document.getElementById('currentSessionName');
            const sessionCode = document.getElementById('sessionCode');
            
            if (currentSessionName) {
                currentSessionName.textContent = '朋友的专注会话';
            }
            
            if (sessionCode) {
                sessionCode.textContent = joinCode;
            }
            
            // 更新成员列表
            const membersList = document.getElementById('membersList');
            const memberCount = document.getElementById('memberCount');
            
            if (membersList) {
                membersList.innerHTML = `
                    <li class="member-item">
                        <span class="member-name">朋友 (主持人)</span>
                        <span class="member-status">专注中</span>
                    </li>
                    <li class="member-item">
                        <span class="member-name">我</span>
                        <span class="member-status">专注中</span>
                    </li>
                `;
            }
            
            if (memberCount) {
                memberCount.textContent = '2';
            }
            
            // 显示成功通知
            showNotification('成功加入专注小组！', 'success');
        });
    }
});