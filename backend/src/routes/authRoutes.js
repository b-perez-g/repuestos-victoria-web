const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { loginLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

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
        .withMessage('El nombre es requerido'),
    body('a_paterno')
        .notEmpty()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El apellido es requerido')
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
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales')
];

// Rutas públicas
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginLimiter, loginValidation, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, AuthController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);

// Rutas protegidas
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/validate', authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: 'Token válido',
        user: req.user
    });
});

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
        res.status(500).json({
            success: false,
            message: 'Error verificando disponibilidad'
        });
    }
});

module.exports = router;