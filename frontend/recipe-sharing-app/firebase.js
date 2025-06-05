// firebase.js (or wherever your config file is located)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpgAH4H8FhN7N-cZ0Mn702b9nHHBfQPCo",
  authDomain: "recibook-ad087.firebaseapp.com",
  projectId: "recibook-ad087",
  storageBucket: "recibook-ad087.firebasestorage.app",
  messagingSenderId: "271445905577",
  appId: "1:271445905577:web:9cd8cd5d8e79a48a4899b8",
  measurementId: "G-8EN31TJKQ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;