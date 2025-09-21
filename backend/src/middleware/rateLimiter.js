//midleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Limiter general
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX),
    message: 'Demasiadas solicitudes, por favor intenta más tarde',
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter estricto para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, // 5 intentos
    message: 'Demasiados intentos de login, por favor intenta más tarde',
    skipSuccessfulRequests: true,
});

// Limiter para recuperación de contraseña
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: 'Demasiadas solicitudes de recuperación, por favor intenta más tarde',
});

module.exports = {
    generalLimiter,
    loginLimiter,
    passwordResetLimiter
};