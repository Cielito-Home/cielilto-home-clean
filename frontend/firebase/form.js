import { db, collection, addDoc, serverTimestamp } from './firebase.js';

async function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;

  const formData = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    service: form.service.value,
    message: form.message.value.trim(),
    privacyAccepted: form.privacy.checked,
    timestamp: serverTimestamp()
  };

  // 1. Guardar en Firebase
  try {
    await addDoc(collection(db, 'mensajesContacto'), formData);
    console.log('✅ Información guardada en Firebase');
  } catch (err) {
    console.error('❌ Error al guardar en Firebase:', err);
  }

  // 2. Enviar al backend para mandar el correo
  try {
    const response = await fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      alert('Mensaje enviado correctamente');
      form.reset();
    } else {
      alert('Error al enviar el mensaje: ' + result.message);
    }

  } catch (err) {
    console.error('❌ Error al enviar correo:', err);
    alert('Error al enviar el correo.');
  }
}
