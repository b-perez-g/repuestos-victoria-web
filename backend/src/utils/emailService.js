//utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Crear transporter reutilizable
let transporter = null;

// Inicializar transporter
const initializeTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_PORT === '465', // true para puerto 465, false para otros
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // Solo para desarrollo
            }
        });

        // Verificar configuración
        transporter.verify((error, success) => {
            if (error) {
                console.error('Error configurando email transporter:', error);
            } else {
                console.log('✅ Servidor de email listo para enviar mensajes');
            }
        });
    }
    return transporter;
};

// Plantilla HTML base para emails
const getEmailTemplate = (title, content, buttonText, buttonUrl) => {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                color: #111827;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #F9FAFB;
                padding: 0;
                border: 1px solid #374151;
                border-radius: 12px;
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #111827 0%, #1F2937 50%, #DC2626 100%);
                color: #F9FAFB;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }
            .logo {
                margin-bottom: 10px;
            }
            .content {
                padding: 40px 30px;
                background-color: #F9FAFB;
            }
            .content h2 {
                color: #111827;
                margin-top: 0;
                font-size: 24px;
            }
            .content p {
                color: #111827;
                line-height: 1.6;
                font-size: 16px;
                margin: 16px 0;
            }
            .content ul {
                color: #374151;
                line-height: 1.8;
                padding-left: 20px;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .button {
                display: inline-block;
                padding: 14px 30px;
                background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
                color: #F9FAFB !important;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);
            }
            .button:hover {
                background: linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%);
                transform: translateY(-1px);
                box-shadow: 0 6px 8px rgba(220, 38, 38, 0.3);
            }
            .footer {
                background-color: #111827;
                padding: 20px;
                text-align: center;
                color: #F9FAFB;
                font-size: 14px;
            }
            .footer p {
                margin: 5px 0;
                color: #9CA3AF;
            }
            .divider {
                height: 1px;
                background-color: #6B7280;
                margin: 20px 0;
            }
            .warning {
                background-color: #1F2937;
                border-left: 4px solid #DC2626;
                padding: 15px;
                margin: 20px 0;
                color: #F9FAFB;
                border-radius: 0 8px 8px 0;
            }
            .success {
                background-color: #111827;
                border-left: 4px solid #6B7280;
                padding: 15px;
                margin: 20px 0;
                color: #F9FAFB;
                border-radius: 0 8px 8px 0;
            }
            .error {
                background-color: #1F2937;
                border-left: 4px solid #DC2626;
                padding: 15px;
                margin: 20px 0;
                color: #F9FAFB;
                border-radius: 0 8px 8px 0;
            }
            .info {
                background-color: #F9FAFB;
                border-left: 4px solid #DC2626;
                padding: 15px;
                margin: 20px 0;
                color: #111827;
                border-radius: 0 8px 8px 0;
            }
            .code {
                background-color: #111827;
                border: 1px solid #374151;
                padding: 15px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                word-break: break-all;
                margin: 20px 0;
                color: #F9FAFB;
            }
            .highlight {
                color: #DC2626;
                font-weight: bold;
            }
            .brand-accent {
                color: #DC2626;
            }
            .premium {
                background: linear-gradient(135deg, #111827 0%, #1F2937 100%);
                color: #F9FAFB;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
                border: 1px solid #374151;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    <h1>Repuestos Victoria</h1>
                </div>
                <p style="margin: 0; opacity: 0.9; font-size: 16px; color: #9CA3AF;">Sistema de Gestión</p>
            </div>
            <div class="content">
                ${content}
                ${buttonText && buttonUrl ? `
                    <div class="button-container">
                        <a href="${buttonUrl}" class="button">${buttonText}</a>
                    </div>
                ` : ''}
            </div>
            <div class="footer">
                <p>Este es un mensaje automático, por favor no respondas a este email.</p>
                <div style="height: 1px; background-color: #374151; margin: 15px 0;"></div>
                <p>&copy; ${new Date().getFullYear()} Repuestos Victoria. Todos los derechos reservados.</p>
                <p style="font-size: 12px; opacity: 0.7; color: #6B7280;">Sistema de gestión empresarial</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Enviar email de verificación
const sendVerificationEmail = async (email, token) => {
    try {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
        
        const content = `
            <h2>¡Bienvenido a <span style="color: #DC2626;">Repuestos Victoria</span>!</h2>
            <p style="color: #111827;">Gracias por registrarte en nuestro sistema de gestión. Para completar tu registro y activar tu cuenta, necesitamos verificar tu dirección de email.</p>
            <p style="color: #374151;">Por favor, haz clic en el siguiente botón para verificar tu cuenta:</p>
            
            <div style="background-color: #F9FAFB; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <strong style="color: #DC2626;">💡 Acceso Premium:</strong> 
                <span style="color: #1F2937;">Una vez verificada tu cuenta, tendrás acceso completo a nuestro sistema de gestión de repuestos y herramientas empresariales.</span>
            </div>
            
            <div style="height: 1px; background-color: #6B7280; margin: 20px 0;"></div>
            <p style="color: #6B7280; font-size: 14px;">Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
            <div style="background-color: #111827; border: 1px solid #374151; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 14px; word-break: break-all; margin: 20px 0; color: #F9FAFB;">${verificationUrl}</div>
            
            <div style="background-color: #1F2937; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <strong style="color: #DC2626;">⚠️ Importante:</strong> 
                <span style="color: #F9FAFB;">Este enlace expirará en 24 horas por razones de seguridad. Si no solicitaste este registro, puedes ignorar este mensaje de manera segura.</span>
            </div>
            
            <div style="background-color: #111827; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #DC2626;">
                <p style="margin: 0; color: #F9FAFB; font-size: 14px;">
                    <strong style="color: #DC2626;">🔒 Seguridad:</strong> 
                    Este email es parte de nuestro proceso de verificación de dos pasos para proteger tu cuenta.
                </p>
            </div>
        `;

        const mailOptions = {
            from: `"Repuestos Victoria - Sistema de Gestión" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: '✉️ Verifica tu cuenta - Repuestos Victoria',
            html: getEmailTemplate(
                'Verificación de Email',
                content,
                'Verificar mi cuenta',
                verificationUrl
            )
        };

        const transport = initializeTransporter();
        const info = await transport.sendMail(mailOptions);
        
        console.log('✅ Email de verificación enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error enviando email de verificación:', error);
        throw error;
    }
};

// Enviar email de recuperación de contraseña
const sendPasswordResetEmail = async (email, token) => {
    try {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        
        const content = `
            <h2>Recuperación de Contraseña</h2>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p>Si realizaste esta solicitud, haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <div class="divider"></div>
            <p style="color: #666; font-size: 14px;">Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
            <div class="code">${resetUrl}</div>
            <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por razones de seguridad. Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje y tu contraseña permanecerá sin cambios.
            </div>
            <p style="margin-top: 20px;"><strong>Consejos de seguridad:</strong></p>
            <ul style="color: #666;">
                <li>Nunca compartas tu contraseña con nadie</li>
                <li>Usa una contraseña única y segura</li>
                <li>Activa la autenticación de dos factores cuando esté disponible</li>
            </ul>
        `;

        const mailOptions = {
            from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'Sistema Login'}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: '🔐 Restablecer contraseña',
            html: getEmailTemplate(
                'Restablecer Contraseña',
                content,
                'Restablecer mi contraseña',
                resetUrl
            )
        };

        const transport = initializeTransporter();
        const info = await transport.sendMail(mailOptions);
        
        console.log('Email de recuperación enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando email de recuperación:', error);
        throw error;
    }
};

// Enviar email de bienvenida después de verificación
const sendWelcomeEmail = async (email, firstName) => {
    try {
        const content = `
            <h2>¡Bienvenido ${firstName}!</h2>
            <p>Tu cuenta ha sido verificada exitosamente. Ahora puedes acceder a todas las funcionalidades de nuestro sistema.</p>
            <p>Aquí hay algunas cosas que puedes hacer:</p>
            <ul style="color: #666; line-height: 1.8;">
                <li>Actualizar tu perfil con información adicional</li>
                <li>Configurar preferencias de notificación</li>
                <li>Explorar todas las características disponibles</li>
                <li>Contactar soporte si necesitas ayuda</li>
            </ul>
            <div class="divider"></div>
            <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.</p>
        `;

        const mailOptions = {
            from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'Sistema Login'}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: '🎉 ¡Bienvenido! Tu cuenta está activa',
            html: getEmailTemplate(
                '¡Cuenta Activada!',
                content,
                'Ir al Dashboard',
                `${process.env.FRONTEND_URL}/dashboard`
            )
        };

        const transport = initializeTransporter();
        const info = await transport.sendMail(mailOptions);
        
        console.log('Email de bienvenida enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando email de bienvenida:', error);
        throw error;
    }
};

// Enviar notificación de cambio de contraseña
const sendPasswordChangedEmail = async (email, firstName) => {
    try {
        const content = `
            <h2>Contraseña Actualizada</h2>
            <p>Hola ${firstName},</p>
            <p>Te confirmamos que la contraseña de tu cuenta ha sido actualizada exitosamente.</p>
            <div class="warning">
                <strong>⚠️ ¿No reconoces esta actividad?</strong><br>
                Si no realizaste este cambio, por favor contacta con soporte inmediatamente y cambia tu contraseña.
            </div>
            <p><strong>Detalles de la actividad:</strong></p>
            <ul style="color: #666;">
                <li>Fecha: ${new Date().toLocaleString('es-ES')}</li>
                <li>Acción: Cambio de contraseña</li>
            </ul>
        `;

        const mailOptions = {
            from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'Sistema Login'}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: '🔔 Contraseña actualizada',
            html: getEmailTemplate(
                'Notificación de Seguridad',
                content,
                null,
                null
            )
        };

        const transport = initializeTransporter();
        const info = await transport.sendMail(mailOptions);
        
        console.log('Email de notificación enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando notificación:', error);
        throw error;
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendPasswordChangedEmail
};