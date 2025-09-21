//midleware/roleMiddleware
/**
 * Este middleware verifica que el usuario autenticado tenga uno de los roles permitidos
 * para acceder a la ruta protegida. Debe colocarse **después del middleware de autenticación**.
 * 
 * @param  {...string} allowedRoles - Lista de roles permitidos para la ruta
 * @returns {import('express').RequestHandler} - Función middleware de Express que valida el rol del usuario.
 */
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso'
            });
        }
        next();
    }
};

module.exports = roleMiddleware;