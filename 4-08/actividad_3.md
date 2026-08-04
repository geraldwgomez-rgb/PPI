# Actividad 3 — De tablas Supabase a historias CRUD (30 min)

Ahora al revés: para **cada tabla** importante (columna 1B), pensar en las 4 operaciones básicas y ver cuáles necesitan historia propia:

---

### 1. Tabla: `usuario`

| Operación | ¿Aplica? | Historia de usuario | Pantalla donde ocurre |
| :--- | :---: | :--- | :--- |
| **Crear (Create)** | Sí | Como invitado, quiero registrarme con mi correo, cédula y contraseña para crear mi cuenta en la plataforma. | Registro (`/register`) |
| **Leer (Read)** | Sí | Como usuario regular, quiero ver los datos de mi perfil para consultar mi información registrada. | Perfil (`/profile`) |
| **Actualizar (Update)** | Sí | Como usuario regular, quiero actualizar mis datos personales o cambiar mi contraseña en caso de olvido. | Perfil / Olvidó Contraseña |
| **Eliminar (Delete)** | Sí | Como administrador, quiero eliminar o desactivar la cuenta de un usuario a solicitud o por política. | Dashboard Admin / Supabase |

---

### 2. Tabla: `cuenta`

| Operación | ¿Aplica? | Historia de usuario | Pantalla donde ocurre |
| :--- | :---: | :--- | :--- |
| **Crear (Create)** | Sí | Como usuario regular, quiero registrar una nueva cuenta financiera (ej. Nequi, Banco, Efectivo) para organizar mi dinero. | Crear Cuenta (`/accounts/new`) |
| **Leer (Read)** | Sí | Como usuario regular, quiero ver la lista de mis cuentas financieras y sus saldos para conocer mi disponibilidad actual. | Dashboard / Cuentas |
| **Actualizar (Update)** | Sí | Como usuario regular, quiero editar el nombre o divisa de una cuenta para corregir errores. | Editar Cuenta (`/accounts/edit`) |
| **Eliminar (Delete)** | Sí | Como usuario regular, quiero eliminar una cuenta financiera que ya no utilice para limpiar mi vista. | Gestión de Cuentas |

---

### 3. Tabla: `categoria`

| Operación | ¿Aplica? | Historia de usuario | Pantalla donde ocurre |
| :--- | :---: | :--- | :--- |
| **Crear (Create)** | Sí | Como usuario regular, quiero crear categorías personalizadas para clasificar mis ingresos y gastos. | Categorías (`/categories`) |
| **Leer (Read)** | Sí | Como usuario regular, quiero ver las categorías disponibles para seleccionarlas al registrar un movimiento. | Formulario Transacción |
| **Actualizar (Update)** | Sí | Como usuario regular, quiero editar el nombre o tipo de una categoría personalizada. | Categorías (`/categories`) |
| **Eliminar (Delete)** | Sí | Como usuario regular, quiero eliminar una categoría personalizada que ya no use. | Categorías (`/categories`) |

---

### 4. Tabla: `gastos`

| Operación | ¿Aplica? | Historia de usuario | Pantalla donde ocurre |
| :--- | :---: | :--- | :--- |
| **Crear (Create)** | Sí | Como usuario regular, quiero registrar un nuevo gasto con monto, fecha, categoría y presupuesto para llevar el control. | Registrar Gasto (`/expenses/new`) |
| **Leer (Read)** | Sí | Como usuario regular, quiero ver el historial de mis gastos para analizar mis egresos. | Historial / Dashboard |
| **Actualizar (Update)** | Sí | Como usuario regular, quiero editar un gasto registrado para corregir un valor, fecha o categoría. | Editar Gasto (`/expenses/edit`) |
| **Eliminar (Delete)** | Sí | Como usuario regular, quiero eliminar un gasto registrado por error para recalcular mi presupuesto. | Historial de Gastos |

---

### 5. Tabla: `ingresos`

| Operación | ¿Aplica? | Historia de usuario | Pantalla donde ocurre |
| :--- | :---: | :--- | :--- |
| **Crear (Create)** | Sí | Como usuario regular, quiero registrar un nuevo ingreso para aumentar mi saldo disponible. | Registrar Ingreso (`/incomes/new`) |
| **Leer (Read)** | Sí | Como usuario regular, quiero consultar el historial de mis ingresos registrados para conocer mis entradas de dinero. | Historial de Ingresos |
| **Actualizar (Update)** | Sí | Como usuario regular, quiero modificar los datos de un ingreso para corregir una cantidad mal digitada. | Editar Ingreso (`/incomes/edit`) |
| **Eliminar (Delete)** | Sí | Como usuario regular, quiero anular o eliminar un ingreso duplicado. | Historial de Ingresos |

---

### 6. Tabla: `presupuesto`

| Operación | ¿Aplica? | Historia de usuario | Pantalla donde ocurre |
| :--- | :---: | :--- | :--- |
| **Crear (Create)** | Sí | Como usuario regular, quiero definir un presupuesto con un monto límite para controlar mis gastos por periodo. | Crear Presupuesto (`/budgets/new`) |
| **Leer (Read)** | Sí | Como usuario regular, quiero ver el tope de mi presupuesto y el gasto acumulado para saber cuánto puedo gastar. | Dashboard / Presupuestos |
| **Actualizar (Update)** | Sí | Como usuario regular, quiero ajustar el monto límite de mi presupuesto según mis metas. | Editar Presupuesto |
| **Eliminar (Delete)** | Sí | Como usuario regular, quiero eliminar un presupuesto para crear uno nuevo. | Gestión de Presupuestos |

---

### 7. Tabla: `productos`

| Operación | ¿Aplica? | Historia de usuario | Pantalla donde ocurre |
| :--- | :---: | :--- | :--- |
| **Crear (Create)** | Sí | Como usuario regular, quiero agregar un producto con su precio y stock a mi catálogo para gestionar mi inventario. | Nuevo Producto (`/products/new`) |
| **Leer (Read)** | Sí | Como usuario regular, quiero ver el catálogo de mis productos registrados con sus precios y stock disponible. | Catálogo de Productos |
| **Actualizar (Update)** | Sí | Como usuario regular, quiero actualizar el precio o existencias de un producto. | Editar Producto |
| **Eliminar (Delete)** | Sí | Como usuario regular, quiero descontinuar o eliminar un producto de mi catálogo. | Catálogo de Productos |

---

### 8. Tabla: `sistema_smc`

| Operación | ¿Aplica? | Historia de usuario | Pantalla donde ocurre |
| :--- | :---: | :--- | :--- |
| **Crear (Create)** | Sí | Como sistema, quiero registrar automáticamente cada inicio de sesión y vinculación para mantener bitácora de auditoría. | Backend / Triggers de DB |
| **Leer (Read)** | Sí | Como administrador, quiero consultar los registros de auditoría y accesos para verificar la seguridad del sistema. | Dashboard Admin / Supabase |
| **Actualizar (Update)** | No | *No aplica.* Los registros de auditoría son inmutables para garantizar trazabilidad. | N/A |
| **Eliminar (Delete)** | No | *No aplica.* No se deben eliminar logs de auditoría desde la app cliente. | N/A |