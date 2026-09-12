# Guía de Entendimiento y Sustentación — Sistema SMC

> Cada punto de esta guía referencia el código real documentado en `documentacion.md` (funciones, tablas y componentes exactos) — no son explicaciones genéricas. Sigue el mismo orden que la documentación: **React → JavaScript → CSS → SQL**.

---

## 1. Mapa de la aplicación (React)

### 1.1 El arranque — `App.jsx`
Todo pasa por 4 variables de estado:

```js
const [session, setSession] = useState(null)
const [rol, setRol] = useState(null)
const [verIndex, setVerIndex] = useState(true)
const [showIntro, setShowIntro] = useState(true)
```

El orden de evaluación en el `return` es la clave de todo el flujo:

```js
if (showIntro) return <IntroSplash onFinish={() => setShowIntro(false)} />
if (verIndex && !session) return <IndexPage onEntrar={() => setVerIndex(false)} />
if (!session) return <LoginPage onLogin={handleLoginSuccess} onVolver={() => setVerIndex(true)} />
if (!rol) return <p>Cargando...</p>
// de aquí en adelante: BrowserRouter con las rutas reales
```

**Por qué ese orden y no otro:** son *guard clauses* (cláusulas de guardia) — cada `if` corta la ejecución antes de llegar al router real. Si intercambiaras el orden (por ejemplo, revisar `rol` antes que `session`), la app intentaría consultar el rol de un usuario que no existe.

**`obtenerRol(userId)`** es la función que conecta sesión → rol:
```js
async function obtenerRol(userId) {
  const { data } = await supabase.from('roles').select('rol').eq('id', userId).single()
  if (data) setRol(data.rol)
}
```
Se llama desde **dos lugares**: dentro de `getSession()` (si ya había sesión guardada al recargar la página) y dentro de `onAuthStateChange` (cada vez que el estado de auth cambia — login, logout, refresh de token). Por eso el rol siempre queda sincronizado sin importar cómo se llegó a tener sesión.

**`handleLoginSuccess(newSession)`** — el gancho entre login e intro:
```js
function handleLoginSuccess(newSession) {
  setSession(newSession)
  setShowIntro(true)
}
```
Se pasa como `onLogin` a `LoginPage` en vez de pasar `setSession` directo — por eso el intro se repite después de cada login, no solo al abrir la app.

### 1.2 El árbol de rutas
```
rol === 'usuario'          rol === 'administrador'
/            DashboardPage  /                 AdminPage
/gastos      GastosPage     /admin/usuarios   AdminUsuariosPage
/ingresos    IngresosPage   /admin/reportes   AdminReportesPage
/presupuestos PresupuestosPage /admin/soporte AdminSoportePage
/soporte     SoportePage    /cuentas          CuentasPage
/usuarios    UsuariosPage   /usuarios         UsuariosPage
```
Nota importante: **`/usuarios` existe para ambos roles** pero apunta al mismo componente `UsuariosPage` (perfil propio) — no hay una ruta `/usuarios` distinta por rol, es intencional: cualquiera edita su propio perfil desde la misma pantalla.

Todas las rutas viven dentro de un único `<Route element={<Layout session={session} rol={rol} />}>` — esto significa que **`Sidebar`, `Header` y `Footer` no se vuelven a montar** al navegar entre páginas; solo cambia lo que hay dentro de `<Outlet />`.

### 1.3 Componentes reutilizables (no son "páginas")
| Componente | Se usa en | Qué recibe |
|---|---|---|
| `FiltroGastos.jsx` | (donde se listen gastos) | prop `onFiltrar(filtros)` — se dispara en cada cambio de input, sin botón "Aplicar" |
| `ParticlesBackground.jsx` | `LoginPage.jsx` | props `particleCount`, `color`, `linkDistance`, `speed` — todas con default |
| `IntroSplash.jsx` | `App.jsx` (2 veces) | prop `onFinish` — callback al terminar la animación |

---

## 2. La lógica que hace funcionar cada módulo (JavaScript)

### 2.1 Reportes en PDF — `AdminReportesPage.jsx`
Dos funciones trabajan juntas:

**`getMesesDesde(fechaRegistro)`** construye el selector de meses **desde la fecha de registro del usuario hasta hoy** — no una lista fija de 12 meses. Si preguntan "¿por qué no aparecen meses futuros o anteriores al registro?": porque el `while (actual <= hoy)` corta exactamente en el mes actual, y `inicio` parte de `fechaRegistro`.

