const db = firebase.database();
    const storage = firebase.storage();
    const auth = firebase.auth();

    document.addEventListener('DOMContentLoaded', () => {
        // العناصر الأساسية
        const screenshotsInput = document.getElementById('screenshots');
        const screenshotsGrid = document.getElementById('screenshotsGrid');
        const uploadForm = document.getElementById('uploadForm');
        const submitBtn = document.querySelector('#uploadForm button[type="submit"]');
        
        // المتغيرات العامة
        let uploadType = 'file';
        let iconURL = '';

        // ======= معاينة الصور =======
        screenshotsInput.addEventListener('change', function(e) {
            screenshotsGrid.innerHTML = '';
            const files = Array.from(e.target.files);
            
            files.forEach(file => {
                if (!file.type.startsWith('image/')) return;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    const container = document.createElement('div');
                    container.className = 'screenshot-item';
                    
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.style.cssText = `
                        width: 100%;
                        height: 150px;
                        object-fit: cover;
                        border-radius: 8px;
                    `;
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = '×';
                    deleteBtn.style.cssText = `
                        position: absolute;
                        top: 5px;
                        left: 5px;
                        background: red;
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 25px;
                        height: 25px;
                        cursor: pointer;
                        font-size: 18px;
                    `;
                    
                    deleteBtn.onclick = () => {
                        container.remove();
                        const newFiles = Array.from(screenshotsInput.files).filter(f => f !== file);
                        const dataTransfer = new DataTransfer();
                        newFiles.forEach(f => dataTransfer.items.add(f));
                        screenshotsInput.files = dataTransfer.files;
                    };
                    
                    container.appendChild(img);
                    container.appendChild(deleteBtn);
                    screenshotsGrid.appendChild(container);
                };
                reader.readAsDataURL(file);
            });
        });

        // ======= معالجة الأيقونة =======
        document.getElementById('appIcon').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('iconPreview').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // ======= معالجة الملف =======
        document.getElementById('appFile').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('appTitle').value = file.name.replace(/\.[^/.]+$/, "");
                document.getElementById('appSize').value = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
            }
        });

        // ======= تبديل طريقة الرفع =======
        window.handleFileOption = function(type) {
            uploadType = type;
            document.getElementById('fileUploadSection').classList.toggle('hidden', type !== 'file');
            document.getElementById('linkUploadSection').classList.toggle('hidden', type !== 'link');
        };

        // ======= معالجة النموذج =======
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // تعطيل الزر وإظهار حالة التحميل
                submitBtn.disabled = true;
                document.getElementById('uploadStatus').style.display = 'flex';
                document.getElementById('progressText').textContent = '0%';

                const user = auth.currentUser;
                if (!user) {
                    showAlert('error', 'يجب تسجيل الدخول أولاً');
                    return;
                }

                // التحقق من البيانات
                const screenshots = screenshotsInput.files;
                const appType = document.getElementById('appType').value;

                if (!document.getElementById('appIcon').files[0]) {
                    showAlert('error', 'الرجاء اختيار أيقونة التطبيق');
                    return;
                }

                if (screenshots.length !== 3) {
                    showAlert('error', 'الرجاء اختيار 3 صور للشرح');
                    return;
                }

                // رفع الملفات
                const iconURL = await uploadFile(document.getElementById('appIcon').files[0], 'icons');
                const screenshotUrls = await Promise.all(
                    Array.from(screenshots).map(file => uploadFile(file, 'screenshots'))
                );

                // معالجة رابط التطبيق
                let downloadLink, fileSize;
                if (uploadType === 'file') {
                    const appFile = document.getElementById('appFile').files[0];
                    if (!appFile) {
                        showAlert('error', 'الرجاء اختيار ملف التطبيق');
                        return;
                    }
                    downloadLink = await uploadFile(appFile, 'apps');
                    fileSize = (appFile.size / (1024 * 1024)).toFixed(1) + ' MB';
                } else {
                    downloadLink = document.getElementById('appLink').value;
                    fileSize = document.getElementById('appSize').value || 'N/A';
                }

                // إنشاء بيانات التطبيق
                const appData = {
                    title: document.getElementById('appTitle').value,
                    icon: iconURL,
                    dec: document.getElementById('appDescription').value,
                    size: fileSize,
                    type: appType,
                    sc1: screenshotUrls[0],
                    sc2: screenshotUrls[1],
                    sc3: screenshotUrls[2],
                    project: downloadLink,
                    time: new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    }),
                    uid: user.uid
                };

                await db.ref(appType === 'swb' ? 'data1' : 'data2').push(appData);
                
                // إظهار نافذة النجاح
                document.getElementById('uploadStatus').style.display = 'none';
                document.getElementById('successModal').style.display = 'flex';
                submitBtn.disabled = false;

            } catch (error) {
                document.getElementById('uploadStatus').style.display = 'none';
                submitBtn.disabled = false;
                showAlert('error', `حدث خطأ: ${error.message}`);
            }
        });

        // ======= دوال مساعدة =======
        async function uploadFile(file, path) {
            return new Promise((resolve, reject) => {
                const storageRef = storage.ref(`${path}/${Date.now()}_${file.name}`);
                const uploadTask = storageRef.put(file);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        document.getElementById('progressBar').style.width = progress + '%';
                        document.getElementById('progressText').textContent = progress + '%';
                    },
                    (error) => reject(error),
                    () => uploadTask.snapshot.ref.getDownloadURL().then(resolve)
                );
            });
        }

        function showAlert(type, message) {
            const alertBox = document.getElementById('alert');
            alertBox.className = `alert-${type}`;
            alertBox.textContent = message;
            alertBox.style.display = 'block';
            setTimeout(() => alertBox.style.display = 'none', 5000);
        }

        function resetForm() {
            uploadForm.reset();
            document.getElementById('iconPreview').src = '';
            screenshotsGrid.innerHTML = '';
            document.getElementById('progressBar').style.width = '0%';
            document.getElementById('appSize').value = '';
            handleFileOption('file');
        }

        // إغلاق نافذة التأكيد
        window.closeModal = function() {
            document.getElementById('successModal').style.display = 'none';
            resetForm();
        }
    });