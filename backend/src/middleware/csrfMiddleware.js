const crypto = require('crypto');

/**
 * Middleware de protección CSRF
 * Genera y valida tokens CSRF para prevenir ataques Cross-Site Request Forgery
 */
class CSRFMiddleware {
    constructor() {
        this.tokens = new Map(); // En producción usar Redis
        this.tokenExpiry = 30 * 60 * 1000; // 30 minutos

        // Limpiar tokens expirados cada 10 minutos
        setInterval(() => {
            this.cleanExpiredTokens();
        }, 10 * 60 * 1000);
    }

    /**
     * Genera un token CSRF único
     */
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Almacena un token con su timestamp
     */
    storeToken(token, userId = null) {
        this.tokens.set(token, {
            createdAt: Date.now(),
            userId,
            used: false
        });
    }

    /**
     * Valida un token CSRF
     */
    validateToken(token, userId = null) {
        const tokenData = this.tokens.get(token);

        if (!tokenData) {
            return false;
        }

        // Verificar expiración
        if (Date.now() - tokenData.createdAt > this.tokenExpiry) {
            this.tokens.delete(token);
            return false;
        }

        // Verificar que no haya sido usado (one-time use)
        if (tokenData.used) {
            return false;
        }

        // Verificar que el token pertenece al usuario correcto (si aplica)
        if (userId && tokenData.userId && tokenData.userId !== userId) {
            return false;
        }

        // Marcar como usado
        tokenData.used = true;

        // Eliminar después de un corto tiempo
        setTimeout(() => {
            this.tokens.delete(token);
        }, 5000);

        return true;
    }

    /**
     * Limpia tokens expirados
     */
    cleanExpiredTokens() {
        const now = Date.now();
        for (const [token, data] of this.tokens.entries()) {
            if (now - data.createdAt > this.tokenExpiry) {
                this.tokens.delete(token);
            }
        }
    }

    /**
     * Middleware para generar token CSRF
     */
    generateCSRFToken() {
        return (req, res, next) => {
            const token = this.generateToken();
            const userId = req.user ? req.user.id : null;

            this.storeToken(token, userId);

            // Enviar token en cookie httpOnly
            res.cookie('csrf-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: this.tokenExpiry,
                path: '/'
            });

            // También disponible en response para uso en headers
            res.locals.csrfToken = token;

            next();
        };
    }

    /**
     * Middleware para validar token CSRF
     */
    validateCSRFToken(options = {}) {
        const {
            skipMethods = ['GET', 'HEAD', 'OPTIONS'],
            skipPaths = [],
            headerName = 'x-csrf-token'
        } = options;

        return (req, res, next) => {
            // Omitir métodos seguros por defecto
            if (skipMethods.includes(req.method)) {
                return next();
            }

            // Omitir rutas específicas
            if (skipPaths.some(path => req.path.includes(path))) {
                return next();
            }

            // Obtener token del header o body
            const token = req.headers[headerName] || req.body.csrfToken;

            if (!token) {
                return res.status(403).json({
                    success: false,
                    message: 'Token CSRF requerido',
                    code: 'CSRF_TOKEN_MISSING'
                });
            }

            const userId = req.user ? req.user.id : null;

            if (!this.validateToken(token, userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Token CSRF inválido o expirado',
                    code: 'CSRF_TOKEN_INVALID'
                });
            }

            next();
        };
    }

    /**
     * Endpoint para obtener nuevo token CSRF
     */
    getCSRFTokenEndpoint() {
        return (req, res) => {
            const token = this.generateToken();
            const userId = req.user ? req.user.id : null;

            this.storeToken(token, userId);

            res.json({
                success: true,
                csrfToken: token,
                expiresIn: this.tokenExpiry
            });
        };
    }

    /**
     * Middleware para rutas de autenticación que requieren doble verificación
     */
    validateCSRFForAuth() {
        return (req, res, next) => {
            // Para login, cambio de contraseña, etc.
            const token = req.headers['x-csrf-token'] || req.body.csrfToken;

            if (!token) {
                return res.status(403).json({
                    success: false,
                    message: 'Token de seguridad requerido',
                    code: 'CSRF_TOKEN_MISSING'
                });
            }

            if (!this.validateToken(token)) {
                return res.status(403).json({
                    success: false,
                    message: 'Token de seguridad inválido',
                    code: 'CSRF_TOKEN_INVALID'
                });
            }

            next();
        };
    }
}

// Singleton instance
const csrfProtection = new CSRFMiddleware();

module.exports = {
    csrfProtection,
    generateCSRFToken: csrfProtection.generateCSRFToken.bind(csrfProtection),
    validateCSRFToken: csrfProtection.validateCSRFToken.bind(csrfProtection),
    validateCSRFForAuth: csrfProtection.validateCSRFForAuth.bind(csrfProtection),
    getCSRFTokenEndpoint: csrfProtection.getCSRFTokenEndpoint.bind(csrfProtection)
};