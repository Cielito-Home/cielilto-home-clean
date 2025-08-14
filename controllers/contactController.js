const path = require('path');
const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({  // ⚠️ DEBE SER createTransport
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'tu-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'tu-app-password'
        }
    });
};

exports.getContactPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/contacto.html'));
};

exports.handleContactForm = async (req, res) => {
    try {
        const { name, email, phone, service, message, privacy } = req.body;
        
        // Detectar si es una request AJAX o formulario HTML
        const isAjax = req.headers['content-type'] && req.headers['content-type'].includes('application/json');
        
        // Validación básica
        if (!name || !email || !phone || !service || !message || !privacy) {
            if (isAjax) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son obligatorios'
                });
            } else {
                return res.redirect('/contact?error=missing_fields');
            }
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (isAjax) {
                return res.status(400).json({
                    success: false,
                    message: 'Email inválido'
                });
            } else {
                return res.redirect('/contact?error=invalid_email');
            }
        }

        // Crear transportador de email
        const transporter = createTransporter();

        // Email para el administrador
        const adminMailOptions = {
            from: process.env.EMAIL_USER || 'tu-email@gmail.com',
            to: 'cielitoclean@cielitohome.com', // Email de destino
            subject: `Nuevo contacto de ${name} - Cielito Home Clean`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #2d5a3d; color: white; padding: 20px; text-align: center;">
                        <h1>Nuevo Mensaje de Contacto</h1>
                        <p>Cielito Home Clean</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f8f9fa;">
                        <h2 style="color: #2d5a3d; margin-bottom: 20px;">Información del Cliente</h2>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <p><strong>Nombre:</strong> ${name}</p>
                            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                            <p><strong>Teléfono:</strong> <a href="tel:${phone}">${phone}</a></p>
                            <p><strong>Servicio de interés:</strong> ${service}</p>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px;">
                            <h3 style="color: #2d5a3d;">Mensaje:</h3>
                            <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; line-height: 1.6;">
                                ${message}
                            </p>
                        </div>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="mailto:${email}" 
                               style="background-color: #2d5a3d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                                Responder por Email
                            </a>
                            <a href="tel:${phone}" 
                               style="background-color: #25d366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin-left: 10px;">
                                Llamar Ahora
                            </a>
                        </div>
                    </div>
                    
                    <div style="background-color: #2d5a3d; color: white; padding: 15px; text-align: center; font-size: 12px;">
                        <p>Este mensaje fue enviado desde el formulario de contacto en cielitohome.com</p>
                        <p>Fecha: ${new Date().toLocaleString('es-MX')}</p>
                    </div>
                </div>
            `
        };

        // Email de confirmación para el cliente
        const clientMailOptions = {
            from: process.env.EMAIL_USER || 'tu-email@gmail.com',
            to: email,
            subject: 'Confirmación de mensaje - Cielito Home Clean',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #2d5a3d; color: white; padding: 20px; text-align: center;">
                        <h1>¡Gracias por contactarnos!</h1>
                        <p>Cielito Home Clean</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f8f9fa;">
                        <h2 style="color: #2d5a3d;">Hola ${name},</h2>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                            Hemos recibido tu mensaje y queremos agradecerte por tu interés en nuestros servicios de limpieza profesional.
                        </p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #2d5a3d; margin-top: 0;">Resumen de tu consulta:</h3>
                            <p><strong>Servicio:</strong> ${service}</p>
                            <p><strong>Mensaje:</strong> ${message}</p>
                        </div>
                        
                        <p style="font-size: 16px; line-height: 1.6;">
                            <strong>Nuestro equipo se pondrá en contacto contigo en menos de 24 horas</strong> para brindarte una cotización personalizada y resolver todas tus dudas.
                        </p>
                        
                        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #2d5a3d; margin-top: 0;">¿Necesitas atención inmediata?</h3>
                            <p>Puedes contactarnos directamente:</p>
                            <p>📞 <strong>449 138 2712</strong></p>
                            <p>💬 <strong>WhatsApp:</strong> <a href="https://wa.me/524491382712">Enviar mensaje</a></p>
                            <p>📧 <strong>Email:</strong> cielitoclean@cielitohome.com</p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://wa.me/524491382712" 
                               style="background-color: #25d366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                                💬 Chatear por WhatsApp
                            </a>
                        </div>
                    </div>
                    
                    <div style="background-color: #2d5a3d; color: white; padding: 20px; text-align: center;">
                        <h3>¿Por qué elegir Cielito Home Clean?</h3>
                        <div style="display: flex; justify-content: space-around; margin-top: 15px;">
                            <div style="text-align: center; flex: 1;">
                                <p style="margin: 5px 0; font-weight: bold;">✨ Productos Ecológicos</p>
                                <p style="margin: 0; font-size: 12px;">Seguros para tu familia</p>
                            </div>
                            <div style="text-align: center; flex: 1;">
                                <p style="margin: 5px 0; font-weight: bold;">🛡️ Garantía 100%</p>
                                <p style="margin: 0; font-size: 12px;">Satisfacción garantizada</p>
                            </div>
                            <div style="text-align: center; flex: 1;">
                                <p style="margin: 5px 0; font-weight: bold;">👥 Equipo Profesional</p>
                                <p style="margin: 0; font-size: 12px;">Personal capacitado</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                        <p>Síguenos en redes sociales:</p>
                        <p>
                            <a href="https://www.instagram.com/cielitohomeclean" style="color: #2d5a3d; text-decoration: none;">Instagram</a> |
                            <a href="https://wa.me/524491382712" style="color: #2d5a3d; text-decoration: none;">WhatsApp</a>
                        </p>
                        <p style="margin-top: 10px;">
                            Cielito Home Clean - Limpieza Profesional en Aguascalientes<br>
                            Este es un mensaje automático, por favor no responder a este email.
                        </p>
                    </div>
                </div>
            `
        };

        // Enviar ambos emails
        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(clientMailOptions);

        // Guardar en base de datos (opcional - implementar después)
        // await saveContactToDatabase(req.body);

        console.log('Nuevo mensaje de contacto:', {
            name,
            email,
            phone,
            service,
            timestamp: new Date().toISOString()
        });

        // Respuesta exitosa según el tipo de request
        if (isAjax) {
            res.status(200).json({
                success: true,
                message: 'Mensaje enviado correctamente. Te contactaremos pronto.'
            });
        } else {
            res.redirect('/contact?success=true');
        }

    } catch (error) {
        console.error('Error al procesar formulario de contacto:', error);
        
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor. Por favor, intenta de nuevo o contáctanos por WhatsApp.'
            });
        } else {
            res.redirect('/contact?error=server_error');
        }
    }
};

