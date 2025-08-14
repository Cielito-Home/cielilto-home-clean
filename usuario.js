// add-user.js - Script para Node.js
// Ejecutar con: node add-user.js

// Instalar dependencias primero:
// npm install firebase-admin

const admin = require('firebase-admin');

// Configuración de Firebase Admin
const serviceAccount = {
  "type": "service_account",
  "project_id": "clean-ceebe",
  "private_key_id": "tu_private_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\ntu_private_key\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@clean-ceebe.iam.gserviceaccount.com",
  "client_id": "tu_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40clean-ceebe.iam.gserviceaccount.com"
};

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'clean-ceebe'
});

const db = admin.firestore();

async function addAuthorizedUser() {
  try {
    console.log('🔑 Agregando usuario autorizado...');
    
    // Cambiar estos datos por los tuyos
    const userData = {
      correo: 'sistemas16ch@gmail.com',
      nombre: 'Lenin Silva',
      rol: 'admin',
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      activo: true
    };
    
    const docRef = await db.collection('usuarios').add(userData);
    
    console.log('✅ Usuario autorizado agregado con ID:', docRef.id);
    console.log('📧 Email:', userData.correo);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error agregando usuario:', error.message);
    process.exit(1);
  }
}

// Ejecutar la función
addAuthorizedUser();