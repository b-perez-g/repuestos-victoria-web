const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

/**
 * Sistema avanzado de Rate Limiting con bloqueo progresivo
 * y detección de patrones sospechosos
 */
class AdvancedRateLimiter {
    constructor() {
        // Almacén de intentos fallidos (en producción usar Redis)
        this.failedAttempts = new Map();
        this.suspiciousIPs = new Set();
        this.blockedIPs = new Map();

        // Limpiar datos expirados cada 30 minutos
        setInterval(() => {
            this.cleanExpiredData();
        }, 30 * 60 * 1000);
    }

    /**
     * Calcula tiempo de bloqueo progresivo
     */
    calculateBlockTime(attemptCount) {
        // Progresión: 1min, 5min, 15min, 1hr, 24hr
        const blockTimes = [
            1 * 60 * 1000,      // 1 minuto
            5 * 60 * 1000,      // 5 minutos
            15 * 60 * 1000,     // 15 minutos
            60 * 60 * 1000,     // 1 hora
            24 * 60 * 60 * 1000 // 24 horas
        ];

        const index = Math.min(attemptCount - 1, blockTimes.length - 1);
        return blockTimes[index];
    }

    /**
     * Registra intento fallido
     */
    recordFailedAttempt(ip, email = null) {
        const key = `${ip}:${email || 'unknown'}`;
        const now = Date.now();

        if (!this.failedAttempts.has(key)) {
            this.failedAttempts.set(key, {
                count: 0,
                firstAttempt: now,
                lastAttempt: now,
                blocked: false
            });
        }

        const record = this.failedAttempts.get(key);
        record.count++;
        record.lastAttempt = now;

        // Bloquear después de 5 intentos
        if (record.count >= 5) {
            const blockTime = this.calculateBlockTime(record.count - 4);
            record.blocked = true;
            record.blockedUntil = now + blockTime;

            // Agregar IP a lista sospechosa
            this.suspiciousIPs.add(ip);

            console.log(`🚫 IP ${ip} bloqueada por ${blockTime/1000/60} minutos (intento ${record.count})`);
        }

        return record;
    }

    /**
     * Verifica si IP/email está bloqueado
     */
    isBlocked(ip, email = null) {
        const key = `${ip}:${email || 'unknown'}`;
        const record = this.failedAttempts.get(key);

        if (!record || !record.blocked) {
            return false;
        }

        // Verificar si el bloqueo ha expirado
        if (Date.now() > record.blockedUntil) {
            record.blocked = false;
            record.blockedUntil = null;
            return false;
        }

        return {
            blocked: true,
            remainingTime: record.blockedUntil - Date.now(),
            attemptCount: record.count
        };
    }

    /**
     * Resetea intentos fallidos (login exitoso)
     */
    resetFailedAttempts(ip, email = null) {
        const key = `${ip}:${email || 'unknown'}`;
        this.failedAttempts.delete(key);
    }

    /**
     * Detecta patrones sospechosos
     */
    detectSuspiciousActivity(ip, userAgent, email) {
        const now = Date.now();
        const window = 10 * 60 * 1000; // 10 minutos

        // Contar intentos recientes de esta IP
        let recentAttempts = 0;
        for (const [key, record] of this.failedAttempts.entries()) {
            if (key.startsWith(ip) && (now - record.lastAttempt) < window) {
                recentAttempts++;
            }
        }

        // Patrones sospechosos:
        const isSuspicious =
            recentAttempts > 10 || // Muchos intentos recientes
            this.suspiciousIPs.has(ip) || // IP previamente marcada
            this.isCommonBotUserAgent(userAgent) || // User-agent de bot
            this.isDisposableEmail(email); // Email desechable

        if (isSuspicious) {
            this.suspiciousIPs.add(ip);
            console.log(`⚠️ Actividad sospechosa detectada: IP ${ip}, Email: ${email}`);
        }

        return isSuspicious;
    }

