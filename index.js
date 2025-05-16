firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'segnal.html';
    } else {
        // قاعدة البيانات
        const db = firebase.database();
        const appsRef = db.ref('data2');
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

        // بيانات المستخدم
        const userRef = db.ref(`users/${user.uid}`);
        userRef.on('value', (snapshot) => {
            const userData = snapshot.val() || {};
            updateProfileUI(userData, user);
        });

        // حقل البحث
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

        // تحميل صورة الملف الشخصي
        const profileImageInput = document.getElementById('profileImageInput');
        const profilePictureContainer = document.getElementById('profilePictureContainer');
        const uploadOverlay = document.getElementById('uploadOverlay');
        const uploadLoader = document.getElementById('uploadLoader');

        profilePictureContainer.addEventListener('click', () => {
            profileImageInput.click();
        });

        profileImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('الرجاء اختيار صورة بصيغة PNG أو JPEG أو WEBP');
                return;
            }

            uploadOverlay.style.display = 'flex';
            uploadLoader.style.display = 'block';

            const storageRef = firebase.storage().ref(`profile_images/${user.uid}.jpg`);
            storageRef.put(file)
                .then(snapshot => snapshot.ref.getDownloadURL())
                .then(downloadURL => {
                    return firebase.database().ref(`users/${user.uid}`).update({
                        pic: downloadURL
                    }).then(() => {
                        document.getElementById('profilePicture').src = downloadURL;
                        document.getElementById('profileBanner').src = downloadURL;
                    });
                })
                .catch(error => {
                    console.error("Upload failed:", error);
                    alert('حدث خطأ أثناء رفع الصورة');
                })
                .finally(() => {
                    uploadOverlay.style.display = 'none';
                    uploadLoader.style.display = 'none';
                });
        });
    }
});

// تحديث الواجهة
function updateProfileUI(userData, firebaseUser) {
    const profileElements = {
        profileName: userData.name || firebaseUser.displayName || 'مستخدم جديد',
        profileEmail: userData.email || firebaseUser.email || 'لا يوجد بريد إلكتروني',
        profilePicture: userData.pic || firebaseUser.photoURL || 'default-avatar.png',
        profileBanner: userData.pic || 'default-banner.jpg'
    };

    document.getElementById('profileName').textContent = profileElements.profileName;
    document.getElementById('profileEmail').textContent = profileElements.profileEmail;
    document.getElementById('profilePicture').src = profileElements.profilePicture;
    document.getElementById('profileBanner').src = profileElements.profileBanner;
}

// عرض التطبيقات
function renderApps(apps) {
    const grid = document.getElementById('appsGrid');
    grid.innerHTML = apps.length ? '' : '<p class="no-results">لم يتم العثور على نتائج</p>';

    apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `
            <img src="${app.icon}" class="app-image" alt="${app.title}" onerror="this.onerror=null;this.src='default-icon.png'">
            <div class="app-content">
                <h3 class="app-title">${app.title}</h3>
                <div class="app-meta">
                    <span>${app.size || 'N/A'}</span>
                    <div class="rating">
                        ${generateRatingStars(app.rating || 4.5)}
                    </div>
                </div>
            </div>
        `;
        card.onclick = () => openAppDetails(app);
        grid.appendChild(card);
    });
}

// توليد التقييم
function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    return `
        ${'<i class="material-icons-round">star</i>'.repeat(fullStars)}
        ${halfStar ? '<i class="material-icons-round">star_half</i>' : ''}
        ${'<i class="material-icons-round">star_border</i>'.repeat(5 - fullStars - halfStar)}
    `;
}

// القائمة الجانبية
const sideMenu = document.getElementById('sideMenu');
let isMenuOpen = false;

function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    sideMenu.classList.toggle('open', isMenuOpen);
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
}

document.addEventListener('click', (e) => {
    if (isMenuOpen && !sideMenu.contains(e.target) && !e.target.closest('.toolbar-icon')) {
        toggleMenu();
    }
});

// فتح التفاصيل
function openAppDetails(app) {
    const params = new URLSearchParams(app);
    window.location.href = `preview.html?${params}`;
}

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'segnal.html';
    }).catch(error => {
        alert('حدث خطأ أثناء تسجيل الخروج');
    });
}