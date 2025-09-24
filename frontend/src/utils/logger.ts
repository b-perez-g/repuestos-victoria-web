/**
 * Utilidad de logging condicional por entorno - Frontend
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Logger condicional que solo muestra logs según el entorno
 */
export const logger = {
  // Logs de desarrollo (solo en development)
  dev: {
    log: (...args: any[]) => {
      if (isDevelopment) {
        console.log(...args);
      }
    },
    info: (...args: any[]) => {
      if (isDevelopment) {
        console.info(...args);
      }
    },
    warn: (...args: any[]) => {
      if (isDevelopment) {
        console.warn(...args);
      }
    },
    error: (...args: any[]) => {
      if (isDevelopment) {
        console.error(...args);
      }
    }
  },

  // Logs de producción (solo errores críticos)
  prod: {
    log: (...args: any[]) => {
      if (isProduction) {
        console.log(...args);
      }
    },
    info: (...args: any[]) => {
      if (isProduction) {
        console.info(...args);
      }
    },
    warn: (...args: any[]) => {
      if (isProduction) {
        console.warn(...args);
      }
    },
    error: (...args: any[]) => {
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

  // Logs de autenticación
  auth: {
    log: (...args: any[]) => {
      if (isDevelopment) {
        console.log('🔐 [AUTH]', ...args);
      }
    },
    success: (...args: any[]) => {
      if (isDevelopment) {
        console.log('✅ [AUTH]', ...args);
      }
    },
    error: (...args: any[]) => {
      if (isDevelopment) {
        console.error('❌ [AUTH]', ...args);
      }
    }
  },

  // Logs de API
  api: {
    request: (method: string, url: string) => {
      if (isDevelopment) {
        console.log(`📤 [API] ${method.toUpperCase()} ${url}`);
      }
    },
    response: (status: number, method: string, url: string) => {
      if (isDevelopment) {
        console.log(`📥 [API] ${status} ${method.toUpperCase()} ${url}`);
      }
    },
    error: (status: number, method: string, url: string, error?: any) => {
      if (isDevelopment) {
        console.error(`❌ [API] ${status} ${method.toUpperCase()} ${url}`, error);
      }
    }
  }
};

export default logger;