    /**
     * Verifica user-agents comunes de bots
     */
    isCommonBotUserAgent(userAgent) {
        if (!userAgent) return true;

        const botPatterns = [
            /bot/i, /crawler/i, /spider/i, /scraper/i,
            /curl/i, /wget/i, /python/i, /requests/i
        ];

        return botPatterns.some(pattern => pattern.test(userAgent));
    }

    /**
     * Verifica dominios de email desechables
     */
    isDisposableEmail(email) {
        if (!email) return false;

        const disposableDomains = [
            '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
            'mailinator.com', 'throwaway.email', 'temp-mail.org'
        ];

        const domain = email.split('@')[1]?.toLowerCase();
        return disposableDomains.includes(domain);
    }

    /**
     * Limpia datos expirados
     */
    cleanExpiredData() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas

        for (const [key, record] of this.failedAttempts.entries()) {
            if (now - record.lastAttempt > maxAge) {
                this.failedAttempts.delete(key);
            }
        }

        console.log(`🧹 Limpieza completada: ${this.failedAttempts.size} registros activos`);
    }
}

// Instancia singleton
const advancedLimiter = new AdvancedRateLimiter();

// Limiter general mejorado
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    limit: parseInt(process.env.RATE_LIMIT_MAX || 100),
    message: {
        success: false,
        message: 'Demasiadas solicitudes, por favor intenta más tarde',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.log(`🚫 Rate limit excedido: IP ${req.ip}, Path: ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Demasiadas solicitudes, por favor intenta más tarde',
            code: 'RATE_LIMIT_EXCEEDED'
        });
    }
});

// Rate limiter estándar para login
const standardLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: {
        success: false,
        message: 'Demasiados intentos de login, por favor intenta más tarde',
        code: 'LOGIN_RATE_LIMIT_EXCEEDED'
    },
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        advancedLimiter.recordFailedAttempt(req.ip, req.body.email);
        res.status(429).json({
            success: false,
            message: 'Demasiados intentos de login, por favor intenta más tarde',
            code: 'LOGIN_RATE_LIMIT_EXCEEDED'
        });
    }
});

// Limiter avanzado para login
const loginLimiter = (req, res, next) => {
    const ip = req.ip;
    const email = req.body.email;
    const userAgent = req.get('user-agent');

    // Verificar si está bloqueado
    const blockStatus = advancedLimiter.isBlocked(ip, email);
    if (blockStatus) {
        const minutes = Math.ceil(blockStatus.remainingTime / (1000 * 60));
        return res.status(429).json({
            success: false,
            message: `Cuenta temporalmente bloqueada. Intenta en ${minutes} minutos.`,
            code: 'ACCOUNT_TEMPORARILY_BLOCKED',
            remainingTime: blockStatus.remainingTime,
            attemptCount: blockStatus.attemptCount
        });
    }

    // Detectar actividad sospechosa
    const isSuspicious = advancedLimiter.detectSuspiciousActivity(ip, userAgent, email);
    if (isSuspicious) {
        req.suspiciousActivity = true;
    }

    // Continuar con rate limiter estándar
    standardLoginLimiter(req, res, next);
};

// Limiter para recuperación de contraseña
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    message: {
        success: false,
        message: 'Demasiadas solicitudes de recuperación, por favor intenta más tarde',
        code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Limiter estricto para registro
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    limit: 5,
    message: {
        success: false,
        message: 'Demasiados registros desde esta IP, intenta más tarde',
        code: 'REGISTER_RATE_LIMIT_EXCEEDED'
    }
});

// Middleware para manejar intentos fallidos
const handleFailedLogin = (req, res, next) => {
    const originalSend = res.send;

    res.send = function(data) {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

        if (parsedData && !parsedData.success && req.body.email) {
            advancedLimiter.recordFailedAttempt(req.ip, req.body.email);
        } else if (parsedData && parsedData.success && req.body.email) {
            advancedLimiter.resetFailedAttempts(req.ip, req.body.email);
        }

        originalSend.call(this, data);
    };

    next();
};

module.exports = {
    generalLimiter,
    loginLimiter,
    passwordResetLimiter,
    registerLimiter,
    handleFailedLogin,
    advancedLimiter
};