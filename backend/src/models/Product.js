const { getConnection } = require('../config/database');

class Product {
    /**
     * Crear nuevo producto
     */
    static async create(productData) {
        let connection;
        try {
            connection = await getConnection();

            const query = `
                INSERT INTO productos (
                    id_categoria, id_subcategoria, nombre, descripcion, precio,
                    stock, sku, imagen_url, activo, destacado, peso,
                    dimensiones, garantia_meses
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await connection.execute(query, [
                productData.id_categoria,
                productData.id_subcategoria || null,
                productData.nombre,
                productData.descripcion || null,
                productData.precio,
                productData.stock || 0,
                productData.sku,
                productData.imagen_url || null,
                productData.activo !== undefined ? productData.activo : true,
                productData.destacado !== undefined ? productData.destacado : false,
                productData.peso || null,
                productData.dimensiones || null,
                productData.garantia_meses || null
            ]);

            return result.insertId;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Verificar si un producto existe por SKU
     */
    static async existsBySku(sku) {
        let connection;
        try {
            connection = await getConnection();

            const [rows] = await connection.execute(
                'SELECT id FROM productos WHERE sku = ?',
                [sku]
            );

            return rows.length > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Obtener producto por ID
     */
    static async findById(id) {
        let connection;
        try {
            connection = await getConnection();

            const [rows] = await connection.execute(`
                SELECT
                    p.*,
                    c.nombre as categoria_nombre,
                    s.nombre as subcategoria_nombre
                FROM productos p
                LEFT JOIN categorias c ON p.id_categoria = c.id
                LEFT JOIN subcategorias s ON p.id_subcategoria = s.id
                WHERE p.id = ?
            `, [id]);

            return rows[0] || null;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Obtener todos los productos
     */
    static async findAll(options = {}) {
        let connection;
        try {
            connection = await getConnection();

            let query = `
                SELECT
                    p.*,
                    c.nombre as categoria_nombre,
                    s.nombre as subcategoria_nombre
                FROM productos p
                LEFT JOIN categorias c ON p.id_categoria = c.id
                LEFT JOIN subcategorias s ON p.id_subcategoria = s.id
            `;

            const conditions = [];
            const params = [];

            if (options.activo !== undefined) {
                conditions.push('p.activo = ?');
                params.push(options.activo);
            }

            if (options.categoria) {
                conditions.push('p.id_categoria = ?');
                params.push(options.categoria);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY p.creado_en DESC';

            if (options.limit) {
                query += ' LIMIT ?';
                params.push(parseInt(options.limit));
            }

            const [rows] = await connection.execute(query, params);
            return rows;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Actualizar producto
     */
    static async update(id, productData) {
        let connection;
        try {
            connection = await getConnection();

            const fields = [];
            const values = [];

            // Campos que se pueden actualizar
            const updatableFields = [
                'id_categoria', 'id_subcategoria', 'nombre', 'descripcion',
                'precio', 'stock', 'sku', 'imagen_url', 'activo', 'destacado',
                'peso', 'dimensiones', 'garantia_meses'
            ];

            updatableFields.forEach(field => {
                if (productData[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    values.push(productData[field]);
                }
            });

            if (fields.length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            values.push(id);

            const query = `
                UPDATE productos
                SET ${fields.join(', ')}
                WHERE id = ?
            `;

            const [result] = await connection.execute(query, values);
            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Eliminar producto
     */
    static async delete(id) {
        let connection;
        try {
            connection = await getConnection();

            const [result] = await connection.execute(
                'DELETE FROM productos WHERE id = ?',
                [id]
            );

            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = Product;