// test-email.js - Versión corregida
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('🧪 Probando configuración de email...');
    console.log('📧 Email:', process.env.EMAIL_USER);
    console.log('🔑 Password configurado:', process.env.EMAIL_PASS ? 'Sí' : 'No');
    console.log('🏢 Email empresa:', process.env.COMPANY_EMAIL);
    
    try {
        // Crear transportador (CORREGIDO: createTransport en lugar de createTransporter)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verificar conexión
        console.log('🔄 Verificando conexión con Gmail...');
        await transporter.verify();
        console.log('✅ Conexión exitosa con Gmail!');

        // Enviar email de prueba
        console.log('📤 Enviando email de prueba...');
        const info = await transporter.sendMail({
            from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Te envías a ti mismo
            subject: '🧪 Prueba de configuración - Cielito Home Clean',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #2d5a3d; color: white; padding: 20px; text-align: center;">
                        <h1>✅ ¡Configuración Exitosa!</h1>
                        <p>Cielito Home Clean</p>
                    </div>
                    <div style="padding: 30px; background-color: #f8f9fa;">
                        <h2 style="color: #2d5a3d;">¡Felicidades!</h2>
                        <p>Tu configuración de email está funcionando correctamente.</p>
                        <p><strong>Fecha de prueba:</strong> ${new Date().toLocaleString('es-MX')}</p>
                        <p><strong>Email configurado:</strong> ${process.env.EMAIL_USER}</p>
                        <p><strong>Empresa:</strong> ${process.env.COMPANY_NAME}</p>
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #2d5a3d;"><strong>✨ Tu aplicación está lista para enviar emails!</strong></p>
                        </div>
                        <div style="background: #2d5a3d; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Configuración actual:</h3>
                            <p style="margin: 5px 0;">📧 <strong>Email origen:</strong> ${process.env.EMAIL_USER}</p>
                            <p style="margin: 5px 0;">🏢 <strong>Email empresa:</strong> ${process.env.COMPANY_EMAIL}</p>
                            <p style="margin: 5px 0;">📱 <strong>WhatsApp:</strong> ${process.env.COMPANY_WHATSAPP}</p>
                            <p style="margin: 5px 0;">🔗 <strong>Puerto:</strong> ${process.env.PORT || 3000}</p>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #2d5a3d; font-size: 18px; font-weight: bold;">🎯 Próximos pasos:</p>
                            <ol style="text-align: left; color: #666;">
                                <li>Ejecuta <code>npm start</code> para iniciar el servidor</li>
                                <li>Ve a <code>http://localhost:3000/contacto.html</code></li>
                                <li>Prueba el formulario de contacto</li>
                                <li>Prueba el newsletter en el footer</li>
                            </ol>
                        </div>
                    </div>
                </div>
            `
        });

        console.log('✅ Email de prueba enviado exitosamente!');
        console.log('📬 Message ID:', info.messageId);
        console.log('');
        console.log('🎉 ¡Tu configuración está perfecta!');
        console.log('📧 Revisa tu email en: sistemas16ch@gmail.com');
        console.log('');
        console.log('🚀 Ahora ejecuta: npm start');
        console.log('🌐 Luego ve a: http://localhost:3000/contacto.html');
        
    } catch (error) {
        console.error('❌ Error en la configuración:');
        console.error('');
        
        if (error.code === 'EAUTH') {
            console.error('🔑 Error de autenticación:');
            console.error('   - Tu email parece correcto: sistemas16ch@gmail.com');
            console.error('   - Verifica la contraseña de aplicación: fatrwbrdnqzyvbnt');
            console.error('   - Asegúrate de que la verificación en 2 pasos esté activada');
            console.error('   - Puede que necesites regenerar la contraseña de aplicación');
        } else if (error.code === 'ENOTFOUND') {
            console.error('🌐 Error de conexión:');
            console.error('   - Verifica tu conexión a internet');
            console.error('   - Puede ser un problema temporal de Gmail');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('⏰ Timeout de conexión:');
            console.error('   - Verifica tu firewall');
            console.error('   - Intenta de nuevo en unos minutos');
        } else {
            console.error('Error completo:', error);
        }
        
        console.error('');
        console.error('💡 Sugerencias:');
        console.error('   1. Ve a https://myaccount.google.com/apppasswords');
        console.error('   2. Genera una nueva contraseña de aplicación');
        console.error('   3. Actualiza tu archivo .env con la nueva contraseña');
    }
}

// Verificar que existan las variables de entorno
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Error: Archivo .env no configurado correctamente');
    console.error('');
    console.error('Asegúrate de que tu archivo .env contenga:');
    console.error('EMAIL_USER=sistemas16ch@gmail.com');
    console.error('EMAIL_PASS=fatrwbrdnqzyvbnt');
    console.error('COMPANY_EMAIL=cielitoclean@cielitohome.com');
    console.error('COMPANY_NAME=Cielito Home Clean');
    process.exit(1);
}

testEmail();