const { validationResult } = require('express-validator');
const Category = require('../models/Category');

/**
 * Controlador para gestión de categorías
 */
class CategoryController {
    /**
     * Obtener todas las categorías
     */
    static async getCategories(req, res) {
        try {
            const categories = await Category.findAll();

            res.json({
                success: true,
                message: 'Categorías obtenidas exitosamente',
                data: categories
            });
        } catch (error) {
            console.error('Error obteniendo categorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtener categoría por ID
     */
    static async getCategoryById(req, res) {
        try {
            const { id } = req.params;

            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Categoría obtenida exitosamente',
                data: category
            });
        } catch (error) {
            console.error('Error obteniendo categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Crear nueva categoría
     */
    static async createCategory(req, res) {
        try {
            console.log('Creating category with data:', req.body);

            // Validar datos de entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('❌ Validation errors found:');
                errors.array().forEach((error, index) => {
                    console.log(`  Error ${index + 1}:`, {
                        field: error.path,
                        message: error.msg,
                        value: error.value,
                        location: error.location
                    });
                });
                return res.status(422).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: errors.array()
                });
            }

            const { nombre, descripcion, imagen_url, activa } = req.body;

            // Verificar si ya existe una categoría con el mismo nombre
            const existingCategory = await Category.existsByName(nombre);
            if (existingCategory) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe una categoría con ese nombre'
                });
            }

            const categoryId = await Category.create({
                nombre: nombre.trim(),
                descripcion: descripcion?.trim() || null,
                imagen_url: imagen_url?.trim() || null,
                activa: activa !== undefined ? activa : true
            });

            const newCategory = await Category.findById(categoryId);

            res.status(201).json({
                success: true,
                message: 'Categoría creada exitosamente',
                data: newCategory
            });
        } catch (error) {
            console.error('Error creando categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Actualizar categoría
     */
    static async updateCategory(req, res) {
        try {
            // Validar datos de entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { nombre, descripcion, imagen_url, activa } = req.body;

            // Verificar si la categoría existe
            const existingCategory = await Category.findById(id);
            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            // Verificar si otro categoría tiene el mismo nombre
            const nameExists = await Category.existsByName(nombre, id);
            if (nameExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe otra categoría con ese nombre'
                });
            }

            const updated = await Category.update(id, {
                nombre: nombre.trim(),
                descripcion: descripcion?.trim() || null,
                imagen_url: imagen_url?.trim() || null,
                activa: activa !== undefined ? activa : existingCategory.activa
            });

            if (!updated) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar la categoría'
                });
            }

            const updatedCategory = await Category.findById(id);

            res.json({
                success: true,
                message: 'Categoría actualizada exitosamente',
                data: updatedCategory
            });
        } catch (error) {
            console.error('Error actualizando categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Eliminar categoría
     */
    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            // Verificar si la categoría existe
            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            // Intentar eliminar (el modelo ya verifica si tiene productos)
            const deleted = await Category.delete(id);

            if (!deleted) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo eliminar la categoría'
                });
            }

            res.json({
                success: true,
                message: 'Categoría eliminada exitosamente'
            });
        } catch (error) {
            if (error.message.includes('productos asociados')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            console.error('Error eliminando categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Cambiar estado activo/inactivo
     */
    static async toggleCategoryStatus(req, res) {
        try {
            const { id } = req.params;
            console.log('Toggle status request for category ID:', id);

            // Verificar si la categoría existe
            const category = await Category.findById(id);
            console.log('Category found:', category);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            console.log('Current status:', category.activa);
            const updated = await Category.toggleActive(id);
            console.log('Toggle result:', updated);

            if (!updated) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo cambiar el estado de la categoría'
                });
            }

            const updatedCategory = await Category.findById(id);
            console.log('Updated category:', updatedCategory);

            res.json({
                success: true,
                message: `Categoría ${updatedCategory.activa ? 'activada' : 'desactivada'} exitosamente`,
                data: updatedCategory
            });
        } catch (error) {
            console.error('Error cambiando estado de categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = CategoryController;