# Actividad 5 — Priorización y Backlog

A continuación se presenta la clasificación del proyecto SMC aplicando la metodología **MoSCoW** y la organización del **Backlog** estructurado en 3 Sprints de desarrollo.

---

## 📊 Matriz de Priorización MoSCoW

| Historia de Usuario | Must Have (Imprescindible) | Should Have (Debería tener) | Could Have (Podría tener) | Won't Have (Por ahora) |
| :--- | :---: | :---: | :---: | :---: |
| **Página de Inicio / Landing Page (Index)** | **X** | | | |
| **Registro de Usuario Regular y Login (Supabase Auth)** | **X** | | | |
| **Gestión de Gastos e Ingresos (CRUD básico)** | **X** | | | |
| **Visualización del Dashboard Financiero y Saldos** | **X** | | | |
| **Políticas de Seguridad RLS en Supabase** | **X** | | | |
| **Gestión de Presupuestos (Límite y seguimiento)** | | **X** | | |
| **Gestión de Cuentas Financieras (Banco, Nequi, Efectivo)** | | **X** | | |
| **Categorización de Gastos/Ingresos (Personalizadas)** | | **X** | | |
| **Catálogo de Productos e Inventario** | | | **X** | |
| **Recuperación de Contraseña vía Correo** | | | **X** | |
| **Auditoría Avanzada y Logs de Sistema (`sistema_smc`)** | | | **X** | |
| **Exportación de Reportes Financieros en PDF/Excel** | | | | **X** |
| **Multi-divisa e Integración con Pasarelas de Pago** | | | | **X** |

---

## 🚀 Planificación del Backlog por Sprints

### 🔵 Sprint 1: Autenticación, Roles y Navegación Básica
> **Objetivo:** Establecer la estructura base del sistema, permitiendo que un usuario se registre, inicie sesión y navegue de forma segura mediante RLS.

* **[HU01] Landing Page / Index:** Como invitado, quiero ver la página de inicio con la información del proyecto SMC y los fundadores para conocer la aplicación antes de registrarme.
* **[HU02] Registro de Usuario:** Como invitado, quiero registrarme con correo, contraseña y cédula para crear mi cuenta en la plataforma.
* **[HU03] Inicio de Sesión:** Como usuario regular, quiero autenticarme en el sistema para acceder a mi información financiera.
* **[HU04] Aislamiento RLS (Seguridad):** Como sistema, quiero aplicar políticas Row Level Security en Supabase para garantizar que el usuario regular solo acceda a sus propios datos.
* **[HU05] Estructura del Dashboard Vacio:** Como usuario regular, quiero acceder al panel principal con la sesión activa y poder cerrar sesión correctamente.

---

### 🟢 Sprint 2: Funcionalidad Principal (Core Financiero)
> **Objetivo:** Desarrollar el flujo central de negocio para que el microempresario pueda gestionar su dinero y controlar sus límites.

* **[HU06] Gestión de Ingresos:** Como usuario regular, quiero registrar, consultar, editar y eliminar mis entradas de dinero.
* **[HU07] Gestión de Gastos:** Como usuario regular, quiero registrar, consultar, editar y eliminar mis salidas de dinero vinculándolas a una categoría.
* **[HU08] Métricas del Dashboard:** Como usuario regular, quiero ver el cálculo consolidado de saldos, ingresos totales y gastos acumulados en tiempo real.
* **[HU09] Configuración de Cuentas:** Como usuario regular, quiero registrar mis fuentes de dinero (Nequi, Banco, Efectivo) para asociarlas a mis movimientos.
* **[HU10] Control de Presupuestos:** Como usuario regular, quiero definir un monto límite por periodo para recibir un seguimiento sobre mi gasto acumulado.

---

### 🟡 Sprint 3: Extras, Productos y Roles Avanzados
> **Objetivo:** Incorporar herramientas de inventario para el negocio, utilidades secundarias y administración del sistema.

* **[HU11] Catálogo de Productos:** Como usuario regular (microempresario), quiero agregar, consultar y actualizar mi inventario con precios y stock disponible.
* **[HU12] Categorías Personalizadas:** Como usuario regular, quiero crear y gestionar mis propias categorías de gastos e ingresos.
* **[HU13] Recuperación de Contraseña:** Como usuario regular, quiero restablecer mi contraseña mediante un correo de verificación si la he olvidado.
* **[HU14] Trazabilidad y Auditoría (`sistema_smc`):** Como administrador/sistema, quiero registrar automáticamente los logs de inicio de sesión y accesos para auditorías de seguridad.