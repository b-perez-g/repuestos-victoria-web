CREATE DATABASE repuestos_victoria_db;

USE repuestos_victoria_db;

-- 1. Roles de usuario
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Usuarios del sistema
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    correo VARCHAR(255) UNIQUE NOT NULL,
    nombre_usuario VARCHAR(100) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    id_rol INT,
    activo BOOLEAN DEFAULT TRUE,
    verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    token_restablecer VARCHAR(255),
    expira_restablecer TIMESTAMP NULL,
    intentos_fallidos INT DEFAULT 0,
    bloqueado_hasta TIMESTAMP NULL,
    ultimo_ingreso TIMESTAMP NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles(id)
);
CREATE INDEX idx_correo ON usuarios(correo);
CREATE INDEX idx_token_restablecer ON usuarios(token_restablecer);
CREATE INDEX idx_token_verificacion ON usuarios(token_verificacion);

-- 3. Tokens de refresco
CREATE TABLE tokens_refresco (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(500) NOT NULL,
    id_usuario INT NOT NULL,
    expira_en TIMESTAMP NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario (id_usuario)
);

-- 4. Sesiones activas
CREATE TABLE sesiones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    token_sesion VARCHAR(500) NOT NULL UNIQUE,
    ip VARCHAR(45),
    agente_usuario TEXT,
    persistente BOOLEAN DEFAULT FALSE,
    expira_en TIMESTAMP NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token_sesion (token_sesion),
    INDEX idx_usuario (id_usuario)
);

-- 5. Logs de auditoría
CREATE TABLE logs_auditoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    accion VARCHAR(100) NOT NULL,
    ip VARCHAR(45),
    agente_usuario TEXT,
    exito BOOLEAN DEFAULT TRUE,
    mensaje_error TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (id_usuario),
    INDEX idx_creado_en (creado_en)
);

-- Roles iniciales
INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador con acceso total'),
('moderador', 'Moderador con permisos limitados'),
('usuario', 'Usuario regular');

-- 6. Direcciones de envío
CREATE TABLE direcciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    calle VARCHAR(100) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    comuna VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    casa_depto VARCHAR(50),
    descripcion TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- 7. Categorías de productos
CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- 8. Marcas
CREATE TABLE marcas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
);

-- 9. Modelos de vehículos
CREATE TABLE modelos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_marca INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_marca) REFERENCES marcas(id)
);

-- 10. Productos
CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_categoria INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    imagen_url VARCHAR(255),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id)
);

-- 11. Compatibilidad producto-modelo
CREATE TABLE compatibilidad (
    id_producto INT NOT NULL,
    id_modelo INT NOT NULL,
    anio_inicio INT,
    anio_fin INT,
    PRIMARY KEY (id_producto, id_modelo),
    FOREIGN KEY (id_producto) REFERENCES productos(id),
    FOREIGN KEY (id_modelo) REFERENCES modelos(id)
);

-- 12. Carrito de compras
CREATE TABLE carrito (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo','confirmado') DEFAULT 'activo',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- 13. Detalle del carrito
CREATE TABLE carrito_detalle (
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    PRIMARY KEY (id_carrito, id_producto),
    FOREIGN KEY (id_carrito) REFERENCES carrito(id),
    FOREIGN KEY (id_producto) REFERENCES productos(id)
);

-- 14. Pedidos
CREATE TABLE pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_direccion INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente','pagado','enviado','entregado','cancelado') DEFAULT 'pendiente',
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_direccion) REFERENCES direcciones(id)
);

-- 15. Detalle de pedido
CREATE TABLE pedido_detalle (
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_pedido, id_producto),
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id),
    FOREIGN KEY (id_producto) REFERENCES productos(id)
);

-- 16. Pagos
CREATE TABLE pagos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    metodo ENUM('tarjeta','transferencia','paypal','mercadopago') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id)
);

-- 17. Envíos
CREATE TABLE envios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    empresa VARCHAR(100),
    numero_seguimiento VARCHAR(100),
    fecha_envio DATETIME,
    fecha_entrega DATETIME,
    estado ENUM('pendiente','enviado','entregado') DEFAULT 'pendiente',
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id)
);

-- 18. Tipos de comprobante
CREATE TABLE tipos_comprobante (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre ENUM('boleta','factura') NOT NULL,
    descripcion TEXT
);

-- 19. Comprobantes
CREATE TABLE comprobantes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_tipo INT NOT NULL,
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    rut_cliente VARCHAR(20),
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('emitido','anulado') DEFAULT 'emitido',
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id),
    FOREIGN KEY (id_tipo) REFERENCES tipos_comprobante(id)
);

-- 20. Devoluciones
CREATE TABLE devoluciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    motivo TEXT,
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente','aprobado','rechazado','completado') DEFAULT 'pendiente',
    fecha_resolucion DATETIME,
    tipo_reembolso ENUM('credito_tienda','devolucion_efectivo','cambio_producto'),
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id),
    FOREIGN KEY (id_producto) REFERENCES productos(id)
);

-- 21. Historial de estados
CREATE TABLE historial_estados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM('pedido','devolucion') NOT NULL,
    id_tipo INT NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT
);
