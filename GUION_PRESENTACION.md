# Guión de defensa oral — MindTracker
## Presentación de Proyecto Integrado · DAW 2º · 25 minutos

---

> **Estructura de tiempo:**
> | Sección | Diapositivas | Tiempo |
> |---|---|---|
> | Apertura y portada | 1 | 1 min |
> | Índice | 2 | 0:30 |
> | Motivación | 3 | 2 min |
> | Objetivos | 4 | 2 min |
> | Stack tecnológico | 5 | 2 min |
> | Arquitectura | 6 | 2 min |
> | Base de datos | 7 | 2 min |
> | Backend | 8 | 2:30 |
> | Frontend | 9 | 2 min |
> | Funcionalidades | 10 | 2 min |
> | Seguridad | 11 | 2 min |
> | Despliegue | 12 | 1:30 |
> | Pruebas | 13 | 1:30 |
> | Conclusiones | 14 | 2 min |
> | Cierre | 15 | 0:30 |
> | **Total** | | **~25 min** |

---

## DIAPOSITIVA 1 — Portada *(~1 min)*

Buenos días / buenas tardes. Mi nombre es [nombre] y voy a presentar mi Proyecto Integrado de segundo curso de Desarrollo de Aplicaciones Web.

El proyecto se llama **MindTracker**: una aplicación web completa para el seguimiento del estado emocional y los hábitos diarios. A lo largo de estos veinticinco minutos voy a contaros qué problema resuelve, cómo está construida, qué decisiones técnicas tomé y qué he aprendido durante el proceso.

---

## DIAPOSITIVA 2 — Índice *(~30 s)*

Como podéis ver en el índice, la presentación sigue el hilo lógico de cualquier proyecto de software: primero el problema y los objetivos, luego las decisiones técnicas capa por capa, y finalmente los resultados y lo que queda por hacer. Vamos allá.

---

## DIAPOSITIVA 3 — Motivación *(~2 min)*

Todo proyecto empieza con un problema. En este caso, el problema es sencillo pero relevante: **las aplicaciones comerciales de seguimiento del bienestar** como Daylio o Bearable funcionan bien, pero tienen tres inconvenientes importantes.

Primero, la **privacidad**: suben tus datos emocionales —algo muy personal— a servidores de terceros sin que tú tengas control real sobre ellos. Segundo, el **coste**: las funciones útiles están detrás de una suscripción mensual. Y tercero, la **dependencia**: cuando cambian la API o cierran el servicio, pierdes todo tu historial.

Frente a eso, yo me planteé: ¿y si construyo yo mismo una herramienta que me permita registrar mi estado de ánimo y mis hábitos, que sea autohospedada, gratuita y cuyo código sea completamente mío?

Además, desde el punto de vista académico, era la oportunidad perfecta para integrar en un proyecto real los cinco módulos del ciclo: servidor, cliente, bases de datos, despliegue y sistemas. No quería hacer cinco trabajos separados; quería que todo encajase en una aplicación que alguien pudiese usar de verdad.

---

## DIAPOSITIVA 4 — Objetivos *(~2 min)*

El **objetivo general** del proyecto es desarrollar una aplicación web full-stack funcional, segura y desplegable en producción para el registro y seguimiento de estados emocionales y hábitos diarios.

Pero detrás de ese objetivo general hay cinco objetivos específicos que son los que realmente guiaron el desarrollo:

1. **Autenticación robusta**: JWT almacenado en cookies HttpOnly para que el token no sea accesible desde JavaScript, y bcrypt para el almacenamiento seguro de contraseñas.

2. **API REST completa**: todos los recursos —usuarios, estados de ánimo, hábitos— expuestos a través de endpoints bien definidos siguiendo el patrón MVC.

3. **SPA con React**: una interfaz de usuario fluida, sin recargas de página, que facilite el registro diario en menos de dos minutos.

4. **Despliegue en producción**: no quería que esto quedase solo en local. Apache como proxy inverso, SSL, Ubuntu real.

5. **Integración curricular**: que cada módulo del ciclo aportase algo concreto y visible en la aplicación.

---

## DIAPOSITIVA 5 — Stack tecnológico *(~2 min)*

Repasemos las tecnologías elegidas y por qué.

**Frontend**: React 18 con React Router para navegación client-side y Vite como bundler. Elegí React porque es el estándar de la industria y porque el módulo de Desarrollo en Entorno Cliente lo cubre en profundidad. Vite porque el tiempo de arranque en desarrollo es significativamente más rápido que webpack.

