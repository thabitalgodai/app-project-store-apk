const urlParams = new URLSearchParams(window.location.search);
  
  // تعبئة البيانات الأساسية
  document.getElementById('appTitle').textContent = urlParams.get('title');
  document.getElementById('appIcon').src = urlParams.get('icon');
  document.getElementById('description').textContent = urlParams.get('dec');

  // معالجة التقييم
  const rating = parseFloat(urlParams.get('rating')) || 4.5;
  const stars = document.getElementById('ratingStars');
  stars.innerHTML = renderStars(rating);
  document.getElementById('ratingText').textContent = `${rating.toFixed(1)} • ١٠ ألف+ تنزيل`;

  function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(5 - fullStars - halfStar);
  }

  // لقطات الشاشة
  const screenshots = [
    urlParams.get('sc1'),
    urlParams.get('sc2'),
    urlParams.get('sc3')
  ].filter(Boolean);

  const container = document.getElementById('screenshots');
  screenshots.forEach(sc => {
    const img = document.createElement('img');
    img.className = 'screenshot';
    img.src = sc;
    img.alt = 'لقطة شاشة';
    container.appendChild(img);
  });

  // المعلومات الإضافية
  const details = {
    size: urlParams.get('size') || '15 م.ب',
    version: urlParams.get('version') || '1.0.0',
    updated: urlParams.get('updated') || '٢٤ مايو ٢٠٢٤',
    requires: urlParams.get('android') || 'أندرويد 8.0 أو أعلى',
    contentRating: '+3',
    time: urlParams.get('time') || 'غير معروف'
  };

  const grid = document.getElementById('detailsGrid');
  Object.entries(details).forEach(([key, value]) => {
    const div = document.createElement('div');
    div.className = 'detail-item';
    div.innerHTML = `
      <span class="detail-label">${getLabel(key)}</span>
      <span class="detail-value">${value}</span>
    `;
    grid.appendChild(div);
  });

  function getLabel(key) {
    const labels = {
      size: 'الحجم',
      version: 'الإصدار',
      updated: 'تم التحديث',
      requires: 'إصدار أندرويد',
      contentRating: 'التصنيف العمري',
      time: 'رفع بتاريخ'
    };
    return labels[key] || key;
  }

  // زر التثبيت
  document.getElementById('installBtn').addEventListener('click', () => {
    const link = urlParams.get('project');
    if (link && link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      alert('رابط التحميل غير متوفر حالياً');
    }
  });

  // وظائف المشاركة
  function toggleShareMenu() {
    const menu = document.getElementById('shareMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }

  window.addEventListener('click', function(e) {
    if (!document.getElementById('shareMenu').contains(e.target) && 
        !e.target.closest('.toolbar-icon')) {
      document.getElementById('shareMenu').style.display = 'none';
    }
  });

  function shareViaWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://wa.me/?text=${url}`, '_blank');
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    alert('تم نسخ الرابط بنجاح');
    toggleShareMenu();
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({
        title: document.getElementById('appTitle').textContent,
        text: 'تحميل تطبيق ' + document.getElementById('appTitle').textContent,
        url: window.location.href
      });
    } else {
      copyLink();
    }
  }