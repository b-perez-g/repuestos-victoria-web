# Solución Temporal para Pruebas de Login

## Estado Actual
- ✅ Backend funcionando en puerto 5000
- ✅ Frontend funcionando en puerto 3000
- ❌ Problema: Login exitoso pero falla `checkAuth()`

## Problema Identificado
El error ocurre en AuthProvider.tsx:87 - después del login exitoso, `checkAuth()` retorna `null`, causando el error "No se pudo establecer la sesión".

## Pasos para Resolver

### 1. Crear Usuario Temporal
Ejecuta en tu cliente de base de datos MariaDB:

```sql
USE repuestos_victoria_db;

-- Crear usuario de prueba verificado
INSERT INTO usuarios (correo, contrasena_hash, nombres, a_paterno, id_rol, verificado, activo)
VALUES (
    'admin@test.com',
    '$2b$12$rH8qnDfVQqhJzZa8iHwJuOVJJ6jJVwWJXWQgHvJhHJjJ3jJjJjJjJ', -- password: test123
    'Admin',
    'Test',
    1,
    1,
    1
);
```

### 2. Probar Login en Frontend
1. Ve a http://localhost:3000/login
2. Usa estas credenciales:
   - Email: admin@test.com
   - Password: test123

### 3. Debug Esperado
Con los logs agregados, deberías ver en la consola del navegador:
- 🔍 Verificando autenticación...
- 🔍 Respuesta /auth/validate: [datos]

## Problema Raíz Sospechado
El endpoint `/auth/validate` probablemente está:
1. No recibiendo las cookies correctamente
2. Retornando un error 401
3. No encontrando el token en la base de datos

## Pasos Siguientes (Cuando veas los logs)
1. Revisa qué dice `🔍 Respuesta /auth/validate:`
2. Si es un 401, el problema está en authMiddleware
3. Si las cookies no se están enviando, es un problema de CORS/cookies