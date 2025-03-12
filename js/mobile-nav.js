document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    if (menuToggle && navMenu) {
        // 切换菜单显示/隐藏
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // 点击导航链接后关闭菜单
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
        
        // 点击页面其他区域关闭菜单
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        // 添加滑动手势支持
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const swipeThreshold = 100;
            
            // 从左向右滑动打开菜单
            if (touchEndX - touchStartX > swipeThreshold && !navMenu.classList.contains('active')) {
                menuToggle.classList.add('active');
                navMenu.classList.add('active');
                document.body.classList.add('menu-open');
            }
            
            // 从右向左滑动关闭菜单
            if (touchStartX - touchEndX > swipeThreshold && navMenu.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        }
    }
});