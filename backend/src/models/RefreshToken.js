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
                `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
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
                `SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()`,
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
     * @returns {Promise<void>}
     * @throws {Error} - Lanza un error si ocurre algún problema durante la eliminación.
     */
    static async deleteByToken(token) {
        let connection;
        try {
            connection = await getConnection();
            await connection.execute(
                `DELETE FROM refresh_tokens WHERE token = ?`,
                [token]
            );
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Elimina todos los refresh tokens expirados.
     *
     * @returns {Promise<void>}
     * @throws {Error} - Lanza un error si ocurre algún problema durante la eliminación.
     */
    static async deleteExpired() {
        let connection;
        try {
            connection = await getConnection();
            await connection.execute(
                `DELETE FROM refresh_tokens WHERE expires_at < NOW()`
            );
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Elimina todos los refresh tokens de un usuario específico.
     *
     * @param {number} userId - ID del usuario cuyos tokens serán eliminados.
     * @returns {Promise<void>}
     * @throws {Error} - Lanza un error si ocurre algún problema durante la eliminación.
     */
    static async deleteAllUserTokens(userId) {
        let connection;
        try {
            connection = await getConnection();
            await connection.execute(
                `DELETE FROM refresh_tokens WHERE user_id = ?`,
                [userId]
            );
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = RefreshToken;