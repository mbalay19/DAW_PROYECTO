# MEMORIA DEL PROYECTO — MindTracker
## CFGS Desarrollo de Aplicaciones Web · 2S2526

---

# 1. INTRODUCCIÓN

## 1.1 Motivación

El punto de partida de este proyecto fue una observación cotidiana: las personas que llevan algún tipo de seguimiento de su estado de ánimo o de sus rutinas diarias tienden a desarrollar una mayor conciencia de los patrones que influyen en su bienestar. Sin embargo, las aplicaciones disponibles en el mercado suelen estar orientadas a perfiles específicos, presentan interfaces sobrecargadas o requieren suscripciones de pago para acceder a las funciones más relevantes.

La idea de construir MindTracker surgió a partir de la experiencia cercana con una persona que mantenía un diario de seguimiento emocional de forma manual, anotando en papel cómo se había sentido cada día y qué hábitos había cumplido. El proceso era funcional pero laborioso: no permitía visualizar tendencias a lo largo del tiempo ni exportar datos de forma sencilla. Ante esa situación, la propuesta fue desarrollar una herramienta web propia que cubriera esa necesidad de forma accesible, sin coste y adaptada a un uso diario sostenido.

Desde una perspectiva técnica, el proyecto también responde a la voluntad de consolidar los conocimientos adquiridos durante el ciclo formativo en un entorno de desarrollo real. La arquitectura elegida, basada en una API REST con Node.js y Express en el back-end y React en el front-end, representa una combinación ampliamente utilizada en la industria y cuya comprensión práctica resulta esencial para el ejercicio profesional en el sector del desarrollo web.

## 1.2 Abstract

MindTracker is a full-stack web application designed to help users record and monitor their daily emotional state and lifestyle habits. The system allows authenticated users to log a mood score between 1 and 10 accompanied by free text notes, as well as track five predefined habits — sleep duration, physical exercise, reading, study, and diet quality — each with a set of discrete options.

The back-end is built on Node.js with the Express.js 5 framework, exposing a REST API consumed by a React 18 single-page application. Authentication relies on JSON Web Tokens stored in HttpOnly cookies, and user passwords are hashed with bcrypt. Data persistence is handled by a MariaDB relational database consisting of five tables. The application is deployed on an Apache 2 reverse proxy running on Ubuntu (WSL), which forwards API requests to the Node.js process and serves the compiled React bundle as static files.

The project targets personal use and small-scale deployment, prioritising simplicity of interaction and data ownership by the user over cloud-based third-party solutions.

## 1.3 Objetivos

### Objetivo general

Desarrollar una aplicación web funcional que permita a cualquier persona registrar diariamente su estado de ánimo y el cumplimiento de una serie de hábitos de vida, con acceso a un historial de entradas y a un perfil de usuario gestionable.

### Objetivos específicos

1. Implementar un sistema de autenticación seguro basado en JWT almacenados en cookies HttpOnly, con contraseñas cifradas mediante bcrypt.
2. Diseñar y construir una API REST con Node.js y Express.js que exponga los endpoints necesarios para la gestión de usuarios, registros de estado de ánimo y hábitos diarios.
3. Crear una base de datos relacional en MariaDB con un mínimo de cinco tablas correctamente relacionadas mediante claves foráneas.
4. Desarrollar el front-end como una SPA (Single Page Application) con React 18 y React Router DOM, integrando todas las vistas de la aplicación.
5. Desplegar la aplicación en un servidor Apache 2 actuando como proxy inverso sobre un entorno Ubuntu en WSL.
6. Garantizar que la aplicación sea utilizable desde un navegador moderno sin instalación adicional por parte del usuario final.
7. Documentar el sistema de forma que permita su instalación, uso y mantenimiento por parte de terceros.

---

# 2. ESTADO DEL ARTE

## 2.1 Contexto general

El seguimiento del estado emocional y de los hábitos de vida ha ganado relevancia en los últimos años dentro del ámbito de las aplicaciones de salud digital. Organismos como la Organización Mundial de la Salud han señalado reiteradamente que la salud mental es uno de los grandes retos del siglo XXI, y el mercado de aplicaciones móviles y web orientadas al bienestar personal ha respondido con una proliferación de herramientas de distinta naturaleza y complejidad.

En términos generales, estas aplicaciones se pueden agrupar en tres categorías: los diarios de humor (*mood trackers*), los gestores de hábitos (*habit trackers*) y las aplicaciones de bienestar integral que combinan ambas funcionalidades junto con meditaciones guiadas, estadísticas avanzadas y programas personalizados.

## 2.2 Aplicaciones existentes

**Daylio** es una de las referencias más consolidadas en el segmento de *mood tracking* para móvil. Permite registrar el estado de ánimo con iconos visuales y asociar actividades a cada entrada. Su interfaz es sencilla y la experiencia de usuario está muy pulida, pero la versión gratuita limita el acceso al historial y a las estadísticas. No dispone de versión web y los datos residen en servidores propios de la empresa.

**Bearable** amplía el concepto de seguimiento hacia un modelo más orientado a la salud: permite registrar síntomas, medicación, sueño, energía y estado emocional en una misma entrada diaria. Es una herramienta más completa, pero también más compleja de utilizar para un propósito exclusivamente cotidiano. El modelo de negocio está basado en suscripción premium.

**Reflectly** adopta un enfoque de diario guiado por inteligencia artificial, con preguntas dinámicas que varían según el perfil del usuario. Aunque la experiencia es atractiva visualmente, la dependencia de un servicio en la nube y la ausencia de control sobre los propios datos son factores que limitan su adecuación para usuarios preocupados por la privacidad.

**Habitica** gamifica el seguimiento de hábitos mediante un sistema de rol: los hábitos se convierten en misiones y los fallos penalizan al personaje. Es una propuesta original, pero el foco en la mecánica de juego puede distraer del objetivo real y no incluye ningún tipo de seguimiento emocional.

**Notion** y **Obsidian**, aunque no son aplicaciones específicas de seguimiento de hábitos, son utilizadas por muchas personas para construir sistemas de diario personal con plantillas. La flexibilidad es máxima, pero la curva de configuración es elevada y no ofrecen una experiencia guiada.

## 2.3 Carencias identificadas

Del análisis anterior se desprenden varias carencias que justifican el desarrollo de una solución propia:

- **Modelo de negocio**: las funcionalidades más relevantes (historial completo, exportación de datos, estadísticas detalladas) quedan reservadas a versiones de pago en la mayoría de los casos.
- **Disponibilidad web**: muchas aplicaciones están diseñadas exclusivamente para móvil, lo que dificulta el acceso desde un ordenador personal.
- **Control de datos**: las soluciones comerciales alojan los datos en infraestructuras de terceros, sin que el usuario pueda auditar ni controlar dónde se almacena su información.
- **Complejidad de uso**: las aplicaciones más completas presentan curvas de aprendizaje elevadas que desincentivan un uso diario sostenido.

