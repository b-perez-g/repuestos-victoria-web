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
            const [rows] = await connection.execute('SELECT * FROM roles ORDER BY id');
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
     * @param {string} nombre - Nombre del rol.
     * @returns {Promise<Object|null>} - Rol encontrado o null.
     */
    static async findByName(nombre) {
        let connection;
        try {
            connection = await getConnection();
            const [rows] = await connection.execute('SELECT * FROM roles WHERE nombre = ?', [nombre]);
            return rows[0] || null;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Crea un nuevo rol.
     * 
     * @param {string} nombre - Nombre del rol.
     * @param {string} descripcion - Descripción del rol.
     * @returns {Promise<number>} - ID del rol creado.
     */
    static async create(nombre, descripcion) {
        let connection;
        try {
            connection = await getConnection();
            const [result] = await connection.execute(
                'INSERT INTO roles (nombre, descripcion) VALUES (?, ?)',
                [nombre, descripcion]
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
     * @param {string} nombre - Nuevo nombre del rol.
     * @param {string} descripcion - Nueva descripción del rol.
     * @returns {Promise<boolean>} - True si se actualizó correctamente.
     */
    static async update(id, nombre, descripcion) {
        let connection;
        try {
            connection = await getConnection();
            const [result] = await connection.execute(
                'UPDATE roles SET nombre = ?, descripcion = ? WHERE id = ?',
                [nombre, descripcion, id]
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
                `SELECT u.id, u.correo, u.nombres, u.a_paterno, u.a_materno, u.activo, u.verificado
                 FROM usuarios u 
                 WHERE u.id_rol = ?`,
                [roleId]
            );
            return rows;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = Role;