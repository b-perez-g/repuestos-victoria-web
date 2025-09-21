const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const UserController = require('../controllers/userController');

// Validaciones
const updateProfileValidation = [
    body('nombres')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('a_paterno')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El apellido paterno debe tener entre 2 y 100 caracteres'),
    body('a_materno')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('El apellido materno no puede tener más de 100 caracteres')
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('La contraseña actual es requerida'),
    body('newPassword')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
        .withMessage('La nueva contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales')
        .custom((value, { req }) => value !== req.body.currentPassword)
        .withMessage('La nueva contraseña debe ser diferente a la actual')
];

const updateUserValidation = [
    body('activo')
        .optional()
        .isBoolean()
        .withMessage('activo debe ser booleano'),
    body('id_rol')
        .optional()
        .isInt({ min: 1 })
        .withMessage('id_rol debe ser un número entero válido')
];

const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page debe ser un número entero positivo'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit debe ser un número entre 1 y 100'),
    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search no puede tener más de 100 caracteres'),
    query('role')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Role no puede tener más de 50 caracteres')
];

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ===== RUTAS DE PERFIL DE USUARIO =====
// Obtener perfil del usuario actual
router.get('/profile', UserController.getProfile);

// Actualizar perfil del usuario actual
router.put('/profile', updateProfileValidation, UserController.updateProfile);

// Cambiar contraseña del usuario actual
router.post('/change-password', changePasswordValidation, UserController.changePassword);

// Obtener actividad del usuario actual
router.get('/activity', UserController.getUserActivity);

// ===== RUTAS DE ADMINISTRACIÓN =====
// Obtener todos los usuarios (Admin)
router.get(
    '/users',
    roleMiddleware('admin'),
    paginationValidation,
    UserController.getAllUsers
);

// Obtener usuario por ID (Admin)
router.get(
    '/users/:id',
    roleMiddleware('admin'),
    param('id').isInt().withMessage('ID debe ser un número entero'),
    UserController.getUserById
);

// Actualizar usuario (Admin)
router.put(
    '/users/:id',
    roleMiddleware('admin'),
    param('id').isInt().withMessage('ID debe ser un número entero'),
    updateUserValidation,
    UserController.updateUser
);

// Eliminar usuario (Admin)
router.delete(
    '/users/:id',
    roleMiddleware('admin'),
    param('id').isInt().withMessage('ID debe ser un número entero'),
    UserController.deleteUser
);

// ===== RUTAS DE ESTADÍSTICAS =====
// Obtener estadísticas del dashboard (Admin y Moderator)
router.get(
    '/dashboard-stats',
    roleMiddleware('admin', 'moderator'),
    UserController.getDashboardStats
);

// ===== RUTAS DE AUDITORÍA =====
// Obtener logs de auditoría (Admin)
router.get(
    '/audit-logs',
    roleMiddleware('admin'),
    [
        ...paginationValidation,
        query('action')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Action no puede tener más de 100 caracteres'),
        query('userId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('UserId debe ser un número entero positivo')
    ],
    UserController.getAuditLogs
);

// ===== RUTAS DE MANTENIMIENTO =====
// Limpiar sesiones expiradas (Admin)
router.post(
    '/cleanup-sessions',
    roleMiddleware('admin'),
    UserController.cleanupSessions
);

// ===== RUTAS DE ROLES =====
// Obtener todos los roles disponibles (Admin)
router.get('/roles', roleMiddleware('admin'), async (req, res) => {
    try {
        const Role = require('../models/Role');
        const roles = await Role.findAll();
        res.json({
            success: true,
            roles
        });
    } catch (error) {
        console.error('Error obteniendo roles:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Obtener usuarios por rol (Admin)
router.get('/roles/:roleId/users', 
    roleMiddleware('admin'),
    param('roleId').isInt().withMessage('roleId debe ser un número entero'),
    async (req, res) => {
        try {
            const Role = require('../models/Role');
            const users = await Role.getUsersByRole(req.params.roleId);
            res.json({
                success: true,
                users
            });
        } catch (error) {
            console.error('Error obteniendo usuarios del rol:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
);

module.exports = router;