**`generarReporte()`** — flujo interno:
1. Calcula `primerDia`/`ultimoDia` del mes elegido con `new Date(anio, mesNum-1, 1)` y `new Date(anio, mesNum, 0)` (el truco de `new Date(año, mes, 0)` da el último día del mes anterior a `mes`, que es justo el último día de `mesNum-1`... aquí `mesNum` sin restar da el día 0 de `mesNum`, es decir el último día de `mesNum-1` en índice real — así consigue el último día del mes seleccionado).
2. Trae `gastos`, `ingresos` y `presupuesto` **filtrados por `user_id` Y por rango de fecha** (`.gte()` + `.lte()`).
3. Calcula totales con `.reduce()`.
4. Llama `setPreview(...)` — esto es lo que pinta la vista previa en pantalla **antes** de generar el PDF.
5. Recién ahí construye el PDF con `jsPDF`: rectángulo de encabezado, texto, 3 tarjetas de resumen dibujadas a mano con `doc.rect()`, y 3 tablas con `autoTable()` (ingresos en verde, gastos en rojo, presupuestos en azul).

**Pregunta típica:** *¿Por qué el PDF nunca puede desincronizarse de lo que se ve en pantalla?* → Porque ambos (`setPreview` y el PDF) parten de las **mismas** variables `gastos`, `ingresos`, `totalGastos`, etc. — no hay una segunda consulta separada para el PDF.

### 2.2 Soporte y mensajería — `AdminSoportePage.jsx` + `SoportePage.jsx`
Cuatro funciones, dos por cada lado:

| Función | Lado | Qué hace |
|---|---|---|
| `cargarDatos()` | Admin | Trae usuarios (excluyendo al propio admin con `.neq('id', session.user.id)`) y **todo** el historial de mensajes |
| `enviarMensaje(e)` | Admin | Valida los 3 campos, hace `insert` en `mensajes`, limpia el form, recarga |
| `cargarMensajes()` | Usuario | Trae solo sus mensajes (`.eq('usuario_id', session.user.id)`), cuenta no leídos |
| `marcarLeido(id)` / `marcarTodosLeidos()` | Usuario | `update({ leido: true })` puntual o masivo |

**Pregunta típica:** *¿Cómo sabe el admin qué usuario recibió cada mensaje si la tabla solo guarda `usuario_id`?* → `cargarDatos()` cruza manualmente el arreglo de mensajes con el de usuarios en JavaScript (`m.usuario_id === u.id`) para armar `emailUsuario` antes de mostrarlo — no es un JOIN de SQL, es un `.find()` en el frontend.

### 2.3 Gestión de usuarios — `AdminUsuariosPage.jsx`
**`eliminarUsuario(id, email)`** es la función más delicada del proyecto:
```js
if (id === session?.user?.id) { alert('No puedes eliminarte a ti mismo.'); return }
// ...confirmación...
await supabase.from('gastos').delete().eq('user_id', id)
await supabase.from('ingresos').delete().eq('user_id', id)
await supabase.from('presupuesto').delete().eq('user_id', id)
await supabase.from('roles').delete().eq('id', id)
const { error } = await supabase.rpc('eliminar_usuario', { uid: id })
```
**Orden exacto y por qué importa:** primero se borran las tablas "hijas" (`gastos`, `ingresos`, `presupuesto`, `roles`) **manualmente desde el frontend**, y solo al final se llama la función RPC `eliminar_usuario` que borra de `auth.users`. Si se hiciera al revés (borrar `auth.users` primero), las referencias `user_id` en las demás tablas quedarían huérfanas.

**`cambiarRol(id, rolActual)`** hace un simple toggle (`usuario` ⇄ `administrador`) — nótese que **no** hay un tercer rol posible en todo el sistema.

### 2.4 El fix histórico de RPC (2.8 en la documentación)
Hubo un bug real: `.rpc('obtener_usuarios').select('*').order(...)` no funcionaba porque las funciones RPC de Supabase no encadenan `.select()`/`.order()` como las tablas normales. Se corrigió con un script Python que usó regex para quitar esos encadenamientos en 5 archivos a la vez. **Si preguntan por qué `obtener_usuarios` es una función RPC y no una consulta directa a `auth.users`:** porque el frontend (con la clave pública/anon) no tiene permiso de leer `auth.users` directamente — la función RPC actúa como una puerta controlada que sí puede.

