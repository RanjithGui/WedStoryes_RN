// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuZh1t1AvmMclPqT6KEDR-3JF7W7Vs1-U",
  authDomain: "wedstoryes-52252.firebaseapp.com",
  projectId: "wedstoryes-52252",
  storageBucket: "wedstoryes-52252.firebasestorage.app",
  messagingSenderId: "840541996709",
  appId: "1:840541996709:web:6fe9349b157a7638dcaf4c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
