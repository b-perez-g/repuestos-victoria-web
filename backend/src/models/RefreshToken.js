const { getConnection } = require("../config/database");

/**
 * Clase para manejar tokens de actualización (refresh tokens) en la base de datos.
 * Permite crear, buscar y eliminar refresh tokens.
 */
class RefreshToken {

    /**
     * Crea un nuevo refresh token para un usuario.
     *
     * @param {number} userId - ID del usuario al que pertenece el token.
     * @param {string} token - Token de actualización generado.
     * @param {Date|string} expiresAt - Fecha y hora de expiración del token.
     * @returns {Promise<number>} - Devuelve el ID del token insertado en la base de datos.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la inserción.
     */
    static async create(userId, token, expiresAt) {
        let connection;
        try {
            connection = await getConnection();
            const [result] = await connection.execute(
                `INSERT INTO tokens_refresco (id_usuario, token, expira_en) VALUES (?, ?, ?)`,
                [userId, token, expiresAt]
            );
            return result.insertId;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Busca un refresh token válido por su valor.
     *
     * @param {string} token - Token de actualización a buscar.
     * @returns {Promise<Object|null>} - Devuelve el token encontrado o `null` si no existe o está expirado.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la consulta.
     */
    static async findByToken(token) {
        let connection;
        try {
            connection = await getConnection();
            const [rows] = await connection.execute(
                `SELECT * FROM tokens_refresco WHERE token = ? AND expira_en > NOW()`,
                [token]
            );
            return rows[0] || null;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Elimina un refresh token específico de la base de datos.
     *
     * @param {string} token - Token a eliminar.
     * @returns {Promise<boolean>} - Devuelve true si se eliminó correctamente.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la eliminación.
     */
    static async deleteByToken(token) {
        let connection;
        try {
            connection = await getConnection();
            const [result] = await connection.execute(
                `DELETE FROM tokens_refresco WHERE token = ?`,
                [token]
            );
            return result.affectedRows > 0;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Elimina todos los refresh tokens expirados.
     *
     * @returns {Promise<number>} - Devuelve el número de tokens eliminados.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la eliminación.
     */
    static async deleteExpired() {
        let connection;
        try {
            connection = await getConnection();
            const [result] = await connection.execute(
                `DELETE FROM tokens_refresco WHERE expira_en < NOW()`
            );
            return result.affectedRows;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Elimina todos los refresh tokens de un usuario específico.
     *
     * @param {number} userId - ID del usuario cuyos tokens serán eliminados.
     * @returns {Promise<number>} - Devuelve el número de tokens eliminados.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la eliminación.
     */
    static async deleteAllUserTokens(userId) {
        let connection;
        try {
            connection = await getConnection();
            const [result] = await connection.execute(
                `DELETE FROM tokens_refresco WHERE id_usuario = ?`,
                [userId]
            );
            return result.affectedRows;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Obtiene todos los tokens de un usuario
     */
    static async findByUserId(userId) {
        let connection;
        try {
            connection = await getConnection();
            const [rows] = await connection.execute(
                `SELECT * FROM tokens_refresco WHERE id_usuario = ? AND expira_en > NOW()`,
                [userId]
            );
            return rows;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = RefreshToken;