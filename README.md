# Clash of Words ⚔️

¡Bienvenido a **Clash of Words**! Un videojuego educativo de cartas interactivo diseñado para el aprendizaje y reforzamiento del vocabulario en inglés, especialmente dirigido a estudiantes de 5.° y 6.° año de educación básica (Grades 5-6).

Este proyecto combina mecánicas de estrategia y juegos de rol con herramientas de aprendizaje auditivo, proporcionando una experiencia gamificada y accesible para los alumnos, junto con un panel de control para que los docentes gestionen el catálogo de vocabulario y supervisen el progreso de su clase.

---

## 🚀 Características Principales

### 🎮 Para el Estudiante (Student Hub)
*   **Inicio de Sesión Personalizado:** Acceso directo con nombre de usuario para guardar el progreso y las estadísticas individuales.
*   **Reclamación de Botín Inicial (Starter Loot):** Un cofre de bienvenida gratuito que otorga al estudiante sus primeras 22 cartas y 100 monedas para ingresar inmediatamente a la arena.
*   **Creador de Mazos (Deck Builder):** Permite armar y personalizar mazos competitivos con un mínimo de 20 y un máximo de 25 cartas de su colección.
*   **Arena de Batalla (Game Mat):**
    *   **Combate por Rarezas y Poder:** Las cartas se enfrentan comparando primero su Rareza (*Common, Uncommon, Rare, Epic, Legendary*). En caso de empate de rareza, se compara el Poder total, resolviéndose con un *Tie-Breaker* (desempate) si persiste la igualdad.
    *   **Equipamiento y Efectos:** El estudiante puede arrastrar o jugar cartas de tipo **Item** y **Effect** desde su mano para potenciar la fuerza de su Criatura activa en el centro.
    *   **Pronunciación por Texto a Voz (TTS):** Al mantener presionada cualquier carta o presionar su botón de altavoz, el juego pronunciará el término en inglés en voz alta a una velocidad adaptada para estudiantes del idioma.
*   **Tienda de Vocabulario (Shop):** Compra de *Booster Packs* (sobres de 3 cartas aleatorias) por 50 monedas obtenidas al ganar duelos.
*   **Redención de Códigos:** Reclamación de códigos de recompensa (distribuidos por el profesor) para obtener monedas o sobres adicionales.
*   **Historial de Partidas:** Registro detallado de victorias, derrotas y variación de trofeos acumulados.

### 👩‍🏫 Para el Docente (Teacher Dashboard)
*   **Acceso Seguro:** Pantalla de verificación (credenciales de demostración por defecto: `admin` / `admin`).
*   **Gestión del Catálogo:** Panel interactivo para activar o desactivar cartas del vocabulario general del juego, controlando qué palabras aparecen en las partidas y en los sobres de la tienda.
*   **Monitoreo del Progreso:** Visualización del progreso general de los estudiantes, incluyendo victorias, derrotas, porcentaje de win rate, trofeos acumulados y tamaño de su colección.

### ♿ Accesibilidad y Diseño Inmersivo
*   **Diseño Visual de Alta Fidelidad:** Interfaz inspirada en juegos de fantasía oscura con gradientes inmersivos, efectos de brillo y microanimaciones dinámicas que simulan un juego de cartas físico moderno.
*   **Soporte para Daltonismo:** Cada nivel de rareza incluye un símbolo distintivo como marca de agua en la carta para su fácil identificación visual (`◯` Común, `▲` Poco Común, `♢` Rara, `🛡️` Épica, `⭐` Legendaria).
*   **Efectos de Sonido Sintetizados:** Sonidos generados mediante la API Web Audio nativa sin necesidad de descargar archivos de audio pesados.

---

## 🛠️ Tecnologías Utilizadas

El proyecto está construido bajo una arquitectura web moderna, rápida y altamente interactiva:
1.  **Frontend Core:** React 18 (TypeScript) + Vite como empaquetador ultrarrápido.
2.  **Estilos y Animaciones:** Tailwind CSS v4 para un diseño responsivo y estilizado, combinado con micro-animaciones dinámicas.
3.  **Componentes y UI:** Primitivos de Radix UI para componentes accesibles y consistentes.
4.  **Efectos Visuales:** Canvas-Confetti para celebrar las victorias del estudiante.
5.  **Audio Nativo:** Web Audio API (para efectos sonoros sintetizados) y SpeechSynthesis API (para la pronunciación TTS en inglés).
6.  **Iconografía:** Lucide React.

---

## 💻 Instrucciones de Instalación y Ejecución

Sigue estos sencillos pasos para probar el proyecto de forma local:

### Requisitos Previos
*   Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

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

## 📝 Credenciales de Demostración del Docente
Para acceder al panel del profesor durante la demostración local, utiliza las siguientes credenciales:
*   **Usuario:** `admin`
*   **Contraseña:** `admin`

---

¡Disfruta aprendiendo y combatiendo en **Clash of Words**! ⚔️📚