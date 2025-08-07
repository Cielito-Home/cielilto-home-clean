const firebaseConfig = {
  apiKey: "AIzaSyBQxxfctZoCFH4JwEybLU8fxIbhi11_uTs",
  authDomain: "clean-ceebe.firebaseapp.com",
  projectId: "clean-ceebe",
  storageBucket: "clean-ceebe.appspot.com",
  messagingSenderId: "204280927649",
  appId: "1:204280927649:web:64074548b5f1f0469827e0",
  measurementId: "G-4NEW8NX8Q8"
};

firebase.initializeApp(firebaseConfig);

// Inicializa Firestore
const db = firebase.firestore();

// Exportar para uso global
window.db = db;
window.firebase = firebase;