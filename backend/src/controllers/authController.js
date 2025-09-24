const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const TokenGenerator = require("../utils/tokenGenerator");
const logger = require("../utils/logger");
const {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendPasswordChangedEmail,
} = require("../utils/emailService");
const { getConnection } = require("../config/database");

/**
 * Controlador de autenticación y gestión de usuarios.
 */
class AuthController {
    /**
     * Registra un nuevo usuario y envía email de verificación.
     */
    static async register(req, res) {
        try {
            // Validar datos
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    success: false,
                    message: "Datos de entrada inválidos",
                    errors: errors.array(),
                });
            }

            const {
                correo,
                contrasena,
                nombres,
                a_paterno,
                a_materno,
                id_rol = 3, // Default cliente
            } = req.body;

            // Verificar si usuario existe
            const existingUser = await User.findByEmail(correo);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "El email ya está registrado",
                });
            }

            const hashedPassword = await bcrypt.hash(
                contrasena,
                parseInt(process.env.BCRYPT_ROUNDS) || 12
            );

            // Generar token de verificación
            const verificationToken = TokenGenerator.generateRandomToken();

            // Crear usuario
            const userId = await User.create({
                correo: correo.toLowerCase().trim(),
                contrasena_hash: hashedPassword,
                nombres: nombres.trim(),
                a_paterno: a_paterno.trim(),
                a_materno: a_materno?.trim() || null,
                token_verificacion: verificationToken,
                id_rol: id_rol,
            });


            // Enviar email de verificación
            try {
                await sendVerificationEmail(correo, verificationToken);
            } catch (emailError) {
                console.error(
                    "Error enviando email de verificación:",
                    emailError
                );
                // No fallar el registro por error de email
            }

            // Log de auditoría
            await AuthController.logAudit(
                userId,
                "REGISTER",
                req.ip,
                req.get("user-agent"),
                true
            );

            res.status(201).json({
                success: true,
                message:
                    "Usuario registrado exitosamente. Por favor verifica tu email.",
            });
        } catch (error) {
            console.error("Error en registro:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }

    /**
     * Inicia sesión de un usuario y genera tokens de acceso y refresh.
     */

    // En authController.js - método login modificado

    static async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    success: false,
                    message: "Datos de entrada inválidos",
                    errors: errors.array(),
                });
            }

            const { email, password, rememberMe = false } = req.body;

            // Sanitizar y validar entrada
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email y contraseña son requeridos",
                });
            }

            // Verificar tipo de datos
            if (typeof email !== 'string' || typeof password !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: "Tipos de datos inválidos",
                });
            }

            // Verificar longitud máxima para prevenir DoS
            if (email.length > 254 || password.length > 128) {
                return res.status(400).json({
                    success: false,
                    message: "Datos de entrada demasiado largos",
                });
            }

            // Buscar usuario
            const user = await User.findByEmail(email.toLowerCase().trim());

            if (!user) {
                await AuthController.logAudit(
                    null,
                    "LOGIN_FAILED",
                    req.ip,
                    req.get("user-agent"),
                    false,
                    "Usuario no encontrado"
                );
                return res.status(401).json({
                    success: false,
                    message: "Credenciales inválidas",
                });
            }

            // Verificar si cuenta está bloqueada
            if (
                user.bloqueado_hasta &&
                new Date(user.bloqueado_hasta) > new Date()
            ) {
                const minutosRestantes = Math.ceil(
                    (new Date(user.bloqueado_hasta) - new Date()) / (1000 * 60)
                );
                return res.status(423).json({
                    success: false,
                    message: `Cuenta bloqueada temporalmente. Inténtalo en ${minutosRestantes} minutos.`,
                });
            }

            // Verificar contraseña
            const isPasswordValid = await bcrypt.compare(
                password,
                user.contrasena_hash
            );

            if (!isPasswordValid) {
                const attempts = (user.intentos_fallidos || 0) + 1;
                let lockUntil = null;

                const maxAttempts =
                    parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
                const lockTimeMinutes = parseInt(process.env.LOCK_TIME) || 15;

                if (attempts >= maxAttempts) {
                    lockUntil = new Date(
                        Date.now() + lockTimeMinutes * 60 * 1000
                    );
                }

                await User.updateLoginAttempts(user.id, attempts, lockUntil);
                await AuthController.logAudit(
                    user.id,
                    "LOGIN_FAILED",
                    req.ip,
                    req.get("user-agent"),
                    false,
                    "Contraseña incorrecta"
                );

                return res.status(401).json({
                    success: false,
                    message: lockUntil
                        ? "Demasiados intentos fallidos. Cuenta bloqueada temporalmente."
                        : "Credenciales inválidas",
                });
            }

            // Verificar si usuario está activo
            if (!user.activo) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Tu cuenta ha sido desactivada. Contacta al administrador.",
                });
            }

            // Verificar si email está verificado
            if (!user.verificado) {
                return res.status(403).json({
                    success: false,
                    message: "Tu cuenta no está verificada. Revisa tu correo electrónico o solicita un nuevo correo de verificación.",
                    needsVerification: true,
                    email: user.correo
                });
            }

            // ✅ Definir payload para tokens
            const payload = {
                id: user.id,
                email: user.correo,
                role: user.nombre_rol || "cliente",
                firstName: user.nombres,
                lastName: user.a_paterno,
            };

            // Generar tokens
            const accessToken = TokenGenerator.generateAccessToken(payload);
            const refreshToken = TokenGenerator.generateRefreshToken({
                id: user.id,
            });

            // ✅ CONFIGURACIÓN CORRECTA DE COOKIES SEGÚN REMEMBER ME
            if (rememberMe) {
                // 🔒 SESIÓN PERSISTENTE - Cookies con fecha de expiración
                const cookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                    path: "/",
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos (reducido de 30)
                };

                const refreshCookieOptions = {
                    ...cookieOptions,
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
                };

                res.cookie("token", accessToken, cookieOptions);
                res.cookie("refreshToken", refreshToken, refreshCookieOptions);

                // Guardar en BD con expiración reducida
                const refreshExpiry = new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                );
                await RefreshToken.create(user.id, refreshToken, refreshExpiry);
            } else {
                // ⚡ SESIÓN TEMPORAL - Cookies de sesión con expiración corta
                const sessionCookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                    path: "/",
                    maxAge: 2 * 60 * 60 * 1000, // 2 horas para sesiones temporales
                };

                res.cookie("token", accessToken, sessionCookieOptions);
                res.cookie("refreshToken", refreshToken, sessionCookieOptions);

                // Guardar en BD con expiración muy corta
                const refreshExpiry = new Date(
                    Date.now() + 2 * 60 * 60 * 1000
                ); // 2 horas
                await RefreshToken.create(user.id, refreshToken, refreshExpiry);
            }

            // Resetear intentos fallidos
            await User.updateLastLogin(user.id);

            // Crear sesión con validación
            await AuthController.createSession(
                user.id,
                accessToken,
                req.ip,
                req.get("user-agent"),
                rememberMe
            );

            // Verificar límite de sesiones concurrentes (max 5 por usuario)
            await AuthController.limitConcurrentSessions(user.id, 5);

            // Log de auditoría
            await AuthController.logAudit(
                user.id,
                "LOGIN_SUCCESS",
                req.ip,
                req.get("user-agent"),
                true
            );


            res.json({
                success: true,
                message: "Login exitoso",
                user: {
                    id: user.id,
                    email: user.correo,
                    firstName: user.nombres,
                    lastName: user.a_paterno,
                    role: user.nombre_rol || "cliente",
                },
            });
        } catch (error) {
            console.error("Error en login:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }

    /**
     * Valida el token actual del usuario y devuelve información completa
     */
    static async validateToken(req, res) {
        try {
            // El middleware ya validó el token y estableció req.user
            res.json({
                success: true,
                message: "Token válido",
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    role: req.user.role,
                },
            });
        } catch (error) {
            console.error("Error validando token:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }

    /**
     * Renueva el access token utilizando un refresh token válido.
     */
    // En authController.js - método refreshToken modificado

    static async refreshToken(req, res) {
        try {
            let refreshToken = req.cookies?.refreshToken;

            if (!refreshToken && req.body.refreshToken) {
                refreshToken = req.body.refreshToken;
            }

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: "Refresh token no proporcionado",
                });
            }

            // Verificar refresh token
            const decoded = TokenGenerator.verifyRefreshToken(refreshToken);
            if (!decoded) {
                return res.status(401).json({
                    success: false,
                    message: "Refresh token inválido",
                });
            }

            // Buscar token en BD
            const tokenExists = await RefreshToken.findByToken(refreshToken);
            if (!tokenExists) {
                return res.status(401).json({
                    success: false,
                    message: "Refresh token no encontrado o expirado",
                });
            }

            // Buscar usuario
            const user = await User.findById(decoded.id);
            if (!user || !user.activo) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no encontrado o inactivo",
                });
            }

            // Generar nuevo access token
            const payload = {
                id: user.id,
                email: user.correo,
                role: user.nombre_rol || "cliente",
                firstName: user.nombres,
                lastName: user.a_paterno,
            };

            const newAccessToken = TokenGenerator.generateAccessToken(payload);

            // ✅ DETECTAR TIPO DE SESIÓN BASADO EN LA COOKIE ORIGINAL
            const originalRefreshExpiry = new Date(tokenExists.expira_en);
            const now = new Date();
            const remainingTime =
                originalRefreshExpiry.getTime() - now.getTime();
            const totalOriginalTime = remainingTime; // Tiempo restante

            // Si el refresh token expira en más de 7 días, es una sesión persistente
            const isPersistentSession = remainingTime > 7 * 24 * 60 * 60 * 1000;

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                path: "/",
            };

            if (isPersistentSession) {
                // Sesión persistente - cookie con expiración
                res.cookie("token", newAccessToken, {
                    ...cookieOptions,
                    maxAge: Math.min(remainingTime, 30 * 24 * 60 * 60 * 1000),
                });
            } else {
                // Sesión temporal - cookie de sesión
                res.cookie("token", newAccessToken, cookieOptions);
            }


            res.json({
                success: true,
                token: newAccessToken,
            });
        } catch (error) {
            console.error("Error en refresh token:", error);
            res.status(401).json({
                success: false,
                message: "Error al renovar token",
            });
        }
    }

    /**
     * Cierra la sesión de un usuario y elimina el refresh token.
     */
    static async logout(req, res) {
        try {
            const { refreshToken } = req.cookies;

            if (refreshToken) {
                await RefreshToken.deleteByToken(refreshToken);
            }

            // Eliminar sesión
            if (req.user) {
                await AuthController.deleteSession(req.user.id);
                await AuthController.logAudit(
                    req.user.id,
                    "LOGOUT",
                    req.ip,
                    req.get("user-agent"),
                    true
                );
            }

            res.clearCookie("token");
            res.clearCookie("refreshToken");

            res.json({
                success: true,
                message: "Logout exitoso",
            });
        } catch (error) {
            console.error("Error en logout:", error);
            res.status(500).json({
                success: false,
                message: "Error al cerrar sesión",
            });
        }
    }

    /**
     * Solicita la recuperación de contraseña enviando un email con token.
     */
    static async forgotPassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    success: false,
                    message: "Email inválido",
                    errors: errors.array(),
                });
            }

            const { email } = req.body;
            const user = await User.findByEmail(email.toLowerCase().trim());

            // No revelar si el email existe
            const successMessage =
                "Si el email existe, recibirás instrucciones para recuperar tu contraseña";

            if (!user) {
                return res.json({
                    success: true,
                    message: successMessage,
                });
            }

            // Generar token con expiración de 1 hora
            const resetToken = TokenGenerator.generateRandomToken();
            const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

            // Guardar token
            await User.setResetToken(
                email.toLowerCase().trim(),
                resetToken,
                expires
            );

            // Enviar email
            try {
                await sendPasswordResetEmail(email, resetToken);
            } catch (emailError) {
                console.error("Error enviando email de reset:", emailError);
                // No fallar por error de email
            }

            // Log de auditoría
            await AuthController.logAudit(
                user.id,
                "PASSWORD_RESET_REQUEST",
                req.ip,
                req.get("user-agent"),
                true
            );

            res.json({
                success: true,
                message: successMessage,
            });
        } catch (error) {
            console.error("Error en forgot password:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }

    /**
     * Resetea la contraseña de un usuario utilizando un token válido.
     */
    static async resetPassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    success: false,
                    message: "Datos inválidos",
                    errors: errors.array(),
                });
            }

            const { token, password } = req.body;

            const success = await User.resetPassword(token, password);

            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: "Token inválido o expirado",
                });
            }

            // Buscar usuario para enviar email de confirmación
            const user = await User.findByResetToken(token);
            if (user) {
                try {
                    await sendPasswordChangedEmail(user.correo, user.nombres);
                } catch (emailError) {
                    console.error(
                        "Error enviando email de confirmación:",
                        emailError
                    );
                }

                await AuthController.logAudit(
                    user.id,
                    "PASSWORD_RESET_SUCCESS",
                    req.ip,
                    req.get("user-agent"),
                    true
                );
            }

            res.json({
                success: true,
                message: "Contraseña actualizada exitosamente",
            });
        } catch (error) {
            console.error("Error en reset password:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }

    /**
     * Verifica el email de un usuario mediante token de verificación.
     */
    static async verifyEmail(req, res) {
        try {
            const { token } = req.params;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: "Token de verificación requerido",
                });
            }

            // Buscar usuario por token antes de verificar
            const user = await User.findByVerificationToken(token);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Token de verificación inválido o ya utilizado",
                });
            }

            if (user.verificado) {
                return res.status(400).json({
                    success: false,
                    message: "El correo ya ha sido verificado",
                });
            }

            const success = await User.verifyEmail(token);

            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: "Token de verificación inválido",
                });
            }

            // Enviar email de bienvenida
            try {
                await sendWelcomeEmail(user.correo, user.nombres);
            } catch (emailError) {
                console.error(
                    "Error enviando email de bienvenida:",
                    emailError
                );
            }

            await AuthController.logAudit(
                user.id,
                "EMAIL_VERIFIED",
                req.ip,
                req.get("user-agent"),
                true
            );

            res.json({
                success: true,
                message: "Email verificado exitosamente",
            });
        } catch (error) {
            console.error("Error en verificación:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }

    /**
     * Reenvía el email de verificación
     */
    static async resendVerification(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email requerido",
                });
            }

            const user = await User.findByEmail(email.toLowerCase().trim());

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Usuario no encontrado",
                });
            }

            if (user.verificado) {
                return res.status(400).json({
                    success: false,
                    message: "El correo ya está verificado",
                });
            }

            // Generar nuevo token
            const verificationToken = TokenGenerator.generateRandomToken();

            let connection;
            try {
                connection = await getConnection();
                await connection.execute(
                    "UPDATE usuarios SET token_verificacion = ? WHERE id = ?",
                    [verificationToken, user.id]
                );
            } finally {
                if (connection) connection.release();
            }

            // Enviar email
            try {
                await sendVerificationEmail(email, verificationToken);
            } catch (emailError) {
                console.error("Error enviando email:", emailError);
                return res.status(500).json({
                    success: false,
                    message: "Error enviando email de verificación",
                });
            }

            res.json({
                success: true,
                message: "Email de verificación reenviado",
            });
        } catch (error) {
            console.error("Error reenviando verificación:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }

    /**
     * Crea una sesión para un usuario con token y expiración.
     */
    static async createSession(userId, token, ip, userAgent, isPersistent) {
        let connection;
        try {
            connection = await getConnection();
            const expiresAt = isPersistent
                ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
                : new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas

            const now = new Date();

            await connection.execute(
                `INSERT INTO sesiones (id_usuario, token_sesion, ip, agente_usuario, persistente, expira_en, ultima_actividad)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, token, ip, userAgent, isPersistent, expiresAt, now]
            );
        } catch (error) {
            console.error("Error creando sesión:", error);
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Elimina la sesión de un usuario.
     */
    static async deleteSession(userId) {
        let connection;
        try {
            connection = await getConnection();
            await connection.execute(
                `DELETE FROM sesiones WHERE id_usuario = ?`,
                [userId]
            );
        } catch (error) {
            console.error("Error eliminando sesión:", error);
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Limita sesiones concurrentes por usuario
     */
    static async limitConcurrentSessions(userId, maxSessions = 5) {
        let connection;
        try {
            connection = await getConnection();

            // Contar sesiones activas
            const [rows] = await connection.execute(
                `SELECT COUNT(*) as count FROM sesiones WHERE id_usuario = ? AND expira_en > NOW()`,
                [userId]
            );

            const sessionCount = rows[0].count;

            if (sessionCount > maxSessions) {
                // Eliminar sesiones más antiguas (priorizando por última actividad, luego por creación)
                await connection.execute(
                    `DELETE FROM sesiones
                     WHERE id_usuario = ? AND expira_en > NOW()
                     ORDER BY COALESCE(ultima_actividad, creado_en) ASC, creado_en ASC
                     LIMIT ?`,
                    [userId, sessionCount - maxSessions]
                );

            }
        } catch (error) {
            console.error("Error limitando sesiones:", error);
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Valida la sesión actual del usuario
     */
    static async validateSession(userId, token) {
        let connection;
        try {
            connection = await getConnection();

            const [rows] = await connection.execute(
                `SELECT * FROM sesiones
                 WHERE id_usuario = ? AND token_sesion = ? AND expira_en > NOW()`,
                [userId, token]
            );

            if (rows.length === 0) {
                return false;
            }

            // Actualizar última actividad
            await connection.execute(
                `UPDATE sesiones SET ultima_actividad = NOW() WHERE id = ?`,
                [rows[0].id]
            );

            return true;
        } catch (error) {
            console.error("Error validando sesión:", error);
            return false;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Registra una acción en el log de auditoría.
     */
    static async logAudit(
        userId,
        action,
        ip,
        userAgent,
        success,
        errorMessage = null
    ) {
        let connection;
        try {
            connection = await getConnection();
            await connection.execute(
                `INSERT INTO logs_auditoria (id_usuario, accion, ip, agente_usuario, exito, mensaje_error)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, action, ip, userAgent, success, errorMessage]
            );
        } catch (error) {
            console.error("Error guardando log de auditoría:", error);
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = AuthController;
