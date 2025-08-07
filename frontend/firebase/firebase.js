// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQxxfctZoCFH4JwEybLU8fxIbhi11_uTs",
  authDomain: "clean-ceebe.firebaseapp.com",
  projectId: "clean-ceebe",
  storageBucket: "clean-ceebe.firebasestorage.app",
  messagingSenderId: "204280927649",
  appId: "1:204280927649:web:64074548b5f1f0469827e0",
  measurementId: "G-4NEW8NX8Q8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);