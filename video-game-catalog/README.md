
# Video Game Catalog - Angular Edition

## Temática elegida

La aplicación es un **Catálogo de Videojuegos**. Permite a los usuarios gestionar su colección personal de videojuegos, añadiendo, viendo, editando y eliminando títulos. Además, ofrece funcionalidades avanzadas como búsqueda en tiempo real, visualización de estadísticas y exportación de datos.

## Decisiones de diseño

- **Framework y Arquitectura**: Se utilizó Angular con una arquitectura basada en componentes standalone y Signals para un manejo de estado moderno y reactivo. Esto asegura una excelente performance y mantenibilidad.
- **Layout y Estilo**: Se optó por un diseño de una sola página con un layout claro y funcional, utilizando Tailwind CSS para un desarrollo rápido y un diseño responsive. La interfaz se divide en tres secciones principales: el formulario de gestión, la tabla de datos y la visualización de estadísticas.
- **Tema Oscuro**: Se eligió un tema oscuro (`dark mode`) para reducir la fatiga visual y ofrecer una estética moderna, muy popular en aplicaciones de gaming. Los colores se basan en una paleta de grises oscuros con acentos en azul para los elementos interactivos.
- **Visualización de Datos**: Se utiliza una tabla (`<table>`) para mostrar los videojuegos, ya que es la forma más estructurada y legible de presentar datos tabulares. Las filas se resaltan al ser seleccionadas para ofrecer una clara retroalimentación visual al usuario.

## Instrucciones de ejecución

Esta aplicación está diseñada para ejecutarse en un entorno web que soporte aplicaciones Angular modernas.

1.  **Apertura**: La aplicación se carga abriendo el archivo `index.html` en un navegador web compatible (como Google Chrome, Firefox, etc.).
2.  **Uso**: La interfaz es intuitiva. Usa el formulario para añadir o editar juegos. Haz clic en una fila de la tabla para seleccionarla y cargar sus datos en el formulario. Utiliza los botones para realizar las acciones CRUD.

## Dificultades y Soluciones

- **Dificultad**: La gestión del estado para actualizar el gráfico de estadísticas de forma reactiva y eficiente cada vez que la lista de juegos cambiaba (al añadir, editar o eliminar un juego) presentaba un desafío. Una solución simple pero ineficiente sería redibujar el gráfico manualmente después de cada operación.

- **Solución**: Se aprovechó el sistema de reactividad de Signals de Angular. La lista de videojuegos se gestiona con un `signal`. Se creó un `effect` de Angular que "observa" los cambios en este `signal`. Cada vez que la lista de juegos se modifica, el `effect` se dispara automáticamente, recalculando los datos y actualizando la instancia del gráfico de Chart.js. Esto centraliza la lógica de actualización del gráfico, la desacopla de las operaciones CRUD y garantiza que la UI esté siempre sincronizada con el estado de la aplicación de manera performante.

## Funcionalidades Avanzadas

- **Búsqueda Dinámica**: La búsqueda se implementa de forma reactiva. El texto del campo de búsqueda se almacena en un `signal`. Se utiliza un `computed signal` que depende tanto de la lista completa de juegos como del término de búsqueda. Este `computed signal` recalcula automáticamente la lista de juegos filtrados cada vez que cualquiera de las dependencias cambia, actualizando la tabla en tiempo real sin necesidad de gestionar eventos manualmente.

- **Exportación a JSON**: La función "Exportar a JSON" toma el estado actual de la lista de videojuegos (del `signal`), lo convierte a una cadena de texto en formato JSON, y crea un `Blob` (Binary Large Object). Luego, genera una URL para este Blob y crea un elemento `<a>` temporal en el DOM. Se simula un clic en este enlace para iniciar la descarga del archivo `videojuegos.json`, y finalmente se limpia el elemento temporal.
