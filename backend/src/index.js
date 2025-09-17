const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Importar configuración y rutas
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { generalLimiter } = require('./middleware/rateLimiter');

// Crear aplicación Express
const app = express();

// Configuración de seguridad con Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: !process.env.NODE_ENV === 'development',
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Configuración CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (como Postman o aplicaciones móviles)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.FRONTEND_URL
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['set-cookie'],
    maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// Middleware de registro (logging)
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Middleware para comprimir respuestas
app.use(compression());

// Middleware para parsear JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para parsear cookies
app.use(cookieParser());

// Trust proxy (necesario si está detrás de un proxy/load balancer)
app.set('trust proxy', 1);

// Rate limiting general
app.use('/api/', generalLimiter);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Ruta de salud/status
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Ruta de información de la API
app.get('/api/info', (req, res) => {
    res.json({
        name: process.env.NEXT_PUBLIC_APP_NAME || 'Secure Login System API',
        version: '1.0.0',
        description: 'API REST segura para sistema de autenticación',
        documentation: '/api/docs',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                refreshToken: 'POST /api/auth/refresh-token',
                forgotPassword: 'POST /api/auth/forgot-password',
                resetPassword: 'POST /api/auth/reset-password',
                verifyEmail: 'GET /api/auth/verify-email/:token'
            },
            users: {
                profile: 'GET /api/users/profile',
                updateProfile: 'PUT /api/users/profile',
                changePassword: 'POST /api/users/change-password',
                getAllUsers: 'GET /api/users/users (Admin)',
                dashboardStats: 'GET /api/users/dashboard-stats'
            }
        }
    });
});

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../public')));
}

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path,
        method: req.method
    });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    // Log del error
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    // Error de CORS
    if (err.message === 'No permitido por CORS') {
        return res.status(403).json({
            success: false,
            message: 'Acceso no permitido desde este origen'
        });
    }

    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: err.errors
        });
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }

    // Error de JWT expirado
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expirado'
        });
    }

    // Error por defecto
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Error interno del servidor' 
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Puerto de escucha
const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor
const startServer = async () => {
    try {
        // Verificar conexión a la base de datos
        await testConnection();
        
        // Iniciar servidor
        const server = app.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`📝 Entorno: ${process.env.NODE_ENV}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📚 API info: http://localhost:${PORT}/api/info`);
            console.log('=================================');
        });

        // Configurar timeout
        server.timeout = 30000; // 30 segundos

        // Manejo de señales para graceful shutdown
        const gracefulShutdown = (signal) => {
            console.log(`\n${signal} recibido. Cerrando servidor gracefully...`);
            
            server.close(() => {
                console.log('Servidor HTTP cerrado');
                process.exit(0);
            });

            // Forzar cierre después de 10 segundos
            setTimeout(() => {
                console.error('Forzando cierre del servidor');
                process.exit(1);
            }, 10000);
        };

        // Escuchar señales de terminación
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Manejo de errores no capturados
        process.on('uncaughtException', (error) => {
            console.error('Excepción no capturada:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Rechazo no manejado en:', promise, 'razón:', reason);
            // No cerrar el servidor en este caso, solo registrar
        });

    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
};

// Iniciar el servidor
startServer();

// Exportar app para testing
module.exports = app;