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
    const boton = document.querySelector("button"); // Ajusta el selector si usas un ID específico
    if (boton) {
        boton.addEventListener("click", saludar);
    }
});