exports.handleNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email es requerido'
            });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }

        const transporter = createTransporter();

        // Email de bienvenida al suscriptor
        const welcomeMailOptions = {
            from: process.env.EMAIL_USER || 'tu-email@gmail.com',
            to: email,
            subject: '¡Bienvenido al Newsletter de Cielito Home Clean! 🏠✨',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">¡Bienvenido!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px;">Ya eres parte de la familia Cielito Home Clean</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f8f9fa;">
                        <h2 style="color: #2d5a3d; text-align: center;">¡Gracias por suscribirte! 🎉</h2>
                        
                        <p style="font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
                            Ahora recibirás contenido exclusivo, ofertas especiales y consejos profesionales de limpieza directamente en tu bandeja de entrada.
                        </p>
                        
                        <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h3 style="color: #2d5a3d; margin-top: 0; text-align: center;">🎁 ¡Oferta de Bienvenida!</h3>
                            <div style="background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 15px 0;">
                                <h2 style="color: #2d5a3d; margin: 0; font-size: 24px;">15% de Descuento</h2>
                                <p style="margin: 10px 0; font-size: 14px; color: #666;">En tu primer servicio</p>
                                <p style="margin: 15px 0 5px 0; font-weight: bold; color: #2d5a3d;">Código: BIENVENIDO15</p>
                                <p style="margin: 0; font-size: 12px; color: #666;">*Válido por 30 días</p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <h3 style="color: #2d5a3d;">¿Listo para una limpieza profesional?</h3>
                            <a href="https://wa.me/524491382712?text=Hola, me gustaría usar mi descuento de bienvenida del 15%" 
                               style="background-color: #25d366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; margin: 10px;">
                                💬 Solicitar Cotización por WhatsApp
                            </a>
                            <br>
                            <a href="tel:4491382712" 
                               style="background-color: #2d5a3d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; margin: 10px;">
                                📞 Llamar Ahora
                            </a>
                        </div>
                        
                        <div style="background: #2d5a3d; color: white; padding: 20px; border-radius: 10px; margin: 25px 0;">
                            <h3 style="margin-top: 0; text-align: center;">Lo que recibirás en nuestro newsletter:</h3>
                            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-top: 15px;">
                                <div style="width: 48%; margin-bottom: 15px;">
                                    <p style="margin: 5px 0;"><strong>✨ Tips de Limpieza</strong></p>
                                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">Consejos profesionales</p>
                                </div>
                                <div style="width: 48%; margin-bottom: 15px;">
                                    <p style="margin: 5px 0;"><strong>🎯 Ofertas Exclusivas</strong></p>
                                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">Solo para suscriptores</p>
                                </div>
                                <div style="width: 48%; margin-bottom: 15px;">
                                    <p style="margin: 5px 0;"><strong>🏠 Guías de Mantenimiento</strong></p>
                                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">Para tu hogar u oficina</p>
                                </div>
                                <div style="width: 48%; margin-bottom: 15px;">
                                    <p style="margin: 5px 0;"><strong>📅 Promociones Estacionales</strong></p>
                                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">Descuentos especiales</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                        <p>Síguenos en redes sociales para más contenido:</p>
                        <p style="margin: 10px 0;">
                            <a href="https://www.instagram.com/cielitohomeclean" style="color: #2d5a3d; text-decoration: none; margin: 0 10px;">📸 Instagram</a>
                            <a href="https://wa.me/524491382712" style="color: #2d5a3d; text-decoration: none; margin: 0 10px;">💬 WhatsApp</a>
                        </p>
                        <p style="margin-top: 15px;">
                            Cielito Home Clean - Limpieza Profesional en Aguascalientes<br>
                            Si no deseas recibir más emails, <a href="#" style="color: #2d5a3d;">haz clic aquí para darte de baja</a>
                        </p>
                    </div>
                </div>
            `
        };

        // Email de notificación al admin
        const adminNotificationOptions = {
            from: process.env.EMAIL_USER || 'tu-email@gmail.com',
            to: 'cielitoclean@cielitohome.com',
            subject: 'Nueva suscripción al Newsletter - Cielito Home Clean',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #2d5a3d; color: white; padding: 20px; text-align: center;">
                        <h1>Nueva Suscripción al Newsletter</h1>
                    </div>
                    <div style="padding: 20px; background-color: #f8f9fa;">
                        <p><strong>Nuevo suscriptor:</strong> ${email}</p>
                        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX')}</p>
                        <p>El usuario ha recibido automáticamente el email de bienvenida con el código de descuento BIENVENIDO15.</p>
                    </div>
                </div>
            `
        };

        // Enviar emails
        await transporter.sendMail(welcomeMailOptions);
        await transporter.sendMail(adminNotificationOptions);

        // Guardar en base de datos (opcional - implementar después)
        // await saveNewsletterSubscription(email);

        console.log('Nueva suscripción al newsletter:', {
            email,
            timestamp: new Date().toISOString()
        });

        // Respuesta según el tipo de request
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            res.status(200).json({
                success: true,
                message: '¡Te has suscrito exitosamente! Revisa tu email para tu descuento de bienvenida.'
            });
        } else {
            res.redirect('/?newsletter=success');
        }

    } catch (error) {
        console.error('Error al procesar suscripción al newsletter:', error);
        
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor. Por favor, intenta de nuevo.'
            });
        } else {
            res.redirect('/?newsletter=error');
        }
    }
};

