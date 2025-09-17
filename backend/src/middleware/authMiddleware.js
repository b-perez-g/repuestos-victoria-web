const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware de autenticación para proteger rutas.
 *
 * Este middleware realiza las siguientes acciones:
 * 1. Busca un token JWT en:
 *    - Las cookies (`req.cookies.token`)
 *    - El encabezado `Authorization` con formato `Bearer <token>`
 * 2. Verifica el token usando la clave secreta `process.env.JWT_SECRET`.
 * 3. Busca al usuario correspondiente en la base de datos usando el ID del token.
 * 4. Verifica que la cuenta del usuario esté activa.
 * 5. Agrega la información del usuario a `req.user` para que esté disponible en los controladores siguientes.
 * 6. Llama a `next()` si todo es válido; de lo contrario, responde con un error 401.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @throws {401 Unauthorized} - Si no se proporciona token, es inválido, ha expirado, el usuario no existe o la cuenta está desactivada.
 */
const authMiddleware = async (req, res, next) => {
    try {
        // 1. Buscar token en cookies o header Authorization
        let token = req.cookies?.token;

        if (!token && req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No autorizado - Token no proporcionado",
            });
        }

        // 2. Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //3. Buscar usuario en la base de datos
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        // 4. Verificar que la cuenta esté activa
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: "Cuenta desactivada",
            });
        }

        // 5. Agregar usuario a la request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role_name,
            roleId: user.role_id,
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expirado",
                expired: true,
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};

module.exports = authMiddleware;
