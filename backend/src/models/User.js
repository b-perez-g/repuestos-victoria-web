const { getConnection } = require("../config/database");
const bcrypt = require("bcrypt");

/**
 * Clase que maneja operaciones relacionadas con los usuarios en la base de datos.
 */
class User {
    /**
     * Crea un nuevo usuario en la base de datos.
     *
     * @param {Object} userData - Objeto que contiene la información del usuario
     * @returns {Promise<number>} Devuelve el ID del usuario que se creó.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la consulta a la base de datos.
     */
    static async create(userData) {
        let connection;

        try {
            connection = await getConnection();

            const [result] = await connection.execute(
                `INSERT INTO usuarios (correo, contrasena_hash, nombres, a_paterno, a_materno, id_rol, token_verificacion) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    userData.correo,
                    userData.contrasena_hash,
                    userData.nombres,
                    userData.a_paterno,
                    userData.a_materno || null,
                    userData.id_rol || 3, // Default cliente
                    userData.token_verificacion,
                ]
            );
            return result.insertId;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Busca un usuario por su email.
     *
     * @param {string} correo - Email del usuario que se quiere buscar
     * @returns {Promise<Object|undefined>} - Devuelve un objeto con los datos del usuario o 'undefined' si no hay resultados.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la consulta a la base de datos.
     */
    static async findByEmail(correo) {
        let connection;
        try {
            connection = await getConnection();

            const [rows] = await connection.execute(
                `SELECT u.*, r.nombre as nombre_rol
                 FROM usuarios u
                 LEFT JOIN roles r ON u.id_rol = r.id
                 WHERE u.correo = ?`,
                [correo]
            );
            return rows[0];
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Busca un usuario por su ID.
     *
     * @param {number} id - ID del usuario a buscar.
     * @returns {Promise<Object|undefined>} - Devuelve un objeto con los datos del usuario o 'undefined' si no hay resultados.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la consulta a la base de datos.
     */
    static async findById(id) {
        let connection;
        try {
            connection = await getConnection();

            const [rows] = await connection.execute(
                `SELECT u.*, r.nombre as nombre_rol
                FROM usuarios u
                LEFT JOIN roles r ON u.id_rol = r.id
                WHERE u.id = ?`,
                [id]
            );
            return rows[0];
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Actualiza los intentos de login fallidos.
     *
     * @param {number} userId - ID del usuario a actualizar.
     * @param {number} attempts - Número de intentos fallidos actuales.
     * @param {Date|null} lockUntil - Fecha y hora hasta la que la cuenta permanecerá bloqueada, o `null` si no aplica.
     * @returns {Promise<boolean>} - Devuelve `true` si el usuario fue actualizado correctamente.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la consulta a la base de datos.
     */
    static async updateLoginAttempts(userId, attempts, lockUntil = null) {
        let connection;
        try {
            connection = await getConnection();

            const [result] = await connection.execute(
                `UPDATE usuarios
                 SET intentos_fallidos = ?, bloqueado_hasta = ?
                 WHERE id = ?`,
                [attempts, lockUntil, userId]
            );
            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Actualiza el último inicio de sesión del usuario.
     *
     * @param {number} userId - ID del usuario a actualizar.
     * @returns {Promise<boolean>} - Devuelve `true` si el usuario fue actualizado correctamente.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la consulta a la base de datos.
     */
    static async updateLastLogin(userId) {
        let connection;
        try {
            connection = await getConnection();

            const [result] = await connection.execute(
                `UPDATE usuarios 
                 SET ultimo_ingreso = CURRENT_TIMESTAMP, intentos_fallidos = 0, bloqueado_hasta = NULL
                 WHERE id = ?`,
                [userId]
            );
            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Actualiza el token de restablecimiento de contraseña y su fecha de expiración.
     *
     * @param {string} correo - Email del usuario
     * @param {string} token - Token de restablecimiento
     * @param {Date} expires - Fecha de expiración
     * @returns {Promise<boolean>} - Devuelve `true` si el usuario fue actualizado correctamente.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la consulta a la base de datos.
     */
    static async setResetToken(correo, token, expires) {
        let connection;
        try {
            connection = await getConnection();

            const [result] = await connection.execute(
                `UPDATE usuarios
                 SET token_restablecer = ?, expira_restablecer = ?
                 WHERE correo = ?`,
                [token, expires, correo]
            );

            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Restablece la contraseña de un usuario usando un token de recuperación válido.
     *
     * @param {string} token - Token de restablecimiento
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise<boolean>} - Devuelve `true` si el usuario fue actualizado correctamente.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la consulta a la base de datos.
     */
    static async resetPassword(token, newPassword) {
        let connection;
        try {
            connection = await getConnection();

            const hashedPassword = await bcrypt.hash(
                newPassword,
                parseInt(process.env.BCRYPT_ROUNDS) || 12
            );

            const [result] = await connection.execute(
                `UPDATE usuarios 
                 SET contrasena_hash = ?, token_restablecer = NULL, expira_restablecer = NULL 
                 WHERE token_restablecer = ? AND expira_restablecer > NOW()`,
                [hashedPassword, token]
            );

            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Verifica la dirección de correo de un usuario mediante un token de verificación.
     *
     * @param {string} token - Token de verificación enviado previamente al correo del usuario.
     * @returns {Promise<boolean>} - Devuelve `true` si el usuario fue actualizado correctamente.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la consulta a la base de datos.
     */
    static async verifyEmail(token) {
        let connection;
        try {
            connection = await getConnection();

            const [result] = await connection.execute(
                `UPDATE usuarios 
                 SET verificado = true, token_verificacion = NULL 
                 WHERE token_verificacion = ?`,
                [token]
            );

            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtiene un usuario por token de verificación
     */
    static async findByVerificationToken(token) {
        let connection;
        try {
            connection = await getConnection();

            const [rows] = await connection.execute(
                `SELECT * FROM usuarios WHERE token_verificacion = ?`,
                [token]
            );
            return rows[0];
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Obtiene un usuario por token de reset
     */
    static async findByResetToken(token) {
        let connection;
        try {
            connection = await getConnection();

            const [rows] = await connection.execute(
                `SELECT * FROM usuarios WHERE token_restablecer = ? AND expira_restablecer > NOW()`,
                [token]
            );
            return rows[0];
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Actualiza el perfil del usuario
     */
    static async updateProfile(userId, data) {
        let connection;
        try {
            connection = await getConnection();

            const fields = [];
            const values = [];

            if (data.nombres !== undefined) {
                fields.push('nombres = ?');
                values.push(data.nombres);
            }
            if (data.a_paterno !== undefined) {
                fields.push('a_paterno = ?');
                values.push(data.a_paterno);
            }
            if (data.a_materno !== undefined) {
                fields.push('a_materno = ?');
                values.push(data.a_materno);
            }

            if (fields.length === 0) {
                return true; // No hay nada que actualizar
            }

            values.push(userId);

            const [result] = await connection.execute(
                `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`,
                values
            );

            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Cambia la contraseña del usuario
     */
    static async changePassword(userId, newPassword) {
        let connection;
        try {
            connection = await getConnection();

            const hashedPassword = await bcrypt.hash(
                newPassword,
                parseInt(process.env.BCRYPT_ROUNDS) || 12
            );

            const [result] = await connection.execute(
                `UPDATE usuarios SET contrasena_hash = ? WHERE id = ?`,
                [hashedPassword, userId]
            );

            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = User;