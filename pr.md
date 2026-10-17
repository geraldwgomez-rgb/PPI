# Guion de la exposición — Sistema SMC

Basado en `Presentacion_Sistema_SMC.pdf` (12 diapositivas) y en los lineamientos de `presentacionPPI.md`.
**Duración:** 10 a 12 minutos de exposición + 3 a 5 de preguntas. **Proporción:** 40 % diapositivas, 60 % demo y arquitectura.

> Los responsables por bloque son una **propuesta** según el rol de cada uno. Cámbienlos como quieran, pero todos deben hablar.

---

## 1. Mapa de tiempos y responsables

| Diap. | Sección | Tiempo | Quién (propuesta) |
|---|---|---|---|
| 1–2 | Portada, problema y objetivo | 1:30 | Daniel |
| 3 | Solución propuesta | 1:00 | Sarai |
| 4 | Arquitectura | 1:30 | Yulian |
| 5–6 | Modelo de datos y seguridad (RLS) | 1:30 | Gerald |
| 7 | Tecnologías y herramientas | 0:45 | Juan José |
| 8 | **Demo en vivo** | 3:00 | Sarai maneja la interfaz, Gerald muestra Supabase, Juan José muestra el repositorio |
| 9 | Retos y aprendizajes | 1:00 | Yulian |
| 10–11 | Mejoras futuras y conclusiones | 1:00 | Daniel |
| 12 | Cierre y preguntas | 0:15 | Todos |
| | **Total** | **≈ 11:30** | |

---

## 2. Qué decir en cada diapositiva

Cada punto es una idea para decir con sus palabras, no para leer.

**1. Portada** — Presenten el proyecto y a cada integrante con su rol (Frontend / Backend).

**2. Problema y objetivo**
- Muchos microempresarios en Colombia no llevan un orden financiero.
- Eso causa pérdidas de dinero y cierres prematuros.
- Objetivo: una app web para registrar, controlar y analizar ingresos y gastos.

**3. Solución (5 funciones)**
- Ingresos y gastos con filtros.
- Presupuestos por periodo.
- Resumen con gráficos.
- Reportes en PDF (administrador).
- Soporte con respuestas sugeridas (FAQ).
- Hay dos roles: usuario y administrador.

**4. Arquitectura**
- El usuario entra desde el navegador a la app React publicada en GitHub Pages (hosting estático).
- React habla con Supabase mediante `supabase-js`: PostgreSQL, autenticación y RLS.
- Se desarrolló en GitHub Codespaces, con el mismo entorno para todo el equipo.
- Variables de entorno: URL y clave `anon`. La `service_role` nunca se sube al repositorio.

**5. Modelo de datos**
- `auth.users` guarda los usuarios y `roles` el rol de cada uno (1 a 1).
- `gastos`, `ingresos`, `presupuesto` y `mensajes` se relacionan con el usuario (1 a N).
- `faq_soporte` guarda las preguntas frecuentes que administra el admin.

**6. Seguridad (RLS)**
- La clave `anon` es pública porque va en el frontend.
- Por eso la protección está en la base de datos: RLS activo en cada tabla.
- Cada usuario ve solo sus filas (`usuario_id = auth.uid()`); el admin tiene políticas propias.
- El rol que ve el frontend solo decide qué mostrar; lo que protege los datos es RLS.

**7. Tecnologías** — Una frase por herramienta: qué hace y por qué la eligieron (React + Vite, Supabase, Codespaces, GitHub Pages, Bootstrap, recharts y jsPDF).

**8. Demo** — Ver el guion de la sección 3.

**9. Retos (solo estos tres, son reales)**
- Las imágenes de fondo no cargaban en Vite → carpeta `public/` y rutas absolutas.
- Vistas SQL con `SECURITY DEFINER` saltaban RLS → `security_invoker`.
- El usuario no podía escribir a soporte → política `INSERT` nueva y campo `remitente`.

**10–11. Mejoras y conclusiones**
- Alertas de presupuesto, control de concurrencia, lógica compartida (un solo cálculo de balance) y despliegue continuo.
- Cierre: resolvimos un problema real, con arquitectura clara y seguridad en la base de datos, trabajando en equipo.

**12. Cierre** — Agradecer y abrir preguntas. Si tienen el enlace y el QR del sitio y del repositorio, ponerlos en esta diapositiva (lo piden los lineamientos).

---

## 3. Guion de la demo (3 minutos)

Usen el **sitio publicado en GitHub Pages**, no `localhost`.

| # | Flujo | Qué mostrar | Quién |
|---|---|---|---|
| 1 | Registro e inicio de sesión | Entrar con el usuario de prueba y, en Supabase, mostrar el usuario en Auth | Sarai / Gerald |
| 2 | Registrar un gasto | Crear un gasto y abrir el **Table Editor** de Supabase (tabla `gastos`) para ver la fila nueva | Sarai / Gerald |
| 3 | Resumen y gráficos | Volver a "Mi Resumen": cambió el balance y los gráficos por categoría | Sarai |
| 4 | Soporte y reporte | Usuario escribe a soporte con una pregunta de las FAQ (ej. "¿cómo registro un gasto?"); entrar como admin, ver la **respuesta sugerida** y enviarla; luego generar el **reporte PDF** | Sarai |
| 5 | Repositorio (30 s) | Estructura de carpetas, historial de commits y participación de cada integrante | Juan José |

**Datos que deben estar cargados de antemano:** un usuario de prueba con ingresos y gastos en varias categorías, al menos un presupuesto, una cuenta de administrador y las FAQ cargadas.

**Plan B:** capturas de pantalla o un video corto de cada flujo, por si falla el internet o Supabase.

---

## 4. Revisen esto antes del día (riesgos reales)

Estos puntos pueden romper la demo en GitHub Pages. Pruébenlos en el sitio publicado.

- [ ] **Rutas y recarga (F5).** `App.jsx` usa `BrowserRouter`. GitHub Pages no resuelve rutas del lado del servidor, así que recargar una ruta interna (por ejemplo `/gastos`) puede dar 404. Verifiquen cómo lo resolvieron: `HashRouter`, `basename` o un `404.html`. Es una pregunta probable del docente.
- [ ] **Variables de entorno en el despliegue.** Las `VITE_...` se incluyen al construir. Comprueben que el sitio publicado sí se conecta a Supabase.
- [ ] **URL de Auth en Supabase.** En Authentication → URL configuration, la URL de GitHub Pages debe estar como Site URL o Redirect URL. Si no, el correo de confirmación del registro apunta a otro lado.
- [ ] **Imágenes de fondo y fotos de fundadores** cargan en el sitio publicado (no solo en local).
- [ ] **Proyecto de Supabase activo.** Los gratuitos se pausan por inactividad; reactívenlo con anticipación.
- [ ] **Soporte con FAQ.** Si van a demostrarlo, confirmen que ya corrieron `automatizacion-soporte.sql` en Supabase.
- [ ] **Sin claves secretas** en el código ni en el repositorio.
- [ ] `README` con descripción, instalación y enlace al sitio; repositorio accesible para el docente.
- [ ] Un ensayo completo **cronometrado**.

---

## 5. Preguntas probables y cómo responder

**¿Por qué Supabase y no otro backend?**
Da base de datos PostgreSQL, autenticación y seguridad por filas en un solo servicio, sin montar ni mantener un servidor propio. Eso nos dejó concentrarnos en la aplicación.

**¿Cómo protegen los datos si la clave está en el frontend?**
La clave `anon` es pública por diseño. La protección son las políticas RLS: aunque alguien cambie el código del navegador, la base de datos solo devuelve las filas que le corresponden a ese usuario (`auth.uid()`). La `service_role` nunca está en el repositorio.

**¿Qué pasa si dos usuarios editan el mismo dato al mismo tiempo?**
Hoy gana la última escritura (no hay bloqueo). Cada usuario edita sobre todo sus propios registros, así que el riesgo es bajo. Como mejora: una columna `updated_at` con verificación antes de guardar, o Realtime.

**¿Cómo manejan la autenticación y los roles?**
Supabase Auth maneja el inicio de sesión. Una tabla `roles` (mismo id que el usuario) guarda `usuario` o `administrador`. El frontend consulta el rol y muestra las rutas correspondientes; la seguridad real de los datos está en RLS.

**¿Qué limitaciones tiene GitHub Pages?**
Es hosting estático: no ejecuta código de servidor ni resuelve rutas del lado del servidor (por eso hay que usar `HashRouter` o configurar `basename`/`404.html`), y las variables de entorno quedan en el código construido, por eso solo van claves públicas. [Completar: qué solución usaron para las rutas.]

**¿Cómo se organizó el trabajo en equipo en GitHub?**
[Completar con lo real: ramas, quién hizo qué, commits, pull requests. Tengan el historial a la mano para mostrarlo.]

**¿Qué escalarían o cambiarían con miles de usuarios?**
- Hoy el panel del administrador trae todos los gastos e ingresos y suma en el navegador. Con muchos datos habría que mover esos agregados a vistas o funciones SQL.
- Agregar índices en `user_id` y `fecha`, y paginación en las listas.
- Pasar a un plan de Supabase de mayor capacidad.
- Centralizar la lógica repetida (el balance se calcula en varias pantallas).

**Preguntas extra que pueden salir**
- *¿Por qué no usan una librería como Material UI o Tailwind?* Bootstrap ya estaba en el proyecto; se sobreescribieron sus variables en `index.css` para tener identidad propia sin reescribir los componentes.
- *¿Cómo se genera el reporte PDF?* En el navegador del administrador con `jsPDF` y `jspdf-autotable`, a partir de las mismas consultas que se ven en pantalla; no hay servidor.
- *¿La respuesta automática de soporte contesta sola al usuario?* No: el sistema deja una respuesta **sugerida** al administrador, que decide enviarla, editarla o escribir otra.

---

## 6. Consejos para el día

- No lean las diapositivas: son apoyo. Tienen poco texto a propósito.
- Definan quién avanza las diapositivas y quién maneja el navegador en la demo.
- Si algo falla, sigan con el Plan B sin detenerse a explicar el error.