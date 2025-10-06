// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "x-clone-a2284.firebaseapp.com",
  projectId: "x-clone-a2284",
  storageBucket: "x-clone-a2284.firebasestorage.app",
  messagingSenderId: "771180245989",
  appId: "1:771180245989:web:22dc0e220517dd18c0b50c",
  measurementId: "G-W0XE09WFQR"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
