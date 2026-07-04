# Clash of Words ⚔️

¡Bienvenido a **Clash of Words**! Un videojuego educativo de cartas interactivo diseñado para el aprendizaje y reforzamiento del vocabulario en inglés, especialmente dirigido a estudiantes de 5.° y 6.° año de educación básica (Grades 5-6).

---

## 👥 Equipo de Desarrollo (Integrantes)
* **Marcelo Rebolledo**
* **Adolfo Gayoso**
* **Paolo Paredes**
* **Daniel Sepúlveda**

---

## 📋 Inscripción del Proyecto

### Descripción general de la problemática
La enseñanza tradicional del inglés carece de dinamismo, mientras que el material lúdico físico resulta extremadamente costoso y difícil de escalar. Esto limita el acceso de los estudiantes a herramientas didácticas innovadoras por restricciones presupuestarias y logísticas de impresión.

### Objetivo que persigue la solución
Desarrollar una aplicación móvil y de escritorio web que digitalice la experiencia del juego de cartas para facilitar el aprendizaje del inglés. Se busca ofrecer una plataforma interactiva, accesible y de bajo costo que potencie la participación de los alumnos.

### Descripción general del tipo de solución
Se entregará una aplicación multiplataforma que gestiona mazos digitales, reglas automatizadas y seguimiento de progreso. El sistema permitirá al cliente actualizar contenidos sin gastos de producción física, integrando elementos multimedia para reforzar la pronunciación.

### Descripción inicial de stakeholders
Principalmente es el equipo de desarrollo. El cliente principal es el docente de inglés, dueño de la metodología y contenido original. Los usuarios finales son los estudiantes, quienes buscan una experiencia de aprendizaje gamificada.

---

## 🚀 Características Principales

### 🎮 Para el Estudiante (Student Hub)
* **Inicio de Sesión Personalizado:** Acceso directo con nombre de usuario en un simulador horizontal móvil que guarda y carga de manera automática el inventario y estadísticas de la sesión local.
* **Reclamación de Botín Inicial (Starter Loot):** Un cofre de bienvenida gratuito en inglés que otorga al estudiante sus primeras 22 cartas listas para jugar y 100 monedas iniciales.
* **Creador de Mazos (Deck Builder):** Permite armar y personalizar mazos competitivos con un mínimo de 20 y un máximo de 25 cartas de su colección, inspeccionando descripciones extendidas y TTS.
* **Arena de Batalla (Game Mat):**
  * **Combate por Rarezas y Poder:** Las cartas se enfrentan comparando primero su Rareza (*Common, Uncommon, Rare, Epic, Legendary*). En caso de empate de rareza, se compara el Poder total, resolviéndose con un *Tie-Breaker* (desempate acumulado) si persiste la igualdad.
  * **Equipamiento y Efectos:** El estudiante puede jugar cartas de tipo **Item** y **Effect** desde su mano para potenciar la fuerza de su Criatura activa en el centro.
  * **Pronunciación por Texto a Voz (TTS):** Al mantener presionada cualquier carta o presionar su botón de altavoz, el juego pronunciará el término en inglés en voz alta.
* **Simulación de Duelo Completo (Autoplay Loop):**
  * Incluye un selector de **Autoplay** en el tablero de la Arena.
  * Al activarse, la IA simulará un duelo completo paso a paso (robo, selección de ítem/efecto, revelación de choque, desempates y cambio de turno automático) hasta que se agoten los mazos y se declare la victoria o derrota final. Ideal para grabaciones y demostraciones en video.
* **Tienda de Vocabulario (Shop):** Compra de *Booster Packs* (sobres de 3 cartas aleatorias) por 50 monedas obtenidas en los duelos.
* **Redención de Códigos:** Reclamación de códigos de recompensa (distribuidos por el profesor) para obtener monedas o sobres adicionales.
* **Historial de Partidas:** Registro detallado de victorias, derrotas y variación de trofeos acumulados.

