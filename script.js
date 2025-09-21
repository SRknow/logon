import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, setDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {
  // Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyAQtZk3oG2jtkcodnAL_N3bruQgp1X5VdY",
    authDomain: "blog-6edc1.firebaseapp.com",
    projectId: "blog-6edc1",
    storageBucket: "blog-6edc1.firebasestorage.app",
    messagingSenderId: "329823907988",
    appId: "1:329823907988:web:7ec357b75117537642c481",
    measurementId: "G-YXXVVELF0L"
  };

  const app = initializeApp(firebaseConfig);
  getAnalytics(app);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // DOM Elements
  const showLoginBtn = document.getElementById("showLogin");
  const showRegisterBtn = document.getElementById("showRegister");
  const modal = document.getElementById("modal");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");
  const loginError = document.getElementById("loginError");

  const registerName = document.getElementById("registerName");
  const registerEmail = document.getElementById("registerEmail");
  const registerPassword = document.getElementById("registerPassword");
  const registerBtn = document.getElementById("registerBtn");
  const registerError = document.getElementById("registerError");

  const homePage = document.getElementById("homePage");
  const userNameSpan = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  const closeLogin = document.getElementById("closeLogin");
  const closeRegister = document.getElementById("closeRegister");

  const blogTitle = document.getElementById("blogTitle");
  const blogContent = document.getElementById("blogContent");
  const submitBlog = document.getElementById("submitBlog");
  const blogList = document.getElementById("blogList");

  // Modal events
  showLoginBtn.onclick = () => { 
    modal.style.display = "block"; 
    loginForm.style.display = "block"; 
    registerForm.style.display = "none"; 
    loginError.textContent = ""; 
  };
  showRegisterBtn.onclick = () => { 
    modal.style.display = "block"; 
    registerForm.style.display = "block"; 
    loginForm.style.display = "none"; 
    registerError.textContent = ""; 
  };
  closeLogin.onclick = () => modal.style.display = "none";
  closeRegister.onclick = () => modal.style.display = "none";

  // Register User
  registerBtn.onclick = async () => {
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();

    if(!name || !email || !password) {
      registerError.textContent = "All fields are required.";
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update displayName
      await updateProfile(user, { displayName: name });

      // Save user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        uid: user.uid,
        createdAt: Date.now()
      });

      // Show home
      showHome(user, name);

    } catch (error) {
      registerError.textContent = error.message;
    }
  };

  // Login User
  loginBtn.onclick = async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if(!email || !password) {
      loginError.textContent = "Email and password required.";
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user info from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if(userDoc.exists()) {
        showHome(user, userDoc.data().name);
      } else {
        showHome(user, user.displayName || user.email);
      }

    } catch (error) {
      loginError.textContent = error.message;
    }
  };

  // Logout
  logoutBtn.onclick = async () => {
    await signOut(auth);
    homePage.style.display = "none";
    modal.style.display = "block";
    loginForm.style.display = "block";
  };

  // Show homepage
  async function showHome(user, name) {
    modal.style.display = "none";
    homePage.style.display = "block";
    userNameSpan.textContent = name || user.displayName || user.email;
    blogTitle.value = "";
    blogContent.value = "";
    await loadBlogs(user.uid);
  }

  // Submit Blog
  submitBlog.onclick = async () => {
    const user = auth.currentUser;
    if(!user) return alert("Please login first");

    const title = blogTitle.value.trim();
    const content = blogContent.value.trim();
    if(!title || !content) return alert("Please enter title and content");

    await addDoc(collection(db, "blogs"), {
      uid: user.uid,
      name: user.displayName || user.email,
      title: title,
      content: content,
      timestamp: Date.now()
    });

    blogTitle.value = "";
    blogContent.value = "";
    await loadBlogs(user.uid);
  };

  // Load user's blogs
  async function loadBlogs(uid) {
    blogList.innerHTML = "";
    const q = query(collection(db, "blogs"), where("uid","==",uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "blog-post";
      div.innerHTML = `<h4>${data.title}</h4><p>${data.content}</p>`;
      blogList.appendChild(div);
    });
  }
});
