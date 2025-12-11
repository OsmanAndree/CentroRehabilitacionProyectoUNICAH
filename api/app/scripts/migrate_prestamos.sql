-- Script de migración para agregar nuevos campos a la tabla prestamos
-- Ejecutar este script en la base de datos para actualizar la estructura
-- NOTA: Si alguna columna ya existe, el comando fallará. Ejecutar solo las líneas necesarias.

-- Agregar campo periodo_prestamo
ALTER TABLE prestamos 
ADD COLUMN periodo_prestamo VARCHAR(100) NULL 
COMMENT 'Periodo del préstamo (ej: "30 días", "1 mes", etc.)';

-- Agregar campo tipo (Préstamo o Donación)
ALTER TABLE prestamos 
ADD COLUMN tipo ENUM('Prestamo', 'Donacion') NOT NULL DEFAULT 'Prestamo';

-- Agregar campos de Referencia 1
ALTER TABLE prestamos 
ADD COLUMN referencia1_nombre VARCHAR(200) NULL;

ALTER TABLE prestamos 
ADD COLUMN referencia1_direccion TEXT NULL;

ALTER TABLE prestamos 
ADD COLUMN referencia1_telefono VARCHAR(20) NULL;

-- Agregar campos de Referencia 2
ALTER TABLE prestamos 
ADD COLUMN referencia2_nombre VARCHAR(200) NULL;

ALTER TABLE prestamos 
ADD COLUMN referencia2_direccion TEXT NULL;

ALTER TABLE prestamos 
ADD COLUMN referencia2_telefono VARCHAR(20) NULL;

