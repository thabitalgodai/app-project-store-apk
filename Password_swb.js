const loginBtn = document.getElementById('login-btn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMsg = document.getElementById('error-msg');

        // بيانات الاعتماد المشفرة (SHA-256)
        const storedHash = {
            username: 'thabit',
            password: '736091318'
        };

        // معالجة عملية الدخول
        async function handleLogin() {
            try {
                // تعطيل الزر أثناء المعالجة
                loginBtn.disabled = true;
                loginBtn.textContent = 'جاري التحقق...';

                // التحقق من الحقول الفارغة
                if (!usernameInput.value || !passwordInput.value) {
                    throw new Error('يرجى ملء جميع الحقول');
                }

                // التحقق من بيانات الدخول
                if (usernameInput.value !== storedHash.username || passwordInput.value !== storedHash.password) {
                    throw new Error('بيانات الاعتماد غير صحيحة');
                }

                // تم التحقق بنجاح
                window.location.href = 'app_swb.html';

            } catch (error) {
                showError(error.message);
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'الدخول للنظام';
            }
        }

        // عرض رسائل الخطأ
        function showError(message) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
            setTimeout(() => {
                errorMsg.style.display = 'none';
            }, 5000);
        }

        
        loginBtn.addEventListener('click', handleLogin);
        
    
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });