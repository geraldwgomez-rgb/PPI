# 📦 Manual de Instalación — Sistema SMC
**Sistema de Control Financiero Personal**
Versión 1.0 | React + Supabase

---

## 📋 Tabla de Contenidos

1. [Requisitos previos](#1-requisitos-previos)
2. [Instalación para desarrolladores](#2-instalación-para-desarrolladores)
3. [Configuración de Supabase](#3-configuración-de-supabase)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Ejecutar el proyecto](#5-ejecutar-el-proyecto)
6. [Instalación en GitHub Codespaces](#6-instalación-en-github-codespaces)
7. [Solución de problemas comunes](#7-solución-de-problemas-comunes)

---

## 1. Requisitos previos

### Para desarrolladores

Antes de instalar el proyecto asegúrate de tener instalado:

| Herramienta | Versión mínima | Descarga |
| :--- | :--- | :--- |
| **Node.js** | v18 o superior | [nodejs.org](https://nodejs.org) |
| **npm** | v9 o superior | Viene incluido con Node.js |
| **Git** | Cualquier versión reciente | [git-scm.com](https://git-scm.com) |
| **Navegador moderno** | Chrome, Firefox o Edge | — |

Para verificar que los tienes instalados, abre una terminal y ejecuta:

```bash
node --version   # Debe mostrar v18.x.x o superior
npm --version    # Debe mostrar 9.x.x o superior
git --version    # Debe mostrar git version x.x.x
```

### Para usuarios no técnicos

Solo necesitas:
- Una cuenta en **GitHub** ([github.com](https://github.com))
- Una cuenta en **Supabase** ([supabase.com](https://supabase.com))
- Un navegador moderno (Chrome recomendado)

Si usas **GitHub Codespaces** no necesitas instalar nada en tu computador. Ve directamente a la [sección 6](#6-instalación-en-github-codespaces).

---

## 2. Instalación para desarrolladores

### Paso 1 — Clonar el repositorio

Abre una terminal y ejecuta:

```bash
git clone https://github.com/TU_USUARIO/PPI.git
```

> Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

### Paso 2 — Entrar a la carpeta del proyecto

```bash
cd PPI/16-06
```

### Paso 3 — Instalar las dependencias

```bash
npm install
```

Este comando descarga todas las librerías necesarias del proyecto. Puede tardar entre 1 y 3 minutos dependiendo de tu conexión a internet.

Las dependencias principales que se instalarán son:

| Librería | Para qué sirve |
| :--- | :--- |
| `react` + `react-dom` | Interfaz de usuario |
| `react-router-dom` | Navegación entre páginas |
| `@supabase/supabase-js` | Conexión con la base de datos |
| `bootstrap` | Estilos y componentes visuales |
| `recharts` | Gráficos del dashboard |
| `jspdf` + `jspdf-autotable` | Generación de reportes PDF |
| `vite` | Servidor de desarrollo |

### Paso 4 — Verificar la instalación

```bash
npm list react
```

Debe mostrar `react@18.x.x` sin errores.

---

## 3. Configuración de Supabase

### Paso 1 — Crear una cuenta

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en **Start your project**
3. Inicia sesión con tu cuenta de GitHub (recomendado) o crea una cuenta nueva

### Paso 2 — Crear un proyecto nuevo

1. Haz clic en **New project**
2. Completa los campos:
   - **Name:** `sistema-smc` (o el nombre que prefieras)
   - **Database Password:** crea una contraseña segura y guárdala
   - **Region:** `South America (São Paulo)` — la más cercana a Colombia
3. Haz clic en **Create new project**
4. Espera 1-2 minutos mientras se aprovisiona

### Paso 3 — Crear las tablas de la base de datos

1. Ve a **SQL Editor** en el menú lateral
2. Haz clic en **New query**
3. Pega y ejecuta el contenido del archivo `populationdb.SQL` del repositorio
4. Haz clic en **Run** — debe mostrar `Success`

### Paso 4 — Configurar la autenticación

1. Ve a **Authentication → Providers → Email**
2. Verifica que **Email** esté habilitado ✅
3. Ve a **Authentication → URL Configuration**
4. En **Site URL** escribe la URL donde correrá tu app:
   - Local: `http://localhost:5173`
   - Codespaces: la URL de tu puerto 5173
5. Haz clic en **Save changes**

### Paso 5 — Obtener las credenciales de la API

1. Ve a **Project Settings** (ícono de engranaje ⚙️)
2. Clic en **API**
3. Copia y guarda estos dos valores:

| Campo | Dónde está |
| :--- | :--- |
| `VITE_SUPABASE_URL` | **Project URL** |
| `VITE_SUPABASE_ANON_KEY` | **Project API keys → anon public** |

> ⚠️ **Nunca copies la clave `service_role`** — esa es solo para uso en servidores backend.

---

## 4. Variables de entorno

### Paso 1 — Crear el archivo `.env`

En la raíz de la carpeta `16-06` crea un archivo llamado `.env`:

```bash
# En la terminal, estando en PPI/16-06:
touch .env
```

### Paso 2 — Agregar las credenciales

Abre el archivo `.env` con cualquier editor de texto y escribe:

```env
VITE_SUPABASE_URL=https://TU_PROJECT_URL.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

Reemplaza los valores con las credenciales que copiaste en el paso anterior. Por ejemplo:

```env
VITE_SUPABASE_URL=https://xvvwwvbvcsmkvkfrandg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Paso 3 — Proteger el archivo `.env`

Asegúrate de que `.env` esté en el archivo `.gitignore` para no subir tus credenciales a GitHub:

```bash
echo ".env" >> .gitignore
```

> ⚠️ **Nunca subas el archivo `.env` a GitHub.** Las credenciales expuestas pueden ser usadas por terceros para acceder a tu base de datos.

---

## 5. Ejecutar el proyecto

### En desarrollo (local)

```bash
npm run dev
```

Abre tu navegador en:
```
http://localhost:5173
```

### En GitHub Codespaces

```bash
npm run dev -- --host
```

Luego ve a la pestaña **Puertos**, cambia la visibilidad del puerto 5173 a **Público** y abre la URL que aparece.

### Crear el primer usuario administrador

1. Inicia la app y regístrate con tu correo
2. Ve a **Supabase → Authentication → Users**, copia el UUID de tu usuario
3. En **SQL Editor** ejecuta:

```sql
UPDATE roles
SET rol = 'administrador'
WHERE id = (SELECT id FROM auth.users WHERE email = 'tu@email.com');
```

Reemplaza `tu@email.com` con el correo que usaste para registrarte.

---

## 6. Instalación en GitHub Codespaces

Esta opción es ideal si no quieres instalar nada en tu computador.

### Paso 1 — Abrir el repositorio en Codespaces

1. Ve a [github.com](https://github.com) e inicia sesión
2. Abre el repositorio **PPI**
3. Haz clic en el botón verde **Code**
4. Selecciona la pestaña **Codespaces**
5. Haz clic en **Create codespace on main**
6. Espera 1-2 minutos mientras se configura el entorno

### Paso 2 — Entrar a la carpeta del proyecto

En la terminal del Codespace ejecuta:

```bash
cd 16-06
```

### Paso 3 — Instalar dependencias

```bash
npm install
```

### Paso 4 — Crear el archivo `.env`

```bash
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://TU_PROJECT_URL.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
EOF
```

### Paso 5 — Iniciar el servidor

```bash
npm run dev -- --host
```

### Paso 6 — Abrir en el navegador

1. Ve a la pestaña **Puertos** (junto a Terminal)
2. Busca el puerto **5173**
3. Haz clic derecho → **Visibilidad del puerto** → **Público**
4. Haz clic en el enlace para abrir la app

> ⚠️ Cada vez que el Codespace se reinicie, deberás volver a crear el archivo `.env` ya que los archivos no rastreados por Git no se conservan entre sesiones.

---

## 7. Solución de problemas comunes

### ❌ `sh: vite: not found`

**Causa:** Las dependencias no están instaladas.

**Solución:**
```bash
npm install
npm run dev -- --host
```

---

### ❌ `supabaseUrl is required`

**Causa:** El archivo `.env` no existe o está mal configurado.

**Solución:**
```bash
# Verifica que el archivo existe
cat .env

# Si no existe, créalo
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://TU_URL.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE
EOF

# Reinicia Vite
npm run dev -- --host
```

---

### ❌ `Failed to load resource: 500`

**Causa:** Error en las políticas RLS de Supabase o recursión infinita en una política.

**Solución:** Ve a **Supabase → SQL Editor** y ejecuta:

```sql
-- Verificar políticas activas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

Si hay políticas duplicadas o recursivas, elimínalas con:

```sql
DROP POLICY IF EXISTS "nombre_de_la_politica" ON nombre_tabla;
```

---

### ❌ `No routes matched location "/ruta"`

**Causa:** La ruta no está definida en `App.jsx` para el rol actual del usuario.

**Solución:** Verifica que la ruta esté incluida en el bloque de rutas correspondiente al rol (`usuario` o `administrador`) en `src/App.jsx`.

---

### ❌ La página aparece en blanco (Error 404 en Codespaces)

**Causa:** El puerto no está configurado como público o Vite no está corriendo.

**Solución:**
```bash
# 1. Detén Vite con Ctrl+C
# 2. Actualiza vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: 'all',
  },
})
EOF

# 3. Reinicia Vite
npm run dev -- --host
```

Luego en la pestaña **Puertos** cambia el puerto 5173 a **Público**.

---

### ❌ `email rate limit exceeded`

**Causa:** Supabase limita el envío de correos de confirmación a 2 por hora en el plan gratuito.

**Solución:** Crea el usuario manualmente desde el panel de Supabase:
1. Ve a **Authentication → Users**
2. Clic en **Add user → Create new user**
3. Ingresa el correo y contraseña
4. Marca **Auto Confirm User** ✅
5. Clic en **Create user**

---

## 📁 Estructura del proyecto

```
PPI/
└── 16-06/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Header.jsx
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   └── Layout.jsx
    │   │   ├── gastos/
    │   │   │   ├── FormularioGasto.jsx
    │   │   │   ├── FiltroGastos.jsx
    │   │   │   └── ListaGastos.jsx
    │   │   ├── ingresos/
    │   │   │   ├── FormularioIngreso.jsx
    │   │   │   ├── FiltroIngresos.jsx
    │   │   │   └── ListaIngresos.jsx
    │   │   ├── presupuestos/
    │   │   │   ├── FormularioPresupuesto.jsx
    │   │   │   ├── ListaPresupuestos.jsx
    │   │   │   └── BarraProgreso.jsx
    │   │   └── auth/
    │   ├── lib/
    │   │   └── supabaseClient.js
    │   ├── pages/
    │   │   ├── IndexPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── GastosPage.jsx
    │   │   ├── IngresosPage.jsx
    │   │   ├── PresupuestosPage.jsx
    │   │   ├── ProductosPage.jsx
    │   │   ├── UsuariosPage.jsx
    │   │   ├── SoportePage.jsx
    │   │   ├── CuentasPage.jsx
    │   │   ├── AdminPage.jsx
    │   │   ├── AdminUsuariosPage.jsx
    │   │   ├── AdminReportesPage.jsx
    │   │   └── AdminSoportePage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env                  ← NO subir a GitHub
    ├── .gitignore
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🔗 Recursos útiles

| Recurso | Enlace |
| :--- | :--- |
| Documentación de Supabase | [supabase.com/docs](https://supabase.com/docs) |
| Documentación de React | [react.dev](https://react.dev) |
| Documentación de Vite | [vitejs.dev](https://vitejs.dev) |
| Documentación de Bootstrap | [getbootstrap.com](https://getbootstrap.com) |
| Documentación de Recharts | [recharts.org](https://recharts.org) |
| GitHub Codespaces | [docs.github.com/codespaces](https://docs.github.com/en/codespaces) |

---

*Manual de instalación del Sistema SMC — Proyecto PPI*