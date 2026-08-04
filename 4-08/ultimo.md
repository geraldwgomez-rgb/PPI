# 🛠️ Tareas Técnicas Previas — Historias vs. Requerimientos de Base de Datos en Supabase

A continuación se consolida la lista de historias de usuario que requieren ajustes, campos o tablas adicionales en Supabase antes de iniciar la fase de codificación:

---

| Historia de Usuario (HU) | Componente / Funcionalidad | Falta en Supabase (Tabla / Campo / Relación) |
| :--- | :--- | :--- |
| **[HU01] Landing Page / Index** | Presentación y Fundadores | **Sin cambios:** Información estática consumida desde el Frontend. |
| **[HU02] Registro y Login** | Autenticación y Perfil | • **Mapeo / Trigger:** Vincular la tabla interna `auth.users` de Supabase con la tabla `public.usuario`.<br>• **Campo nuevo:** `auth_id (uuid)` como Clave Foránea (FK) relacionando `public.usuario` con `auth.users.id`. |
| **[HU03] Inicio de Sesión** | Sesiones activas | **Sin cambios:** Gestionado nativamente por `supabase.auth`. |
| **[HU04] Aislamiento RLS** | Seguridad de datos | • **Políticas RLS:** Crear las políticas de seguridad `ENABLE ROW LEVEL SECURITY` para `usuario`, `cuenta`, `gastos`, `ingresos`, `presupuesto` y `productos`. |
| **[HU05] Dashboard Principal** | Consolidado de saldos | • **Relación / FK:** Vincular la tabla `cuenta` con `gastos` e `ingresos` (`id_cuenta` FK en las tablas de transacciones) para calcular el saldo real de cada cuenta. |
| **[HU06] Gestión de Ingresos** | Registrar / Editar ingresos | • **Relación / FK:** Asegurar el campo `id_cuenta (FK)` en la tabla `ingresos` para saber en qué cuenta entra el dinero. |
| **[HU07] Gestión de Gastos** | Registrar / Editar gastos | • **Relación / FK:** Confirmar relaciones `id_cuenta (FK)`, `id_categoria (FK)` y `id_presupuesto (FK)` como opcionales/anulables (`NULLABLE`). |
| **[HU08] Métricas del Dashboard** | Cálculos en tiempo real | • **Vista / Función SQL:** Crear una `VIEW` o una `Database Function` (RPC) para calcular totales acumulados (`total_ingresos - total_gastos`) eficientemente. |
| **[HU09] Configuración de Cuentas** | Manejo de Cuentas | • **Campo nuevo:** `saldo_inicial (numeric)` en la tabla `cuenta` para reflejar el monto base antes de registrar transacciones. |
| **[HU10] Control de Presupuestos** | Seguimiento de gasto | • **Campo nuevo:** `id_categoria (FK)` en la tabla `presupuesto` (si se requiere presupuestar por categoría específica y no solo global). |
| **[HU11] Catálogo de Productos** | Inventario / Ventas | • **Tabla / Campos:** Crear la tabla `productos` con `id_producto (PK)`, `nombre`, `precio (numeric)`, `stock (int)`, `descripcion (text)` y `cedula_usuario (FK)`. |
| **[HU12] Categorías Personalizadas**| Categorización | • **Campo nuevo:** `es_sistema (boolean)` en la tabla `categoria` para diferenciar categorías globales por defecto de las creadas por el usuario. |
| **[HU13] Recuperación de Contraseña**| Reset Password | **Sin cambios:** Utiliza la infraestructura nativa de plantillas de correo y tokens de `Supabase Auth`. |
| **[HU14] Trazabilidad y Auditoría** | Bitácora `sistema_smc` | • **Campos adicionales:** `evento (varchar)` y `ip_origen (varchar)` en la tabla `sistema_smc` para detallar qué acción realizó el usuario (login, logout, mod de datos).<br>• **Trigger Automático:** Crear un `Trigger SQL` que inserte automáticamente un registro en `sistema_smc` al ocurrir un evento de autenticación. |

---

## 📋 Lista Resumida de Tareas Técnicas Prioritarias (Sprint 0 / Pre-Dev)

1. **Crear la tabla `productos`** con su correspondiente `cedula_usuario` (FK) y políticas RLS.
2. **Agregar campo `auth_id (UUID)`** en la tabla `usuario` vinculado a `auth.users(id)` mediante un `Database Trigger` de auto-creación de perfil.
3. **Agregar campos missing:**
   * `saldo_inicial` a la tabla `cuenta`.
   * `es_sistema` (booleano) a la tabla `categoria`.
   * `id_cuenta` (FK) en las tablas `gastos` e `ingresos`.
   * `evento` e `ip_origen` en la tabla `sistema_smc`.
4. **Habilitar Row Level Security (RLS)** y definir políticas `USING (auth.uid() = user_id)` en todas las tablas activas.