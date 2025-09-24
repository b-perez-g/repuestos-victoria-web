const express = require('express');
const { body } = require('express-validator');
const CategoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware de autenticación solo para rutas protegidas (se aplicará específicamente abajo)

// Middleware para verificar que el usuario sea admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
    }
    next();
};

// Validaciones para crear/actualizar categoría
const categoryValidation = [
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s0-9.,\-&()]+$/)
        .withMessage('El nombre solo puede contener letras, números, espacios y caracteres básicos'),

    body('descripcion')
        .optional({ checkFalsy: true })
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),

    body('imagen_url')
        .optional()
        .custom((value) => {
            if (!value || value.trim() === '') return true; // Permitir vacío
            return /^https?:\/\/.+/.test(value); // Validar URL si no está vacío
        })
        .withMessage('Debe ser una URL válida'),

    body('activa')
        .optional()
        .isBoolean()
        .withMessage('El campo activa debe ser true o false')
];

// Rutas públicas (solo lectura para clientes)
router.get('/', CategoryController.getCategories);


// Rutas protegidas (solo admin) - Las rutas más específicas van primero
router.patch('/:id/toggle-status', authMiddleware, requireAdmin, CategoryController.toggleCategoryStatus);
router.post('/', authMiddleware, requireAdmin, categoryValidation, CategoryController.createCategory);
router.put('/:id', authMiddleware, requireAdmin, categoryValidation, CategoryController.updateCategory);
router.delete('/:id', authMiddleware, requireAdmin, CategoryController.deleteCategory);

// Rutas con parámetros dinámicos van al final
router.get('/:id', CategoryController.getCategoryById);

module.exports = router;