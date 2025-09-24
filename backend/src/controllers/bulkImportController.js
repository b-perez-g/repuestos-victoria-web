const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');

/**
 * Controlador para importación masiva de datos
 */
class BulkImportController {
    /**
     * Importar categorías masivamente
     */
    static async importCategories(req, res) {
        try {
            const { categories } = req.body;

            if (!categories || !Array.isArray(categories) || categories.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere un array de categorías para importar'
                });
            }

            console.log(`Iniciando importación de ${categories.length} categorías`);

            const results = {
                total: categories.length,
                created: 0,
                skipped: 0,
                errors: []
            };

            for (let i = 0; i < categories.length; i++) {
                const categoryData = categories[i];
                const rowNumber = i + 1;

                try {
                    // Validar datos obligatorios
                    if (!categoryData.nombre || typeof categoryData.nombre !== 'string') {
                        results.errors.push(`Fila ${rowNumber}: Nombre es requerido`);
                        continue;
                    }

                    const nombre = categoryData.nombre.trim();
                    if (nombre.length < 2 || nombre.length > 100) {
                        results.errors.push(`Fila ${rowNumber}: Nombre debe tener entre 2 y 100 caracteres`);
                        continue;
                    }

                    // Verificar si la categoría ya existe
                    const exists = await Category.existsByName(nombre);
                    if (exists) {
                        results.skipped++;
                        results.errors.push(`Fila ${rowNumber}: Categoría "${nombre}" ya existe`);
                        continue;
                    }

                    // Preparar datos para crear
                    const newCategoryData = {
                        nombre: nombre,
                        descripcion: categoryData.descripcion ? String(categoryData.descripcion).trim() : null,
                        imagen_url: categoryData.imagen_url ? String(categoryData.imagen_url).trim() : null,
                        activa: categoryData.activa !== undefined ? Boolean(categoryData.activa) : true
                    };

                    // Validar URL si se proporciona
                    if (newCategoryData.imagen_url && newCategoryData.imagen_url !== '') {
                        const urlPattern = /^https?:\/\/.+/;
                        if (!urlPattern.test(newCategoryData.imagen_url)) {
                            results.errors.push(`Fila ${rowNumber}: URL de imagen no válida`);
                            continue;
                        }
                    }

                    // Crear categoría
                    await Category.create(newCategoryData);
                    results.created++;

                    console.log(`✅ Categoría creada: ${nombre}`);

                } catch (error) {
                    console.error(`❌ Error creando categoría fila ${rowNumber}:`, error);
                    results.errors.push(`Fila ${rowNumber}: Error al crear categoría - ${error.message}`);
                }
            }

            console.log(`Importación completada: ${results.created} creadas, ${results.skipped} omitidas, ${results.errors.length} errores`);

