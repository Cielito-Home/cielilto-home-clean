document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Inicializando contactForm.js...');

    // Esperar a que window.db esté disponible
    function waitForFirebase(retries = 20, interval = 150) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            function check() {
                if (window.db) {
                    resolve();
                } else if (attempts >= retries) {
                    reject('❌ Firebase no está disponible después de esperar');
                } else {
                    attempts++;
                    setTimeout(check, interval);
                }
            }
            check();
        });
    }

    waitForFirebase().then(() => {
        // Manejar formulario de contacto
        const contactForm = document.getElementById('contactForm');
        console.log('📋 Formulario encontrado:', !!contactForm);
        if(contactForm) {
            console.log('✅ Configurando evento de envío del formulario...');
            contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📤 Enviando formulario...');
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            console.log('📊 Datos del formulario:', data);
            
            // Validación del lado del cliente
            if (!validateContactForm(data)) {
                console.log('❌ Validación fallida');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando...';
            submitBtn.disabled = true;
            
            try {
                console.log('🔄 Enviando request al servidor...');
                const response = await fetch('/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                console.log('📡 Respuesta del servidor:', response.status);
                
                // Verificar si la respuesta es JSON válida
                const contentType = response.headers.get('content-type');
                console.log('📄 Content-Type:', contentType);
                
                let result;
                
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json();
                    console.log('📋 Resultado JSON:', result);
                } else {
                    console.log('❌ Respuesta no es JSON');
                    throw new Error('Respuesta del servidor no válida');
                }
                
                if (result.success) {
                    console.log('✅ Éxito!');
                    // Mostrar mensaje de éxito
                    showMessage('success', '¡Mensaje enviado exitosamente! Te contactaremos pronto.');
                    
                    // Guardar en Firebase
                    try {
                        await window.firebase.firestore.addDoc(
                            window.firebase.firestore.collection(db, 'mensajesContacto'),
                            {
                                name: data.name,
                                email: data.email,
                                phone: data.phone,
                                service: data.service,
                                message: data.message,
                                privacyAccepted: data.privacy === 'on' || data.privacy === true,
                                timestamp: window.firebase.firestore.serverTimestamp()
                            }
                        );
                        console.log('📁 Registro guardado en Firebase');
                    } catch (firebaseError) {
                        console.error('⚠️ Error al guardar en Firebase:', firebaseError);
                    }
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Opcional: redirigir a WhatsApp después de 3 segundos
                    setTimeout(() => {
                        if (confirm('¿Te gustaría continuar la conversación por WhatsApp?')) {
                            window.open('https://wa.me/524491382712?text=Hola, acabo de enviar un mensaje desde el formulario web', '_blank');
                        }
                    }, 3000);
                    
                } else {
                    console.log('❌ Error del servidor:', result.message);
                    showMessage('error', result.message || 'Error al enviar el mensaje');
                }
                
            } catch (error) {
                console.error('💥 Error:', error);
                showMessage('error', 'Error de conexión. Por favor intenta de nuevo o contáctanos por WhatsApp.');
            } finally {
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
        } else {
            console.log('❌ No se encontró el formulario de contacto');
        }
        // Manejar formularios de newsletter
        console.log('📧 Buscando formularios de newsletter...');
        // Buscar todos los formularios de newsletter
        const newsletterForms = document.querySelectorAll('form:has(input[type="email"][placeholder*="correo"])');
        console.log('📧 Formularios de newsletter encontrados:', newsletterForms.length);
        // Fallback: buscar de forma más específica
        if (newsletterForms.length === 0) {
            const allForms = document.querySelectorAll('form');
            console.log('📋 Todos los formularios:', allForms.length);
            allForms.forEach((form, index) => {
                const emailInput = form.querySelector('input[type="email"]');
                if (emailInput && emailInput.placeholder && emailInput.placeholder.includes('correo')) {
                    console.log(`📧 Formulario newsletter encontrado en índice ${index}`);
                    setupNewsletterForm(form);
                }
            });
        } else {
            newsletterForms.forEach(form => {
                setupNewsletterForm(form);
            });
        }
        function setupNewsletterForm(form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                console.log('📧 Enviando newsletter...');
                const emailInput = this.querySelector('input[type="email"]');
                const email = emailInput.value.trim();
                if (!email) {
                    showMessage('error', 'Por favor ingresa tu email');
                    return;
                }
                if (!validateEmail(email)) {
                    showMessage('error', 'Por favor ingresa un email válido');
                    return;
                }
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnContent = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                submitBtn.disabled = true;
                try {
                    // 1. Verificar si ya existe en Firebase (modular)
                    const q = window.firebase.firestore.query(
                        window.firebase.firestore.collection(db, 'newsletter_users'),
                        window.firebase.firestore.where('correo', '==', email)
                    );
                    const existingQuery = await window.firebase.firestore.getDocs(q);
                    if (!existingQuery.empty) {
                        showMessage('error', 'Este email ya está suscrito');
                        return;
                    }
                    // 2. Guardar en Firebase
                    await window.firebase.firestore.addDoc(
                        window.firebase.firestore.collection(db, 'newsletter_users'),
                        {
                            correo: email,
                            timestamp: window.firebase.firestore.serverTimestamp()
                        }
                    );
                    console.log('✅ Email guardado en Firebase');
                    // 3. Enviar email de bienvenida
                    const response = await fetch('/newsletter', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email })
                    });
                    // Verificar si la respuesta es JSON válida
                    const contentType = response.headers.get('content-type');
                    let result;
                    if (contentType && contentType.includes('application/json')) {
                        result = await response.json();
                    } else {
                        throw new Error('Respuesta del servidor no válida');
                    }
                    if (result.success) {
                        showMessage('success', '¡Suscripción exitosa! Revisa tu email para tu descuento de bienvenida.');
                        emailInput.value = '';
                    } else {
                        showMessage('error', result.message || 'Error al enviar email de bienvenida');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showMessage('error', 'Error de conexión. Por favor intenta de nuevo.');
                } finally {
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.disabled = false;
                }
            });
        }
    }).catch((err) => {
        console.error(err);
        showMessage('error', 'Firebase no está disponible. Intenta recargar la página.');
    });
});