// Agregar al final del archivo contactController.js si no existe:

exports.handleAdminNewsletter = async (req, res) => {
    try {
        const { subject, content, subscribers } = req.body;
        
        if (!subject || !content || !subscribers || !Array.isArray(subscribers)) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos'
            });
        }

        if (subscribers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay suscriptores'
            });
        }

        const transporter = createTransporter();
        let sentCount = 0;
        let errors = [];

        console.log(`📧 Enviando newsletter a ${subscribers.length} suscriptores...`);

        // Enviar a cada suscriptor
        for (const email of subscribers) {
            try {
                await transporter.sendMail({
                    from: `"Cielito Home Clean" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: subject,
                    html: content
                });
                
                sentCount++;
                console.log(`✅ Enviado a: ${email}`);
                
                // Pausa para no saturar el servidor
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ Error enviando a ${email}:`, error.message);
                errors.push(email);
            }
        }

        console.log(`🎉 Newsletter enviado a ${sentCount}/${subscribers.length} suscriptores`);

        res.json({
            success: true,
            message: 'Newsletter enviado exitosamente',
            sentCount: sentCount,
            totalSubscribers: subscribers.length,
            errors: errors.length
        });

    } catch (error) {
        console.error('❌ Error enviando newsletter:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message
        });
    }
};