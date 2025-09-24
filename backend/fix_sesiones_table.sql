-- ========================================
-- SCRIPT DE ACTUALIZACIÓN DE TABLA SESIONES
-- Repuestos Victoria - Sistema de Login
-- ========================================

-- Usar la base de datos correcta
USE repuestos_victoria_db;

-- ========================================
-- 1. VERIFICAR ESTRUCTURA ACTUAL
-- ========================================
SELECT 'Verificando estructura actual de tabla sesiones...' AS mensaje;
DESCRIBE sesiones;

-- ========================================
-- 2. AGREGAR COLUMNA ULTIMA_ACTIVIDAD
-- ========================================
SELECT 'Agregando columna ultima_actividad...' AS mensaje;

-- Agregar columna ultima_actividad si no existe
SET @sql = CONCAT(
    'ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER expira_en'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 3. INICIALIZAR DATOS EXISTENTES
-- ========================================
SELECT 'Inicializando datos existentes...' AS mensaje;

-- Actualizar registros existentes para que tengan una fecha de última actividad
UPDATE sesiones
SET ultima_actividad = COALESCE(actualizado_en, creado_en, NOW())
WHERE ultima_actividad IS NULL;

-- ========================================
-- 4. OPTIMIZAR ÍNDICES
-- ========================================
SELECT 'Creando índices optimizados...' AS mensaje;

-- Índice compuesto para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_token_expira
ON sesiones(id_usuario, token_sesion(100), expira_en);

-- Índice para última actividad
CREATE INDEX IF NOT EXISTS idx_sesiones_ultima_actividad
ON sesiones(ultima_actividad);

-- Índice para limpieza de sesiones inactivas
CREATE INDEX IF NOT EXISTS idx_sesiones_expira_actividad
ON sesiones(expira_en, ultima_actividad);

-- ========================================
-- 5. PROCEDIMIENTOS DE MANTENIMIENTO
-- ========================================
SELECT 'Creando procedimientos de mantenimiento...' AS mensaje;

DELIMITER //

-- Procedimiento para limpiar sesiones inactivas
DROP PROCEDURE IF EXISTS LimpiarSesionesInactivas//
CREATE PROCEDURE LimpiarSesionesInactivas(
    IN minutos_inactividad INT DEFAULT 60
)
BEGIN
    DECLARE sesiones_eliminadas INT DEFAULT 0;

    -- Limpiar sesiones expiradas por tiempo
    DELETE FROM sesiones WHERE expira_en < NOW();
    SET sesiones_eliminadas = ROW_COUNT();

    -- Limpiar sesiones inactivas (más de X minutos sin actividad)
    DELETE FROM sesiones
    WHERE ultima_actividad < DATE_SUB(NOW(), INTERVAL minutos_inactividad MINUTE)
    AND expira_en > NOW(); -- Solo si no han expirado por tiempo

    SET sesiones_eliminadas = sesiones_eliminadas + ROW_COUNT();

    SELECT CONCAT('Sesiones eliminadas: ', sesiones_eliminadas) AS resultado;
END//

-- Procedimiento para obtener estadísticas de sesiones
DROP PROCEDURE IF EXISTS EstadisticasSesiones//
CREATE PROCEDURE EstadisticasSesiones()
BEGIN
    SELECT
        COUNT(*) as total_sesiones,
        COUNT(CASE WHEN expira_en > NOW() THEN 1 END) as sesiones_activas,
        COUNT(CASE WHEN expira_en <= NOW() THEN 1 END) as sesiones_expiradas,
        COUNT(CASE WHEN persistente = 1 THEN 1 END) as sesiones_persistentes,
        COUNT(CASE WHEN persistente = 0 THEN 1 END) as sesiones_temporales,
        COUNT(CASE WHEN ultima_actividad > DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 1 END) as activas_ultima_hora,
        COUNT(CASE WHEN ultima_actividad > DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 END) as activas_ultimo_dia
    FROM sesiones;

    -- Top 5 usuarios con más sesiones activas
    SELECT
        u.correo,
        u.nombres,
        COUNT(*) as sesiones_activas,
        MAX(s.ultima_actividad) as ultima_actividad
    FROM sesiones s
    JOIN usuarios u ON s.id_usuario = u.id
    WHERE s.expira_en > NOW()
    GROUP BY s.id_usuario, u.correo, u.nombres
    ORDER BY sesiones_activas DESC, ultima_actividad DESC
    LIMIT 5;
END//

DELIMITER ;

-- ========================================
-- 6. EVENTO AUTOMÁTICO DE LIMPIEZA
-- ========================================
SELECT 'Configurando limpieza automática...' AS mensaje;

-- Habilitar el programador de eventos
SET GLOBAL event_scheduler = ON;

-- Crear evento de limpieza automática cada 30 minutos
DROP EVENT IF EXISTS ev_limpiar_sesiones_inactivas;

CREATE EVENT ev_limpiar_sesiones_inactivas
ON SCHEDULE EVERY 30 MINUTE
STARTS CURRENT_TIMESTAMP
DO
CALL LimpiarSesionesInactivas(120); -- 2 horas de inactividad

-- ========================================
-- 7. VERIFICACIÓN FINAL
-- ========================================
SELECT 'Verificando estructura actualizada...' AS mensaje;
DESCRIBE sesiones;

SELECT 'Verificando índices creados...' AS mensaje;
SHOW INDEX FROM sesiones;

-- Mostrar estadísticas actuales
CALL EstadisticasSesiones();

-- ========================================
-- 8. INSTRUCCIONES FINALES
-- ========================================
SELECT '========================================' AS mensaje;
SELECT 'ACTUALIZACIÓN COMPLETADA EXITOSAMENTE' AS mensaje;
SELECT '========================================' AS mensaje;
SELECT 'La tabla sesiones ahora incluye:' AS mensaje;
SELECT '- Columna ultima_actividad' AS mensaje;
SELECT '- Índices optimizados para rendimiento' AS mensaje;
SELECT '- Procedimientos de mantenimiento' AS mensaje;
SELECT '- Limpieza automática cada 30 minutos' AS mensaje;
SELECT '========================================' AS mensaje;
SELECT 'Comandos útiles:' AS mensaje;
SELECT 'CALL EstadisticasSesiones(); -- Ver estadísticas' AS mensaje;
SELECT 'CALL LimpiarSesionesInactivas(60); -- Limpiar sesiones inactivas de 60 min' AS mensaje;
SELECT '========================================' AS mensaje;