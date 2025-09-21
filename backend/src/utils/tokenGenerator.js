//utils/tokenGenerator.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Generador de tokens y utilidades de seguridad
 */
class TokenGenerator {
    /**
     * Genera un token aleatorio seguro
     * @param {number} length - Longitud del token en bytes (default: 32)
     * @returns {string} Token hexadecimal
     */
    static generateRandomToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Genera un código de verificación numérico
     * @param {number} length - Longitud del código (default: 6)
     * @returns {string} Código numérico
     */
    static generateVerificationCode(length = 6) {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }

    /**
     * Genera un token JWT de acceso
     * @param {Object} payload - Datos a incluir en el token
     * @param {string} [expiresIn] - Tiempo de expiración (default: from env)
     * @returns {string} Token JWT
     */
    static generateAccessToken(payload, expiresIn = process.env.JWT_EXPIRE) {
        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn,
                issuer: process.env.NEXT_PUBLIC_APP_NAME || 'LoginSystem',
                audience: 'web'
            }
        );
    }

    /**
     * Genera un token JWT de refresco
     * @param {Object} payload - Datos a incluir en el token
     * @param {string} [expiresIn] - Tiempo de expiración (default: from env)
     * @returns {string} Token JWT de refresco
     */
    static generateRefreshToken(payload, expiresIn = process.env.JWT_REFRESH_EXPIRE) {
        return jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn,
                issuer: process.env.NEXT_PUBLIC_APP_NAME || 'LoginSystem',
                audience: 'refresh'
            }
        );
    }

    /**
     * Verifica un token JWT de acceso
     * @param {string} token - Token a verificar
     * @returns {Object|null} Payload decodificado o null si es inválido
     */
    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET, {
                issuer: process.env.NEXT_PUBLIC_APP_NAME || 'LoginSystem',
                audience: 'web'
            });
        } catch (error) {
            console.error('Error verificando access token:', error.message);
            return null;
        }
    }

    /**
     * Verifica un token JWT de refresco
     * @param {string} token - Token a verificar
     * @returns {Object|null} Payload decodificado o null si es inválido
     */
    static verifyRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
                issuer: process.env.NEXT_PUBLIC_APP_NAME || 'LoginSystem',
                audience: 'refresh'
            });
        } catch (error) {
            console.error('Error verificando refresh token:', error.message);
            return null;
        }
    }

    /**
     * Decodifica un token JWT sin verificar la firma
     * @param {string} token - Token a decodificar
     * @returns {Object|null} Payload decodificado o null si es inválido
     */
    static decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            console.error('Error decodificando token:', error.message);
            return null;
        }
    }

    /**
     * Genera un hash SHA256
     * @param {string} data - Datos a hashear
     * @returns {string} Hash hexadecimal
     */
    static generateHash(data) {
        return crypto
            .createHash('sha256')
            .update(data)
            .digest('hex');
    }

    /**
     * Genera un token CSRF
     * @returns {string} Token CSRF
     */
    static generateCSRFToken() {
        return this.generateRandomToken(24);
    }

    /**
     * Genera un ID de sesión único
     * @returns {string} ID de sesión
     */
    static generateSessionId() {
        const timestamp = Date.now().toString(36);
        const randomPart = this.generateRandomToken(16);
        return `${timestamp}-${randomPart}`;
    }

    /**
     * Genera un token temporal con expiración
     * @param {number} expiresInMinutes - Minutos hasta expiración (default: 60)
     * @returns {Object} Token y fecha de expiración
     */
    static generateTemporaryToken(expiresInMinutes = 60) {
        const token = this.generateRandomToken();
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
        
        return {
            token,
            expiresAt,
            expiresInMinutes
        };
    }

    /**
     * Valida si un token temporal ha expirado
     * @param {Date} expiresAt - Fecha de expiración
     * @returns {boolean} True si ha expirado
     */
    static isTokenExpired(expiresAt) {
        return new Date() > new Date(expiresAt);
    }

    /**
     * Genera un API Key seguro
     * @param {string} prefix - Prefijo para el API key (default: 'sk')
     * @returns {string} API Key formateado
     */
    static generateApiKey(prefix = 'sk') {
        const key = this.generateRandomToken(32);
        return `${prefix}_${key}`;
    }

    /**
     * Ofusca un token para logs (muestra solo inicio y fin)
     * @param {string} token - Token a ofuscar
     * @param {number} visibleChars - Caracteres visibles al inicio y fin (default: 4)
     * @returns {string} Token ofuscado
     */
    static obfuscateToken(token, visibleChars = 4) {
        if (!token || token.length <= visibleChars * 2) {
            return '***';
        }
        
        const start = token.substring(0, visibleChars);
        const end = token.substring(token.length - visibleChars);
        return `${start}...${end}`;
    }

    /**
     * Genera un nonce para CSP (Content Security Policy)
     * @returns {string} Nonce en base64
     */
    static generateNonce() {
        return crypto.randomBytes(16).toString('base64');
    }

    /**
     * Compara dos tokens de forma segura (timing-safe)
     * @param {string} token1 - Primer token
     * @param {string} token2 - Segundo token
     * @returns {boolean} True si son iguales
     */
    static secureCompare(token1, token2) {
        if (!token1 || !token2 || token1.length !== token2.length) {
            return false;
        }
        
        const buffer1 = Buffer.from(token1);
        const buffer2 = Buffer.from(token2);
        
        return crypto.timingSafeEqual(buffer1, buffer2);
    }

    /**
     * Genera un token de invitación con metadatos
     * @param {Object} metadata - Metadatos a incluir
     * @param {number} expiresInDays - Días hasta expiración (default: 7)
     * @returns {string} Token de invitación codificado
     */
    static generateInvitationToken(metadata, expiresInDays = 7) {
        const token = this.generateRandomToken(24);
        const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
        
        const payload = {
            token,
            metadata,
            expiresAt: expiresAt.toISOString(),
            createdAt: new Date().toISOString()
        };
        
        return Buffer.from(JSON.stringify(payload)).toString('base64url');
    }

    /**
     * Decodifica un token de invitación
     * @param {string} invitationToken - Token codificado
     * @returns {Object|null} Payload decodificado o null si es inválido
     */
    static decodeInvitationToken(invitationToken) {
        try {
            const decoded = Buffer.from(invitationToken, 'base64url').toString();
            const payload = JSON.parse(decoded);
            
            if (this.isTokenExpired(payload.expiresAt)) {
                return null;
            }
            
            return payload;
        } catch (error) {
            console.error('Error decodificando token de invitación:', error.message);
            return null;
        }
    }
}

module.exports = TokenGenerator;