### 👩‍🏫 Para el Docente (Teacher Dashboard)
* **Acceso Seguro por PIN:** Pantalla de verificación protegida por un código PIN de 6 dígitos.
* **Protección de Enrutamiento:** Los estudiantes no pueden acceder a las vistas del profesor, y el profesor solo visualiza sus herramientas docentes una vez que ha ingresado el PIN correcto.
* **Ocultamiento de Autenticación:** La pestaña de verificación se oculta completamente de la barra de navegación tras introducir el PIN de forma exitosa.
* **Gestión del Catálogo (CMS):** Panel interactivo para activar o desactivar cartas del vocabulario general del juego, controlando qué palabras aparecen en las partidas y en los sobres de la tienda.
* **Monitoreo del Progreso & Códigos de Recompensa:**
  * **Estadísticas de Aula:** Visualización del progreso general de los estudiantes (clasificación, trofeos, victorias y porcentaje de victorias).
  * **Bitácora del Recreo (Recess Activity Logs):** Registro de las interacciones lúdicas cooperativas de los estudiantes durante los recreos.
  * **Generador de Códigos de Recompensas:** Formulario de creación de códigos promocionales únicos para distribuir como premio.
  * **Layout con Scroll Integrado:** Cabeceras y pestañas de selección estáticas que facilitan el desplazamiento por los listados largos.

### ♿ Accesibilidad y Alineación OCR
* **Escaneo de Activos por OCR (Tesseract.js & Jimp):** Se implementó una base de datos alineada con escaneo OCR automatizado sobre los 422 archivos PNG de cartas. Los nombres de las cartas en la base de datos coinciden exactamente con los grabados visuales de las ilustraciones (por ejemplo, *Wizard Lizard*, *Surfing Panda*, *Jumping Cobra*), y las descripciones visuales se cargaron como habilidades nativas de las cartas, garantizando que el audio TTS y el texto coincidan perfectamente y se mantengan en inglés.
* **Soporte para Daltonismo:** Cada nivel de rareza incluye un símbolo distintivo como marca de agua en la carta para su fácil identificación visual (`◯` Común, `▲` Poco Común, `♢` Rara, `🛡️` Épica, `⭐` Legendaria).
* **Efectos de Sonido Sintetizados:** Sonidos generados mediante la API Web Audio nativa sin necesidad de descargar archivos de audio pesados.

---

## 🛠️ Tecnologías Utilizadas
1. **Frontend Core:** React 18 (TypeScript) + Vite como empaquetador ultrarrápido.
2. **Estilos y Estructura:** Tailwind CSS v4 para el diseño de tarjetas y tableros apaisados.
3. **Mapeo y Reconocimiento:** Tesseract.js para escaneo OCR de títulos y Jimp para el procesamiento analítico.
4. **Efectos Visuales:** Canvas-Confetti para celebrar las victorias del estudiante.
5. **Audio Nativo:** Web Audio API (para efectos sonoros sintetizados) y SpeechSynthesis API (para la pronunciación TTS en inglés).
6. **Iconografía:** Lucide React.

---

## 💻 Instrucciones de Instalación y Ejecución

Sigue estos sencillos pasos para probar el proyecto de forma local:

### Requisitos Previos
* Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

### 1. Instalar Dependencias
Instala los paquetes necesarios del proyecto ejecutando el siguiente comando en la carpeta raíz:
```bash
npm install
```
*(o `pnpm install` si utilizas pnpm)*

### 2. Iniciar el Servidor de Desarrollo
Inicia el entorno local para visualizar la aplicación:
```bash
npm run dev
```

### 3. Abrir en el Navegador
Una vez iniciado el servidor, abre tu navegador en la dirección local que indique la terminal (típicamente `http://localhost:5173`).

---

## 🔑 Credenciales de Demostración del Docente (PIN de Seguridad)
Para acceder al panel del profesor durante la demostración local, utiliza las siguientes credenciales:
* **PIN de verificación:** `123456`

---

¡Disfruta aprendiendo y combatiendo en **Clash of Words**! ⚔️📚