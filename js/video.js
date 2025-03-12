document.addEventListener('DOMContentLoaded', function() {
    const videoContainer = document.querySelector('.video-container');
    const video = document.querySelector('.video-container video');
    const playButton = document.querySelector('.play-button');
    const videoOverlay = document.querySelector('.video-overlay');
    
    if (videoContainer && video && playButton && videoOverlay) {
        // 点击播放按钮时播放视频
        playButton.addEventListener('click', function() {
            videoOverlay.style.opacity = '0';
            
            // 延迟后隐藏覆盖层，确保过渡效果完成
            setTimeout(() => {
                videoOverlay.style.display = 'none';
            }, 500);
            
            // 播放视频
            video.play();
        });
        
        // 点击视频时暂停/播放
        video.addEventListener('click', function() {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
        
        // 视频播放结束时重置覆盖层
        video.addEventListener('ended', function() {
            videoOverlay.style.display = 'flex';
            videoOverlay.style.opacity = '1';
        });
        
        // 添加键盘控制
        document.addEventListener('keydown', function(e) {
            // 只有当视频在视口中时才响应键盘事件
            const rect = videoContainer.getBoundingClientRect();
            const isInViewport = (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
            
            if (!isInViewport) return;
            
            // 空格键控制播放/暂停
            if (e.code === 'Space') {
                e.preventDefault();
                if (video.paused) {
                    video.play();
                    videoOverlay.style.opacity = '0';
                    setTimeout(() => {
                        videoOverlay.style.display = 'none';
                    }, 500);
                } else {
                    video.pause();
                }
            }
            
            // 左右箭头控制快进/快退
            if (e.code === 'ArrowLeft') {
                video.currentTime = Math.max(0, video.currentTime - 5);
            }
            
            if (e.code === 'ArrowRight') {
                video.currentTime = Math.min(video.duration, video.currentTime + 5);
            }
            
            // 上下箭头控制音量
            if (e.code === 'ArrowUp') {
                video.volume = Math.min(1, video.volume + 0.1);
            }
            
            if (e.code === 'ArrowDown') {
                video.volume = Math.max(0, video.volume - 0.1);
            }
        });
    }
});