const { validationResult } = require('express-validator');
const Subcategory = require('../models/Subcategory');

/**
 * Controlador para gestión de subcategorías
 */
class SubcategoryController {
    /**
     * Obtener todas las subcategorías (con filtro opcional por categoría)
     */
    static async getSubcategories(req, res) {
        try {
            const { categoryId } = req.query;
            const subcategories = await Subcategory.findAll(categoryId);

            res.json({
                success: true,
                message: 'Subcategorías obtenidas exitosamente',
                data: subcategories
            });
        } catch (error) {
            console.error('Error obteniendo subcategorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtener subcategoría por ID
     */
    static async getSubcategoryById(req, res) {
        try {
            const { id } = req.params;

            const subcategory = await Subcategory.findById(id);

            if (!subcategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Subcategoría no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Subcategoría obtenida exitosamente',
                data: subcategory
            });
        } catch (error) {
            console.error('Error obteniendo subcategoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Crear nueva subcategoría
     */
    static async createSubcategory(req, res) {
        try {
            console.log('Creating subcategory with data:', req.body);

            // Validar datos de entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('❌ Subcategory validation errors found:');
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

            const { id_categoria, nombre, descripcion, activa } = req.body;

            // Verificar si ya existe una subcategoría con el mismo nombre en la misma categoría
            const existingSubcategory = await Subcategory.existsByName(nombre, id_categoria);
            if (existingSubcategory) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe una subcategoría con ese nombre en esta categoría'
                });
            }

            const subcategoryId = await Subcategory.create({
                id_categoria,
                nombre: nombre.trim(),
                descripcion: descripcion?.trim() || null,
                activa: activa !== undefined ? activa : true
            });

            const newSubcategory = await Subcategory.findById(subcategoryId);

            res.status(201).json({
                success: true,
                message: 'Subcategoría creada exitosamente',
                data: newSubcategory
            });
        } catch (error) {
            console.error('Error creando subcategoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Actualizar subcategoría
     */
    static async updateSubcategory(req, res) {
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
            const { id_categoria, nombre, descripcion, activa } = req.body;

            // Verificar si la subcategoría existe
            const existingSubcategory = await Subcategory.findById(id);
            if (!existingSubcategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Subcategoría no encontrada'
                });
            }

            // Verificar si otra subcategoría tiene el mismo nombre en la misma categoría
            const nameExists = await Subcategory.existsByName(nombre, id_categoria, id);
            if (nameExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe otra subcategoría con ese nombre en esta categoría'
                });
            }

            const updated = await Subcategory.update(id, {
                id_categoria,
                nombre: nombre.trim(),
                descripcion: descripcion?.trim() || null,
                activa: activa !== undefined ? activa : existingSubcategory.activa
            });

            if (!updated) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar la subcategoría'
                });
            }

            const updatedSubcategory = await Subcategory.findById(id);

            res.json({
                success: true,
                message: 'Subcategoría actualizada exitosamente',
                data: updatedSubcategory
            });
        } catch (error) {
            console.error('Error actualizando subcategoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Eliminar subcategoría
     */
    static async deleteSubcategory(req, res) {
        try {
            const { id } = req.params;

            // Verificar si la subcategoría existe
            const subcategory = await Subcategory.findById(id);
            if (!subcategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Subcategoría no encontrada'
                });
            }

            // Intentar eliminar (el modelo ya verifica si tiene productos)
            const deleted = await Subcategory.delete(id);

            if (!deleted) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo eliminar la subcategoría'
                });
            }

            res.json({
                success: true,
                message: 'Subcategoría eliminada exitosamente'
            });
        } catch (error) {
            if (error.message.includes('productos asociados')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            console.error('Error eliminando subcategoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Cambiar estado activo/inactivo
     */
    static async toggleSubcategoryStatus(req, res) {
        try {
            const { id } = req.params;

            // Verificar si la subcategoría existe
            const subcategory = await Subcategory.findById(id);
            if (!subcategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Subcategoría no encontrada'
                });
            }

            const updated = await Subcategory.toggleActive(id);

            if (!updated) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo cambiar el estado de la subcategoría'
                });
            }

            const updatedSubcategory = await Subcategory.findById(id);

            res.json({
                success: true,
                message: `Subcategoría ${updatedSubcategory.activa ? 'activada' : 'desactivada'} exitosamente`,
                data: updatedSubcategory
            });
        } catch (error) {
            console.error('Error cambiando estado de subcategoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtener subcategorías por categoría
     */
    static async getSubcategoriesByCategory(req, res) {
        try {
            const { categoryId } = req.params;

            const subcategories = await Subcategory.findByCategory(categoryId);

            res.json({
                success: true,
                message: 'Subcategorías obtenidas exitosamente',
                data: subcategories
            });
        } catch (error) {
            console.error('Error obteniendo subcategorías por categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = SubcategoryController;