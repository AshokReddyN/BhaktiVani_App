import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for BhaktiVani App
const firebaseConfig = {
    apiKey: "AIzaSyCN1iUOeJrPiBGg_4Zc3Uau4ltepc2vw-I",
    authDomain: "bhaktivaniapp.firebaseapp.com",
    projectId: "bhaktivaniapp",
    storageBucket: "bhaktivaniapp.firebasestorage.app",
    messagingSenderId: "173567792564",
    appId: "1:173567792564:web:e6ddae20551d89c24acee1",
    measurementId: "G-06XQ915F5Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
