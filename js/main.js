const star = document.getElementById('shooting-star');
const topNav = document.getElementById('topNav');
const footerText = document.getElementById('footerText');

let targetProgress = 0;
let currentProgress = 0;

// 纯数学计算 S 曲线坐标，绝不打结、不变形
function getStarPosition(progress) {
    const w = window.innerWidth;
    const h = document.documentElement.scrollHeight;

    // 起点：首屏底部中间（对应“往下走”的位置）
    const startX = w * 0.5;
    const startY = window.innerHeight * 0.85;

    // 【修改】终点：页面最左下角（留一点点边距），这样绝不会挡住右侧的卡片
    const endX = w * 0.1; 
    const endY = h - 80; // 距离页面最底部 80 像素

    // Y 轴随着滚动均匀下降
    const currentY = startY + (endY - startY) * progress;

    // X 轴用正弦函数左右摆动
    const amplitude = w * 0.3; 
    const frequency = Math.PI * 3; 
    const baseX = startX + (endX - startX) * progress;
    
    // 【核心修改】乘以 (1 - progress)，让流星越接近底部，摆动幅度越小，最后垂直落下
    const currentX = baseX + Math.sin(progress * frequency) * amplitude * (1 - progress);

    return { x: currentX, y: currentY };
}

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // 进度从 0 到 1
    targetProgress = Math.max(0, Math.min(1, scrollY / docHeight));

    // 导航栏出现
    if (scrollY > 0) {
        topNav.classList.add('scrolled');
    } else {
        topNav.classList.remove('scrolled');
    }

    // 底部文字出现
    if (scrollY > docHeight - window.innerHeight * 0.6) {
        footerText.classList.add('show');
    } else {
        footerText.classList.remove('show');
    }
});

function render() {
    // 添加缓动惯性
    currentProgress += (targetProgress - currentProgress) * 0.08;

    if (currentProgress > 0.01) {
        star.style.opacity = 1;
        
        const pos = getStarPosition(currentProgress);
        const prevPos = getStarPosition(currentProgress - 0.005);
        
        // 计算切线角度
        const dx = pos.x - prevPos.x;
        const dy = pos.y - prevPos.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI - 90;

        // 根据速度拉伸尾巴
        const speed = Math.abs(targetProgress - currentProgress) * 1000;
        let tailLength = 100 + speed * 5;
        star.style.height = `${Math.min(tailLength, 250)}px`;

        // 应用位置和旋转
        star.style.left = `${pos.x}px`;
        star.style.top = `${pos.y}px`;
        star.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    } else {
        star.style.opacity = 0;
    }

    requestAnimationFrame(render);
}

render();

// 卡片浮现逻辑
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.timeline-item').forEach(item => {
    observer.observe(item);
});