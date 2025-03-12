document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.testimonials-slider');
    
    sliders.forEach(slider => {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        // 鼠标/触摸事件处理
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // 滚动速度
            slider.scrollLeft = scrollLeft - walk;
        });
        
        // 触摸事件支持
        slider.addEventListener('touchstart', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.touches[0].pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        
        slider.addEventListener('touchend', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        
        slider.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        });
        
        // 自动滚动功能
        let autoScrollInterval;
        
        function startAutoScroll() {
            autoScrollInterval = setInterval(() => {
                slider.scrollLeft += 1;
                
                // 当滚动到最右侧时，重置到开始位置
                if (slider.scrollLeft >= (slider.scrollWidth - slider.clientWidth)) {
                    slider.scrollLeft = 0;
                }
            }, 30);
        }
        
        function stopAutoScroll() {
            clearInterval(autoScrollInterval);
        }
        
        // 当鼠标悬停在轮播图上时停止自动滚动
        slider.addEventListener('mouseenter', stopAutoScroll);
        slider.addEventListener('touchstart', stopAutoScroll);
        
        // 当鼠标离开轮播图时开始自动滚动
        slider.addEventListener('mouseleave', startAutoScroll);
        slider.addEventListener('touchend', startAutoScroll);
        
        // 初始启动自动滚动
        startAutoScroll();
        
        // 添加导航按钮
        const prevButton = document.createElement('button');
        prevButton.className = 'slider-nav prev';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        
        const nextButton = document.createElement('button');
        nextButton.className = 'slider-nav next';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        slider.parentNode.appendChild(prevButton);
        slider.parentNode.appendChild(nextButton);
        
        // 导航按钮事件
        prevButton.addEventListener('click', () => {
            stopAutoScroll();
            slider.scrollBy({
                left: -350,
                behavior: 'smooth'
            });
            setTimeout(startAutoScroll, 1000);
        });
        
        nextButton.addEventListener('click', () => {
            stopAutoScroll();
            slider.scrollBy({
                left: 350,
                behavior: 'smooth'
            });
            setTimeout(startAutoScroll, 1000);
        });
    });
});