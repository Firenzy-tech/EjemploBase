/**
 * Realiza la petición al backend para obtener el saludo.
 * @param {string} nombre 
 * @returns {Promise<string>}
 */
async function fetchSaludo(nombre) {
    // Al usar una ruta relativa, el navegador usará el mismo host y puerto 
    // desde el que se cargó el archivo index.html de forma automática.
    const url = `/saludo?nombre=${encodeURIComponent(nombre)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.text();
}

async function saludar() {
    const nombreInput = document.getElementById("nombre");
    const resultadoDiv = document.getElementById("resultado");

    // Validación de seguridad para asegurar que los elementos existen
    if (!nombreInput || !resultadoDiv) {
        console.error("Error: No se encontraron los elementos 'nombre' o 'resultado' en el HTML.");
        return;
    }

    const nombre = nombreInput.value.trim();

    try {
        resultadoDiv.textContent = "Cargando...";
        const texto = await fetchSaludo(nombre);
        
        // Usamos innerHTML o textContent dependiendo de si queremos renderizar HTML
        // En este caso, el backend devuelve texto plano, así que textContent es más seguro.
        resultadoDiv.textContent = texto;
        resultadoDiv.style.color = "#21618c"; // Restaurar color original en caso de éxito
    } catch (error) {
        console.error("Error en la comunicación:", error);
        resultadoDiv.textContent = "No se pudo conectar con el servidor. Asegúrate de que el backend esté activo.";
        resultadoDiv.style.color = "red";
    }
}

// Esperar a que el DOM esté cargado para evitar errores de elementos null
document.addEventListener("DOMContentLoaded", () => {
    cargarHeader();
    cargarNavMenu();
    cargarBreadcrumb();
    cargarFooter();

    const boton = document.querySelector("button"); // Ajusta el selector si usas un ID específico
    if (boton) {
        boton.addEventListener("click", saludar);
    }

    // Configuración del enrutador
    window.addEventListener('hashchange', router);
    window.addEventListener('load', router);

});

/**
 * Carga el contenido del header desde un archivo HTML externo.
 */
async function cargarHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;
    const response = await fetch('html/Header.html');
    const headerHtml = await response.text();
    headerPlaceholder.innerHTML = headerHtml;
}

/**
 * Carga el contenido del footer desde un archivo HTML externo.
 */
async function cargarFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    const response = await fetch('html/Footer.html');
    const footerHtml = await response.text();
    footerPlaceholder.innerHTML = footerHtml;
}

/**
 * Carga el contenido del NavMenu desde un archivo HTML externo.
 */
async function cargarNavMenu() {
    const navmenuPlaceholder = document.getElementById('navmenu-placeholder');
    if (!navmenuPlaceholder) return;

    const response = await fetch('html/NavMenu.html');
    const navmenuHtml = await response.text();
    navmenuPlaceholder.innerHTML = navmenuHtml;
}

/**
 * Carga el contenido del breadcrumb desde un archivo HTML externo.
 */
async function cargarBreadcrumb() {
    const breadcrumbPlaceholder = document.getElementById('breadcrumb-placeholder');
    if (!breadcrumbPlaceholder) return;

    const response = await fetch('Html/Breadcrumb.html');
    const breadcrumbHtml = await response.text();
    breadcrumbPlaceholder.innerHTML = breadcrumbHtml;
}

/**
 * Carga el contenido de una página en el div principal y actualiza el breadcrumb.
 * @param {string} page - El nombre de la página a cargar (ej. 'gastos').
 * @param {string} pageTitle - El título para el breadcrumb.
 */
async function loadContent(page, pageTitle) {
    const contentDiv = document.getElementById('page-content');
    if (!contentDiv) return;

    try {
        const response = await fetch(`html/Pages/${page}.html`);
        if (!response.ok) throw new Error('Página no encontrada');
        
        const pageHtml = await response.text();
        contentDiv.innerHTML = pageHtml;

        // Actualizar breadcrumb
        const breadcrumbPlaceholder = document.getElementById('breadcrumb-placeholder');
        breadcrumbPlaceholder.innerHTML = `
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#/dashboard">Inicio</a></li>
                    <li class="breadcrumb-item active" aria-current="page">${pageTitle}</li>
                </ol>
            </nav>
        `;

        // Actualizar el enlace activo en el NavMenu
        document.querySelectorAll('.side-navmenu nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#/${page}`) {
                link.classList.add('active');
            }
        });

    } catch (error) {
        console.error("Error al cargar la página:", error);
        contentDiv.innerHTML = `<h1>Error 404</h1><p>La página no se pudo encontrar.</p>`;
    }
}

/**
 * Enrutador simple basado en el hash de la URL.
 */
function router() {
    // Obtiene el path del hash, ej. de '#/gastos' -> '/gastos'
    const path = window.location.hash.slice(1) || '/dashboard'; 
    // Obtiene la última parte del path, que es el nombre de la página
    const page = path.substring(path.lastIndexOf('/') + 1);

    switch (page) {
        case 'dashboard':
            loadContent('dashboard', 'Dashboard');
            break;
        case 'gastos':
            loadContent('gastos', 'Gastos');
            break;
        case 'ingresos':
            loadContent('ingresos', 'Ingresos');
            break;
        case 'reportes':
            loadContent('reportes', 'Reportes');
            break;
        case 'categorias':
            loadContent('categorias', 'Categorías');
            break;
        case 'configuracion':
            loadContent('configuracion', 'Configuración');
            break;
        default:
            // Si la ruta no coincide, carga el dashboard por defecto.
            loadContent('dashboard', 'Dashboard');
            break;
    }
}