# 🔧 Instrucciones para Actualización de Base de Datos

## 📋 Resumen
Para que el sistema funcione completamente, necesitas ejecutar el script SQL que agrega la columna `ultima_actividad` a la tabla `sesiones`.

## 🚀 Pasos a seguir

### 1. Ejecutar el Script SQL

Ejecuta el archivo `fix_sesiones_table.sql` en tu base de datos MySQL/MariaDB:

```bash
# Opción A: Desde línea de comandos
mysql -u root -p repuestos_victoria_db < backend/fix_sesiones_table.sql

# Opción B: Desde phpMyAdmin o HeidiSQL
# - Abre el archivo fix_sesiones_table.sql
# - Copia y pega el contenido
# - Ejecuta el script
```

### 2. Verificar la Actualización

Después de ejecutar el script, verifica que todo esté correcto:

```sql
-- Verificar la nueva columna
DESCRIBE sesiones;

-- Ver estadísticas de sesiones
CALL EstadisticasSesiones();
```

## ✅ Lo que hace el script

### Cambios en la tabla `sesiones`:
- ✅ Agrega columna `ultima_actividad`
- ✅ Inicializa datos existentes
- ✅ Crea índices optimizados

### Mejoras de rendimiento:
- 🚀 Índices compuestos para consultas rápidas
- 🧹 Limpieza automática de sesiones inactivas
- 📊 Procedimientos de estadísticas

### Funcionalidades nuevas:
- ⏰ Tracking de última actividad de usuario
- 🗑️ Limpieza automática cada 30 minutos
- 📈 Monitoreo de sesiones activas

## 🔍 Comandos útiles post-instalación

```sql
-- Ver estadísticas detalladas
CALL EstadisticasSesiones();

-- Limpiar sesiones inactivas de 2 horas
CALL LimpiarSesionesInactivas(120);

-- Ver estructura actualizada
DESCRIBE sesiones;

-- Ver índices creados
SHOW INDEX FROM sesiones;
```

## ⚠️ Importante

1. **Backup**: Haz un backup de tu BD antes de ejecutar el script
2. **Testing**: Prueba en desarrollo antes de producción
3. **Permisos**: Asegúrate de tener permisos para ALTER TABLE

## 🐛 Solución de problemas

### Si el script falla:
1. Verifica permisos de usuario MySQL
2. Verifica que la BD `repuestos_victoria_db` exista
3. Ejecuta línea por línea si hay errores

### Si el backend sigue con errores:
1. Reinicia el servidor backend
2. Verifica logs del servidor
3. Confirma que la columna se creó: `DESCRIBE sesiones;`

## 📁 Archivos modificados

- ✅ `backend/fix_sesiones_table.sql` - Script de actualización
- ✅ `backend/src/controllers/authController.js` - Código actualizado
- ✅ `backend/database_updates.sql` - Script existente (opcional)

## 🎯 Resultado esperado

Después de la actualización:
- ❌ No más errores `Unknown column 'ultima_actividad'`
- ✅ Login y autenticación funcionando perfectamente
- ✅ Tracking de actividad de usuarios
- ✅ Limpieza automática de sesiones
- ✅ Mejor rendimiento en consultas de sesiones

---

**💡 Tip**: Una vez ejecutado el script, el sistema estará completamente funcional y optimizado.