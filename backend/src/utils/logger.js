/**
 * Utilidad de logging condicional por entorno
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Logger condicional que solo muestra logs en desarrollo
 */
const logger = {
  // Logs de desarrollo (solo en development)
  dev: {
    log: (...args) => {
      if (isDevelopment) {
        console.log(...args);
      }
    },
    info: (...args) => {
      if (isDevelopment) {
        console.info(...args);
      }
    },
    warn: (...args) => {
      if (isDevelopment) {
        console.warn(...args);
      }
    },
    error: (...args) => {
      if (isDevelopment) {
        console.error(...args);
      }
    }
  },

  // Logs de producción (solo en production)
  prod: {
    log: (...args) => {
      if (isProduction) {
        console.log(...args);
      }
    },
    info: (...args) => {
      if (isProduction) {
        console.info(...args);
      }
    },
    warn: (...args) => {
      if (isProduction) {
        console.warn(...args);
      }
    },
    error: (...args) => {
      if (isProduction) {
        console.error(...args);
      }
    }
  },

  // Logs siempre (para errores importantes)
  always: {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  },

  // Logs de seguridad (siempre se muestran)
  security: {
    log: (...args) => console.log('🔒 [SECURITY]', ...args),
    warn: (...args) => console.warn('⚠️ [SECURITY]', ...args),
    error: (...args) => console.error('🚨 [SECURITY]', ...args)
  },

  // Logs de auditoría (siempre se muestran)
  audit: {
    log: (...args) => console.log('📋 [AUDIT]', ...args),
    info: (...args) => console.info('📋 [AUDIT]', ...args),
    warn: (...args) => console.warn('📋 [AUDIT]', ...args),
    error: (...args) => console.error('📋 [AUDIT]', ...args)
  }
};

module.exports = logger;