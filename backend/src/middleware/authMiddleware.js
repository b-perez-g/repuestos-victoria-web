const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        // Verificar token en headers si no está en cookies
        if (!token && req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No autorizado - Token no proporcionado",
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuario en la base de datos
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        // Verificar si el usuario está activo
        if (!user.activo) {
            return res.status(401).json({
                success: false,
                message: "Cuenta desactivada",
            });
        }

        // Adjuntar información del usuario a la request
        req.user = {
            id: user.id,
            email: user.correo,
            role: user.nombre_rol || 'cliente',
            roleId: user.id_rol,
            verified: user.verificado,
            active: user.activo,
            firstName: user.nombres,
            lastName: user.a_paterno
        };

        next();
    } catch (error) {
        console.error('Error en authMiddleware:', error);
        
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expirado",
                expired: true,
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Token inválido",
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = authMiddleware;