### 2.5 Partículas — `ParticlesBackground.jsx`
No usa ninguna librería. El bucle de animación:
```js
particles.forEach((p) => {
  // dibuja el punto
  p.x += p.vx; p.y += p.vy
  if (p.x < 0 || p.x > width) p.vx *= -1   // rebote en bordes
  if (p.y < 0 || p.y > height) p.vy *= -1
})
if (!prefersReducedMotion) animationId = requestAnimationFrame(draw)
```
Las líneas entre partículas solo se dibujan si `dist < linkDistance`, con opacidad `1 - dist/linkDistance` — por eso las líneas se desvanecen antes de desaparecer del todo en vez de cortarse abruptamente.

### 2.6 El intro — `IntroSplash.jsx`
Máquina de 3 fases controlada por `setTimeout` encadenados (no por CSS `animation-iteration-count`, sino por estado de React):
```js
const t1 = setTimeout(() => setPhase('hold'), 900)   // 0.0s → 0.9s: entrada
const t2 = setTimeout(() => setPhase('exit'), 2200)  // 0.9s → 2.2s: pulso
const t3 = setTimeout(() => onFinish(), 3200)        // 2.2s → 3.2s: desintegración
```
Cada letra recibe valores aleatorios **una sola vez por render** vía inline style (`--dx`, `--dy`, `--rot`), consumidos luego por la animación CSS `intro-letter-break` — por eso cada vez que se muestra el intro, las letras "explotan" en direcciones distintas.

---

## 3. Identidad visual (CSS) — cómo un solo archivo cambia toda la app

`index.css` está dividido en 17 secciones numeradas. Las 3 que más preguntas generan:

### 3.1 Overrides de Bootstrap (sección 2)
```css
:root, [data-bs-theme="dark"] {
  --bs-info: var(--accent);
  --bs-danger: var(--danger);
  --bs-dark: var(--bg-secondary);
  /* ... */
}
```
**Esto es lo más importante para entender del CSS.** El JSX de todo el proyecto usa clases de Bootstrap (`text-info`, `border-danger`, `btn-info`, `bg-dark`) que **nunca se tocaron**. Cambiar la app de verde a cian no significó editar componentes — solo redefinir qué color *significa* `--bs-info` para Bootstrap.

**Pregunta típica:** *¿Por qué no usar directamente `var(--accent)` en cada componente?* → Porque ya existían decenas de usos de `text-info`/`btn-info` repartidos en 15 archivos; interceptar la variable que Bootstrap ya consulta internamente evita tocar uno por uno.

### 3.2 `.kpi-card`, `.hero-header`, `.glow-card` (secciones 6-7)
Son las 3 clases "de autor" (no son de Bootstrap) creadas específicamente para imitar el mockup de referencia:
- `.kpi-card` → tarjeta de métrica con borde superior cian (usada en `AdminPage`, `DashboardPage`, `IndexPage`)
- `.hero-header` → encabezado con overlay oscuro en gradiente, para el título de cada portal
- `.glow-card` → tarjeta con `box-shadow` de resplandor cian, usada en "El Problema" y "Fundadores" de `IndexPage`

### 3.3 `.bg-slideshow__overlay` (sección 15)
Un solo elemento con **4 capas de `background` apiladas** (grid horizontal + grid vertical + viñeta radial + degradado lineal), todas en una sola declaración separada por comas. Por eso agregar "profundidad" al fondo no requirió tocar ningún JSX: el `<div className="bg-slideshow__overlay">` ya estaba presente en las 3 páginas desde antes.

---

## 4. Seguridad real (SQL / Supabase) — la parte que sostiene todo lo demás

### 4.1 Row Level Security, con el ejemplo exacto del proyecto
```sql
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario ve sus mensajes" ON mensajes
FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "admin ve todos los mensajes" ON mensajes
FOR SELECT USING (
  (SELECT rol FROM roles WHERE id = auth.uid()) = 'administrador'
);
```
Fíjate que hay **dos políticas `SELECT` distintas sobre la misma tabla** — Postgres las combina con `OR`: una fila es visible si *cualquiera* de las dos condiciones se cumple. Por eso un admin ve todo (segunda política) y un usuario normal solo lo suyo (primera política, porque la segunda le da `false` al no ser admin).

**Pregunta típica, con la respuesta ya verificable en el código:** *¿Qué pasa si el frontend de `AdminSoportePage.jsx` tuviera un bug y pidiera `.from('mensajes').select('*')` sin filtrar por usuario?* → No importaría: si quien hace la consulta es un usuario normal, la política `"usuario ve sus mensajes"` igual solo le devuelve las filas donde `usuario_id = auth.uid()`. RLS actúa **después** de que la consulta llega a la base de datos, sin importar qué haya pedido el frontend.