**Backend**: Node.js 20 con Express.js versión 5, que es la primera versión con soporte nativo de async/await en los manejadores de errores. Esto me permitió eliminar bloques try/catch repetitivos y tener un código más limpio.

**Base de datos**: MariaDB, que es compatible con MySQL pero con mejor rendimiento en ciertos escenarios. El conector oficial de Node.js con pool de conexiones para no abrir y cerrar conexiones en cada petición.

**Infraestructura**: Apache 2.4 como proxy inverso y servidor de archivos estáticos, sobre Ubuntu 22.04. Apache está muy bien documentado y es lo que veremos en el módulo de Despliegue, así que tenía todo el sentido usarlo aquí.

---

## DIAPOSITIVA 6 — Arquitectura del sistema *(~2 min)*

La arquitectura es una **arquitectura en tres capas**, clásica pero sólida, más una capa de proxy que separa el cliente del servidor de aplicación.

Empezando desde arriba: el **frontend React** es una SPA que se sirve como archivos estáticos. Una vez descargada, toda la navegación es client-side y la comunicación con el backend se hace mediante llamadas REST.

**Apache** actúa como intermediario: cuando una petición llega a `/api/*` o `/auth/*` la redirige al proceso Node.js en el puerto 2345; para cualquier otra ruta, sirve directamente los archivos del build de React. Esto además permite añadir cabeceras de seguridad a nivel de proxy, sin tocar el código de la aplicación.

**Express** implementa el patrón MVC: las rutas reciben las peticiones, los controladores ejecutan la lógica de negocio, y los modelos se encargan exclusivamente de las queries a la base de datos.

Finalmente **MariaDB** con cinco tablas normalizadas y relaciones de clave foránea garantiza la integridad referencial de todos los datos.

Esta separación me permite, por ejemplo, cambiar la base de datos sin tocar los controladores, o cambiar el frontend sin tocar el API.

---

## DIAPOSITIVA 7 — Base de datos *(~2 min)*

El diseño de la base de datos es uno de los aspectos que más cuidé. Son cinco tablas:

- **users**: almacena los datos del usuario con la contraseña hasheada y una restricción UNIQUE en el email.

- **moods**: cada entrada de estado de ánimo. El valor es un entero de 1 a 10, tiene notas de texto libre y la fecha de registro.

- **habits**: es básicamente un catálogo. Tiene los cinco hábitos que el sistema soporta: sueño, ejercicio, lectura, estudio y dieta.

- **habit_options**: las opciones predefinidas de cada hábito. Por ejemplo, para el hábito "sueño" las opciones son "menos de 5h", "5-6h", "6-7h", "7-8h" y "más de 8h". Esto está separado en su propia tabla porque es un dato variable y no quiero hardcodearlo en el código.

- **habit_logs**: los registros diarios del usuario. Aquí hay una decisión importante: hay una **restricción UNIQUE sobre (user_id, habit_id, date)**. Esto garantiza a nivel de base de datos que un usuario no puede tener dos registros del mismo hábito en el mismo día. Usé un UPSERT —INSERT ... ON DUPLICATE KEY UPDATE— para que registrar dos veces el mismo hábito actualice el anterior en lugar de fallar.

---

## DIAPOSITIVA 8 — Backend · API REST *(~2:30 min)*

El backend expone once endpoints organizados en tres recursos: autenticación, estados de ánimo y hábitos.

Los **endpoints de autenticación** son los más críticos desde el punto de vista de la seguridad. El login verifica la contraseña con `bcrypt.compare`, genera un JWT firmado con una clave secreta y lo guarda en una cookie con los flags `httpOnly` y `secure`. El usuario nunca ve el token directamente.

Los **endpoints de ánimo** son CRUD estándar. La particularidad es que todas las rutas privadas pasan por un middleware de autenticación que extrae el JWT de la cookie, lo verifica y añade el userId al objeto `req` para que los controladores lo usen sin tener que volver a validarlo.

Los **endpoints de hábitos** siguen el mismo patrón, con el añadido del UPSERT que mencioné antes.

El patrón **MVC** queda muy claro en la estructura de carpetas: `routes/` solo vincula URLs con controladores, `controllers/` contiene toda la lógica de negocio y las respuestas HTTP, y `models/` solo habla con la base de datos. Los controladores nunca ejecutan SQL; los modelos nunca saben qué status HTTP devolver.

Express 5 me permitió escribir controladores async sin un wrapper adicional —si una función async lanza una excepción, Express 5 la captura automáticamente y la pasa al middleware de error.

---

