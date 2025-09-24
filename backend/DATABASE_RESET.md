# Reseteo de Base de Datos - Repuestos Victoria

Este directorio contiene varios scripts para resetear completamente la base de datos.

## ⚠️ ADVERTENCIA
**Estos scripts eliminarán TODOS los datos de la base de datos. Usa con precaución.**

## Opciones disponibles

### 1. Script SQL simple
```bash
mysql -u root -p repuestos_victoria < reset_database.sql
mysql -u root -p repuestos_victoria < repuestos.sql
```

### 2. Script Node.js automatizado
```bash
node reset_and_restore.js
```

### 3. Script Bash (Linux/Mac)
```bash
chmod +x reset_db.sh
./reset_db.sh [database_name] [username] [password]
```

### 4. Windows (PowerShell/CMD)
```cmd
mysql -u root -p repuestos_victoria < reset_database.sql && mysql -u root -p repuestos_victoria < repuestos.sql
```

## Variables de entorno para Node.js

Asegúrate de tener configuradas las variables de entorno:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=repuestos_victoria
```

## ¿Qué hace cada script?

### `reset_database.sql`
- Desactiva verificaciones de claves foráneas
- Elimina todas las tablas en orden correcto
- Reactiva verificaciones de claves foráneas

### `reset_and_restore.js`
- Se conecta a la base de datos usando variables de entorno
- Elimina todas las tablas
- Lee y ejecuta `repuestos.sql` automáticamente
- Maneja errores y conexiones

### `reset_db.sh`
- Script bash interactivo
- Solicita confirmación antes de ejecutar
- Ejecuta ambos archivos SQL en secuencia
- Muestra progreso y errores

## Después del reset

La base de datos quedará con:
- ✅ Estructura completa recreada
- ✅ Roles básicos del sistema
- ✅ Tipos de comprobantes
- ✅ **SIN** datos de usuarios, productos o ventas
- ✅ **SIN** datos de prueba

## Uso recomendado

1. **Desarrollo**: Usa `reset_and_restore.js` para rapidez
2. **Producción**: **NUNCA** ejecutes estos scripts
3. **Testing**: Úsalo antes de cargar datos de prueba

## Backup antes del reset

Siempre haz backup antes:
```bash
mysqldump -u root -p repuestos_victoria > backup_$(date +%Y%m%d_%H%M%S).sql
```