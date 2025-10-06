// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'x-clone-a2284.firebaseapp.com',
  projectId: 'x-clone-a2284',
  storageBucket: 'x-clone-a2284.firebasestorage.app',
  messagingSenderId: '771180245989',
  appId: '1:771180245989:web:22dc0e220517dd18c0b50c',
  measurementId: 'G-W0XE09WFQR',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
