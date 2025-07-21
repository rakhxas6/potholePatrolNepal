// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBaqoZlB6D-5AocS0BupY_IBnLBWOcoL2U",
  authDomain: "pothole-patrol-nepal.firebaseapp.com",
  projectId: "pothole-patrol-nepal",
  storageBucket: "pothole-patrol-nepal.firebasestorage.app",
  messagingSenderId: "1083567460307",
  appId: "1:1083567460307:web:daeb2ed0dc38d01caf6926",
  measurementId: "G-Z7ZSMNRK9G",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ⚙️ Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);


