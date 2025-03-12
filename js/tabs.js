document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 获取目标标签页
            const tabTarget = this.getAttribute('data-tab');
            
            // 移除所有按钮的active类
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // 移除所有内容面板的active类
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // 为当前按钮添加active类
            this.classList.add('active');
            
            // 显示目标面板
            document.getElementById(tabTarget).classList.add('active');
        });
    });
});