## DIAPOSITIVA 9 — Frontend · React SPA *(~2 min)*

El frontend es una Single Page Application que arranca en `App.jsx`. Aquí hay dos conceptos importantes que quiero destacar.

El primero es la **gestión de autenticación**: al cargar la aplicación, se hace una petición a `/api/me`. Si el servidor responde con el usuario actual, se asume que la sesión está activa y se muestra el dashboard; si no, se redirige al login. Esto evita el parpadeo típico de las SPAs donde primero se ve la pantalla protegida y luego se redirige.

El segundo es el sistema de **rutas protegidas**: `ProtectedRoute` y `PublicRoute` son componentes wrapper que comprueban el estado de autenticación antes de renderizar. Si intentas ir a `/dashboard` sin sesión, te redirige a `/login`; si intentas ir a `/login` con sesión, te redirige al dashboard.

El **Dashboard** es el componente central. Contiene la lógica de qué vista mostrar —Entrada, Registros o Perfil— y el header con el menú desplegable. Las vistas son componentes independientes que reciben props y emiten eventos al padre, lo que mantiene el estado centralizado y predecible.

---

## DIAPOSITIVA 10 — Funcionalidades clave *(~2 min)*

Veamos cómo funciona la aplicación desde el punto de vista del usuario.

**Registro de estado de ánimo**: en lugar de un slider que puede ser impreciso en móvil, usé una cuadrícula de diez botones numerados del 1 al 10. Un clic, seleccionas el valor, y puedes añadir notas de texto libre. La fecha por defecto es hoy, pero puede cambiarse para registrar entradas pasadas.

**Seguimiento de hábitos**: en el mismo panel de entrada, a la derecha, están los cinco hábitos. Cada uno muestra sus opciones en forma de radio buttons. La decisión de **guardar inmediatamente** al seleccionar una opción —sin botón de confirmar— fue deliberada: reduce la fricción y hace el registro más rápido. El objetivo era que el registro diario llevase menos de dos minutos.

**Historial**: la vista de Registros muestra las entradas de ánimo en orden cronológico inverso. Cada entrada muestra el valor, las notas y los hábitos registrados ese día como etiquetas visuales. Desde aquí se pueden eliminar entradas.

**Perfil**: el usuario puede actualizar sus datos personales y cambiar su contraseña. El cambio de contraseña requiere introducir la contraseña actual para verificar la identidad.

---

## DIAPOSITIVA 11 — Seguridad *(~2 min)*

La seguridad fue una prioridad desde el primer día, no algo que añadí al final. Repaso los seis puntos clave.

**JWT en HttpOnly cookies**: el token de sesión está completamente oculto al JavaScript del cliente. Un atacante que consiga ejecutar código XSS en el navegador del usuario no podrá robar el token porque la cookie tiene el flag httpOnly.

**Bcrypt con 10 rounds**: las contraseñas se hashean antes de guardarse. El factor de coste de 10 hace que calcular un hash tarde unos 100ms, lo que hace inviable un ataque de fuerza bruta o diccionario a escala.

**Queries parametrizadas**: ninguna query en el código concatena strings con datos del usuario. Todo usa placeholders del conector de MariaDB. SQL Injection es imposible con este enfoque.

**Cabeceras de seguridad**: Apache añade X-Frame-Options para prevenir clickjacking, X-Content-Type-Options para evitar MIME sniffing y X-XSS-Protection como medida adicional.

**CORS restringido**: el backend solo acepta peticiones del origen configurado en la variable de entorno `ORIGIN`. Cualquier otro origen recibe un error CORS.

**SSL/TLS**: toda la comunicación está cifrada en producción mediante certificado servido desde Apache mod_ssl.

---

## DIAPOSITIVA 12 — Despliegue *(~1:30 min)*

El despliegue fue la parte del proyecto que más me sorprendió en términos de complejidad real. A veces en los módulos todo parece funcionar en local y uno asume que el despliegue es trivial. No lo es.

El proceso tiene seis pasos secuenciales. Primero, preparar el servidor Ubuntu con los permisos correctos. Segundo, instalar y configurar MariaDB con un usuario específico para la aplicación —nada de usar root. Tercero, poner el servidor Node.js a correr de forma persistente usando un servicio de systemd. Cuarto, compilar el React con `vite build` para generar la carpeta `dist/` optimizada. Quinto, configurar Apache con un VirtualHost que enruta `/api/` y `/auth/` hacia Node.js y el resto hacia los estáticos. Sexto, y muy importante, las **variables de entorno**: `JWT_SECRET`, la contraseña de la base de datos y el origen CORS viven en un archivo `.env` que nunca va al repositorio.

