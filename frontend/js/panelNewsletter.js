// panelNewsletter.js
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

import { app } from '../firebase/firebase.js'; // Asegúrate de exportar 'app' desde firebase.js

const db = getFirestore(app);
const tableBody = document.querySelector('#contactTable tbody');
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const editForm = document.getElementById('editForm');

let currentDocId = null;

// Función para formatear fecha
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleString('es-MX');
}

// Cargar datos desde Firebase
async function loadContacts() {
  tableBody.innerHTML = ''; // limpiar
  const querySnapshot = await getDocs(collection(db, 'mensajesContacto'));

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${data.email || ''}</td>
      <td>${data.name || ''}</td>
      <td>${data.phone || ''}</td>
      <td>${data.service || ''}</td>
      <td>${data.message || ''}</td>
      <td>${formatDate(data.timestamp)}</td>
      <td>
        <button class="btn btn-sm btn-warning" data-id="${docSnap.id}">Editar</button>
      </td>
    `;

    row.querySelector('button').addEventListener('click', () => {
      openEditModal(docSnap.id, data);
    });

    tableBody.appendChild(row);
  });
}

// Llenar modal con datos
function openEditModal(id, data) {
  currentDocId = id;
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-email').value = data.email || '';
  document.getElementById('edit-name').value = data.name || '';
  document.getElementById('edit-phone').value = data.phone || '';
  document.getElementById('edit-service').value = data.service || '';
  document.getElementById('edit-message').value = data.message || '';
  editModal.show();
}

// Guardar cambios en Firebase
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('edit-id').value;
  const updatedData = {
    email: document.getElementById('edit-email').value.trim(),
    name: document.getElementById('edit-name').value.trim(),
    phone: document.getElementById('edit-phone').value.trim(),
    service: document.getElementById('edit-service').value.trim(),
    message: document.getElementById('edit-message').value.trim(),
  };

  try {
    await updateDoc(doc(db, 'mensajesContacto', id), updatedData);
    console.log('✅ Contacto actualizado');
    editModal.hide();
    loadContacts(); // refrescar tabla
  } catch (err) {
    console.error('❌ Error al actualizar:', err);
    alert('Hubo un error al guardar los cambios.');
  }
});

loadContacts(); // Inicializar tabla
