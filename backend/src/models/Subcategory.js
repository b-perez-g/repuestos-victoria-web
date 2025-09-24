const { getConnection } = require('../config/database');

class Subcategory {
    /**
     * Obtener todas las subcategorías
     */
    static async findAll(categoryId = null) {
        let connection;
        try {
            connection = await getConnection();

            let query = `
                SELECT
                    s.*,
                    c.nombre as categoria_nombre,
                    COUNT(DISTINCT p.id) as productos_count
                FROM subcategorias s
                INNER JOIN categorias c ON s.id_categoria = c.id
                LEFT JOIN productos p ON s.id = p.id_subcategoria
            `;

            let params = [];

            if (categoryId) {
                query += ' WHERE s.id_categoria = ?';
                params.push(categoryId);
            }

            query += ' GROUP BY s.id ORDER BY s.nombre ASC';

            const [rows] = await connection.execute(query, params);
            return rows;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Obtener subcategoría por ID
     */
    static async findById(id) {
        let connection;
        try {
            connection = await getConnection();
            const [rows] = await connection.execute(`
                SELECT
                    s.*,
                    c.nombre as categoria_nombre,
                    COUNT(DISTINCT p.id) as productos_count
                FROM subcategorias s
                INNER JOIN categorias c ON s.id_categoria = c.id
                LEFT JOIN productos p ON s.id = p.id_subcategoria
                WHERE s.id = ?
                GROUP BY s.id
            `, [id]);
            return rows[0] || null;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Generar slug único para subcategoría
     */
    static generateSlug(nombre) {
        return nombre
            .toLowerCase()
            .trim()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Crear nueva subcategoría
     */
    static async create(data) {
        let connection;
        try {
            connection = await getConnection();

            const { id_categoria, nombre, descripcion, activa = true } = data;
            const slug = this.generateSlug(nombre);

            const [result] = await connection.execute(`
                INSERT INTO subcategorias (id_categoria, nombre, descripcion, slug, activa, creado_en)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [id_categoria, nombre, descripcion, slug, activa]);

            return result.insertId;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Actualizar subcategoría
     */
    static async update(id, data) {
        let connection;
        try {
            connection = await getConnection();

            const { id_categoria, nombre, descripcion, activa } = data;
            const slug = this.generateSlug(nombre);

            const [result] = await connection.execute(`
                UPDATE subcategorias
                SET id_categoria = ?, nombre = ?, descripcion = ?, slug = ?, activa = ?, actualizado_en = NOW()
                WHERE id = ?
            `, [id_categoria, nombre, descripcion, slug, activa, id]);

            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Eliminar subcategoría (solo si no tiene productos)
     */
    static async delete(id) {
        let connection;
        try {
            connection = await getConnection();

            // Verificar si tiene productos asociados
            const [productCount] = await connection.execute(`
                SELECT COUNT(*) as count FROM productos WHERE id_subcategoria = ?
            `, [id]);

            if (productCount[0].count > 0) {
                throw new Error('No se puede eliminar la subcategoría porque tiene productos asociados');
            }

            const [result] = await connection.execute(`
                DELETE FROM subcategorias WHERE id = ?
            `, [id]);

            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Verificar si existe una subcategoría con el mismo nombre en la misma categoría
     */
    static async existsByName(nombre, categoryId, excludeId = null) {
        let connection;
        try {
            connection = await getConnection();

            let query = 'SELECT COUNT(*) as count FROM subcategorias WHERE LOWER(nombre) = LOWER(?) AND id_categoria = ?';
            let params = [nombre, categoryId];

            if (excludeId) {
                query += ' AND id != ?';
                params.push(excludeId);
            }

            const [rows] = await connection.execute(query, params);
            return rows[0].count > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Cambiar estado activo/inactivo
     */
    static async toggleActive(id) {
        let connection;
        try {
            connection = await getConnection();

            const [result] = await connection.execute(`
                UPDATE subcategorias
                SET activa = NOT activa, actualizado_en = NOW()
                WHERE id = ?
            `, [id]);

            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Obtener subcategorías por categoría
     */
    static async findByCategory(categoryId) {
        let connection;
        try {
            connection = await getConnection();
            const [rows] = await connection.execute(`
                SELECT
                    s.*,
                    COUNT(DISTINCT p.id) as productos_count
                FROM subcategorias s
                LEFT JOIN productos p ON s.id = p.id_subcategoria
                WHERE s.id_categoria = ?
                GROUP BY s.id
                ORDER BY s.nombre ASC
            `, [categoryId]);
            return rows;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = Subcategory;