Lo más valioso de este proceso fue entender cómo las capas del sistema interactúan en producción, y por qué la separación entre proxy y aplicación es tan importante.

---

## DIAPOSITIVA 13 — Pruebas *(~1:30 min)*

Documenté catorce casos de prueba funcionales, todos superados, que cubren los flujos críticos de la aplicación.

Los casos van desde el registro de usuario y el login, hasta la eliminación de entradas del historial y el cierre de sesión. También incluyen los casos **negativos**: registro con email duplicado, login con contraseña incorrecta, acceso a rutas protegidas sin sesión activa.

Quiero destacar tres casos que me parecieron especialmente importantes:

- **CP-05** —acceso sin sesión—: verificar que un usuario no autenticado que intenta acceder directamente a `/dashboard` es redirigido a `/login` sin ver ningún dato privado.

- **CP-10** —upsert de hábito—: registrar dos veces el mismo hábito en el mismo día debe actualizar el registro existente, no crear uno nuevo ni devolver un error.

- **CP-13** —cambio de contraseña—: solo funciona si se proporciona la contraseña actual correcta, evitando que alguien que deja la sesión abierta pueda cambiar la contraseña sin saberlo.

Las pruebas fueron manuales y documentadas en la memoria, con los pasos, los datos de entrada esperados y los resultados obtenidos.

---

## DIAPOSITIVA 14 — Conclusiones y trabajo futuro *(~2 min)*

Voy cerrando con lo que considero los logros más importantes del proyecto.

Primero, **el objetivo se cumplió**: MindTracker es una aplicación funcional, segura y desplegada en producción. No es un prototipo, es un sistema que se puede usar.

Segundo, **la integración curricular es real**: cada módulo del ciclo aportó algo concreto. No forcé ninguna tecnología; cada una estaba donde tenía sentido.

Tercero, **las decisiones de seguridad son correctas y deliberadas**: JWT en HttpOnly, bcrypt, queries parametrizadas. No son adornos; son la base de cualquier aplicación web moderna.

Cuarto, **la arquitectura en tres capas demuestra ser mantenible**: durante el desarrollo cambié varias cosas del frontend sin tocar el backend, y al revés. La separación de capas tiene valor real.

Quinto, los **14 casos de prueba** documentados son la evidencia de que el sistema funciona como se diseñó.

En cuanto al **trabajo futuro**, hay cuatro líneas que me parecen naturales:
- **Gráficas de tendencias** para visualizar la evolución del estado de ánimo en el tiempo.
- **Hábitos personalizables** para que cada usuario defina los suyos propios.
- **Aplicación móvil** como PWA o con React Native.
- **Notificaciones** para recordatorios diarios.

Estos no son simples deseos; son mejoras que tienen una base sólida en la arquitectura actual.

---

## DIAPOSITIVA 15 — Cierre *(~30 s)*

Y hasta aquí la presentación de MindTracker.

Ha sido un proyecto que me ha obligado a pensar como un desarrollador completo: no solo "¿cómo hago que esto funcione?" sino "¿por qué lo hago así?", "¿qué pasa si falla?", "¿cómo se despliega esto en un servidor real?".

Quedo a vuestra disposición para cualquier pregunta. Muchas gracias.

---

## NOTAS PARA EL PRESENTADOR

- **Ritmo**: No vayas más rápido de lo indicado en los tiempos. 25 minutos pasan rápido con las preguntas del tribunal.
- **Transiciones**: Cuando cambies de diapositiva, no leas la pantalla. Di la transición de viva voz antes de avanzar.
- **Demo en vivo**: Si el tribunal pide una demo, centra en: login → registro de ánimo → selección de hábitos → ver historial → logout. Ese flujo dura ~2 minutos.
- **Preguntas frecuentes del tribunal**:
  - *¿Por qué React y no otro framework?* → Estándar de industria, cobertura en el módulo, ecosistema maduro.
  - *¿Por qué JWT en cookie y no en localStorage?* → localStorage es accesible por JS → XSS puede robar el token. Cookie httpOnly no.
  - *¿Cómo gestionarías el escalado?* → Añadir un balanceador de carga delante de Apache, usar un pool de réplicas de lectura en MariaDB.
  - *¿Qué cambiarías si empezaras de nuevo?* → Añadir TypeScript desde el principio para mejorar la mantenibilidad.
  - *¿Por qué no usaste un ORM?* → Para este tamaño, las queries parametrizadas directas son más transparentes y educativamente más valiosas.
