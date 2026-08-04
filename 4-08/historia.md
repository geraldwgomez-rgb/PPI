## 📋 Historias de Usuario por Pantalla

### 1. Index / Página de inicio
* *Pantalla:* Index / Página de inicio
* *Rol:* Invitado (no autenticado)
* *Tabla relacionada:* Ninguna — es solo presentación estática
> *Como* invitado,  
> *quiero* explorar la presentación estática de la plataforma SMC,  
> *para* conocer los servicios y beneficios del sistema antes de registrarme.

---

### 2. Iniciar Sesión
* *Pantalla:* Iniciar Sesión
* *Rol:* Invitado
* *Tabla relacionada:* auth.users (Supabase Auth)
> *Como* invitado,  
> *quiero* ingresar mi correo y contraseña registrados,  
> *para* autenticarme y acceder a mis datos financieros.

---

### 3. Registro / Crear cuenta
* *Pantalla:* Registro / Crear cuenta
* *Rol:* Invitado
* *Tabla relacionada:* auth.users (Supabase Auth)
> *Como* invitado,  
> *quiero* crear una cuenta introduciendo mis datos básicos,  
> *para* obtener credenciales de acceso e ingresar al sistema.

---

### 4. Dashboard / Panel principal
* *Pantalla:* Dashboard / Panel principal
* *Rol:* Usuario Regular
* *Tablas relacionadas:* gastos, ingresos, presupuesto
> *Como* usuario regular,  
> *quiero* visualizar un resumen con mis gastos, ingresos y presupuesto general,  
> *para* monitorear mi estado financiero global de un solo vistazo.

---

### 5. Gastos → Mis Gastos
* *Pantalla:* Gastos → Mis Gastos
* *Rol:* Usuario Regular
* *Tabla relacionada:* gastos
> *Como* usuario regular,  
> *quiero* registrar y consultar la lista de mis gastos diarios,  
> *para* llevar un control detallado del dinero que sale de mi cuenta.

---

### 6. Gastos → Categorías
* *Pantalla:* Gastos → Categorías
* *Rol:* Usuario Regular
* *Tabla relacionada:* categoria
> *Como* usuario regular,  
> *quiero* crear y organizar diferentes categorías de gastos,  
> *para* clasificar mis egresos de manera ordenada según mis necesidades.

---

### 7. Ingresos
* *Pantalla:* Ingresos
* *Rol:* Usuario Regular
* *Tabla relacionada:* ingresos
> *Como* usuario regular,  
> *quiero* registrar mis fuentes de ingreso con su respectivo monto y fecha,  
> *para* saber con precisión cuánto dinero dispongo para mis gastos y ahorro.

---

### 8. Presupuestos
* *Pantalla:* Presupuestos
* *Rol:* Usuario Regular
* *Tabla relacionada:* presupuesto
> *Como* usuario regular,  
> *quiero* definir límites de gasto periódicos en la tabla de presupuestos,  
> *para* evitar excederme de mis metas financieras asignadas.

---

### 9. Usuarios / Perfil
* *Pantalla:* Usuarios / Perfil
* *Rol:* Usuario Regular
* *Tabla relacionada:* usuario
> *Como* usuario regular,  
> *quiero* consultar y actualizar la información de mi perfil en la tabla usuario,  
> *para* mantener mis datos personales e identificación al día.

---

### 10. Productos
* *Pantalla:* Productos
* *Rol:* Usuario Regular
* *Tabla relacionada:* productos
> *Como* usuario regular,  
> *quiero* consultar el catálogo de productos disponibles en la tabla productos,  
> *para* conocer las características y precios de lo que puedo adquirir o registrar.

---

### 11. Sistema SMC (Auditoría)
* *Pantalla:* Sistema SMC (Auditoría)
* *Rol:* Administrador
* *Tablas relacionadas:* sistema_smc, cuenta, usuario, categoria, presupuesto
> *Como* administrador,  
> *quiero* auditar los registros e historial de cambios en las tablas del sistema (sistema_smc, cuenta, usuario, categoria, presupuesto),  
> *para* garantizar la se…