            res.json({
                success: true,
                message: 'Importación de categorías completada',
                results: results
            });

        } catch (error) {
            console.error('Error en importación de categorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor: ' + error.message
            });
        }
    }

    /**
     * Importar subcategorías masivamente
     */
    static async importSubcategories(req, res) {
        try {
            const { subcategories } = req.body;

            if (!subcategories || !Array.isArray(subcategories) || subcategories.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere un array de subcategorías para importar'
                });
            }

            console.log(`Iniciando importación de ${subcategories.length} subcategorías`);

            // Obtener todas las categorías existentes para hacer el mapeo
            const existingCategories = await Category.findAll();
            const categoryMap = {};
            existingCategories.forEach(cat => {
                categoryMap[cat.nombre.toLowerCase()] = cat.id;
            });

            const results = {
                total: subcategories.length,
                created: 0,
                skipped: 0,
                errors: []
            };

            for (let i = 0; i < subcategories.length; i++) {
                const subcategoryData = subcategories[i];
                const rowNumber = i + 1;

                try {
                    // Validar datos obligatorios
                    if (!subcategoryData.categoria || typeof subcategoryData.categoria !== 'string') {
                        results.errors.push(`Fila ${rowNumber}: Nombre de categoría es requerido`);
                        continue;
                    }

                    if (!subcategoryData.nombre || typeof subcategoryData.nombre !== 'string') {
                        results.errors.push(`Fila ${rowNumber}: Nombre de subcategoría es requerido`);
                        continue;
                    }

                    const categoriaNombre = subcategoryData.categoria.trim();
                    const nombre = subcategoryData.nombre.trim();

                    if (nombre.length < 2 || nombre.length > 100) {
                        results.errors.push(`Fila ${rowNumber}: Nombre debe tener entre 2 y 100 caracteres`);
                        continue;
                    }

                    // Buscar ID de categoría
                    const categoryId = categoryMap[categoriaNombre.toLowerCase()];
                    if (!categoryId) {
                        results.errors.push(`Fila ${rowNumber}: Categoría "${categoriaNombre}" no encontrada`);
                        continue;
                    }

                    // Verificar si la subcategoría ya existe en esa categoría
                    const exists = await Subcategory.existsByName(nombre, categoryId);
                    if (exists) {
                        results.skipped++;
                        results.errors.push(`Fila ${rowNumber}: Subcategoría "${nombre}" ya existe en la categoría "${categoriaNombre}"`);
                        continue;
                    }

                    // Preparar datos para crear
                    const newSubcategoryData = {
                        id_categoria: categoryId,
                        nombre: nombre,
                        descripcion: subcategoryData.descripcion ? String(subcategoryData.descripcion).trim() : null,
                        activa: subcategoryData.activa !== undefined ? Boolean(subcategoryData.activa) : true
                    };

                    // Crear subcategoría
                    await Subcategory.create(newSubcategoryData);
                    results.created++;

                    console.log(`✅ Subcategoría creada: ${nombre} en ${categoriaNombre}`);

                } catch (error) {
                    console.error(`❌ Error creando subcategoría fila ${rowNumber}:`, error);
                    results.errors.push(`Fila ${rowNumber}: Error al crear subcategoría - ${error.message}`);
                }
            }

            console.log(`Importación de subcategorías completada: ${results.created} creadas, ${results.skipped} omitidas, ${results.errors.length} errores`);

            res.json({
                success: true,
                message: 'Importación de subcategorías completada',
                results: results
            });

        } catch (error) {
            console.error('Error en importación de subcategorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor: ' + error.message
            });
        }
    }

    /**
     * Importar productos masivamente
     */
    static async importProducts(req, res) {
        try {
            const { products } = req.body;

            if (!products || !Array.isArray(products) || products.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere un array de productos para importar'
                });
            }

            console.log(`Iniciando importación de ${products.length} productos`);

            // Obtener todas las categorías y subcategorías existentes para hacer el mapeo
            const existingCategories = await Category.findAll();
            const existingSubcategories = await Subcategory.findAll();

            const categoryMap = {};
            const subcategoryMap = {};

            existingCategories.forEach(cat => {
                categoryMap[cat.nombre.toLowerCase()] = cat.id;
            });

            existingSubcategories.forEach(sub => {
                subcategoryMap[sub.nombre.toLowerCase()] = {
                    id: sub.id,
                    id_categoria: sub.id_categoria
                };
            });

            const results = {
                total: products.length,
                created: 0,
                skipped: 0,
                errors: []
            };

            for (let i = 0; i < products.length; i++) {
                const productData = products[i];
                const rowNumber = i + 1;

                try {
                    // Validar datos obligatorios
                    if (!productData.nombre || typeof productData.nombre !== 'string') {
                        results.errors.push(`Fila ${rowNumber}: Nombre es requerido`);
                        continue;
                    }

                    if (!productData.categoria || typeof productData.categoria !== 'string') {
                        results.errors.push(`Fila ${rowNumber}: Categoría es requerida`);
                        continue;
                    }

                    if (!productData.precio || isNaN(parseFloat(productData.precio))) {
                        results.errors.push(`Fila ${rowNumber}: Precio válido es requerido`);
                        continue;
                    }

                    if (!productData.sku || typeof productData.sku !== 'string') {
                        results.errors.push(`Fila ${rowNumber}: SKU es requerido`);
                        continue;
                    }

                    const nombre = productData.nombre.trim();
                    const categoriaNombre = productData.categoria.trim();
                    const sku = productData.sku.trim();
                    const precio = parseFloat(productData.precio);

                    // Validaciones básicas
                    if (nombre.length < 2 || nombre.length > 200) {
                        results.errors.push(`Fila ${rowNumber}: Nombre debe tener entre 2 y 200 caracteres`);
                        continue;
                    }

                    if (precio <= 0) {
                        results.errors.push(`Fila ${rowNumber}: Precio debe ser mayor a 0`);
                        continue;
                    }

                    if (sku.length < 1 || sku.length > 50) {
                        results.errors.push(`Fila ${rowNumber}: SKU debe tener entre 1 y 50 caracteres`);
                        continue;
                    }

                    // Verificar si el producto ya existe por SKU
                    const exists = await Product.existsBySku(sku);
                    if (exists) {
                        results.skipped++;
                        results.errors.push(`Fila ${rowNumber}: Producto con SKU "${sku}" ya existe`);
                        continue;
                    }

                    // Buscar ID de categoría
                    const categoryId = categoryMap[categoriaNombre.toLowerCase()];
                    if (!categoryId) {
                        results.errors.push(`Fila ${rowNumber}: Categoría "${categoriaNombre}" no encontrada`);
                        continue;
                    }

                    // Buscar subcategoría (opcional)
                    let subcategoryId = null;
                    if (productData.subcategoria && typeof productData.subcategoria === 'string') {
                        const subcategoriaNombre = productData.subcategoria.trim();
                        const subcategory = subcategoryMap[subcategoriaNombre.toLowerCase()];

                        if (subcategory) {
                            // Verificar que la subcategoría pertenezca a la categoría especificada
                            if (subcategory.id_categoria === categoryId) {
                                subcategoryId = subcategory.id;
                            } else {
                                results.errors.push(`Fila ${rowNumber}: Subcategoría "${subcategoriaNombre}" no pertenece a la categoría "${categoriaNombre}"`);
                                continue;
                            }
                        } else {
                            results.errors.push(`Fila ${rowNumber}: Subcategoría "${subcategoriaNombre}" no encontrada`);
                            continue;
                        }
                    }

                    // Preparar datos para crear
                    const newProductData = {
                        id_categoria: categoryId,
                        id_subcategoria: subcategoryId,
                        nombre: nombre,
                        descripcion: productData.descripcion ? String(productData.descripcion).trim() : null,
                        precio: precio,
                        stock: productData.stock ? parseInt(productData.stock) : 0,
                        sku: sku,
                        imagen_url: productData.imagen_url ? String(productData.imagen_url).trim() : null,
                        activo: productData.activo !== undefined ? Boolean(productData.activo) : true,
                        destacado: productData.destacado !== undefined ? Boolean(productData.destacado) : false,
                        peso: productData.peso ? parseFloat(productData.peso) : null,
                        dimensiones: productData.dimensiones ? String(productData.dimensiones).trim() : null,
                        garantia_meses: productData.garantia_meses ? parseInt(productData.garantia_meses) : null
                    };

                    // Validaciones adicionales
                    if (newProductData.stock < 0) {
                        results.errors.push(`Fila ${rowNumber}: Stock no puede ser negativo`);
                        continue;
                    }

                    if (newProductData.imagen_url && newProductData.imagen_url !== '') {
                        const urlPattern = /^https?:\/\/.+/;
                        if (!urlPattern.test(newProductData.imagen_url)) {
                            results.errors.push(`Fila ${rowNumber}: URL de imagen no válida`);
                            continue;
                        }
                    }

                    if (newProductData.peso && newProductData.peso <= 0) {
                        results.errors.push(`Fila ${rowNumber}: Peso debe ser mayor a 0`);
                        continue;
                    }

                    if (newProductData.garantia_meses && newProductData.garantia_meses <= 0) {
                        results.errors.push(`Fila ${rowNumber}: Garantía debe ser mayor a 0 meses`);
                        continue;
                    }

                    // Crear producto
                    await Product.create(newProductData);
                    results.created++;

                    console.log(`✅ Producto creado: ${nombre} (SKU: ${sku})`);

                } catch (error) {
                    console.error(`❌ Error creando producto fila ${rowNumber}:`, error);
                    results.errors.push(`Fila ${rowNumber}: Error al crear producto - ${error.message}`);
                }
            }

            console.log(`Importación de productos completada: ${results.created} creados, ${results.skipped} omitidos, ${results.errors.length} errores`);

            res.json({
                success: true,
                message: 'Importación de productos completada',
                results: results
            });

        } catch (error) {
            console.error('Error en importación de productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor: ' + error.message
            });
        }
    }
}

module.exports = BulkImportController;