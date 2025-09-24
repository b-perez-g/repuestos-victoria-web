const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuthController = require("../controllers/authController");
const rateLimit = require("express-rate-limit");

// Rate limiter para requests autenticados
const authenticatedLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 200, // 200 requests por ventana por usuario
    message: {
        success: false,
        message: 'Demasiadas solicitudes autenticadas',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    skip: (req) => !req.user, // Solo aplicar a usuarios autenticados
    standardHeaders: true,
    legacyHeaders: false
});

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

        // Verificar si el token está en lista negra (opcional - requiere implementar blacklist)
        if (await isTokenBlacklisted(token)) {
            return res.status(401).json({
                success: false,
                message: "Token inválido",
            });
        }

        // Verificar token
        console.log('🔍 Verificando token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token válido:', { userId: decoded.id, email: decoded.email });

        // Verificar estructura del token
        if (!decoded.id || !decoded.email) {
            return res.status(401).json({
                success: false,
                message: "Token malformado",
            });
        }

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

        // Verificar si la cuenta está verificada para rutas sensibles
        if (!user.verificado && requiresVerification(req.path)) {
            return res.status(403).json({
                success: false,
                message: "Cuenta no verificada",
                needsVerification: true
            });
        }

        // Validar sesión en base de datos
        const isValidSession = await AuthController.validateSession(user.id, token);
        if (!isValidSession) {
            return res.status(401).json({
                success: false,
                message: "Sesión inválida o expirada",
                expired: true
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

        // Aplicar rate limiting a usuarios autenticados
        authenticatedLimiter(req, res, next);
    } catch (error) {
        console.error('❌ Error en authMiddleware:', error.name, error.message);

        if (error.name === "TokenExpiredError") {
            console.log('⏰ Token expirado a las:', error.expiredAt);
            return res.status(401).json({
                success: false,
                message: "Token expirado",
                expired: true,
            });
        }

        if (error.name === "JsonWebTokenError") {
            console.log('🔐 Token malformado o inválido');
            return res.status(401).json({
                success: false,
                message: "Token inválido",
            });
        }

        console.log('❓ Error desconocido en auth:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Helper functions
async function isTokenBlacklisted(token) {
    // TODO: Implementar blacklist de tokens (Redis o DB)
    // Por ahora retorna false
    return false;
}

function requiresVerification(path) {
    // Rutas que requieren cuenta verificada
    const sensitiveRoutes = [
        '/api/users/change-password',
        '/api/users/profile',
        '/api/admin'
    ];

    return sensitiveRoutes.some(route => path.startsWith(route));
}

module.exports = authMiddleware;