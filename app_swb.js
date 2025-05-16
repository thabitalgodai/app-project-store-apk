firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'segnal.html';
    } else {
        // قاعدة البيانات
        const db = firebase.database();
        const appsRef = db.ref('data1');
        let allApps = [];
        let searchTimeout;

        // التطبيقات
        appsRef.on('value', (snapshot) => {
  // إظهار التموج
  document.getElementById('loadingOverlay').style.display = 'flex';

  allApps = [];
  snapshot.forEach((child) => {
    allApps.push(child.val());
  });

  renderApps(allApps);

  // إخفاء التموج بعد التحميل
  document.getElementById('loadingOverlay').style.display = 'none';
});

                // إعداد حقل البحث
                document.getElementById('searchInput').addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        const term = e.target.value.toLowerCase().trim();
                        const filtered = allApps.filter((app) =>
                            app.title.toLowerCase().includes(term) ||
                            (app.dec && app.dec.toLowerCase().includes(term))
                        );
                        renderApps(filtered);
                    }, 300);
                });
            }
        });

        // عرض التطبيقات
        function renderApps(apps) {
            const grid = document.getElementById('appsGrid');
            grid.innerHTML = apps.length ? '' : '<p class="no-results">لم يتم العثور على نتائج</p>';
            
            apps.forEach(app => {
                const card = document.createElement('div');
                card.className = 'app-card';
                card.innerHTML = `
                    <img src="${app.icon}" class="app-image" alt="${app.title}">
                    <div class="app-content">
                        <h3 class="app-title">${app.title}</h3>
                        <div class="app-meta">
                            <span>${app.size || 'N/A'}</span>
                            <div class="rating">
                                <span>${app.rating || 4.5}</span>
                                <i class="material-icons-round">star</i>
                            </div>
                        </div>
                    </div>
                `;
                card.onclick = () => openAppDetails(app);
                grid.appendChild(card);
            });
        }

        // فتح التفاصيل
        function openAppDetails(app) {
            const params = new URLSearchParams(app);
            window.location.href = `preview.html?${params}`;
        }

        // التحكم بالقائمة
        function toggleMenu() {
            document.getElementById('sideMenu').classList.toggle('open');
        }

        // إغلاق القائمة بالنقر خارجها
        document.addEventListener('click', e => {
            const menu = document.getElementById('sideMenu');
            if (!menu.contains(e.target) && !e.target.closest('.toolbar-icon')) {
                menu.classList.remove('open');
            }
        });
