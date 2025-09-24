const { getConnection } = require('../config/database');

class Category {
    /**
     * Obtener todas las categorías con subcategorías
     */
    static async findAll() {
        let connection;
        try {
            connection = await getConnection();
            const [rows] = await connection.execute(`
                SELECT
                    c.*,
                    COUNT(DISTINCT p.id) as productos_count,
                    COUNT(DISTINCT s.id) as subcategorias_count
                FROM categorias c
                LEFT JOIN productos p ON c.id = p.id_categoria
                LEFT JOIN subcategorias s ON c.id = s.id_categoria
                GROUP BY c.id
                ORDER BY c.nombre ASC
            `);
            return rows;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Generar slug único para categoría
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
     * Obtener categoría por ID
     */
    static async findById(id) {
        let connection;
        try {
            connection = await getConnection();
            const [rows] = await connection.execute(`
                SELECT
                    c.*,
                    COUNT(p.id) as productos_count
                FROM categorias c
                LEFT JOIN productos p ON c.id = p.id_categoria
                WHERE c.id = ?
                GROUP BY c.id
            `, [id]);
            return rows[0] || null;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Crear nueva categoría
     */
    static async create(data) {
        let connection;
        try {
            connection = await getConnection();

            const { nombre, descripcion, imagen_url, activa = true } = data;
            const slug = this.generateSlug(nombre);

            const [result] = await connection.execute(`
                INSERT INTO categorias (nombre, descripcion, slug, imagen_url, activa, creado_en)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [nombre, descripcion, slug, imagen_url, activa]);

            return result.insertId;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Actualizar categoría
     */
    static async update(id, data) {
        let connection;
        try {
            connection = await getConnection();

            const { nombre, descripcion, imagen_url, activa } = data;
            const slug = this.generateSlug(nombre);

            const [result] = await connection.execute(`
                UPDATE categorias
                SET nombre = ?, descripcion = ?, slug = ?, imagen_url = ?, activa = ?, actualizado_en = NOW()
                WHERE id = ?
            `, [nombre, descripcion, slug, imagen_url, activa, id]);

            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Eliminar categoría (solo si no tiene productos)
     */
    static async delete(id) {
        let connection;
        try {
            connection = await getConnection();

            // Verificar si tiene productos asociados
            const [productCount] = await connection.execute(`
                SELECT COUNT(*) as count FROM productos WHERE id_categoria = ?
            `, [id]);

            if (productCount[0].count > 0) {
                throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
            }

            const [result] = await connection.execute(`
                DELETE FROM categorias WHERE id = ?
            `, [id]);

            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Verificar si existe una categoría con el mismo nombre
     */
    static async existsByName(nombre, excludeId = null) {
        let connection;
        try {
            connection = await getConnection();

            let query = 'SELECT COUNT(*) as count FROM categorias WHERE LOWER(nombre) = LOWER(?)';
            let params = [nombre];

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
                UPDATE categorias
                SET activa = NOT activa, actualizado_en = NOW()
                WHERE id = ?
            `, [id]);

            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = Category;