// Función para validar el formulario de contacto
function validateContactForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!data.email || !validateEmail(data.email)) {
        errors.push('Por favor ingresa un email válido');
    }
    
    if (!data.phone || data.phone.trim().length < 10) {
        errors.push('El teléfono debe tener al menos 10 dígitos');
    }
    
    if (!data.service) {
        errors.push('Por favor selecciona un servicio');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('El mensaje debe tener al menos 10 caracteres');
    }
    
    if (!data.privacy) {
        errors.push('Debes aceptar la política de privacidad');
    }
    
    if (errors.length > 0) {
        showMessage('error', errors.join('<br>'));
        return false;
    }
    
    return true;
}

// Función para validar email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para mostrar mensajes
function showMessage(type, message, targetElement = null) {
    console.log(`📢 Mostrando mensaje ${type}:`, message);
    
    // Remover mensajes anteriores
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border: none;
        border-radius: 10px;
    `;
    
    const icon = type === 'success' ? '<i class="fas fa-check-circle me-2"></i>' : '<i class="fas fa-exclamation-triangle me-2"></i>';
    
    alertDiv.innerHTML = `
        ${icon}${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insertar el mensaje
    document.body.appendChild(alertDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Función para formatear número de teléfono (opcional)
function formatPhoneNumber(input) {
    // Remover todo excepto números
    let phone = input.value.replace(/\D/g, '');
    
    // Formatear como (XXX) XXX-XXXX
    if (phone.length >= 6) {
        phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (phone.length >= 3) {
        phone = phone.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    
    input.value = phone;
}

// Agregar validación en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    // Validación en tiempo real para el teléfono
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
    
    // Validación en tiempo real para email
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        if (!input) return;
        
        input.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.classList.add('is-invalid');
                
                // Agregar mensaje de error si no existe
                let feedback = this.parentNode.querySelector('.invalid-feedback');
                if (!feedback) {
                    feedback = document.createElement('div');
                    feedback.className = 'invalid-feedback';
                    this.parentNode.appendChild(feedback);
                }
                feedback.textContent = 'Por favor ingresa un email válido';
            } else {
                this.classList.remove('is-invalid');
                const feedback = this.parentNode.querySelector('.invalid-feedback');
                if (feedback) feedback.remove();
            }
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid') && validateEmail(this.value)) {
                this.classList.remove('is-invalid');
                const feedback = this.parentNode.querySelector('.invalid-feedback');
                if (feedback) feedback.remove();
            }
        });
    });
});