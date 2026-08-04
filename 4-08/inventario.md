# Roles Identificados en el Sistema SMC

---

## 1. 👤 Usuario Regular

El actor principal del sistema. Es el microempresario o persona que usa la app para gestionar sus finanzas personales.

### Permisos y Funcionalidades:
- Registrarse con correo y contraseña.
- Iniciar y cerrar sesión.
- Gestionar sus propios gastos, ingresos y presupuestos.
- Ver **únicamente** su propia información (garantizado mediante políticas **RLS - Row Level Security**).

---

## 2. 🔧 Administrador

Gestiona el sistema desde el panel de **Supabase**.

### Permisos y Funcionalidades:
- Ver todos los usuarios registrados en la plataforma.
- Crear y eliminar usuarios manualmente.
- Gestionar las políticas de seguridad (RLS).
- Acceder a todas las tablas y registros de la base de datos.

---

## 3. 👁️ Invitado (No autenticado)

Cualquier persona que llega a la aplicación sin iniciar sesión.

### Permisos y Funcionalidades:
- Ver la página de inicio (*Index* / *Landing Page*).
- Ver la presentación del proyecto y la información de los fundadores.
- Acceder al formulario de *Login* / *Registro*.

### Restricciones:
- ❌ **No puede** ver gastos, ingresos ni datos de otros usuarios.
- ❌ **No puede** acceder al *Dashboard* ni al sistema interno.

---




# Especificación de Tablas - Sistema SMC

A continuación se detalla la estructura de la base de datos con las tablas identificadas, sus campos clave (tomados de la arquitectura del modelo de datos) y su representación dentro de la lógica del negocio:

| Tabla | Campos Clave | ¿Qué representa en el negocio? |
| :--- | :--- | :--- |
| **`usuario`** | `cedula` (PK), `nombre`, `apellido`, `correo`, `contrasena` | Representa la información del perfil del microempresario o persona registrada en la plataforma (sus datos personales y credenciales de acceso). |
| **`cuenta`** | `id_cuenta` (PK), `nombre`, `divisa`, `cedula_usuario` (FK) | Representa las cuentas bancarias, billeteras o fuentes financieras de las cuales dispone el usuario para manejar su dinero (ej. Efectivo, Banco, Nequi). |
| **`categoria`** | `id_categoria` (PK), `nombre`, `tipo` | Clasificación o etiquetado para agrupar las transacciones (gastos o ingresos), permitiendo un análisis detallado del destino/origen del dinero (ej. Alimentación, Ventas, Servicios). |
| **`gastos`** | `id_gasto` (PK), `descripcion`, `tipo`, `monto`, `fecha`, `cedula_usuario` (FK), `id_categoria` (FK), `id_presupuesto` (FK) | Registro detallado de los egresos de dinero realizados por el usuario, asociados a una categoría y a un presupuesto configurado. |
| **`ingresos`** | `id_ingreso` (PK), `descripcion`, `monto`, `fecha`, `cedula_usuario` (FK), `id_categoria` (FK) | Registro detallado de todas las entradas de dinero recibidas por el usuario o su negocio (ej. Ventas, Salario, Inversiones). |
| **`presupuesto`** | `id_presupuesto` (PK), `periodo`, `monto_limite`, `gasto_acumulado`, `cedula_usuario` (FK) | Define la meta o límite máximo de dinero que el usuario planea gastar en un periodo determinado (mensual, semanal) y lleva el control del gasto consumido a la fecha. |
| **`productos`** | `id_producto` (PK), `nombre`, `precio`, `stock` / `descripcion`, `cedula_usuario` (FK) | Representa los artículos, bienes o servicios que el microempresario ofrece o comercializa en su actividad económica. |
| **`sistema_smc`** | `id_cuenta` (PK/FK), `cedula_usuario` (FK), `id_presupuesto` (FK), `id_categoria` (FK), `fecha_acceso` | Tabla de auditoría, trazabilidad y consolidado del sistema para registrar accesos, vinculación de entidades y actividad de uso de la plataforma SMC. |


---

# 1C. Pantallas del Mapa del Sitio - Sistema SMC

Lista cada nodo/pantalla del sitemap, el rol que puede verla y las tablas de Supabase con las que se conecta.

| Pantalla | ¿A qué rol(es) le aparece? | ¿Con qué tabla(s) de Supabase se conecta? |
| :--- | :--- | :--- |
| **Index / Página de inicio** | Invitado (no autenticado) | Ninguna — es solo presentación estática |
| **Iniciar Sesión** | Invitado | `auth.users` (Supabase Auth) |
| **Registro / Crear cuenta** | Invitado | `auth.users` (Supabase Auth) |
| **Dashboard / Panel principal** | Usuario Regular | `gastos`, `ingresos`, `presupuesto` |
| **Gastos → Mis Gastos** | Usuario Regular | `gastos` |
| **Gastos → Categorías** | Usuario Regular | `categoria` |
| **Ingresos** | Usuario Regular | `ingresos` |
| **Presupuestos** | Usuario Regular | `presupuesto` |
| **Usuarios / Perfil** | Usuario Regular | `usuario` |
| **Productos** | Usuario Regular | `productos` |
| **Sistema SMC (Auditoría)** | Administrador | `sistema_smc`, `cuenta`, `usuario`, `categoria`, `presupuesto` |