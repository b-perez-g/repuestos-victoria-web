-- Actualización de la base de datos para mejorar la seguridad del sistema de login
-- Ejecutar estos comandos en tu base de datos MySQL

-- 1. Agregar campo ultima_actividad a la tabla sesiones si no existe
ALTER TABLE sesiones
ADD COLUMN IF NOT EXISTS ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Agregar índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_expira ON sesiones(id_usuario, expira_en);
CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones(token_sesion);
CREATE INDEX IF NOT EXISTS idx_tokens_refresco_usuario ON tokens_refresco(id_usuario);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_usuario_fecha ON logs_auditoria(id_usuario, creado_en);

-- 3. Crear tabla para blacklist de tokens (opcional)
CREATE TABLE IF NOT EXISTS tokens_blacklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expira_en TIMESTAMP NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_blacklist_hash (token_hash),
    INDEX idx_blacklist_expira (expira_en)
);

-- 4. Procedimiento para limpiar datos expirados
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS LimpiarDatosExpirados()
BEGIN
    -- Limpiar sesiones expiradas
    DELETE FROM sesiones WHERE expira_en < NOW();

    -- Limpiar tokens de refresco expirados
    DELETE FROM tokens_refresco WHERE expira_en < NOW();

    -- Limpiar logs de auditoría mayores a 90 días
    DELETE FROM logs_auditoria WHERE creado_en < DATE_SUB(NOW(), INTERVAL 90 DAY);

    -- Limpiar blacklist de tokens expirados
    DELETE FROM tokens_blacklist WHERE expira_en < NOW();

    SELECT 'Limpieza completada' as resultado;
END //
DELIMITER ;

-- 5. Configurar limpieza automática (evento)
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS ev_limpieza_automatica
ON SCHEDULE EVERY 1 HOUR
STARTS CURRENT_TIMESTAMP
DO
CALL LimpiarDatosExpirados();