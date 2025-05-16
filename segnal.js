const firebaseConfig = {
    apiKey: "AIzaSyD7A8-DKqjzeKEi9BavHLDJ18J_PT6bsT0",
    authDomain: "mozkrh2.firebaseapp.com",
    databaseURL: "https://mozkrh2-default-rtdb.firebaseio.com",
    projectId: "mozkrh2",
    storageBucket: "mozkrh2.appspot.com",
    messagingSenderId: "1072010410647",
    appId: "1:1072010410647:web:603ddf7d867db870b787d2"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const usersRef = database.ref('users');
const googleProvider = new firebase.auth.GoogleAuthProvider();

// التحقق من حالة المستخدم


// إظهار/إخفاء النماذج
function showLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.querySelector('.auth-divider').style.display = 'block';
    clearErrors();
}

function showSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
    document.querySelector('.auth-divider').style.display = 'block';
    clearErrors();
}

// تسجيل الدخول بجوجل
async function googleLogin() {
  try {
    const result = await auth.signInWithPopup(googleProvider);
    
    // إضافة تحقق إضافي من حالة المستخدم
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const snapshot = await usersRef.child(user.uid).once('value');
        
        if (!snapshot.exists()) {
          await usersRef.child(user.uid).set({
            name: user.displayName,
            email: user.email,
            pic: user.photoURL || "",
            bio: "No bio available",
            active: "true",
            uid: user.uid
          });
        }
        
        // استخدام توجيه مطلق بدل النسبي
        window.location.href = 'index.html'; // ← التعديل هنا
      }
    });
    
  } catch (error) {
    console.error('Error details:', error); // ← أضف هذا للتصحيح
    showError('login-error', getArabicError(error.message));
  }
}

// إنشاء حساب
async function signup(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await user.updateProfile({ displayName: name });

        const userData = {
            name: name,
            email: email,
            pass: password,
            bio: "No bio available",
            pic: "",
            active: "true",
            uid: user.uid
        };

        await usersRef.child(user.uid).set(userData);
        window.location.href = 'index.html';
    } catch (error) {
        showError('signup-error', getArabicError(error.message));
    }
}

// تسجيل الدخول
async function login(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        const snapshot = await usersRef.child(user.uid).once('value');
        const userData = snapshot.val();

        if (userData.active === "false") {
            throw new Error('الحساب غير مفعل');
        }

        window.location.href = 'index.html';
    } catch (error) {
        showError('login-error', getArabicError(error.message));
    }
}

// وظائف مساعدة
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => errorElement.style.display = 'none', 5000);
}

function getArabicError(message) {
    const errors = {
        "Password should be at least 6 characters": "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        "The email address is already in use by another account": "البريد الإلكتروني مستخدم مسبقًا",
        "The password is invalid or the user does not have a password": "كلمة المرور غير صحيحة",
        "There is no user record corresponding to this identifier. The user may have been deleted": "الحساب غير موجود",
        "Popup closed by user": "تم إغلاق النافذة المنبثقة من قبل المستخدم",
        "Access denied by user": "تم رفض الوصول من قبل المستخدم",
        "An account already exists with the same email address": "يوجد حساب بنفس البريد الإلكتروني",
        "Network Error": "خطأ في الشبكة",
        "Auth quota exceeded for this project": "تم تجاوز الحد المسموح للمصادقة"
    };
    return errors[message] || message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });
            }
