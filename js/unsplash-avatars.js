/**
 * Unsplash Avatars Integration
 * 使用Unsplash API获取随机用户头像
 */

const UNSPLASH_ACCESS_KEY = 'Yd7M_ABwEBRIRs_0_XTjtdIjY9F5nMF_KjNLdQEQVXw'; // Unsplash API密钥

// 初始化用户头像
function initUnsplashAvatars() {
  const avatarElements = document.querySelectorAll('.author-avatar');
  
  // 如果没有找到头像元素或没有设置API密钥，则退出
  if (avatarElements.length === 0 || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
    console.warn('未找到头像元素或未设置Unsplash API密钥');
    return;
  }
  
  // 为每个头像元素加载随机Unsplash图片
  avatarElements.forEach((avatar, index) => {
    // 使用不同的查询关键词获取多样化的头像
    const queries = ['portrait', 'face', 'person', 'profile'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    // 构建Unsplash API URL
    // 使用collections参数限制为肖像集合，提高相关性
    const collections = '181462,311028,2053319,220381';
    const url = `https://api.unsplash.com/photos/random?query=${randomQuery}&collections=${collections}&orientation=squarish&content_filter=high`;
    
    // 发送请求到Unsplash API
    fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Unsplash API请求失败');
      }
      return response.json();
    })
    .then(data => {
      // 使用较小尺寸的图片以提高加载速度
      const imageUrl = data.urls.small;
      
      // 预加载图片
      const img = new Image();
      img.onload = function() {
        // 图片加载完成后设置为头像背景
        avatar.src = imageUrl;
        avatar.classList.add('unsplash-avatar'); // 添加类以便应用样式
        
        // 添加图片作者归属信息
        const testimonialCard = avatar.closest('.testimonial-card');
        if (testimonialCard) {
          // 检查是否已存在归属信息，避免重复添加
          const existingAttribution = testimonialCard.querySelector('.unsplash-attribution');
          if (!existingAttribution) {
            const attribution = document.createElement('div');
            attribution.className = 'unsplash-attribution';
            attribution.innerHTML = `Photo by <a href="${data.user.links.html}?utm_source=shareblackscreen&utm_medium=referral" target="_blank" rel="noopener noreferrer">${data.user.name}</a> on <a href="https://unsplash.com/?utm_source=shareblackscreen&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a>`;
            testimonialCard.appendChild(attribution);
          }
        }
      };
      
      img.onerror = function() {
        console.error('加载Unsplash图片失败');
        // 失败时使用备用头像
        useDefaultAvatar(avatar, index);
      };
      
      img.src = imageUrl;
    })
    .catch(error => {
      console.error('获取Unsplash图片失败:', error);
      // 失败时使用备用头像
      useDefaultAvatar(avatar, index);
    });
  });
}

// 使用默认头像
function useDefaultAvatar(avatarElement, index) {
  const avatarIndex = (index % 3) + 1;
  if (window.defaultAvatars && window.defaultAvatars[avatarIndex]) {
    avatarElement.src = window.defaultAvatars[avatarIndex];
  } else {
    avatarElement.src = `img/default-avatar-${avatarIndex}.svg`;
  }
}

// 创建备用的SVG头像
function createDefaultAvatars() {
  const colors = ['#4a6cf7', '#f7754a', '#4af7a1'];
  
  for (let i = 1; i <= 3; i++) {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="30" fill="${colors[i-1]}" opacity="0.2"/>
      <circle cx="30" cy="22" r="10" fill="${colors[i-1]}"/>
      <path d="M15,47 C15,36 45,36 45,47" fill="${colors[i-1]}"/>
    </svg>`;
    
    // 创建Blob对象
    const blob = new Blob([svgContent], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    
    // 创建图片元素并设置为预加载
    const img = new Image();
    img.src = url;
    img.style.display = 'none';
    document.body.appendChild(img);
    
    // 保存URL以便后续使用
    window.defaultAvatars = window.defaultAvatars || {};
    window.defaultAvatars[i] = url;
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  createDefaultAvatars();
  initUnsplashAvatars();
});