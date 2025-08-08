import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBQxxfctZoCFH4JwEybLU8fxIbhi11_uTs",
  authDomain: "clean-ceebe.firebaseapp.com",
  projectId: "clean-ceebe",
  storageBucket: "clean-ceebe.appspot.com",
  messagingSenderId: "204280927649",
  appId: "1:204280927649:web:64074548b5f1f0469827e0",
  measurementId: "G-4NEW8NX8Q8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, serverTimestamp };
export {app};