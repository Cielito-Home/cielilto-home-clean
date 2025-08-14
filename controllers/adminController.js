const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({  // ⚠️ CORREGIR: createTransport NO createTransporter
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

exports.sendNewsletter = async (req, res) => {
    try {
        const { subject, content, subscribers } = req.body;
        
        console.log('📧 Recibida petición de newsletter:', {
            subject: subject ? 'Sí' : 'No',
            content: content ? 'Sí' : 'No',
            subscribers: subscribers ? subscribers.length : 0
        });
        
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

        if (errors.length > 0) {
            console.log(`⚠️ Errores en: ${errors.join(', ')}`);
        }

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

// También agregar esta función para manejar desde contactController
exports.handleAdminNewsletter = async (req, res) => {
    console.log('📧 Redirigiendo a sendNewsletter...');
    return this.sendNewsletter(req, res);
};