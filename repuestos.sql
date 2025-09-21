-- --------------------------------------------------------
-- Base de datos completa para Repuestos Victoria
-- Sistema de autenticación y gestión de repuestos
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS `repuestos_victoria_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `repuestos_victoria_db`;

-- --------------------------------------------------------
-- Estructura de tabla para `roles`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Insertar roles por defecto
INSERT INTO `roles` (`id`, `nombre`, `descripcion`) VALUES
(1, 'admin', 'Administrador del sistema con acceso completo'),
(2, 'moderator', 'Moderador del sistema con permisos limitados'),
(3, 'cliente', 'Cliente del sistema con acceso básico');

-- --------------------------------------------------------
-- Estructura de tabla para `usuarios`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `correo` varchar(255) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `nombres` varchar(100) DEFAULT NULL,
  `a_paterno` varchar(100) DEFAULT NULL,
  `a_materno` varchar(100) DEFAULT NULL,
  `id_rol` int(11) DEFAULT 3,
  `activo` tinyint(1) DEFAULT 1,
  `verificado` tinyint(1) DEFAULT 0,
  `token_verificacion` varchar(255) DEFAULT NULL,
  `token_restablecer` varchar(255) DEFAULT NULL,
  `expira_restablecer` timestamp NULL DEFAULT NULL,
  `intentos_fallidos` int(11) DEFAULT 0,
  `bloqueado_hasta` timestamp NULL DEFAULT NULL,
  `ultimo_ingreso` timestamp NULL DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `id_rol` (`id_rol`),
  KEY `idx_correo` (`correo`),
  KEY `idx_token_restablecer` (`token_restablecer`),
  KEY `idx_token_verificacion` (`token_verificacion`),
  KEY `idx_verificado` (`verificado`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `tokens_refresco`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tokens_refresco` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(500) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `expira_en` timestamp NOT NULL,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_token` (`token`(100)),
  KEY `idx_usuario` (`id_usuario`),
  KEY `idx_expira` (`expira_en`),
  CONSTRAINT `tokens_refresco_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `sesiones`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sesiones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `token_sesion` varchar(500) NOT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `agente_usuario` text DEFAULT NULL,
  `persistente` tinyint(1) DEFAULT 0,
  `expira_en` timestamp NOT NULL,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_sesion` (`token_sesion`),
  KEY `idx_token_sesion` (`token_sesion`(100)),
  KEY `idx_usuario` (`id_usuario`),
  KEY `idx_expira` (`expira_en`),
  CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `logs_auditoria`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `logs_auditoria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `accion` varchar(100) NOT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `agente_usuario` text DEFAULT NULL,
  `exito` tinyint(1) DEFAULT 1,
  `mensaje_error` text DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`id_usuario`),
  KEY `idx_creado_en` (`creado_en`),
  KEY `idx_accion` (`accion`),
  CONSTRAINT `logs_auditoria_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `direcciones`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `direcciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `calle` varchar(100) NOT NULL,
  `numero` varchar(10) NOT NULL,
  `comuna` varchar(100) NOT NULL,
  `region` varchar(100) NOT NULL,
  `casa_depto` varchar(50) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `direcciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `categorias`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `orden` int(11) DEFAULT 0,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_activa` (`activa`),
  KEY `idx_orden` (`orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `marcas`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `marcas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_activa` (`activa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `modelos`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `modelos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_marca` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `anio_inicio` int(11) DEFAULT NULL,
  `anio_fin` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_marca` (`id_marca`),
  KEY `idx_activo` (`activo`),
  KEY `idx_anios` (`anio_inicio`, `anio_fin`),
  CONSTRAINT `modelos_ibfk_1` FOREIGN KEY (`id_marca`) REFERENCES `marcas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `productos`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `sku` varchar(50) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `galeria_imagenes` json DEFAULT NULL,
  `especificaciones` json DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `destacado` tinyint(1) DEFAULT 0,
  `peso` decimal(8,3) DEFAULT NULL,
  `dimensiones` varchar(100) DEFAULT NULL,
  `garantia_meses` int(11) DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `id_categoria` (`id_categoria`),
  KEY `idx_activo` (`activo`),
  KEY `idx_destacado` (`destacado`),
  KEY `idx_precio` (`precio`),
  KEY `idx_stock` (`stock`),
  FULLTEXT KEY `idx_busqueda` (`nombre`, `descripcion`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `compatibilidad`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `compatibilidad` (
  `id_producto` int(11) NOT NULL,
  `id_modelo` int(11) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_producto`,`id_modelo`),
  KEY `id_modelo` (`id_modelo`),
  CONSTRAINT `compatibilidad_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `compatibilidad_ibfk_2` FOREIGN KEY (`id_modelo`) REFERENCES `modelos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `carrito`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `carrito` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `actualizado_en` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `estado` enum('activo','abandonado','convertido') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_session` (`session_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `carrito_detalle`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `carrito_detalle` (
  `id_carrito` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_carrito`,`id_producto`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `carrito_detalle_ibfk_1` FOREIGN KEY (`id_carrito`) REFERENCES `carrito` (`id`) ON DELETE CASCADE,
  CONSTRAINT `carrito_detalle_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `tipos_comprobante`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tipos_comprobante` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` enum('boleta','factura') NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Insertar tipos de comprobante por defecto
INSERT INTO `tipos_comprobante` (`id`, `nombre`, `descripcion`) VALUES
(1, 'boleta', 'Boleta de venta para personas naturales'),
(2, 'factura', 'Factura para empresas y personas jurídicas');

-- --------------------------------------------------------
-- Estructura de tabla para `pedidos`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedidos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `id_direccion` int(11) DEFAULT NULL,
  `numero_pedido` varchar(20) NOT NULL,
  `email_contacto` varchar(255) DEFAULT NULL,
  `telefono_contacto` varchar(20) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `estado` enum('pendiente','pagado','procesando','enviado','entregado','cancelado') DEFAULT 'pendiente',
  `subtotal` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) DEFAULT 0.00,
  `costo_envio` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_pedido` (`numero_pedido`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_direccion` (`id_direccion`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha` (`fecha`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`id_direccion`) REFERENCES `direcciones` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `pedido_detalle`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedido_detalle` (
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `descuento_unitario` decimal(10,2) DEFAULT 0.00,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_pedido`,`id_producto`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `pedido_detalle_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pedido_detalle_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `pagos`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pagos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `metodo` enum('tarjeta','transferencia','paypal','mercadopago','webpay','khipu') NOT NULL,
  `referencia_externa` varchar(255) DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `estado` enum('pendiente','aprobado','rechazado','reembolsado') DEFAULT 'pendiente',
  `detalles_respuesta` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_pedido` (`id_pedido`),
  KEY `idx_estado` (`estado`),
  KEY `idx_metodo` (`metodo`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `comprobantes`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comprobantes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `id_tipo` int(11) NOT NULL,
  `numero_comprobante` varchar(50) NOT NULL,
  `fecha_emision` datetime DEFAULT current_timestamp(),
  `rut_cliente` varchar(20) DEFAULT NULL,
  `razon_social` varchar(255) DEFAULT NULL,
  `direccion_facturacion` text DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `iva` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('emitido','anulado') DEFAULT 'emitido',
  `archivo_pdf` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_comprobante` (`numero_comprobante`),
  KEY `id_pedido` (`id_pedido`),
  KEY `id_tipo` (`id_tipo`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `comprobantes_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comprobantes_ibfk_2` FOREIGN KEY (`id_tipo`) REFERENCES `tipos_comprobante` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `envios`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `envios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `empresa` varchar(100) DEFAULT NULL,
  `numero_seguimiento` varchar(100) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT 0.00,
  `fecha_envio` datetime DEFAULT NULL,
  `fecha_entrega_estimada` datetime DEFAULT NULL,
  `fecha_entrega` datetime DEFAULT NULL,
  `estado` enum('pendiente','preparando','enviado','en_transito','entregado','devuelto') DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_pedido` (`id_pedido`),
  KEY `idx_estado` (`estado`),
  KEY `idx_numero_seguimiento` (`numero_seguimiento`),
  CONSTRAINT `envios_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `devoluciones`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `devoluciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `motivo` text DEFAULT NULL,
  `fecha_solicitud` datetime DEFAULT current_timestamp(),
  `estado` enum('pendiente','aprobado','rechazado','completado') DEFAULT 'pendiente',
  `fecha_resolucion` datetime DEFAULT NULL,
  `tipo_reembolso` enum('credito_tienda','devolucion_efectivo','cambio_producto') DEFAULT NULL,
  `monto_reembolso` decimal(10,2) DEFAULT NULL,
  `observaciones_admin` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_pedido` (`id_pedido`),
  KEY `id_producto` (`id_producto`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `devoluciones_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `devoluciones_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Estructura de tabla para `historial_estados`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `historial_estados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` enum('pedido','devolucion','envio') NOT NULL,
  `id_referencia` int(11) NOT NULL,
  `estado_anterior` varchar(50) DEFAULT NULL,
  `estado_nuevo` varchar(50) NOT NULL,
  `fecha_cambio` datetime DEFAULT current_timestamp(),
  `id_usuario_cambio` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tipo_referencia` (`tipo`, `id_referencia`),
  KEY `idx_fecha` (`fecha_cambio`),
  KEY `id_usuario_cambio` (`id_usuario_cambio`),
  CONSTRAINT `historial_estados_ibfk_1` FOREIGN KEY (`id_usuario_cambio`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Insertar datos de ejemplo para categorías
-- --------------------------------------------------------
INSERT INTO `categorias` (`nombre`, `descripcion`, `slug`, `activa`, `orden`) VALUES
('Motor', 'Repuestos y componentes del motor', 'motor', 1, 1),
('Frenos', 'Sistemas de frenado y componentes', 'frenos', 1, 2),
('Suspensión', 'Amortiguadores, resortes y componentes de suspensión', 'suspension', 1, 3),
('Transmisión', 'Cajas de cambio, embragues y transmisión', 'transmision', 1, 4),
('Eléctrico', 'Componentes eléctricos y electrónicos', 'electrico', 1, 5),
('Carrocería', 'Paneles, luces y accesorios de carrocería', 'carroceria', 1, 6),
('Filtros', 'Filtros de aire, aceite, combustible', 'filtros', 1, 7),
('Aceites', 'Lubricantes y aceites para motor', 'aceites', 1, 8);

-- --------------------------------------------------------
-- Insertar marcas de ejemplo
-- --------------------------------------------------------
INSERT INTO `marcas` (`nombre`, `activa`) VALUES
('Toyota', 1),
('Chevrolet', 1),
('Ford', 1),
('Hyundai', 1),
('Nissan', 1),
('Volkswagen', 1),
('Kia', 1),
('Suzuki', 1),
('Mitsubishi', 1),
('Mazda', 1);

-- --------------------------------------------------------
-- Funciones y triggers para automatización
-- --------------------------------------------------------

-- Trigger para generar número de pedido automáticamente
DELIMITER $$
CREATE TRIGGER `generar_numero_pedido` BEFORE INSERT ON `pedidos`
FOR EACH ROW
BEGIN
    DECLARE next_id INT;
    SELECT AUTO_INCREMENT INTO next_id 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pedidos';
    
    SET NEW.numero_pedido = CONCAT('PV', YEAR(NOW()), LPAD(next_id, 6, '0'));
END$$
DELIMITER ;

-- Trigger para actualizar stock al confirmar pedido
DELIMITER $$
CREATE TRIGGER `actualizar_stock_pedido` AFTER UPDATE ON `pedidos`
FOR EACH ROW
BEGIN
    IF OLD.estado != 'pagado' AND NEW.estado = 'pagado' THEN
        UPDATE productos p
        INNER JOIN pedido_detalle pd ON p.id = pd.id_producto
        SET p.stock = p.stock - pd.cantidad
        WHERE pd.id_pedido = NEW.id;
    END IF;
END$$
DELIMITER ;

-- Trigger para registrar cambios de estado
DELIMITER $$
CREATE TRIGGER `registrar_cambio_estado_pedido` AFTER UPDATE ON `pedidos`
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO historial_estados (tipo, id_referencia, estado_anterior, estado_nuevo, observaciones)
        VALUES ('pedido', NEW.id, OLD.estado, NEW.estado, 'Cambio automático de estado');
    END IF;
END$$
DELIMITER ;

-- --------------------------------------------------------
-- Vistas útiles para reportes
-- --------------------------------------------------------

-- Vista de productos con información completa
CREATE VIEW `vista_productos_completa` AS
SELECT 
    p.id,
    p.sku,
    p.nombre,
    p.descripcion,
    p.precio,
    p.stock,
    p.activo,
    p.destacado,
    c.nombre as categoria,
    c.slug as categoria_slug,
    p.creado_en,
    p.actualizado_en
FROM productos p
INNER JOIN categorias c ON p.id_categoria = c.id;

-- Vista de pedidos con información del usuario
CREATE VIEW `vista_pedidos_completa` AS
SELECT 
    p.id,
    p.numero_pedido,
    p.fecha,
    p.estado,
    p.total,
    CONCAT(u.nombres, ' ', u.a_paterno, ' ', IFNULL(u.a_materno, '')) as nombre_cliente,
    u.correo as email_cliente,
    p.email_contacto,
    p.telefono_contacto
FROM pedidos p
LEFT JOIN usuarios u ON p.id_usuario = u.id;

-- --------------------------------------------------------
-- Índices adicionales para optimización
-- --------------------------------------------------------
ALTER TABLE `productos` ADD INDEX `idx_categoria_activo` (`id_categoria`, `activo`);
ALTER TABLE `pedidos` ADD INDEX `idx_usuario_fecha` (`id_usuario`, `fecha`);
ALTER TABLE `logs_auditoria` ADD INDEX `idx_accion_fecha` (`accion`, `creado_en`);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;