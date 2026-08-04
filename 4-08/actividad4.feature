# Actividad 4 — Criterios de Aceptación (Historias Principales SMC)

A continuación se presentan los criterios de aceptación en formato **Gherkin** para las 5 historias de usuario clave del Sistema SMC, cubriendo los flujos principales (*Landing Page*, Autenticación y *Dashboard*):

---

## Historia 1: Ver página de inicio pública (Index)
**Historia:** Como **invitado**, quiero **ver la página de inicio (Index) con la presentación del proyecto y los fundadores**, para **conocer la aplicación SMC antes de registrarme**.

### Criterio 1: Carga exitosa de la Landing Page
  **Dado que** el usuario no ha iniciado sesión y navega a la URL principal (`/`)
  **Cuando** la página termina de cargar
  **Entonces** se debe mostrar la presentación del proyecto SMC, la información de los fundadores y los botones de acción para "Iniciar sesión" y "Registrarse".

### Criterio 2 (caso de error): Intento de navegación a ruta protegida sin autenticación
  **Dado que** el usuario es un invitado no autenticado
  **Cuando** intenta ingresar directamente a la dirección del Dashboard (`/dashboard`)
  **Entonces** el sistema debe redirigirlo automáticamente al formulario de inicio de sesión (`/login`) sin mostrar ningún dato privado.

---

## Historia 2: Registro de Usuario Regular
**Historia:** Como **invitado**, quiero **registrarme con mi cédula, nombre, correo y contraseña**, para **crear mi cuenta personal en el Sistema SMC**.

### Criterio 1: Registro exitoso de nueva cuenta
  **Dado que** el usuario está en el formulario de registro (`/register`)
  **Cuando** ingresa una cédula válida, su nombre, un correo no registrado y una contraseña que cumple con los requisitos mínimos de seguridad, y presiona "Crear Cuenta"
  **Entonces** el sistema crea la cuenta en Supabase Auth, guarda la información en la tabla `usuario` y redirige al usuario al Dashboard inicial.

### Criterio 2 (caso de error): Registro con correo o cédula existente
  **Dado que** el usuario está en el formulario de registro (`/register`)
  **Cuando** ingresa un correo electrónico o cédula que ya se encuentra registrada en la base de datos
  **Entonces** el sistema no guardará la información y mostrará el mensaje de error: *"El usuario o correo electrónico ya se encuentra registrado"*.

---

## Historia 3: Inicio de Sesión
**Historia:** Como **usuario regular**, quiero **iniciar sesión con mi correo y contraseña**, para **acceder a mis datos financieros de forma segura**.

### Criterio 1: Autenticación exitosa
  **Dado que** el usuario tiene una cuenta activa y se encuentra en la pantalla de inicio de sesión (`/login`)
  **Cuando** ingresa su correo y contraseña correctos y hace clic en "Iniciar Sesión"
  **Entonces** Supabase valida sus credenciales, genera un token de sesión seguro y el sistema lo redirige al Dashboard principal.

### Criterio 2 (caso de error): Credenciales inválidas
  **Dado que** el usuario se encuentra en la pantalla de inicio de sesión (`/login`)
  **Cuando** ingresa un correo o contraseña incorrectos
  **Entonces** el sistema no otorgará acceso a la plataforma y mostrará el mensaje de error: *"Credenciales incorrectas. Verifique su correo y contraseña"*.

---

## Historia 4: Visualización del Dashboard Financiero
**Historia:** Como **usuario regular**, quiero **ver el resumen de mis saldos, ingresos, gastos y presupuestos en el Dashboard**, para **tener visibilidad global del estado de mis finanzas**.

### Criterio 1: Carga y aislamiento de datos propios (RLS)
  **Dado que** el usuario regular ha iniciado sesión correctamente
  **Cuando** accede a la pantalla del Dashboard (`/dashboard`)
  **Entonces** el sistema consulta la base de datos y despliega **únicamente** las cuentas, egresos, ingresos y presupuestos vinculados a su número de cédula/ID de usuario.

### Criterio 2 (caso de error): Error de conexión o falla al recuperar información
  **Dado que** el usuario está en el Dashboard y experimenta una pérdida momentánea de conexión a Internet
  **Cuando** el Dashboard intenta obtener los datos financieros desde Supabase
  **Entonces** la plataforma no crasheará y mostrará una alerta indicando: *"No se pudieron cargar los datos. Verifique su conexión a Internet"*, manteniendo deshabilitadas las opciones de consulta hasta restablecer el servicio.

---

## Historia 5: Trazabilidad y Seguridad del Sistema (SMC)
**Historia:** Como **sistema**, quiero **registrar automáticamente los accesos y eventos de autenticación en la tabla `sistema_smc`**, para **mantener la auditoría y seguridad de la plataforma**.

### Criterio 1: Registro de auditoría automático tras inicio de sesión
  **Dado que** un usuario regular ingresa credenciales válidas
  **Cuando** el sistema procesa la autenticación con éxito
  **Entonces** se genera automáticamente un nuevo registro en la tabla `sistema_smc` almacenando el ID del usuario y la marca de tiempo exacta (`fecha_acceso`).

### Criterio 2 (caso de error): Intento no autorizado de modificación de auditoría
  **Dado que** un usuario regular está autenticado dentro de la aplicación
  **Cuando** intenta realizar un envío manual de datos o modificar/eliminar registros de la tabla `sistema_smc`
  **Entonces** las políticas RLS de Supabase denegarán la transacción y la base de datos retornará una excepción de *"Permiso Denegado"*.