### 4.2 `security_invoker = true` en las vistas
```sql
CREATE OR REPLACE VIEW public.usuarios_info
WITH (security_invoker = true) AS
SELECT u.id, u.email, u.created_at, r.rol
FROM auth.users u
JOIN public.roles r ON u.id = r.id;
```
Sin `security_invoker = true`, esta vista se ejecutaría con los permisos de quien la **creó** (típicamente un rol con acceso amplio a `auth.users`), y cualquiera con acceso a la vista vería el correo de **todos** los usuarios sin que RLS lo evitara — porque las políticas RLS de `auth.users`/`roles` se saltarían al correr la vista con privilegios elevados. Con `security_invoker = true`, la vista respeta los permisos de quien la consulta en cada momento.

### 4.3 La cadena de borrado (ver 2.3 más arriba)
`gastos` → `ingresos` → `presupuesto` → `roles` → `auth.users` (vía RPC). Este orden existe **porque** las tres primeras tablas tienen `user_id` como llave foránea hacia `auth.users(id)` — si Postgres tiene la restricción `REFERENCES auth.users(id)` sin `ON DELETE CASCADE`, borrar el usuario primero directamente fallaría con un error de integridad referencial.

---

## 5. Preguntas cruzadas (mezclan varias capas — las más difíciles)

**P: El balance se calcula en al menos 3 lugares distintos (`DashboardPage`, `AdminPage`, `AdminReportesPage`, `CuentasPage`). ¿No debería estar centralizado?**
R: Es cierto que la fórmula `totalIngresos - totalGastos` se repite. No hay una función compartida `calcularBalance()` extraída a un archivo de utilidades — es una oportunidad de mejora real (refactor), no un error funcional, porque cada página consulta datos con filtros distintos (por usuario+mes, global, por usuario sin filtro de mes), así que el balance en sí es siempre correcto para lo que cada pantalla muestra.

**P: Si RLS ya protege los datos, ¿para qué sirve entonces revisar el `rol` en el frontend (`App.jsx`)?**
R: Son dos capas distintas con propósitos distintos. El `rol` en el frontend decide **qué interfaz mostrar** (experiencia de usuario — no tiene sentido mostrarle a un usuario normal el botón "Eliminar usuario"). RLS decide **qué datos puede leer o escribir realmente** — es la capa de seguridad de verdad. Si solo existiera la primera, cualquiera con conocimientos básicos podría manipular el frontend y actuar como admin; si solo existiera la segunda, la interfaz mostraría botones que fallarían al hacer clic.

**P: ¿Por qué `ParticlesBackground` usa `<canvas>` y `bg-slideshow` usa `<div>` con imágenes de fondo, si ambos son "fondos animados"?**
R: Son técnicas distintas para necesidades distintas. `bg-slideshow` anima **imágenes fotográficas reales** (crossfade entre 2 archivos `.png`) — eso no se puede dibujar con canvas de forma práctica. `ParticlesBackground` dibuja **geometría generada** (puntos, líneas) que se recalcula en cada frame — eso sí es el caso de uso típico de `<canvas>`, y sería muy ineficiente intentar lograrlo animando cientos de `<div>`.

**P: El intro se muestra al cargar la app Y al iniciar sesión — ¿no debería mostrarse solo una vez por visita?**
R: Es una decisión de diseño, no una limitación técnica: `showIntro` no se guarda en `sessionStorage` ni `localStorage` a propósito, así que se repite en cada login. Si se quisiera que apareciera una sola vez por sesión de navegador, bastaría con guardar una bandera en `sessionStorage` y revisarla antes de activar `showIntro` — el código actual está preparado para ese cambio sin tocar `IntroSplash.jsx`, solo `App.jsx`.

---

## 6. Resumen para memorizar (elevator pitch, con nombres reales)

> "`App.jsx` decide con 4 estados (`session`, `rol`, `verIndex`, `showIntro`) qué mostrar en cada momento. La sesión y el rol vienen de Supabase; el rol se guarda en una tabla propia `roles` separada de `auth.users`. Toda la seguridad real está en políticas RLS de Postgres — por ejemplo la tabla `mensajes` tiene una política para que el usuario solo vea sus propios mensajes y otra para que el admin los vea todos, combinadas con OR. El frontend nunca decide qué datos llegan; eso lo decide la base de datos. Visualmente, un solo archivo `index.css` remapea las variables de Bootstrap para que toda la app cambie de paleta sin tocar los 15 componentes que ya usaban `text-info` o `bg-dark`."