// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// (Optional) import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
	authDomain: 'healthinsurancedemo-d130b.firebaseapp.com',
	projectId: 'healthinsurancedemo-d130b',
	storageBucket: 'healthinsurancedemo-d130b.firebasestorage.app',
	messagingSenderId: '71536089165',
	appId: '1:71536089165:web:552aa654844b2359822404',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // required for login
export const db = getFirestore(app); // required for reading user roles
// (Optional) const analytics = getAnalytics(app);
