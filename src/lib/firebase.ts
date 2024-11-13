import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDvouuaPqO6DwnjdHMWhh11heJRm_hYC0s",
  authDomain: "family-life-5e5e1.firebaseapp.com",
  projectId: "family-life-5e5e1",
  storageBucket: "family-life-5e5e1.appspot.com",
  messagingSenderId: "133430561737",
  appId: "1:133430561737:web:b15ca7e6abc9cc0900f618",
  measurementId: "G-G7XGFETVMQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;