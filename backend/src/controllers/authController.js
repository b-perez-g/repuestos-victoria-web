const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const {
    sendVerificationEmail,
    sendPasswordResetEmail,
} = require("../utils/emailService");
const { getConnection } = require("../config/database");

/**
 * Controlador de autenticación y gestión de usuarios.
 */
class AuthController {
    /**
     * Registra un nuevo usuario y envía email de verificación.
     *
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async register(req, res) {
        try {
            // Validar datos
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors);
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            

            const { correo, contrasena, nombres, a_paterno, a_materno, id_rol} = req.body;

            const hashedPassword = await bcrypt.hash(contrasena, parseInt(process.env.BCRYPT_ROUNDS));

            // Verificar si usuario existe
            const existingUser = await User.findByEmail(correo);

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "El email ya está registrado",
                });
            }

            // Generar token de verificación
            const verificationToken = crypto.randomBytes(32).toString("hex");


            // Crear usuario
            const userId = await User.create({
                correo: correo,
                contrasena_hash: hashedPassword,
                nombres: nombres,
                a_paterno: a_paterno,
                a_materno: a_materno,
                token_verificacion: verificationToken,
                id_rol: id_rol
            });

            // Enviar email de verificación
            await sendVerificationEmail(correo, verificationToken);

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
                message: "Error al registrar usuario",
            });
        }
    }

    /**
     * Inicia sesión de un usuario y genera tokens de acceso y refresh.
     *
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const { email, password, rememberMe } = req.body;

            // Buscar usuario
            const user = await User.findByEmail(email);

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
                user.account_locked_until &&
                new Date(user.account_locked_until) > new Date()
            ) {
                return res.status(423).json({
                    success: false,
                    message:
                        "Cuenta bloqueada temporalmente por múltiples intentos fallidos",
                });
            }

            // Verificar contraseña
            const isPasswordValid = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!isPasswordValid) {
                // Incrementar intentos fallidos
                const attempts = user.failed_login_attempts + 1;
                let lockUntil = null;

                if (attempts >= parseInt(process.env.MAX_LOGIN_ATTEMPTS)) {
                    lockUntil = new Date(
                        Date.now() + parseInt(process.env.LOCK_TIME) * 60 * 1000
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
                    message: "Credenciales inválidas",
                });
            }

            // Verificar si email está verificado
            if (!user.is_verified) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Por favor verifica tu email antes de iniciar sesión",
                });
            }

            // Generar tokens
            const accessToken = jwt.sign(
                { id: user.id, email: user.email, role: user.role_name },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            const refreshToken = jwt.sign(
                { id: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRE }
            );

            // Guardar refresh token
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
            await RefreshToken.create(user.id, refreshToken, expiresAt);

            // Actualizar último login
            await User.updateLastLogin(user.id);

            // Crear sesión
            await AuthController.createSession(
                user.id,
                accessToken,
                req.ip,
                req.get("user-agent"),
                rememberMe
            );

            // Log de auditoría
            await AuthController.logAudit(
                user.id,
                "LOGIN_SUCCESS",
                req.ip,
                req.get("user-agent"),
                true
            );

            // Configurar cookies
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            };

            if (rememberMe) {
                cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
            }

            res.cookie("token", accessToken, cookieOptions);
            res.cookie("refreshToken", refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({
                success: true,
                message: "Login exitoso",
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role_name,
                },
                token: accessToken,
            });
        } catch (error) {
            console.error("Error en login:", error);
            res.status(500).json({
                success: false,
                message: "Error al iniciar sesión",
            });
        }
    }

    /**
     * Renueva el access token utilizando un refresh token válido.
     *
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: "Refresh token no proporcionado",
                });
            }

            // Verificar refresh token
            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );

            // Buscar token en BD
            const tokenExists = await RefreshToken.findByToken(refreshToken);
            if (!tokenExists) {
                return res.status(401).json({
                    success: false,
                    message: "Refresh token inválido",
                });
            }

            // Buscar usuario
            const user = await User.findById(decoded.id);
            if (!user || !user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no encontrado o inactivo",
                });
            }

            // Generar nuevo access token
            const newAccessToken = jwt.sign(
                { id: user.id, email: user.email, role: user.role_name },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            // Configurar cookie
            res.cookie("token", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });

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
     *
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
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
     *
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            const user = await User.findByEmail(email);

            // No revelar si el email existe
            if (!user) {
                return res.json({
                    success: true,
                    message:
                        "Si el email existe, recibirás instrucciones para recuperar tu contraseña",
                });
            }

            // Generar token
            const resetToken = crypto.randomBytes(32).toString("hex");
            const expires = new Date(Date.now() + 3600000); // 1 hora

            // Guardar token
            await User.setResetToken(email, resetToken, expires);

            // Enviar email
            await sendPasswordResetEmail(email, resetToken);

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
                message:
                    "Si el email existe, recibirás instrucciones para recuperar tu contraseña",
            });
        } catch (error) {
            console.error("Error en forgot password:", error);
            res.status(500).json({
                success: false,
                message: "Error al procesar solicitud",
            });
        }
    }

    /**
     * Resetea la contraseña de un usuario utilizando un token válido.
     *
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async resetPassword(req, res) {
        try {
            const { token, password } = req.body;

            const success = await User.resetPassword(token, password);

            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: "Token inválido o expirado",
                });
            }

            res.json({
                success: true,
                message: "Contraseña actualizada exitosamente",
            });
        } catch (error) {
            console.error("Error en reset password:", error);
            res.status(500).json({
                success: false,
                message: "Error al resetear contraseña",
            });
        }
    }

    /**
     * Verifica el email de un usuario mediante token de verificación.
     *
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async verifyEmail(req, res) {
        try {
            const { token } = req.params;

            const success = await User.verifyEmail(token);

            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: "Token de verificación inválido",
                });
            }

            res.json({
                success: true,
                message: "Email verificado exitosamente",
            });
        } catch (error) {
            console.error("Error en verificación:", error);
            res.status(500).json({
                success: false,
                message: "Error al verificar email",
            });
        }
    }

    /**
     * Crea una sesión para un usuario con token y expiración.
     *
     * @param {number} userId - ID del usuario.
     * @param {string} token - Token de sesión.
     * @param {string} ip - Dirección IP del usuario.
     * @param {string} userAgent - Agente de usuario.
     * @param {boolean} isPersistent - Si la sesión es persistente.
     * @returns {Promise<void>}
     */
    static async createSession(userId, token, ip, userAgent, isPersistent) {
        let connection;
        try {
            connection = await getConnection();
            const expiresAt = isPersistent
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
                : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

            await connection.execute(
                `INSERT INTO sessions (user_id, session_token, ip_address, user_agent, is_persistent, expires_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, token, ip, userAgent, isPersistent, expiresAt]
            );
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Elimina la sesión de un usuario.
     *
     * @param {number} userId - ID del usuario.
     * @returns {Promise<void>}
     */
    static async deleteSession(userId) {
        let connection;
        try {
            connection = await getConnection();
            await connection.execute(`DELETE FROM sessions WHERE user_id = ?`, [
                userId,
            ]);
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Registra una acción en el log de auditoría.
     *
     * @param {number|null} userId - ID del usuario, null si no aplica.
     * @param {string} action - Acción realizada.
     * @param {string} ip - Dirección IP del usuario.
     * @param {string} userAgent - Agente de usuario.
     * @param {boolean} success - Éxito de la acción.
     * @param {string|null} errorMessage - Mensaje de error opcional.
     * @returns {Promise<void>}
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
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = AuthController;
