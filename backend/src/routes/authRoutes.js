const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { loginLimiter, passwordResetLimiter, registerLimiter, handleFailedLogin } = require('../middleware/rateLimiter');
const { generateCSRFToken, validateCSRFForAuth, getCSRFTokenEndpoint } = require('../middleware/csrfMiddleware');

// Validaciones
const registerValidation = [
    body('correo')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    body('contrasena')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
        .withMessage('La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'),
    body('nombres')
        .notEmpty()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre es requerido y debe tener entre 2 y 100 caracteres'),
    body('a_paterno')
        .notEmpty()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El apellido paterno es requerido y debe tener entre 2 y 100 caracteres'),
    body('a_materno')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('El apellido materno no puede tener más de 100 caracteres'),
    body('id_rol')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El rol debe ser un número válido')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida'),
    body('rememberMe')
        .optional()
        .isBoolean()
        .withMessage('Remember me debe ser booleano')
];

const forgotPasswordValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido')
];

const resetPasswordValidation = [
    body('token')
        .notEmpty()
        .isLength({ min: 32 })
        .withMessage('Token inválido'),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
        .withMessage('La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales')
];

const resendVerificationValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido')
];

// Endpoint para obtener token CSRF
router.get('/csrf-token', generateCSRFToken(), getCSRFTokenEndpoint());

// Rutas públicas con protección CSRF
// Deshabilitar rate limiter para registro en desarrollo
router.post('/register',
    process.env.NODE_ENV === 'development' ? [] : registerLimiter,
    registerValidation,
    process.env.NODE_ENV === 'development' ? (req, res, next) => next() : validateCSRFForAuth(),
    AuthController.register
);
router.post('/login',
    process.env.NODE_ENV === 'development' ? handleFailedLogin : [loginLimiter, handleFailedLogin],
    loginValidation,
    process.env.NODE_ENV === 'development' ? (req, res, next) => next() : validateCSRFForAuth(),
    AuthController.login
);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, validateCSRFForAuth(), AuthController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validateCSRFForAuth(), AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', passwordResetLimiter, resendVerificationValidation, validateCSRFForAuth(), AuthController.resendVerification);

// Rutas protegidas
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/validate', authMiddleware, AuthController.validateToken);

// Verificar disponibilidad de email
router.post('/check-availability', [
    body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
    try {
        const { email } = req.body;
        const User = require('../models/User');

        let available = true;
        let field = '';

        if (email) {
            const user = await User.findByEmail(email);
            available = !user;
            field = 'email';
        }

        res.json({
            success: true,
            available,
            field
        });
    } catch (error) {
        console.error('Error verificando disponibilidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error verificando disponibilidad'
        });
    }
});

// TEMPORAL: Endpoints para desarrollo
// if (process.env.NODE_ENV === 'development') {
    // Verificar usuario
    router.post('/dev-verify-user', async (req, res) => {
        try {
            const { email } = req.body;
            const { getConnection } = require('../config/database');

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email requerido'
                });
            }

            let connection;
            try {
                connection = await getConnection();
                const [result] = await connection.execute(
                    'UPDATE usuarios SET verificado = 1, token_verificacion = NULL WHERE correo = ?',
                    [email]
                );

                if (result.affectedRows > 0) {
                    res.json({
                        success: true,
                        message: 'Usuario verificado exitosamente'
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error verificando usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    });

    // Listar usuarios
    router.get('/dev-list-users', async (req, res) => {
        try {
            const { getConnection } = require('../config/database');
            let connection;
            try {
                connection = await getConnection();
                const [users] = await connection.execute(
                    'SELECT id, correo, nombres, verificado, activo FROM usuarios ORDER BY id DESC LIMIT 10'
                );
                res.json({
                    success: true,
                    users
                });
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error listando usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    });

    // Login bypass para testing
    router.post('/dev-login', async (req, res) => {
        try {
            const { email } = req.body;
            const User = require('../models/User');
            const TokenGenerator = require('../utils/tokenGenerator');

            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Forzar verificación
            if (!user.verificado) {
                const { getConnection } = require('../config/database');
                let connection;
                try {
                    connection = await getConnection();
                    await connection.execute(
                        'UPDATE usuarios SET verificado = 1, token_verificacion = NULL WHERE id = ?',
                        [user.id]
                    );
                    user.verificado = true;
                } finally {
                    if (connection) connection.release();
                }
            }

            // Generar tokens
            const payload = {
                id: user.id,
                email: user.correo,
                role: user.nombre_rol || "cliente",
                firstName: user.nombres,
                lastName: user.a_paterno,
            };

            const accessToken = TokenGenerator.generateAccessToken(payload);
            const refreshToken = TokenGenerator.generateRefreshToken({
                id: user.id,
            });

            // Configurar cookies de sesión
            const sessionCookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                path: "/",
            };

            res.cookie("token", accessToken, sessionCookieOptions);
            res.cookie("refreshToken", refreshToken, sessionCookieOptions);

            // Guardar refresh token
            const RefreshToken = require('../models/RefreshToken');
            const refreshExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await RefreshToken.create(user.id, refreshToken, refreshExpiry);

            res.json({
                success: true,
                message: 'Login bypass exitoso',
                user: {
                    id: user.id,
                    email: user.correo,
                    firstName: user.nombres,
                    lastName: user.a_paterno,
                    role: user.nombre_rol || "cliente",
                },
            });

        } catch (error) {
            console.error('Error en login bypass:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    });
// }

module.exports = router;