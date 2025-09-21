const bcrypt = require('bcrypt');
const User = require('../models/User');
const { getConnection } = require('../config/database');
const { validationResult } = require('express-validator');
const { sendPasswordChangedEmail } = require('../utils/emailService');

/**
 * Controlador para la gestión de usuarios y perfiles.
 */
class UserController {

    /**
     * Obtiene el perfil del usuario actual.
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
            const userProfile = {
                id: user.id,
                correo: user.correo,
                nombres: user.nombres,
                a_paterno: user.a_paterno,
                a_materno: user.a_materno,
                activo: user.activo,
                verificado: user.verificado,
                creado_en: user.creado_en,
                ultimo_ingreso: user.ultimo_ingreso,
                rol: user.nombre_rol
            };

            res.json({
                success: true,
                user: userProfile
            });
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Actualiza el perfil del usuario actual.
     */
    static async updateProfile(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: errors.array()
                });
            }

            const { nombres, a_paterno, a_materno } = req.body;
            const userId = req.user.id;

            const updateData = {};
            if (nombres !== undefined) updateData.nombres = nombres.trim();
            if (a_paterno !== undefined) updateData.a_paterno = a_paterno.trim();
            if (a_materno !== undefined) updateData.a_materno = a_materno ? a_materno.trim() : null;

            const success = await User.updateProfile(userId, updateData);

            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar el perfil'
                });
            }

            res.json({
                success: true,
                message: 'Perfil actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Cambia la contraseña del usuario actual.
     */
    static async changePassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: errors.array()
                });
            }

            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar contraseña actual
            const isValid = await bcrypt.compare(currentPassword, user.contrasena_hash);
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual incorrecta'
                });
            }

            // Actualizar contraseña
            const success = await User.changePassword(userId, newPassword);

            if (!success) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar la contraseña'
                });
            }

            // Enviar email de notificación
            try {
                await sendPasswordChangedEmail(user.correo, user.nombres);
            } catch (emailError) {
                console.error('Error enviando email de notificación:', emailError);
            }

            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtiene todos los usuarios (solo Admin).
     */
    static async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 20, search = '', role = '' } = req.query;
            const offset = (page - 1) * limit;

            let connection;
            try {
                connection = await getConnection();
                
                let whereClause = '';
                let params = [];
                
                if (search) {
                    whereClause += ' WHERE (u.correo LIKE ? OR u.nombres LIKE ? OR u.a_paterno LIKE ?)';
                    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
                }
                
                if (role) {
                    whereClause += whereClause ? ' AND' : ' WHERE';
                    whereClause += ' r.nombre = ?';
                    params.push(role);
                }

                const [users] = await connection.execute(
                    `SELECT u.id, u.correo, u.nombres, u.a_paterno, u.a_materno,
                            u.activo, u.verificado, u.creado_en, u.ultimo_ingreso,
                            r.nombre as nombre_rol
                     FROM usuarios u
                     LEFT JOIN roles r ON u.id_rol = r.id
                     ${whereClause}
                     ORDER BY u.creado_en DESC
                     LIMIT ? OFFSET ?`,
                    [...params, parseInt(limit), parseInt(offset)]
                );

                const [[countResult]] = await connection.execute(
                    `SELECT COUNT(*) as total FROM usuarios u
                     LEFT JOIN roles r ON u.id_rol = r.id
                     ${whereClause}`,
                    params
                );

                res.json({
                    success: true,
                    users,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: countResult.total,
                        pages: Math.ceil(countResult.total / limit)
                    }
                });
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtiene un usuario por su ID (solo Admin).
     */
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Omitir información sensible
            const userProfile = {
                id: user.id,
                correo: user.correo,
                nombres: user.nombres,
                a_paterno: user.a_paterno,
                a_materno: user.a_materno,
                activo: user.activo,
                verificado: user.verificado,
                creado_en: user.creado_en,
                ultimo_ingreso: user.ultimo_ingreso,
                id_rol: user.id_rol,
                nombre_rol: user.nombre_rol,
                intentos_fallidos: user.intentos_fallidos,
                bloqueado_hasta: user.bloqueado_hasta
            };

            res.json({
                success: true,
                user: userProfile
            });
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Actualiza un usuario por su ID (solo Admin).
     */
    static async updateUser(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: errors.array()
                });
            }

            const { activo, id_rol } = req.body;
            const userId = req.params.id;

            // Verificar que no se desactive a sí mismo
            if (userId == req.user.id && activo === false) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes desactivar tu propia cuenta'
                });
            }

            let connection;
            try {
                connection = await getConnection();
                
                const updateFields = [];
                const values = [];
                
                if (activo !== undefined) {
                    updateFields.push('activo = ?');
                    values.push(activo);
                }
                
                if (id_rol !== undefined) {
                    updateFields.push('id_rol = ?');
                    values.push(id_rol);
                }
                
                if (updateFields.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'No hay campos para actualizar'
                    });
                }
                
                values.push(userId);
                
                const [result] = await connection.execute(
                    `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`,
                    values
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }

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
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Elimina un usuario por su ID (solo Admin).
     */
    static async deleteUser(req, res) {
        try {
            const userId = req.params.id;

            if (userId == req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes eliminar tu propia cuenta'
                });
            }

            let connection;
            try {
                connection = await getConnection();
                const [result] = await connection.execute(`DELETE FROM usuarios WHERE id = ?`, [userId]);

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }

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
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtiene estadísticas para el dashboard (Admin/Moderator).
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
                    `SELECT COUNT(*) as total FROM usuarios WHERE activo = true`
                );
                
                const [[verifiedCount]] = await connection.execute(
                    `SELECT COUNT(*) as total FROM usuarios WHERE verificado = true`
                );
                
                const [[recentLogins]] = await connection.execute(
                    `SELECT COUNT(*) as total FROM usuarios 
                     WHERE ultimo_ingreso > DATE_SUB(NOW(), INTERVAL 24 HOUR)`
                );

                const [roleDistribution] = await connection.execute(
                    `SELECT r.nombre, COUNT(u.id) as count 
                     FROM roles r 
                     LEFT JOIN usuarios u ON r.id = u.id_rol 
                     GROUP BY r.id, r.nombre
                     ORDER BY r.id`
                );

                const [recentRegistrations] = await connection.execute(
                    `SELECT DATE(creado_en) as date, COUNT(*) as count 
                     FROM usuarios 
                     WHERE creado_en > DATE_SUB(NOW(), INTERVAL 7 DAY) 
                     GROUP BY DATE(creado_en) 
                     ORDER BY date DESC`
                );

                const [[pendingVerifications]] = await connection.execute(
                    `SELECT COUNT(*) as total FROM usuarios WHERE verificado = false`
                );

                const [[blockedUsers]] = await connection.execute(
                    `SELECT COUNT(*) as total FROM usuarios WHERE bloqueado_hasta > NOW()`
                );

                res.json({
                    success: true,
                    stats: {
                        totalUsers: userCount.total,
                        activeUsers: activeCount.total,
                        verifiedUsers: verifiedCount.total,
                        pendingVerifications: pendingVerifications.total,
                        blockedUsers: blockedUsers.total,
                        recentLogins: recentLogins.total,
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
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtiene los logs de auditoría (solo Admin).
     */
    static async getAuditLogs(req, res) {
        try {
            const { page = 1, limit = 50, action = '', userId = '' } = req.query;
            const offset = (page - 1) * limit;

            let connection;
            try {
                connection = await getConnection();
                
                let whereClause = '';
                let params = [];
                
                if (action) {
                    whereClause += ' WHERE a.accion LIKE ?';
                    params.push(`%${action}%`);
                }
                
                if (userId) {
                    whereClause += whereClause ? ' AND' : ' WHERE';
                    whereClause += ' a.id_usuario = ?';
                    params.push(userId);
                }

                const [logs] = await connection.execute(
                    `SELECT a.*, u.correo, u.nombres, u.a_paterno
                     FROM logs_auditoria a 
                     LEFT JOIN usuarios u ON a.id_usuario = u.id 
                     ${whereClause}
                     ORDER BY a.creado_en DESC 
                     LIMIT ? OFFSET ?`,
                    [...params, parseInt(limit), parseInt(offset)]
                );

                const [[totalCount]] = await connection.execute(
                    `SELECT COUNT(*) as total FROM logs_auditoria a
                     ${whereClause.replace('a.id_usuario', 'id_usuario').replace('a.accion', 'accion')}`,
                    params
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
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Limpia las sesiones expiradas del sistema (solo Admin).
     */
    static async cleanupSessions(req, res) {
        try {
            let connection;
            try {
                connection = await getConnection();
                
                // Limpiar sesiones expiradas
                const [sessionResult] = await connection.execute(
                    `DELETE FROM sesiones WHERE expira_en < NOW()`
                );

                // Limpiar tokens de refresco expirados
                const [tokenResult] = await connection.execute(
                    `DELETE FROM tokens_refresco WHERE expira_en < NOW()`
                );

                res.json({
                    success: true,
                    message: `Limpieza completada: ${sessionResult.affectedRows} sesiones y ${tokenResult.affectedRows} tokens eliminados`
                });
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error limpiando sesiones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Obtiene estadísticas de actividad del usuario actual
     */
    static async getUserActivity(req, res) {
        try {
            const userId = req.user.id;
            let connection;
            
            try {
                connection = await getConnection();
                
                const [sessions] = await connection.execute(
                    `SELECT COUNT(*) as active_sessions FROM sesiones 
                     WHERE id_usuario = ? AND expira_en > NOW()`,
                    [userId]
                );

                const [lastLogins] = await connection.execute(
                    `SELECT creado_en, ip, agente_usuario FROM logs_auditoria 
                     WHERE id_usuario = ? AND accion = 'LOGIN_SUCCESS'
                     ORDER BY creado_en DESC LIMIT 5`,
                    [userId]
                );

                res.json({
                    success: true,
                    activity: {
                        activeSessions: sessions[0]?.active_sessions || 0,
                        recentLogins: lastLogins
                    }
                });
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error obteniendo actividad del usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = UserController;