## 2.4 Posicionamiento de MindTracker

MindTracker no aspira a competir en funcionalidades con soluciones comerciales maduras, sino a ofrecer una herramienta funcional, autohospedada y de código abierto que cubra el ciclo completo de registro, consulta y gestión de entradas de estado de ánimo y hábitos. La apuesta por tecnologías estándar del ecosistema web (Node.js, React, MariaDB) facilita tanto el despliegue en infraestructuras propias como la posible extensión futura del sistema.

Desde el punto de vista técnico, la combinación de una API REST stateless con autenticación por token y una SPA desacoplada del servidor es coherente con los patrones arquitectónicos predominantes en aplicaciones web modernas, lo que hace del proyecto un caso de estudio aplicable a entornos profesionales reales.

---

# 3. METODOLOGÍA

## 3.1 Enfoque de desarrollo

El proyecto se ha desarrollado siguiendo un enfoque iterativo e incremental, con ciclos cortos de trabajo orientados a entregar funcionalidad verificable al final de cada iteración. Este enfoque, compatible con los principios del desarrollo ágil, permite adaptar el alcance a medida que aparecen impedimentos técnicos o se detectan necesidades no previstas en la planificación inicial.

No se ha adoptado ningún marco ágil formal como Scrum o Kanban en su totalidad, ya que el proyecto es individual y no requiere de las ceremonias de coordinación propias de equipos. En su lugar, se han tomado los elementos más útiles de estas metodologías: la división del trabajo en tareas pequeñas y concretas, la priorización continua del backlog y la revisión periódica del progreso.

## 3.2 Fases del proyecto

El desarrollo se articuló en cuatro fases principales:

**Fase 1 — Análisis y diseño (semanas 1-2)**
Se definieron los requisitos funcionales y no funcionales, se modeló el esquema de base de datos y se diseñaron los wireframes de las principales vistas. También se tomaron las decisiones arquitectónicas fundamentales: separación entre API y front-end, uso de JWT en cookies, despliegue con proxy inverso Apache.

**Fase 2 — Desarrollo del back-end (semanas 3-5)**
Se implementó el servidor Express, el sistema de autenticación, los modelos de datos en MariaDB y todos los endpoints de la API REST. Al final de esta fase, la API era completamente funcional y testeable mediante herramientas como cURL o Postman.

**Fase 3 — Desarrollo del front-end (semanas 6-9)**
Se construyó la SPA con React, implementando las vistas de inicio de sesión, registro, panel principal (entrada diaria, registros, perfil) y la integración con la API. Se prestó especial atención a la gestión del estado de autenticación y a la navegación entre vistas.

**Fase 4 — Despliegue, pruebas y documentación (semanas 10-12)**
Se configuró el entorno de producción con Apache 2 y se automatizó el proceso de despliegue mediante un script. Se realizaron pruebas funcionales de caja negra sobre los principales casos de uso y se redactó la documentación técnica y el manual de usuario.

## 3.3 Control de versiones

El desarrollo se gestionó con Git, manteniendo el historial de cambios en un repositorio local. Se empleó una estrategia de ramas sencilla, con una rama principal (`main`) que refleja siempre el estado estable del proyecto y ramas de trabajo por funcionalidad cuando fue necesario aislar cambios experimentales.

## 3.4 Herramientas de apoyo

Para la edición del código se utilizó Visual Studio Code con las extensiones ESLint (basado en StandardJS) y Prettier para mantener la coherencia del estilo. La base de datos se administró durante el desarrollo mediante DBeaver, que permite visualizar el esquema y ejecutar consultas de forma interactiva.

---

# 4. TECNOLOGÍAS Y HERRAMIENTAS

## 4.1 Entorno de ejecución: Node.js

Node.js es un entorno de ejecución de JavaScript del lado del servidor basado en el motor V8 de Chrome. Su arquitectura orientada a eventos y no bloqueante lo hace especialmente adecuado para servidores de API con múltiples conexiones concurrentes y operaciones de entrada/salida como las consultas a base de datos. En este proyecto se utilizan módulos ES (`"type": "module"` en `package.json`), lo que permite el uso de la sintaxis `import`/`export` de forma nativa.

## 4.2 Framework web: Express.js 5

Express.js es el framework más extendido para la construcción de aplicaciones web y APIs con Node.js. La versión 5 (actualmente en estado estable) incorpora mejoras en el manejo de errores asíncronos, permitiendo que los errores lanzados en handlers `async` se propaguen automáticamente al middleware de error sin necesidad de bloques `try/catch` adicionales en cada ruta. En MindTracker, Express gestiona el enrutamiento, aplica los middlewares de seguridad y sirve los archivos estáticos del front-end compilado.

## 4.3 Base de datos: MariaDB

MariaDB es un sistema de gestión de bases de datos relacionales derivado de MySQL, mantenido por la comunidad y ampliamente utilizado en entornos de producción. Se eligió por su compatibilidad con MySQL, su rendimiento en consultas simples y la disponibilidad del paquete oficial `mariadb` para Node.js, que soporta consultas parametrizadas y gestión de conexiones mediante pool.

El esquema de la base de datos consta de cinco tablas (`users`, `moods`, `habits`, `habit_options`, `habit_logs`) relacionadas mediante claves foráneas con integridad referencial, lo que garantiza la consistencia de los datos incluso ante operaciones concurrentes.

## 4.4 Autenticación: JWT y bcrypt

La autenticación se implementa con JSON Web Tokens (RFC 7519). Tras un inicio de sesión exitoso, el servidor genera un token firmado con una clave secreta almacenada en una variable de entorno (`JWT_SECRET`) y lo envía al cliente como una cookie con los atributos `HttpOnly` y `SameSite`. Este mecanismo impide que el token sea accesible desde JavaScript del lado del cliente, mitigando ataques XSS.

Para el almacenamiento de contraseñas se utiliza la librería `bcrypt`, que aplica el algoritmo bcrypt con un factor de coste de 10 rondas de sal. Este factor implica que cada operación de verificación de contraseña requiere un tiempo computacionalmente costoso, dificultando ataques de fuerza bruta sobre contraseñas comprometidas.

## 4.5 Front-end: React 18 y Vite

React es una biblioteca de JavaScript para la construcción de interfaces de usuario mediante componentes. La versión 18 introduce mejoras en el renderizado concurrente, aunque en este proyecto el uso principal se centra en la gestión de estado local con `useState` y efectos secundarios con `useEffect`.

