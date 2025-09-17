const { getConnection } = require('../config/database');

/**
 * Clase que maneja operaciones sobre roles en la base de datos.
 */
class Role {

    /**
     * Obtiene todos los roles existentes.
     * 
     * @returns {Promise<Array>} - Todos los roles.
     */
    static async findAll() {
        let connection;
        try {
            connection = await getConnection();
            const [rows] = await connection.execute('SELECT * FROM roles');
            return rows;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Busca un rol por su ID.
     * 
     * @param {number} id - ID del rol.
     * @returns {Promise<Object|null>} - Rol encontrado o null.
     */
    static async findById(id) {
        let connection;
        try {
            connection = await getConnection();
            const [rows] = await connection.execute('SELECT * FROM roles WHERE id = ?', [id]);
            return rows[0] || null;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Busca un rol por su nombre.
     * 
     * @param {string} name - Nombre del rol.
     * @returns {Promise<Object|null>} - Rol encontrado o null.
     */
    static async findByName(name) {
        let connection;
        try {
            connection = await getConnection();
            const [rows] = await connection.execute('SELECT * FROM roles WHERE name = ?', [name]);
            return rows[0] || null;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Crea un nuevo rol.
     * 
     * @param {string} name - Nombre del rol.
     * @param {string} description - Descripción del rol.
     * @returns {Promise<number>} - ID del rol creado.
     */
    static async create(name, description) {
        let connection;
        try {
            connection = await getConnection();
            const [result] = await connection.execute(
                'INSERT INTO roles (name, description) VALUES (?, ?)',
                [name, description]
            );
            return result.insertId;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Actualiza un rol existente.
     * 
     * @param {number} id - ID del rol.
     * @param {string} name - Nuevo nombre del rol.
     * @param {string} description - Nueva descripción del rol.
     * @returns {Promise<boolean>} - True si se actualizó correctamente.
     */
    static async update(id, name, description) {
        let connection;
        try {
            connection = await getConnection();
            const [result] = await connection.execute(
                'UPDATE roles SET name = ?, description = ? WHERE id = ?',
                [name, description, id]
            );
            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Elimina un rol por su ID.
     * 
     * @param {number} id - ID del rol.
     * @returns {Promise<boolean>} - True si se eliminó correctamente.
     */
    static async delete(id) {
        let connection;
        try {
            connection = await getConnection();
            const [result] = await connection.execute('DELETE FROM roles WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Obtiene todos los usuarios asociados a un rol.
     * 
     * @param {number} roleId - ID del rol.
     * @returns {Promise<Array>} - Arreglo de usuarios con ese rol.
     */
    static async getUsersByRole(roleId) {
        let connection;
        try {
            connection = await getConnection();
            const [rows] = await connection.execute(
                `SELECT u.id, u.email, u.first_name, u.last_name 
                 FROM users u 
                 WHERE u.role_id = ?`,
                [roleId]
            );
            return rows;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = Role;
