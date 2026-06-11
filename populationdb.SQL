-- ============================================================
--  SISTEMA SMC – Script para Supabase (PostgreSQL)
--  Pegar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ─── TIPOS ENUM ────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE tipo_movimiento_enum AS ENUM ('GASTO','INGRESO','AMBOS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_gasto_enum AS ENUM ('FIJO','EXTRAORDINARIO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_ingreso_enum AS ENUM ('ORDINARIO','EXTRAORDINARIO','DIFERIDO','NO_OPERACIONAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── TABLA: usuario ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuario (
    cedula      VARCHAR(20)  PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    apellido    VARCHAR(100) NOT NULL,
    correo      VARCHAR(150) NOT NULL UNIQUE,
    contrasena  VARCHAR(255) NOT NULL   -- almacenar hash, nunca texto plano
);

-- ─── TABLA: cuenta ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cuenta (
    id_cuenta       SERIAL       PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    divisa          VARCHAR(10)  NOT NULL DEFAULT 'COP',
    cedula_usuario  VARCHAR(20)  NOT NULL,
    CONSTRAINT fk_cuenta_usuario
        FOREIGN KEY (cedula_usuario) REFERENCES usuario(cedula)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ─── TABLA: categoria ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria    SERIAL               PRIMARY KEY,
    nombre          VARCHAR(100)         NOT NULL,
    tipo_movimiento tipo_movimiento_enum NOT NULL DEFAULT 'GASTO'
);

-- ─── TABLA: presupuesto ────────────────────────────────────
CREATE TABLE IF NOT EXISTS presupuesto (
    id_presupuesto  SERIAL         PRIMARY KEY,
    periodo         VARCHAR(20)    NOT NULL,      -- ej. '2024-06'
    monto_limite    NUMERIC(15,2)  NOT NULL,
    gasto_acumulado NUMERIC(15,2)  NOT NULL DEFAULT 0.00,
    cedula_usuario  VARCHAR(20)    NOT NULL,
    CONSTRAINT fk_presupuesto_usuario
        FOREIGN KEY (cedula_usuario) REFERENCES usuario(cedula)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ─── TABLA: gastos ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastos (
    id_gasto        SERIAL           PRIMARY KEY,
    descripcion     VARCHAR(255)     NOT NULL,
    tipo            tipo_gasto_enum  NOT NULL,
    monto           NUMERIC(15,2)    NOT NULL,
    fecha           DATE             NOT NULL,
    cedula_usuario  VARCHAR(20)      NOT NULL,
    id_categoria    INT,
    id_presupuesto  INT,
    CONSTRAINT fk_gastos_usuario
        FOREIGN KEY (cedula_usuario) REFERENCES usuario(cedula)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_gastos_categoria
        FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_gastos_presupuesto
        FOREIGN KEY (id_presupuesto) REFERENCES presupuesto(id_presupuesto)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- ─── TABLA: ingresos ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS ingresos (
    id_ingreso      SERIAL             PRIMARY KEY,
    tipo            tipo_ingreso_enum  NOT NULL,
    monto           NUMERIC(15,2)      NOT NULL,
    fecha           DATE               NOT NULL,
    cedula_usuario  VARCHAR(20)        NOT NULL,
    CONSTRAINT fk_ingresos_usuario
        FOREIGN KEY (cedula_usuario) REFERENCES usuario(cedula)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ─── TABLA: sistema_smc ────────────────────────────────────
-- Registra la sesión/acceso del usuario al sistema,
-- vinculando su cuenta, presupuesto y categoría activos.
CREATE TABLE IF NOT EXISTS sistema_smc (
    id_cuenta       INT          PRIMARY KEY,
    cedula_usuario  VARCHAR(20)  NOT NULL,
    id_presupuesto  INT,
    id_categoria    INT,
    fecha_acceso    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_smc_cuenta
        FOREIGN KEY (id_cuenta) REFERENCES cuenta(id_cuenta)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_smc_usuario
        FOREIGN KEY (cedula_usuario) REFERENCES usuario(cedula)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_smc_presupuesto
        FOREIGN KEY (id_presupuesto) REFERENCES presupuesto(id_presupuesto)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_smc_categoria
        FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- ─── ÍNDICES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_gastos_usuario    ON gastos(cedula_usuario);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha      ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_ingresos_usuario  ON ingresos(cedula_usuario);
CREATE INDEX IF NOT EXISTS idx_ingresos_fecha    ON ingresos(fecha);
CREATE INDEX IF NOT EXISTS idx_presupuesto_per   ON presupuesto(periodo);

-- ─── DATOS DE EJEMPLO ──────────────────────────────────────

INSERT INTO usuario (cedula, nombre, apellido, correo, contrasena) VALUES
('1234567890', 'Carlos', 'Ramírez', 'carlos@email.com', '$2b$12$hashEjemplo1'),
('0987654321', 'Laura',  'Gómez',   'laura@email.com',  '$2b$12$hashEjemplo2')
ON CONFLICT DO NOTHING;

INSERT INTO categoria (nombre, tipo_movimiento) VALUES
('Alimentación', 'GASTO'),
('Transporte',   'GASTO'),
('Salario',      'INGRESO'),
('Arriendo',     'GASTO'),
('Inversiones',  'INGRESO')
ON CONFLICT DO NOTHING;

INSERT INTO cuenta (nombre, divisa, cedula_usuario) VALUES
('Cuenta Principal', 'COP', '1234567890'),
('Cuenta Ahorros',   'USD', '0987654321');

INSERT INTO presupuesto (periodo, monto_limite, gasto_acumulado, cedula_usuario) VALUES
('2024-06', 2000000.00, 350000.00, '1234567890'),
('2024-06', 1500000.00,      0.00, '0987654321');

INSERT INTO gastos (descripcion, tipo, monto, fecha, cedula_usuario, id_categoria, id_presupuesto) VALUES
('Mercado semanal', 'FIJO',          150000.00, '2024-06-01', '1234567890', 1, 1),
('Taxi aeropuerto', 'EXTRAORDINARIO', 80000.00, '2024-06-03', '1234567890', 2, 1),
('Arriendo junio',  'FIJO',          700000.00, '2024-06-05', '1234567890', 4, 1);

INSERT INTO ingresos (tipo, monto, fecha, cedula_usuario) VALUES
('ORDINARIO',      3500000.00, '2024-06-01', '1234567890'),
('EXTRAORDINARIO',  500000.00, '2024-06-10', '1234567890'),
('ORDINARIO',      2800000.00, '2024-06-01', '0987654321');

-- ─── VISTAS ────────────────────────────────────────────────

-- Gastos agrupados por usuario y categoría
CREATE OR REPLACE VIEW v_gastos_por_categoria AS
SELECT
    u.cedula,
    u.nombre || ' ' || u.apellido  AS usuario,
    c.nombre                        AS categoria,
    SUM(g.monto)                    AS total_gastado
FROM gastos g
JOIN usuario    u ON g.cedula_usuario = u.cedula
LEFT JOIN categoria c ON g.id_categoria = c.id_categoria
GROUP BY u.cedula, u.nombre, u.apellido, c.nombre;

-- Balance total ingreso vs gasto por usuario
CREATE OR REPLACE VIEW v_balance_usuario AS
SELECT
    u.cedula,
    u.nombre || ' ' || u.apellido             AS usuario,
    COALESCE(SUM(i.monto), 0)                 AS total_ingresos,
    COALESCE((SELECT SUM(monto) FROM gastos   WHERE cedula_usuario = u.cedula), 0) AS total_gastos,
    COALESCE(SUM(i.monto), 0)
      - COALESCE((SELECT SUM(monto) FROM gastos WHERE cedula_usuario = u.cedula), 0) AS balance
FROM usuario u
LEFT JOIN ingresos i ON i.cedula_usuario = u.cedula
GROUP BY u.cedula, u.nombre, u.apellido;

-- ============================================================
--  FIN DEL SCRIPT
-- ============================================================
-- ============================================================
--  SISTEMA SMC – 10 INSERT por tabla
--  Orden: respetar llaves foráneas
--  Pegar en: Supabase → SQL Editor → Run
-- ============================================================


-- ─── 1. USUARIO ────────────────────────────────────────────
INSERT INTO usuario (cedula, nombre, apellido, correo, contrasena) VALUES
('1000000001', 'Andrés',    'Torres',    'andres.torres@email.com',    '$2b$12$hash001'),
('1000000002', 'Valentina', 'Ríos',      'valentina.rios@email.com',   '$2b$12$hash002'),
('1000000003', 'Miguel',    'Herrera',   'miguel.herrera@email.com',   '$2b$12$hash003'),
('1000000004', 'Daniela',   'Mora',      'daniela.mora@email.com',     '$2b$12$hash004'),
('1000000005', 'Sebastián', 'Vargas',    'sebastian.vargas@email.com', '$2b$12$hash005'),
('1000000006', 'Camila',    'Jiménez',   'camila.jimenez@email.com',   '$2b$12$hash006'),
('1000000007', 'Felipe',    'Castillo',  'felipe.castillo@email.com',  '$2b$12$hash007'),
('1000000008', 'Lucía',     'Mendoza',   'lucia.mendoza@email.com',    '$2b$12$hash008'),
('1000000009', 'Juan',      'Ospina',    'juan.ospina@email.com',      '$2b$12$hash009'),
('1000000010', 'Sara',      'Patiño',    'sara.patino@email.com',      '$2b$12$hash010')
ON CONFLICT DO NOTHING;


-- ─── 2. CATEGORIA ──────────────────────────────────────────
INSERT INTO categoria (nombre, tipo_movimiento) VALUES
('Alimentación',       'GASTO'),
('Transporte',         'GASTO'),
('Salario',            'INGRESO'),
('Arriendo',           'GASTO'),
('Inversiones',        'INGRESO'),
('Salud',              'GASTO'),
('Educación',          'GASTO'),
('Entretenimiento',    'GASTO'),
('Freelance',          'INGRESO'),
('Servicios públicos', 'GASTO')
ON CONFLICT DO NOTHING;


-- ─── 3. CUENTA ─────────────────────────────────────────────
INSERT INTO cuenta (nombre, divisa, cedula_usuario) VALUES
('Cuenta Nómina',       'COP', '1000000001'),
('Cuenta Ahorros',      'USD', '1000000002'),
('Cuenta Corriente',    'COP', '1000000003'),
('Cuenta Digital',      'COP', '1000000004'),
('Cuenta Inversión',    'EUR', '1000000005'),
('Cuenta Empresarial',  'COP', '1000000006'),
('Cuenta Secundaria',   'COP', '1000000007'),
('Cuenta Viajes',       'USD', '1000000008'),
('Cuenta Emergencias',  'COP', '1000000009'),
('Cuenta Personal',     'COP', '1000000010');


-- ─── 4. PRESUPUESTO ────────────────────────────────────────
INSERT INTO presupuesto (periodo, monto_limite, gasto_acumulado, cedula_usuario) VALUES
('2024-01', 1800000.00,  450000.00, '1000000001'),
('2024-02', 2000000.00,  780000.00, '1000000002'),
('2024-03', 1500000.00,  300000.00, '1000000003'),
('2024-04', 2500000.00, 1200000.00, '1000000004'),
('2024-05', 3000000.00,  950000.00, '1000000005'),
('2024-06', 1700000.00,  620000.00, '1000000006'),
('2024-07', 2200000.00,  870000.00, '1000000007'),
('2024-08', 1900000.00,  410000.00, '1000000008'),
('2024-09', 2800000.00, 1100000.00, '1000000009'),
('2024-10', 2100000.00,  530000.00, '1000000010');


-- ─── 5. GASTOS ─────────────────────────────────────────────
-- id_categoria: 1=Alimentación 2=Transporte 4=Arriendo 6=Salud 7=Educación 8=Entretenimiento 10=Servicios
-- id_presupuesto: 1-10 creados arriba
INSERT INTO gastos (descripcion, tipo, monto, fecha, cedula_usuario, id_categoria, id_presupuesto) VALUES
('Mercado mensual',         'FIJO',          320000.00, '2024-01-05', '1000000001', 1,  1),
('Pago SITP mes',           'FIJO',           97000.00, '2024-02-01', '1000000002', 2,  2),
('Arriendo febrero',        'FIJO',          800000.00, '2024-02-05', '1000000002', 4,  2),
('Consulta médica',         'EXTRAORDINARIO', 85000.00, '2024-03-12', '1000000003', 6,  3),
('Curso de inglés',         'FIJO',          150000.00, '2024-04-01', '1000000004', 7,  4),
('Concierto',               'EXTRAORDINARIO', 95000.00, '2024-05-20', '1000000005', 8,  5),
('Factura de energía',      'FIJO',           73000.00, '2024-06-03', '1000000006', 10, 6),
('Taxi al aeropuerto',      'EXTRAORDINARIO', 68000.00, '2024-07-14', '1000000007', 2,  7),
('Supermercado semana',     'FIJO',          210000.00, '2024-08-08', '1000000008', 1,  8),
('Medicamentos',            'EXTRAORDINARIO', 45000.00, '2024-09-22', '1000000009', 6,  9);


-- ─── 6. INGRESOS ───────────────────────────────────────────
INSERT INTO ingresos (tipo, monto, fecha, cedula_usuario) VALUES
('ORDINARIO',      3200000.00, '2024-01-01', '1000000001'),
('ORDINARIO',      2800000.00, '2024-02-01', '1000000002'),
('EXTRAORDINARIO', 1500000.00, '2024-03-15', '1000000003'),
('ORDINARIO',      4100000.00, '2024-04-01', '1000000004'),
('DIFERIDO',        800000.00, '2024-05-10', '1000000005'),
('ORDINARIO',      2500000.00, '2024-06-01', '1000000006'),
('EXTRAORDINARIO', 1200000.00, '2024-07-20', '1000000007'),
('NO_OPERACIONAL',  350000.00, '2024-08-05', '1000000008'),
('ORDINARIO',      3700000.00, '2024-09-01', '1000000009'),
('DIFERIDO',        600000.00, '2024-10-12', '1000000010');


-- ─── 7. SISTEMA_SMC ────────────────────────────────────────
-- id_cuenta debe existir en la tabla cuenta (IDs 1-10 creados arriba)
INSERT INTO sistema_smc (id_cuenta, cedula_usuario, id_presupuesto, id_categoria, fecha_acceso) VALUES
(1,  '1000000001', 1,  1,  '2024-01-10 08:30:00+00'),
(2,  '1000000002', 2,  2,  '2024-02-11 09:15:00+00'),
(3,  '1000000003', 3,  3,  '2024-03-12 10:00:00+00'),
(4,  '1000000004', 4,  4,  '2024-04-13 11:45:00+00'),
(5,  '1000000005', 5,  5,  '2024-05-14 14:00:00+00'),
(6,  '1000000006', 6,  6,  '2024-06-15 15:30:00+00'),
(7,  '1000000007', 7,  7,  '2024-07-16 16:00:00+00'),
(8,  '1000000008', 8,  8,  '2024-08-17 17:20:00+00'),
(9,  '1000000009', 9,  9,  '2024-09-18 18:00:00+00'),
(10, '1000000010', 10, 10, '2024-10-19 19:10:00+00');

-- ============================================================
--  FIN – Verificar con:
--  SELECT 'usuario' AS tabla, COUNT(*) FROM usuario
--  UNION ALL SELECT 'categoria', COUNT(*) FROM categoria
--  UNION ALL SELECT 'cuenta',    COUNT(*) FROM cuenta
--  UNION ALL SELECT 'presupuesto', COUNT(*) FROM presupuesto
--  UNION ALL SELECT 'gastos',    COUNT(*) FROM gastos
--  UNION ALL SELECT 'ingresos',  COUNT(*) FROM ingresos
--  UNION ALL SELECT 'sistema_smc', COUNT(*) FROM sistema_smc;
-- ============================================================
-- ============================================================
--  SISTEMA SMC – SELECT, UPDATE, DELETE por tabla
--  Ejecutar cada bloque por separado en SQL Editor
-- ============================================================


-- ════════════════════════════════════════════════════════════
--  TABLA: usuario
-- ════════════════════════════════════════════════════════════

-- 🔍 SELECT – Ver todos los usuarios
SELECT * FROM usuario;

-- 🔍 SELECT – Buscar un usuario por cédula
SELECT * FROM usuario
WHERE cedula = '1000000001';

-- ✏️ UPDATE – Cambiar el correo de un usuario
UPDATE usuario
SET correo = 'andres.nuevo@email.com'
WHERE cedula = '1000000001';

-- ✏️ UPDATE – Cambiar nombre y apellido
UPDATE usuario
SET nombre = 'Andrés Felipe', apellido = 'Torres Ruiz'
WHERE cedula = '1000000001';

-- 🗑️ DELETE – Eliminar un usuario por cédula
-- ⚠️ Solo si no tiene registros en otras tablas
DELETE FROM usuario
WHERE cedula = '1000000010';


-- ════════════════════════════════════════════════════════════
--  TABLA: categoria
-- ════════════════════════════════════════════════════════════

-- 🔍 SELECT – Ver todas las categorías
SELECT * FROM categoria;

-- 🔍 SELECT – Solo categorías de tipo GASTO
SELECT * FROM categoria
WHERE tipo_movimiento = 'GASTO';

-- ✏️ UPDATE – Cambiar el nombre de una categoría
UPDATE categoria
SET nombre = 'Comida y Mercado'
WHERE id_categoria = 1;

-- ✏️ UPDATE – Cambiar el tipo de movimiento
UPDATE categoria
SET tipo_movimiento = 'AMBOS'
WHERE id_categoria = 5;

-- 🗑️ DELETE – Eliminar una categoría
DELETE FROM categoria
WHERE id_categoria = 10;


-- ════════════════════════════════════════════════════════════
--  TABLA: cuenta
-- ════════════════════════════════════════════════════════════

-- 🔍 SELECT – Ver todas las cuentas con el nombre del usuario
SELECT c.id_cuenta, c.nombre, c.divisa,
       u.nombre || ' ' || u.apellido AS propietario
FROM cuenta c
JOIN usuario u ON c.cedula_usuario = u.cedula;

-- 🔍 SELECT – Cuentas en COP
SELECT * FROM cuenta
WHERE divisa = 'COP';

-- ✏️ UPDATE – Cambiar la divisa de una cuenta
UPDATE cuenta
SET divisa = 'EUR'
WHERE id_cuenta = 1;

-- ✏️ UPDATE – Renombrar una cuenta
UPDATE cuenta
SET nombre = 'Cuenta Principal Actualizada'
WHERE id_cuenta = 1;

-- 🗑️ DELETE – Eliminar una cuenta
DELETE FROM cuenta
WHERE id_cuenta = 10;


-- ════════════════════════════════════════════════════════════
--  TABLA: presupuesto
-- ════════════════════════════════════════════════════════════

-- 🔍 SELECT – Ver todos los presupuestos
SELECT * FROM presupuesto;

-- 🔍 SELECT – Presupuestos donde se superó el 50% del límite
SELECT *, 
       ROUND((gasto_acumulado / monto_limite) * 100, 2) AS porcentaje_usado
FROM presupuesto
WHERE gasto_acumulado > (monto_limite * 0.5);

-- ✏️ UPDATE – Aumentar el límite de un presupuesto
UPDATE presupuesto
SET monto_limite = 2500000.00
WHERE id_presupuesto = 1;

-- ✏️ UPDATE – Actualizar el gasto acumulado
UPDATE presupuesto
SET gasto_acumulado = gasto_acumulado + 150000.00
WHERE id_presupuesto = 1;

-- 🗑️ DELETE – Eliminar un presupuesto
DELETE FROM presupuesto
WHERE id_presupuesto = 10;


-- ════════════════════════════════════════════════════════════
--  TABLA: gastos
-- ════════════════════════════════════════════════════════════

-- 🔍 SELECT – Ver todos los gastos con categoría y usuario
SELECT g.id_gasto, g.descripcion, g.tipo, g.monto, g.fecha,
       u.nombre || ' ' || u.apellido AS usuario,
       c.nombre AS categoria
FROM gastos g
JOIN usuario   u ON g.cedula_usuario = u.cedula
JOIN categoria c ON g.id_categoria   = c.id_categoria
ORDER BY g.fecha DESC;

-- 🔍 SELECT – Gastos mayores a $100.000
SELECT * FROM gastos
WHERE monto > 100000
ORDER BY monto DESC;

-- ✏️ UPDATE – Corregir el monto de un gasto
UPDATE gastos
SET monto = 350000.00
WHERE id_gasto = 1;

-- ✏️ UPDATE – Cambiar la categoría de un gasto
UPDATE gastos
SET id_categoria = 2
WHERE id_gasto = 1;

-- 🗑️ DELETE – Eliminar un gasto
DELETE FROM gastos
WHERE id_gasto = 10;


-- ════════════════════════════════════════════════════════════
--  TABLA: ingresos
-- ════════════════════════════════════════════════════════════

-- 🔍 SELECT – Ver todos los ingresos
SELECT i.id_ingreso, i.tipo, i.monto, i.fecha,
       u.nombre || ' ' || u.apellido AS usuario
FROM ingresos i
JOIN usuario u ON i.cedula_usuario = u.cedula
ORDER BY i.fecha DESC;

-- 🔍 SELECT – Solo ingresos ORDINARIOS
SELECT * FROM ingresos
WHERE tipo = 'ORDINARIO';

-- ✏️ UPDATE – Corregir el monto de un ingreso
UPDATE ingresos
SET monto = 3800000.00
WHERE id_ingreso = 1;

-- ✏️ UPDATE – Cambiar el tipo de ingreso
UPDATE ingresos
SET tipo = 'EXTRAORDINARIO'
WHERE id_ingreso = 3;

-- 🗑️ DELETE – Eliminar un ingreso
DELETE FROM ingresos
WHERE id_ingreso = 10;


-- ════════════════════════════════════════════════════════════
--  TABLA: sistema_smc
-- ════════════════════════════════════════════════════════════

-- 🔍 SELECT – Ver todos los accesos con detalle
SELECT s.id_cuenta, s.fecha_acceso,
       u.nombre || ' ' || u.apellido AS usuario,
       p.periodo                     AS presupuesto,
       c.nombre                      AS categoria
FROM sistema_smc s
JOIN usuario    u ON s.cedula_usuario  = u.cedula
JOIN presupuesto p ON s.id_presupuesto = p.id_presupuesto
JOIN categoria  c ON s.id_categoria    = c.id_categoria
ORDER BY s.fecha_acceso DESC;

-- 🔍 SELECT – Último acceso de cada usuario
SELECT DISTINCT ON (cedula_usuario)
       cedula_usuario, fecha_acceso
FROM sistema_smc
ORDER BY cedula_usuario, fecha_acceso DESC;

-- ✏️ UPDATE – Actualizar la fecha de acceso
UPDATE sistema_smc
SET fecha_acceso = NOW()
WHERE id_cuenta = 1;

-- ✏️ UPDATE – Cambiar el presupuesto activo
UPDATE sistema_smc
SET id_presupuesto = 2
WHERE id_cuenta = 1;

-- 🗑️ DELETE – Eliminar un registro de acceso
DELETE FROM sistema_smc
WHERE id_cuenta = 10;


-- ════════════════════════════════════════════════════════════
--  CONSULTAS ÚTILES COMBINADAS
-- ════════════════════════════════════════════════════════════

-- 💰 Balance general de todos los usuarios
SELECT * FROM v_balance_usuario;

-- 📊 Gastos por categoría de todos los usuarios
SELECT * FROM v_gastos_por_categoria;

-- 🔝 Top 3 usuarios con más gastos
SELECT cedula_usuario, SUM(monto) AS total
FROM gastos
GROUP BY cedula_usuario
ORDER BY total DESC
LIMIT 3;