Vite actúa como bundler y servidor de desarrollo. Frente a alternativas como Webpack, Vite ofrece tiempos de arranque muy reducidos gracias al uso de ESM nativos en el servidor de desarrollo y a la compilación bajo demanda. Para producción, genera un build optimizado en `client/dist/` que el servidor Express sirve como archivos estáticos.

## 4.6 Enrutado: React Router DOM

React Router DOM v6 gestiona la navegación en el lado del cliente. Se definen dos tipos de rutas protegidas: `ProtectedRoute` (redirige a `/login` si no hay sesión activa) y `PublicRoute` (redirige a `/` si ya existe sesión). El estado de autenticación se inicializa consultando el endpoint `/api/me` al cargar la aplicación, lo que permite mantener la sesión entre recargas de página.

## 4.7 Servidor web: Apache 2

Apache 2 actúa como proxy inverso entre el cliente y el servidor Node.js. Los módulos `mod_proxy` y `mod_proxy_http` redirigen las peticiones con prefijos `/api/` y `/auth/` al proceso Node.js en el puerto 2345, mientras que el resto de rutas sirven el archivo `index.html` del bundle de React. Esto permite la navegación directa a cualquier ruta de la SPA sin obtener un error 404 del servidor.

Además, Apache gestiona los certificados TLS mediante `mod_ssl` y aplica cabeceras de seguridad HTTP (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`).

## 4.8 Entorno de desarrollo: WSL Ubuntu y Git

El desarrollo y el despliegue se realizaron sobre Ubuntu corriendo en el Subsistema de Windows para Linux (WSL2). Este entorno permite trabajar con herramientas nativas de Linux (apt, systemctl, Apache) directamente desde Windows, facilitando la paridad entre el entorno de desarrollo y un posible entorno de producción en servidor Linux.

Git se utilizó para el control de versiones del código fuente, manteniendo el historial de cambios y permitiendo la recuperación de versiones anteriores en caso de regresiones.

---

# 5. PLANIFICACIÓN, DIAGNÓSTICO Y CONTEXTO LABORAL

## 5.1 Planificación temporal

El proyecto se desarrolló en un período aproximado de doce semanas. La siguiente tabla resume la distribución del trabajo por semanas:

| Semanas | Actividad |
|---------|-----------|
| 1-2     | Análisis de requisitos, diseño del modelo de datos y wireframes |
| 3-4     | Implementación del servidor Express, modelos de base de datos y endpoints de autenticación |
| 5       | Endpoints de moods y habits; middleware de autenticación |
| 6-7     | Componentes React: Login, Dashboard, MoodForm |
| 8-9     | Componentes React: HabitsPanel, RegistrosView, PerfilView |
| 10      | Configuración de Apache, script de despliegue, integración final |
| 11      | Pruebas funcionales y corrección de errores |
| 12      | Documentación, memoria del proyecto, revisión final |

## 5.2 Análisis DAFO

**Debilidades**
- Proyecto individual: no hay revisión de código por pares, lo que aumenta el riesgo de introducir errores no detectados.
- Ausencia de pruebas automatizadas (unitarias o de integración), lo que implica dependencia exclusiva de pruebas manuales.
- El despliegue actual sobre WSL no es una arquitectura de producción estándar.

**Amenazas**
- La dependencia de servicios externos (MariaDB, Apache, Node.js) implica que cualquier actualización de versiones puede introducir incompatibilidades.
- El ecosistema de JavaScript evoluciona rápidamente; las versiones de dependencias pueden quedar obsoletas en poco tiempo.

**Fortalezas**
- Arquitectura limpia con separación entre API y front-end, lo que facilita el mantenimiento y la extensión del sistema.
- Uso de estándares abiertos y ampliamente documentados (JWT, bcrypt, REST).
- Código organizado siguiendo el patrón MVC, con separación clara entre rutas, controladores y modelos.

**Oportunidades**
- La creciente demanda de herramientas de bienestar personal autohospedadas abre posibilidades de uso real por parte de terceros.
- La base técnica del proyecto es extensible hacia funcionalidades de mayor complejidad (estadísticas, notificaciones, exportación de datos).

## 5.3 Contexto laboral y módulos relacionados

El proyecto integra competencias de varios módulos del ciclo formativo de Desarrollo de Aplicaciones Web:

- **Desarrollo Web en Entorno Servidor**: implementación de la API REST con Node.js y Express, gestión de sesiones con JWT, acceso a base de datos.
- **Desarrollo Web en Entorno Cliente**: construcción de la SPA con React, manejo del DOM, gestión de eventos y peticiones AJAX.
- **Bases de Datos**: diseño del esquema relacional, normalización, uso de claves foráneas e índices.
- **Despliegue de Aplicaciones Web**: configuración de Apache como proxy inverso, manejo de certificados TLS, automatización del despliegue.
- **Sistemas Informáticos**: administración del entorno Ubuntu en WSL, gestión de servicios con systemctl.

---

# 6. ANÁLISIS

## 6.1 Requisitos funcionales

Los requisitos funcionales definen qué debe hacer el sistema desde la perspectiva del usuario. Se identificaron los siguientes:

**RF-01 — Registro de usuario**
El sistema debe permitir que una persona nueva cree una cuenta proporcionando nombre, apellidos, teléfono, correo electrónico y contraseña. El correo electrónico debe ser único en el sistema.

**RF-02 — Inicio de sesión**
El sistema debe autenticar a un usuario registrado mediante su correo electrónico y contraseña. Tras una autenticación exitosa, se debe mantener la sesión de forma persistente hasta que el usuario cierre sesión o expire el token (24 horas).

**RF-03 — Cierre de sesión**
El sistema debe permitir al usuario finalizar su sesión activa, eliminando la cookie de autenticación.

**RF-04 — Registro de estado de ánimo**
El usuario autenticado debe poder crear una entrada diaria con un valor numérico de estado de ánimo (entre 1 y 10), una nota de texto libre y una fecha.

**RF-05 — Consulta del historial de estados de ánimo**
El usuario debe poder consultar todas sus entradas anteriores, con posibilidad de filtrar por rango de fechas y limitar el número de resultados.

**RF-06 — Modificación de una entrada de estado de ánimo**
El usuario debe poder editar el valor, la nota y la fecha de una entrada previamente registrada.

**RF-07 — Eliminación de una entrada de estado de ánimo**
El usuario debe poder eliminar cualquiera de sus entradas registradas.

**RF-08 — Registro de hábitos diarios**
El usuario debe poder registrar, para una fecha dada, el nivel de cumplimiento de cada uno de los cinco hábitos predefinidos (sueño, deporte, lectura, estudio, alimentación) seleccionando una opción de una lista predefinida.

**RF-09 — Consulta del historial de hábitos**
El usuario debe poder consultar sus registros de hábitos con posibilidad de filtrar por rango de fechas.

**RF-10 — Consulta de hábitos por fecha**
El usuario debe poder consultar qué hábitos registró en una fecha concreta.

**RF-11 — Eliminación de un registro de hábito**
El usuario debe poder eliminar un registro de hábito específico.

**RF-12 — Consulta del perfil de usuario**
El usuario debe poder ver sus datos personales (nombre, apellidos, teléfono, correo electrónico).

**RF-13 — Modificación del perfil de usuario**
El usuario debe poder actualizar su nombre, apellidos y número de teléfono.

**RF-14 — Cambio de contraseña**
El usuario debe poder cambiar su contraseña proporcionando la contraseña actual y la nueva (mínimo 6 caracteres).

## 6.2 Requisitos no funcionales

**RNF-01 — Seguridad de autenticación**
Las contraseñas deben almacenarse cifradas con bcrypt (sal ≥ 10 rondas). Los tokens JWT deben almacenarse en cookies HttpOnly para prevenir su acceso desde JavaScript.

**RNF-02 — Disponibilidad web**
La aplicación debe ser accesible desde cualquier navegador moderno (Chrome, Firefox, Edge, Safari) sin instalación de software adicional por parte del usuario.

**RNF-03 — Tiempo de respuesta**
Las peticiones a la API deben resolverse en menos de 500 ms en condiciones de carga baja sobre el entorno de despliegue definido.

**RNF-04 — Integridad de datos**
La base de datos debe garantizar la integridad referencial mediante claves foráneas. Las eliminaciones en cascada deben propagar correctamente la eliminación de registros dependientes.

**RNF-05 — Mantenibilidad**
El código debe seguir el patrón MVC con separación clara de responsabilidades. Se debe aplicar el estándar de código StandardJS para mantener la coherencia del estilo.

**RNF-06 — Usabilidad**
La interfaz debe permitir registrar un estado de ánimo y los hábitos del día en menos de dos minutos desde el inicio de sesión.

## 6.3 Casos de uso

### Diagrama de casos de uso

Los actores del sistema son:
- **Usuario no autenticado**: puede acceder a las vistas públicas (login y registro).
- **Usuario autenticado**: puede gestionar sus propios registros y perfil.
- **Sistema**: gestiona la sesión, la base de datos y las respuestas de error.

### Especificación de casos de uso principales

---

**CU-01: Registrar nuevo usuario**

| Campo | Descripción |
|-------|-------------|
| Identificador | CU-01 |
| Nombre | Registrar nuevo usuario |
| Actor | Usuario no autenticado |
| Precondición | El usuario no tiene cuenta en el sistema |
| Flujo principal | 1. El usuario accede a la pestaña de registro.<br>2. Introduce nombre, apellidos, teléfono, correo y contraseña.<br>3. El sistema valida que todos los campos están completos.<br>4. El sistema verifica que el correo no está ya registrado.<br>5. El sistema crea la cuenta con la contraseña cifrada.<br>6. El sistema confirma el registro. |
| Flujo alternativo A | En el paso 3, si falta algún campo: el sistema devuelve un error 400 indicando los campos requeridos. |
| Flujo alternativo B | En el paso 4, si el correo ya existe: el sistema devuelve un error 400 indicando que el correo está registrado. |
| Postcondición | La cuenta queda creada y el usuario puede iniciar sesión. |

---

**CU-02: Iniciar sesión**

| Campo | Descripción |
|-------|-------------|
| Identificador | CU-02 |
| Nombre | Iniciar sesión |
| Actor | Usuario no autenticado |
| Precondición | El usuario tiene una cuenta creada |
| Flujo principal | 1. El usuario introduce su correo y contraseña.<br>2. El sistema busca el usuario por correo.<br>3. El sistema verifica la contraseña con bcrypt.<br>4. El sistema genera un JWT y lo almacena en una cookie HttpOnly con expiración de 24 horas.<br>5. El sistema devuelve los datos básicos del usuario.<br>6. El cliente redirige al panel principal. |
| Flujo alternativo A | En el paso 2, si el correo no existe: error 400 "Usuario no encontrado". |
| Flujo alternativo B | En el paso 3, si la contraseña no coincide: error 400 "Contraseña incorrecta". |
| Postcondición | El usuario tiene una sesión activa y accede al panel principal. |

---

**CU-03: Registrar estado de ánimo del día**

| Campo | Descripción |
|-------|-------------|
| Identificador | CU-03 |
| Nombre | Registrar estado de ánimo |
| Actor | Usuario autenticado |
| Precondición | El usuario tiene sesión activa |
| Flujo principal | 1. El usuario accede a la vista de entrada diaria.<br>2. Selecciona un valor entre 1 y 10 en la cuadrícula de selección.<br>3. Escribe una nota en el campo de texto.<br>4. Selecciona la fecha (por defecto, la del día actual).<br>5. Envía el formulario.<br>6. El sistema valida los datos y crea el registro.<br>7. El sistema devuelve el registro creado con su identificador. |
| Flujo alternativo A | En el paso 6, si falta algún campo: error 400. |
| Postcondición | El registro de estado de ánimo queda guardado en la base de datos. |

---

**CU-04: Registrar hábitos del día**

| Campo | Descripción |
|-------|-------------|
| Identificador | CU-04 |
| Nombre | Registrar hábitos diarios |
| Actor | Usuario autenticado |
| Precondición | El usuario tiene sesión activa |
| Flujo principal | 1. El usuario accede al panel de hábitos en la vista de entrada diaria.<br>2. El sistema carga los cinco hábitos predefinidos con sus opciones.<br>3. Para cada hábito, el usuario selecciona una de las opciones disponibles.<br>4. Al seleccionar una opción, el cliente envía inmediatamente la petición al servidor.<br>5. Si ya existía un registro para ese hábito en esa fecha, el sistema lo actualiza (upsert).<br>6. El sistema confirma el guardado. |
| Postcondición | Los registros de hábitos para la fecha seleccionada quedan guardados o actualizados. |

---

**CU-05: Consultar historial**

| Campo | Descripción |
|-------|-------------|
| Identificador | CU-05 |
| Nombre | Consultar historial de registros |
| Actor | Usuario autenticado |
| Precondición | El usuario tiene sesión activa |
| Flujo principal | 1. El usuario accede a la vista de registros.<br>2. El sistema consulta los estados de ánimo del usuario ordenados por fecha descendente.<br>3. El sistema muestra la lista de entradas con fecha, valor y nota. |
| Flujo alternativo A | El usuario puede eliminar una entrada. El sistema solicita confirmación y, tras ella, elimina el registro. |
| Postcondición | El usuario visualiza o modifica el historial de sus registros. |

---

**CU-06: Gestionar perfil**

| Campo | Descripción |
|-------|-------------|
| Identificador | CU-06 |
| Nombre | Gestionar perfil de usuario |
| Actor | Usuario autenticado |
| Precondición | El usuario tiene sesión activa |
| Flujo principal | 1. El usuario accede a la vista de perfil.<br>2. El sistema muestra los datos actuales: nombre, apellidos, teléfono, correo.<br>3. El usuario modifica los campos deseados y guarda.<br>4. El sistema actualiza los datos en la base de datos y devuelve los valores actualizados. |
| Flujo alternativo A | Cambio de contraseña: el usuario introduce la contraseña actual y la nueva (dos veces). El sistema verifica la actual, comprueba que la nueva tiene al menos 6 caracteres y actualiza el hash en la base de datos. |
| Postcondición | El perfil del usuario queda actualizado. |

---

## 6.4 Modelo entidad-relación

El modelo de datos consta de cinco entidades principales:

**users**: almacena los datos de registro de cada persona usuaria del sistema. Campos: `id` (PK, autoincremental), `name`, `lastName`, `telephone`, `email` (único), `password` (hash bcrypt), `provider` (tipo de autenticación, por defecto 'local'), `createdAt`, `updatedAt`.

**moods**: registra las entradas de estado de ánimo. Campos: `id` (PK), `userId` (FK → users.id, cascade delete), `mood` (entero 0-10, con restricción CHECK), `notes` (texto libre), `date` (tipo DATE), `createdAt`.

**habits**: catálogo de hábitos predefinidos del sistema. Campos: `id` (PK), `name`, `description`, `icon` (nombre de icono), `createdAt`. Se inicializa mediante seeding automático al arrancar la aplicación.

**habit_options**: lista de opciones disponibles para cada hábito. Campos: `id` (PK), `habitId` (FK → habits.id), `label` (texto de la opción), `sortOrder` (orden de presentación).

**habit_logs**: registros de cumplimiento de hábitos por usuario y fecha. Campos: `id` (PK), `userId` (FK → users.id, cascade delete), `habitId` (FK → habits.id), `habitOptionId` (FK → habit_options.id), `date` (DATE), `createdAt`. Tiene una restricción UNIQUE sobre (userId, habitId, date), lo que garantiza un único registro por hábito, usuario y día.

Las relaciones son:
- Un usuario puede tener muchos registros de moods (1:N).
- Un usuario puede tener muchos registros de habit_logs (1:N).
- Cada hábito tiene múltiples opciones (1:N entre habits y habit_options).
- Cada registro de habit_log referencia una opción específica de un hábito.

---

# 7. DISEÑO

## 7.1 Arquitectura del sistema

MindTracker sigue una arquitectura de tres capas:

**Capa de presentación (front-end)**: SPA construida con React 18, que se comunica con el servidor únicamente a través de peticiones HTTP a la API REST. Una vez descargado el bundle inicial, la navegación entre vistas se realiza en el lado del cliente sin nuevas cargas de página.

**Capa de aplicación (back-end)**: API REST implementada con Node.js y Express.js 5. Sigue el patrón MVC: las rutas delegan en los controladores, que utilizan los modelos para acceder a la base de datos. Los middlewares de autenticación verifican el token antes de permitir el acceso a los endpoints protegidos.

**Capa de persistencia**: base de datos relacional MariaDB con cinco tablas. El acceso se gestiona mediante un pool de conexiones (límite de 5 conexiones concurrentes) para optimizar el rendimiento y evitar la saturación del servidor de base de datos.

**Capa de infraestructura**: Apache 2 actúa como punto de entrada único. Las peticiones con prefijo `/api/` o `/auth/` se redirigen al proceso Node.js; el resto se sirven desde el directorio estático del bundle React o se devuelve `index.html` para soportar la navegación del lado del cliente.

## 7.2 Diseño de la API REST

La API sigue los principios REST: identificación de recursos mediante URLs, uso de los verbos HTTP (GET, POST, PUT, DELETE) según la semántica de la operación, y respuestas en formato JSON.

### Endpoints de autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | /auth/register | Crear nueva cuenta | No |
| POST | /auth/login | Iniciar sesión | No |
| POST | /auth/logout | Cerrar sesión | No |
| GET | /api/me | Obtener usuario autenticado actual | Sí |

### Endpoints de estado de ánimo

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | /api/users/moods | Crear registro de mood | Sí |
| GET | /api/users/logs | Obtener historial con filtros opcionales | Sí |
| PUT | /api/users/moods/:id | Actualizar registro por ID | Sí |
| DELETE | /api/users/moods/:id | Eliminar registro por ID | Sí |

### Endpoints de hábitos

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/habits | Obtener catálogo de hábitos y opciones | Sí |
| POST | /api/habits/logs | Crear o actualizar registro de hábito | Sí |
| GET | /api/habits/logs | Obtener historial de hábitos con filtros | Sí |
| GET | /api/habits/logs/date/:date | Obtener hábitos de una fecha específica | Sí |
| DELETE | /api/habits/logs/:id | Eliminar registro de hábito | Sí |

### Endpoints de perfil

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/users/profile | Obtener datos del perfil | Sí |
| PUT | /api/users/profile | Actualizar perfil | Sí |
| PUT | /api/users/password | Cambiar contraseña | Sí |

## 7.3 Diseño del front-end

### Estructura de componentes

La aplicación se organiza en las siguientes vistas principales, gestionadas por React Router DOM:

**`/login`** → Componente `Login`
Contiene dos pestañas: inicio de sesión y registro. La pestaña de inicio de sesión presenta un formulario con campos de correo y contraseña. La pestaña de registro añade los campos de nombre, apellidos, teléfono y confirmación de contraseña. Ambas pestañas realizan validaciones en el cliente antes de enviar la petición al servidor (formato de correo con expresión regular, longitud mínima de contraseña, coincidencia de contraseñas en el registro).

**`/`** → Componente `Dashboard`
Panel principal de la aplicación, accesible solo para usuarios autenticados. Contiene tres vistas internas accesibles desde un menú desplegable en la cabecera:

- **EntradaView**: disposición en dos columnas con `MoodForm` a la izquierda y `HabitsPanel` a la derecha. `MoodForm` presenta una cuadrícula de selección de valores del 1 al 10, un campo de texto para notas y un selector de fecha. `HabitsPanel` carga los cinco hábitos desde la API y presenta para cada uno sus opciones como botones selectables; al cambiar de fecha, recarga los registros existentes para esa fecha.

- **RegistrosView**: lista cronológica de entradas de estado de ánimo. Cada entrada muestra la fecha, el valor numérico del mood y las notas. Incluye un botón de eliminación por entrada.

- **PerfilView**: dos formularios apilados verticalmente. El primero (`ProfileForm`) permite editar nombre, apellidos y teléfono. El segundo (`PasswordForm`) gestiona el cambio de contraseña con los tres campos requeridos.

### Flujo de autenticación

Al cargar la aplicación, `App.jsx` realiza una petición a `/api/me` para determinar si existe una sesión activa. El estado del usuario se inicializa como `undefined` (cargando) hasta recibir respuesta. Si la respuesta es exitosa, el estado pasa a un objeto con los datos del usuario (autenticado); si falla, pasa a `null` (no autenticado). Las rutas protegidas y públicas utilizan este estado para redirigir al usuario según corresponda.

## 7.4 Decisiones de diseño de la interfaz

La interfaz sigue un diseño minimalista que prioriza la legibilidad y la rapidez de interacción. Las principales decisiones de diseño son:

- **Cuadrícula de selección de mood**: en lugar de un slider o un input numérico, los valores del 1 al 10 se presentan como botones en una cuadrícula, lo que facilita la selección con un solo clic tanto en escritorio como en dispositivos táctiles.

- **Guardado inmediato de hábitos**: al seleccionar una opción en el panel de hábitos, la petición se envía de inmediato sin necesidad de un botón de confirmación. Esto reduce la fricción del proceso de registro diario.

- **Estado de carga explícito**: mientras se verifica la sesión en el arranque de la aplicación, se muestra una pantalla de carga para evitar parpadeos de rutas o redirecciones prematuras.

- **Navegación por menú desplegable**: la cabecera incluye un menú desplegable que permite cambiar de vista sin ocupar espacio permanente en la interfaz, lo que mantiene el área de contenido lo más amplia posible.

---

# 8. DESPLIEGUE Y PRUEBAS

## 8.1 Entorno de despliegue

La aplicación se despliega sobre un entorno Ubuntu 22.04 corriendo en WSL2 sobre Windows. Los servicios principales son:

- **Apache 2**: servidor web y proxy inverso, escuchando en los puertos 80 (HTTP) y 443 (HTTPS).
- **Node.js**: proceso de la API, escuchando en el puerto 2345 de localhost.
- **MariaDB**: servidor de base de datos, escuchando en el puerto por defecto (3306).

## 8.2 Proceso de despliegue

El proyecto incluye un script `deploy.sh` que automatiza los pasos del despliegue. El proceso manual equivalente es el siguiente:

**Paso 1 — Clonar el repositorio**
```
git clone <url-repositorio> /var/www/html/mindtracker
cd /var/www/html/mindtracker
```

**Paso 2 — Configurar variables de entorno**
Crear el archivo `.env` en la raíz del proyecto con las siguientes variables:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=<usuario_mariadb>
DB_PASSWORD=<contraseña_mariadb>
DB_NAME=mindtracker
JWT_SECRET=<clave_secreta_aleatoria>
CLIENT_ORIGIN=https://<dominio>
PORT=2345
```

**Paso 3 — Instalar dependencias del back-end**
```
npm install
```

**Paso 4 — Compilar el front-end**
```
cd client
npm install
npm run build
```
El resultado se genera en `client/dist/`.

**Paso 5 — Configurar Apache**
Copiar el archivo de configuración del virtualhost:
```
sudo cp apache-config/mindtracker.conf /etc/apache2/sites-available/
sudo a2ensite mindtracker.conf
sudo a2enmod proxy proxy_http rewrite ssl headers
sudo systemctl reload apache2
```

**Paso 6 — Iniciar el servidor Node.js**
Para un entorno de producción se recomienda usar PM2:
```
npm install -g pm2
pm2 start App.js --name mindtracker
pm2 save
pm2 startup
```

Al arrancar, el servidor Node.js ejecuta automáticamente `initializeDatabase()`, que crea las tablas si no existen y realiza el seeding inicial de los hábitos.

## 8.3 Configuración de Apache

El virtualhost de Apache define dos bloques: uno para el puerto 80 que redirige todo el tráfico a HTTPS, y otro para el puerto 443 con la siguiente configuración relevante:

- `DocumentRoot`: apunta al directorio `frontend` donde se sirven los archivos estáticos.
- `ProxyPass /api/` y `ProxyPass /auth/`: redirigen las peticiones de API al proceso Node.js en `http://localhost:2345/`.
- `mod_rewrite`: si la petición no corresponde a un archivo estático existente, sirve `index.html` para que React Router gestione la ruta en el lado del cliente.
- Cabeceras de seguridad: `X-Frame-Options DENY`, `X-Content-Type-Options nosniff`, `X-XSS-Protection "1; mode=block"`, `Strict-Transport-Security`.

## 8.4 Pruebas funcionales

Las pruebas se realizaron mediante pruebas de caja negra sobre la interfaz web y sobre la API directamente mediante cURL. Para cada caso de uso principal se definieron casos de prueba con los siguientes parámetros: precondiciones, datos de entrada, resultado esperado y resultado obtenido.

---

**CP-01: Registro de usuario con datos válidos**

| Campo | Valor |
|-------|-------|
| Precondición | El correo no está registrado en el sistema |
| Entrada | Nombre: "Ana", Apellidos: "García", Teléfono: "600000001", Email: "ana@test.com", Password: "password123" |
| Resultado esperado | HTTP 201; respuesta JSON con id, name y email del usuario creado |
| Resultado obtenido | HTTP 201 ✓ |

---

**CP-02: Registro de usuario con correo duplicado**

| Campo | Valor |
|-------|-------|
| Precondición | El correo "ana@test.com" ya está registrado |
| Entrada | Mismo correo que CP-01 |
| Resultado esperado | HTTP 400; mensaje "El email ya está registrado" |
| Resultado obtenido | HTTP 400 ✓ |

---

**CP-03: Inicio de sesión correcto**

| Campo | Valor |
|-------|-------|
| Precondición | Usuario "ana@test.com" existe |
| Entrada | Email: "ana@test.com", Password: "password123" |
| Resultado esperado | HTTP 200; cookie `jwt` establecida; JSON con datos del usuario |
| Resultado obtenido | HTTP 200, cookie presente en respuesta ✓ |

---

**CP-04: Inicio de sesión con contraseña incorrecta**

| Campo | Valor |
|-------|-------|
| Precondición | Usuario "ana@test.com" existe |
| Entrada | Email: "ana@test.com", Password: "wrongpassword" |
| Resultado esperado | HTTP 400; mensaje "Contraseña incorrecta" |
| Resultado obtenido | HTTP 400 ✓ |

---

**CP-05: Acceso a endpoint protegido sin token**

| Campo | Valor |
|-------|-------|
| Precondición | Sin cookie JWT |
| Entrada | GET /api/me |
| Resultado esperado | HTTP 401 |
| Resultado obtenido | HTTP 401 ✓ |

---

**CP-06: Crear registro de mood con datos válidos**

| Campo | Valor |
|-------|-------|
| Precondición | Usuario autenticado |
| Entrada | mood: 7, notes: "Buen día en general", date: "2026-04-10" |
| Resultado esperado | HTTP 201; JSON con id, mood, notes y date del registro |
| Resultado obtenido | HTTP 201 ✓ |

---

**CP-07: Crear registro de mood con valor fuera de rango**

| Campo | Valor |
|-------|-------|
| Precondición | Usuario autenticado |
| Entrada | mood: 15, notes: "test", date: "2026-04-10" |
| Resultado esperado | HTTP 500 o error de validación |
| Resultado obtenido | Error lanzado por el modelo antes de insertar en BD ✓ |

---

**CP-08: Registrar hábito (upsert)**

| Campo | Valor |
|-------|-------|
| Precondición | Usuario autenticado; habitId 1 (Sueño) con opciones disponibles |
| Entrada | habitId: 1, habitOptionId: 3 (corresponde a la opción "6-7h"), date: "2026-04-10" |
| Resultado esperado | HTTP 201; registro creado o actualizado |
| Resultado obtenido | HTTP 201 ✓ |

---

**CP-09: Registrar hábito con opción que no pertenece al hábito**

| Campo | Valor |
|-------|-------|
| Precondición | Usuario autenticado |
| Entrada | habitId: 1, habitOptionId: 15 (opción de otro hábito), date: "2026-04-10" |
| Resultado esperado | HTTP 400 |
| Resultado obtenido | HTTP 400 ✓ |

---

**CP-10: Consultar historial de moods**

| Campo | Valor |
|-------|-------|
| Precondición | Usuario autenticado con al menos una entrada |
| Entrada | GET /api/users/logs |
| Resultado esperado | HTTP 200; JSON con id del usuario, count y array de entradas |
| Resultado obtenido | HTTP 200 ✓ |

---

**CP-11: Eliminar registro de mood de otro usuario**

| Campo | Valor |
|-------|-------|
| Precondición | Usuario A autenticado; existe mood con ID perteneciente al usuario B |
| Entrada | DELETE /api/users/moods/:idDeUsuarioB |
| Resultado esperado | HTTP 404 (el modelo filtra por userId en la query) |
| Resultado obtenido | HTTP 404 ✓ |

---

**CP-12: Cambio de contraseña con contraseña actual correcta**

| Campo | Valor |
|-------|-------|
| Precondición | Usuario autenticado |
| Entrada | currentPassword: "password123", newPassword: "newpass456" |
| Resultado esperado | HTTP 200; mensaje de confirmación |
| Resultado obtenido | HTTP 200 ✓ |

---

**CP-13: Cambio de contraseña con nueva contraseña demasiado corta**

| Campo | Valor |
|-------|-------|
| Precondición | Usuario autenticado |
| Entrada | currentPassword: "password123", newPassword: "abc" |
| Resultado esperado | HTTP 400; mensaje sobre longitud mínima |
| Resultado obtenido | HTTP 400 ✓ |

---

**CP-14: Actualizar perfil con nombre vacío**

| Campo | Valor |
|-------|-------|
| Precondición | Usuario autenticado |
| Entrada | name: "", lastName: "García" |
| Resultado esperado | HTTP 400 |
| Resultado obtenido | HTTP 400 ✓ |

---

# 9. CONCLUSIONES

El desarrollo de MindTracker ha permitido consolidar de forma práctica una parte considerable de los conocimientos adquiridos a lo largo del ciclo formativo. El proyecto abarcó el ciclo completo de desarrollo de una aplicación web: desde el análisis de requisitos y el diseño del modelo de datos hasta el despliegue en un entorno con servidor web real.

Técnicamente, el mayor aprendizaje residió en la implementación de la autenticación stateless con JWT y en la comprensión profunda de cómo interactúan el proxy inverso Apache, el servidor Node.js y la SPA de React para que el usuario perciba un sistema coherente. La gestión del estado de autenticación en el cliente, especialmente el manejo de los tres estados posibles (cargando, autenticado, no autenticado) y sus implicaciones en el enrutado, fue uno de los puntos más delicados de la implementación.

Desde una perspectiva de proceso, el trabajo iterativo por fases demostró ser adecuado para un proyecto individual: permitió detectar dependencias entre componentes con antelación y ajustar el alcance sin comprometer la funcionalidad esencial.

El resultado es una aplicación funcional que cumple todos los objetivos específicos planteados al inicio: API REST operativa, base de datos relacional correctamente diseñada, SPA desacoplada, autenticación segura y despliegue en entorno real.

---

# 10. VÍAS FUTURAS

El estado actual de MindTracker cubre el flujo esencial de registro y consulta de datos. Sin embargo, existen múltiples líneas de mejora que podrían añadir valor significativo al sistema:

**Visualización de datos y estadísticas**: la incorporación de gráficas de evolución del estado de ánimo a lo largo del tiempo (por semanas o meses) y la correlación visual entre mood y cumplimiento de hábitos sería la extensión más demandada. Librerías como Recharts o Chart.js permiten integrar este tipo de visualizaciones en el front-end de React sin complejidad excesiva.

**Sistema de notificaciones**: un recordatorio diario configurable (por correo electrónico o, en una versión móvil, mediante notificaciones push) que invite al usuario a realizar su registro en caso de no haberlo hecho antes de una hora determinada.

**Exportación de datos**: permitir al usuario descargar su historial completo en formato CSV o PDF, garantizando la portabilidad de sus datos y facilitando el uso de la información en otras herramientas.

**Autenticación OAuth**: integración con proveedores de identidad externos (Google, GitHub) para simplificar el proceso de registro y eliminar la gestión de contraseñas para quienes lo prefieran.

**Hábitos personalizados**: actualmente el catálogo de hábitos está fijo en la base de datos. Permitir que cada usuario defina sus propios hábitos con sus propias opciones añadiría una capa de personalización muy relevante.

**Pruebas automatizadas**: la ausencia de una suite de pruebas automatizadas es la deuda técnica más significativa del proyecto actual. La implementación de pruebas unitarias sobre los modelos y pruebas de integración sobre los endpoints de la API, utilizando herramientas como Vitest o Jest con supertest, reduciría considerablemente el riesgo de regresiones al añadir nuevas funcionalidades.

**Despliegue en contenedores**: la containerización de los tres servicios (Node.js, MariaDB, Apache) mediante Docker Compose simplificaría el despliegue en cualquier entorno y eliminaría la dependencia de WSL.

---

# 11. BIBLIOGRAFÍA Y WEBGRAFÍA

[1] OpenJS Foundation. *Node.js Documentation*. Disponible en: https://nodejs.org/en/docs [Consultado: marzo 2026]

[2] Express.js Team. *Express 5.x — API Reference*. Disponible en: https://expressjs.com/en/5x/api.html [Consultado: marzo 2026]

[3] Meta Open Source. *React Documentation*. Disponible en: https://react.dev [Consultado: febrero-abril 2026]

[4] Remix Software. *React Router v6 Documentation*. Disponible en: https://reactrouter.com/en/main [Consultado: febrero 2026]

[5] MariaDB Foundation. *MariaDB Server Documentation*. Disponible en: https://mariadb.com/kb/en/ [Consultado: marzo 2026]

[6] Auth0 by Okta. *JSON Web Tokens Introduction*. Disponible en: https://jwt.io/introduction [Consultado: febrero 2026]

[7] IETF. *RFC 7519 — JSON Web Token (JWT)*. Jones, M.; Bradley, J.; Sakimura, N. Mayo 2015. Disponible en: https://tools.ietf.org/html/rfc7519 [Consultado: febrero 2026]

[8] Provos, N.; Mazières, D. *A Future-Adaptable Password Scheme*. USENIX Annual Technical Conference. 1999.

[9] The Apache Software Foundation. *Apache HTTP Server Documentation 2.4*. Disponible en: https://httpd.apache.org/docs/2.4/ [Consultado: marzo 2026]

[10] Vite Team. *Vite Documentation*. Disponible en: https://vitejs.dev/guide/ [Consultado: febrero 2026]

[11] OWASP Foundation. *OWASP Top Ten*. Disponible en: https://owasp.org/www-project-top-ten/ [Consultado: febrero 2026]

[12] npm Inc. *bcrypt package*. Disponible en: https://www.npmjs.com/package/bcrypt [Consultado: febrero 2026]

[13] npm Inc. *jsonwebtoken package*. Disponible en: https://www.npmjs.com/package/jsonwebtoken [Consultado: febrero 2026]

[14] Fowler, M. *Patterns of Enterprise Application Architecture*. Addison-Wesley. 2002.

---

# 12. ANEXOS

## Anexo A — Manual de instalación

### Requisitos previos

- Ubuntu 22.04 (nativo o mediante WSL2 en Windows)
- Node.js v20 o superior
- npm v10 o superior
- MariaDB 10.6 o superior
- Apache 2.4 o superior
- Git

### Paso 1: Clonar el repositorio

```bash
git clone <url-del-repositorio> /var/www/html/mindtracker
cd /var/www/html/mindtracker/mindtracker
```

### Paso 2: Crear la base de datos en MariaDB

```sql
CREATE DATABASE mindtracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mindtracker_user'@'localhost' IDENTIFIED BY 'contraseña_segura';
GRANT ALL PRIVILEGES ON mindtracker.* TO 'mindtracker_user'@'localhost';
FLUSH PRIVILEGES;
```

### Paso 3: Configurar variables de entorno

Crear el archivo `.env` en el directorio raíz del proyecto (junto a `App.js`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=mindtracker_user
DB_PASSWORD=contraseña_segura
DB_NAME=mindtracker
JWT_SECRET=clave_aleatoria_de_al_menos_32_caracteres
CLIENT_ORIGIN=http://localhost
PORT=2345
```

### Paso 4: Instalar dependencias del back-end

```bash
npm install
```

### Paso 5: Compilar el front-end

```bash
cd client
npm install
npm run build
cd ..
```

### Paso 6: Configurar Apache

```bash
sudo cp apache-config/mindtracker.conf /etc/apache2/sites-available/
sudo a2enmod proxy proxy_http rewrite headers
sudo a2ensite mindtracker.conf
sudo a2dissite 000-default.conf
sudo systemctl reload apache2
```

Si se desea HTTPS, también activar `mod_ssl` y configurar los certificados en el archivo `.conf`.

### Paso 7: Iniciar el servidor

Para desarrollo:
```bash
npm run dev
```

Para producción con PM2:
```bash
npm install -g pm2
pm2 start App.js --name mindtracker
pm2 save
pm2 startup
```

### Paso 8: Verificar el funcionamiento

Abrir un navegador y acceder a `http://localhost`. Debe aparecer la pantalla de inicio de sesión. El servidor Node.js creará automáticamente las tablas de la base de datos y el seeding de hábitos en el primer arranque.

---

## Anexo B — Manual de usuario

### Acceso a la aplicación

Abrir un navegador moderno (Chrome, Firefox, Edge, Safari) y navegar a la dirección de la aplicación. La pantalla inicial muestra el formulario de inicio de sesión.

### Crear una cuenta nueva

1. En la pantalla de inicio de sesión, hacer clic en la pestaña **Registrarse**.
2. Rellenar los campos: nombre, apellidos, número de teléfono, correo electrónico y contraseña (mínimo 6 caracteres).
3. Repetir la contraseña en el campo de confirmación.
4. Hacer clic en **Crear cuenta**.
5. Si el registro es correcto, la aplicación vuelve a la pestaña de inicio de sesión.

### Iniciar sesión

1. En la pestaña **Iniciar sesión**, introducir el correo electrónico y la contraseña.
2. Hacer clic en **Entrar**.
3. Tras la autenticación, la aplicación redirige al panel principal.

### Registrar el estado de ánimo del día

1. En el panel principal, la vista por defecto es la **Entrada diaria**.
2. En la sección izquierda, seleccionar un número del 1 al 10 en la cuadrícula (1 = muy mal, 10 = excelente).
3. Escribir una nota en el campo de texto (obligatorio).
4. Verificar o cambiar la fecha en el selector (por defecto es la fecha actual).
5. Hacer clic en **Guardar**.

### Registrar los hábitos del día

1. En la misma vista de **Entrada diaria**, la sección derecha muestra los cinco hábitos.
2. Para cada hábito, seleccionar la opción que mejor describe el día (por ejemplo, para Sueño: "7-8h").
3. La selección se guarda automáticamente al hacer clic en cada opción. No es necesario ningún botón adicional de guardar.
4. Si se cambia la fecha, el panel recarga automáticamente los registros de esa fecha si existen.

### Consultar el historial

1. Hacer clic en el menú de la cabecera y seleccionar **Registros**.
2. Se muestra la lista de entradas de estado de ánimo ordenadas de más reciente a más antigua, con la fecha, el valor numérico y las notas de cada entrada.
3. Para eliminar una entrada, hacer clic en el botón de eliminar correspondiente y confirmar la acción.

### Gestionar el perfil

1. Hacer clic en el menú de la cabecera y seleccionar **Perfil**.
2. En la sección **Datos personales**, modificar nombre, apellidos o teléfono y hacer clic en **Guardar cambios**.
3. En la sección **Cambiar contraseña**, introducir la contraseña actual, la nueva contraseña y su confirmación, y hacer clic en **Actualizar contraseña**.

### Cerrar sesión

Hacer clic en el menú de la cabecera y seleccionar **Cerrar sesión**. La sesión se cierra y la aplicación redirige a la pantalla de inicio de sesión.
