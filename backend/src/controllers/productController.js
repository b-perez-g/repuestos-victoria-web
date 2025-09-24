const Product = require('../models/Product');

/**
 * Controlador para gestión de productos
 */
class ProductController {
    /**
     * Obtener todos los productos
     */
    static async getAllProducts(req, res) {
        try {
            const { categoria, activo, limit } = req.query;
            const options = {};

            if (categoria) options.categoria = categoria;
            if (activo !== undefined) options.activo = activo === 'true';
            if (limit) options.limit = limit;

            const products = await Product.findAll(options);

            res.json({
                success: true,
                products: products
            });
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtener producto por ID
     */
    static async getProductById(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            const product = await Product.findById(parseInt(id));

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                product: product
            });
        } catch (error) {
            console.error('Error obteniendo producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Crear nuevo producto
     */
    static async createProduct(req, res) {
        try {
            const productData = req.body;

            // Validaciones básicas
            if (!productData.nombre || typeof productData.nombre !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre es requerido'
                });
            }

            if (!productData.id_categoria || isNaN(parseInt(productData.id_categoria))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de categoría válido es requerido'
                });
            }

            if (!productData.precio || isNaN(parseFloat(productData.precio))) {
                return res.status(400).json({
                    success: false,
                    message: 'Precio válido es requerido'
                });
            }

            if (!productData.sku || typeof productData.sku !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'SKU es requerido'
                });
            }

            // Verificar si el SKU ya existe
            const exists = await Product.existsBySku(productData.sku);
            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un producto con ese SKU'
                });
            }

            const productId = await Product.create(productData);

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                productId: productId
            });
        } catch (error) {
            console.error('Error creando producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Actualizar producto
     */
    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const productData = req.body;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            // Verificar que el producto existe
            const existingProduct = await Product.findById(parseInt(id));
            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Si se está actualizando el SKU, verificar que no exista
            if (productData.sku && productData.sku !== existingProduct.sku) {
                const skuExists = await Product.existsBySku(productData.sku);
                if (skuExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe un producto con ese SKU'
                    });
                }
            }

            const success = await Product.update(parseInt(id), productData);

            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar el producto'
                });
            }

            res.json({
                success: true,
                message: 'Producto actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Eliminar producto
     */
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            const success = await Product.delete(parseInt(id));

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = ProductController;