const express = require('express');
const { body } = require('express-validator');
const SubcategoryController = require('../controllers/subcategoryController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

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

// Validaciones para crear/actualizar subcategoría
const subcategoryValidation = [
    body('id_categoria')
        .isInt({ min: 1 })
        .withMessage('ID de categoría debe ser un número entero válido'),

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


    body('activa')
        .optional()
        .isBoolean()
        .withMessage('El campo activa debe ser true o false')
];

// Rutas públicas (solo lectura para clientes)
router.get('/', SubcategoryController.getSubcategories);

// Rutas protegidas (solo admin) - Las rutas más específicas van primero
router.patch('/:id/toggle-status', authMiddleware, requireAdmin, SubcategoryController.toggleSubcategoryStatus);
router.get('/category/:categoryId', SubcategoryController.getSubcategoriesByCategory);
router.post('/', authMiddleware, requireAdmin, subcategoryValidation, SubcategoryController.createSubcategory);
router.put('/:id', authMiddleware, requireAdmin, subcategoryValidation, SubcategoryController.updateSubcategory);
router.delete('/:id', authMiddleware, requireAdmin, SubcategoryController.deleteSubcategory);

// Rutas con parámetros dinámicos van al final
router.get('/:id', SubcategoryController.getSubcategoryById);

module.exports = router;