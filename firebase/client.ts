// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbaVIr970qKQgr22oGkpURmyQEwxaIsUg",
  authDomain: "interview-prep-69a5b.firebaseapp.com",
  projectId: "interview-prep-69a5b",
  storageBucket: "interview-prep-69a5b.firebasestorage.app",
  messagingSenderId: "754051105147",
  appId: "1:754051105147:web:bf2e7dcbb09a53f528fdde",
  measurementId: "G-BEJ1Q0SZ8P"
};

// To initialize client side firebase SDK only once
const app = !getApps.length ? initializeApp(firebaseConfig):getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);