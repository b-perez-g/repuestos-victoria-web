const bcrypt = require('bcrypt');
const User = require('../models/User');
const { getConnection } = require('../config/database');

/**
 * Controlador para la gestión de usuarios y perfiles.
 */
class UserController {

    /**
     * Obtiene el perfil del usuario actual.
     * 
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Omitir información sensible
            delete user.password_hash;
            delete user.reset_password_token;
            delete user.verification_token;

            res.json({
                success: true,
                user
            });
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener perfil'
            });
        }
    }

    /**
     * Actualiza el perfil del usuario actual.
     * 
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async updateProfile(req, res) {
        try {
            const { firstName, lastName } = req.body;
            const userId = req.user.id;

            let connection;
            try {
                connection = await getConnection();
                await connection.execute(
                    `UPDATE usuarios SET first_name = ?, last_name = ? WHERE id = ?`,
                    [firstName, lastName, userId]
                );

                res.json({
                    success: true,
                    message: 'Perfil actualizado exitosamente'
                });
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar perfil'
            });
        }
    }

    /**
     * Cambia la contraseña del usuario actual.
     * 
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            const user = await User.findById(userId);
            
            // Verificar contraseña actual
            const isValid = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual incorrecta'
                });
            }

            // Actualizar contraseña
            const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS));
            
            let connection;
            try {
                connection = await getConnection();
                await connection.execute(
                    `UPDATE usuarios SET password_hash = ? WHERE id = ?`,
                    [hashedPassword, userId]
                );

                res.json({
                    success: true,
                    message: 'Contraseña actualizada exitosamente'
                });
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cambiar contraseña'
            });
        }
    }

    /**
     * Obtiene todos los usuarios (solo Admin).
     * 
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async getAllUsers(req, res) {
        try {
            let connection;
try {
            connection = await getConnection();
                const [users] = await connection.execute(
                    `SELECT u.id, u.email, u.first_name, u.last_name, 
                            u.is_active, u.is_verified, u.created_at, u.last_login,
                            r.name as role_name
                     FROM usuarios u
                     LEFT JOIN roles r ON u.role_id = r.id
                     ORDER BY u.created_at DESC`
                );

                res.json({
                    success: true,
                    users
                });
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios'
            });
        }
    }

    /**
     * Obtiene un usuario por su ID (solo Admin).
     * 
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            delete user.password_hash;
            delete user.reset_password_token;
            delete user.verification_token;

            res.json({
                success: true,
                user
            });
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuario'
            });
        }
    }

    /**
     * Actualiza un usuario por su ID (solo Admin).
     * 
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async updateUser(req, res) {
        try {
            const { isActive, roleId } = req.body;
            const userId = req.params.id;

            let connection;
try {
            connection = await getConnection();
                await connection.execute(
                    `UPDATE usuarios SET is_active = ?, role_id = ? WHERE id = ?`,
                    [isActive, roleId, userId]
                );

                res.json({
                    success: true,
                    message: 'Usuario actualizado exitosamente'
                });
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario'
            });
        }
    }

    /**
     * Elimina un usuario por su ID (solo Admin).
     * 
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async deleteUser(req, res) {
        try {
            const userId = req.params.id;

            if (userId === req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes eliminar tu propia cuenta'
                });
            }

            let connection;
try {
            connection = await getConnection();
                await connection.execute(`DELETE FROM usuarios WHERE id = ?`, [userId]);

                res.json({
                    success: true,
                    message: 'Usuario eliminado exitosamente'
                });
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar usuario'
            });
        }
    }

    /**
     * Obtiene estadísticas para el dashboard (Admin/Moderator).
     * 
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async getDashboardStats(req, res) {
        try {
            let connection;
try {
            connection = await getConnection();
                const [[userCount]] = await connection.execute(
                    `SELECT COUNT(*) as total FROM usuarios`
                );
                
                const [[activeCount]] = await connection.execute(
                    `SELECT COUNT(*) as total FROM usuarios WHERE is_active = true`
                );
                
                const [[verifiedCount]] = await connection.execute(
                    `SELECT COUNT(*) as total FROM usuarios WHERE is_verified = true`
                );
                
                const [recentLogins] = await connection.execute(
                    `SELECT COUNT(*) as total FROM usuarios 
                     WHERE last_login > DATE_SUB(NOW(), INTERVAL 24 HOUR)`
                );

                const [roleDistribution] = await connection.execute(
                    `SELECT r.name, COUNT(u.id) as count 
                     FROM roles r 
                     LEFT JOIN usuarios u ON r.id = u.role_id 
                     GROUP BY r.id, r.name`
                );

                const [recentRegistrations] = await connection.execute(
                    `SELECT DATE(created_at) as date, COUNT(*) as count 
                     FROM usuarios 
                     WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY) 
                     GROUP BY DATE(created_at) 
                     ORDER BY date DESC`
                );

                res.json({
                    success: true,
                    stats: {
                        totalUsers: userCount.total,
                        activeUsers: activeCount.total,
                        verifiedUsers: verifiedCount.total,
                        recentLogins: recentLogins[0].total,
                        roleDistribution,
                        recentRegistrations
                    }
                });
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas'
            });
        }
    }

    /**
     * Obtiene los logs de auditoría (solo Admin).
     * 
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async getAuditLogs(req, res) {
        try {
            const { page = 1, limit = 50 } = req.query;
            const offset = (page - 1) * limit;

            let connection;
try {
            connection = await getConnection();
                const [logs] = await connection.execute(
                    `SELECT a.*, u.email
                     FROM audit_logs a 
                     LEFT JOIN usuarios u ON a.user_id = u.id 
                     ORDER BY a.created_at DESC 
                     LIMIT ? OFFSET ?`,
                    [parseInt(limit), parseInt(offset)]
                );

                const [[totalCount]] = await connection.execute(
                    `SELECT COUNT(*) as total FROM audit_logs`
                );

                res.json({
                    success: true,
                    logs,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: totalCount.total,
                        pages: Math.ceil(totalCount.total / limit)
                    }
                });
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error obteniendo logs:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener logs de auditoría'
            });
        }
    }

    /**
     * Limpia las sesiones expiradas del sistema (solo Admin).
     * 
     * @param {Object} req - Objeto de solicitud de Express.
     * @param {Object} res - Objeto de respuesta de Express.
     * @returns {Promise<void>}
     */
    static async cleanupSessions(req, res) {
        try {
            let connection;
try {
            connection = await getConnection();
                const [result] = await connection.execute(
                    `DELETE FROM sessions WHERE expires_at < NOW()`
                );

                res.json({
                    success: true,
                    message: `${result.affectedRows} sesiones expiradas eliminadas`
                });
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error limpiando sesiones:', error);
            res.status(500).json({
                success: false,
                message: 'Error al limpiar sesiones'
            });
        }
    }
}

module.exports = UserController;
