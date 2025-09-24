const express = require('express');
const BulkImportController = require('../controllers/bulkImportController');
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

// Rutas protegidas (solo admin)

// Importación de datos (recibe JSON directamente)
router.post('/categories', authMiddleware, requireAdmin, BulkImportController.importCategories);
router.post('/subcategories', authMiddleware, requireAdmin, BulkImportController.importSubcategories);
router.post('/products', authMiddleware, requireAdmin, BulkImportController.importProducts);

module.exports = router;