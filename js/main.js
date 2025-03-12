document.addEventListener('DOMContentLoaded', function() {
    // 初始化粒子效果
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#6c63ff' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#6c63ff',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'grab' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 1 } },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }
    
    // 返回顶部按钮
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Cookie同意提示
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookies = document.getElementById('acceptCookies');
    
    if (cookieConsent && acceptCookies) {
        if (!localStorage.getItem('cookieConsent')) {
            setTimeout(() => {
                cookieConsent.style.display = 'block';
            }, 2000);
        }
        
        acceptCookies.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'true');
            cookieConsent.style.display = 'none';
        });
    }
    
    // 动画元素
    const animateElements = document.querySelectorAll('.animate');
    
    function checkIfInView() {
        const windowHeight = window.innerHeight;
        const windowTopPosition = window.scrollY;
        const windowBottomPosition = windowTopPosition + windowHeight;
        
        animateElements.forEach(element => {
            const elementHeight = element.offsetHeight;
            const elementTopPosition = element.offsetTop;
            const elementBottomPosition = elementTopPosition + elementHeight;
            
            if (
                (elementBottomPosition >= windowTopPosition) &&
                (elementTopPosition <= windowBottomPosition)
            ) {
                element.classList.add('active');
            }
        });
    }
    
    if (animateElements.length > 0) {
        window.addEventListener('scroll', checkIfInView);
        window.addEventListener('resize', checkIfInView);
        window.addEventListener('load', checkIfInView);
        
        // 初始检查
        checkIfInView();
    }
    
    // 表单提交
    const subscribeForm = document.getElementById('subscribeForm');
    
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const privacy = document.getElementById('privacy').checked;
            
            if (!email || !privacy) {
                alert('请填写邮箱并同意隐私政策');
                return;
            }
            
            // 这里可以添加AJAX请求发送表单数据
            alert('感谢订阅！我们会将最新消息发送到您的邮箱。');
            subscribeForm.reset();
        });
    }
});