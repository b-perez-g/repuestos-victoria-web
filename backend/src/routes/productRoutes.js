const express = require('express');
const ProductController = require('../controllers/productController');
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

// Rutas públicas (productos)
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

// Rutas protegidas (solo admin)
router.post('/', authMiddleware, requireAdmin, ProductController.createProduct);
router.put('/:id', authMiddleware, requireAdmin, ProductController.updateProduct);
router.delete('/:id', authMiddleware, requireAdmin, ProductController.deleteProduct);

module.exports = router;