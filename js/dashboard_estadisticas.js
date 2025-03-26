// Constantes y variables
const urlAPI = "https://localhost/MembresiasREDMIS/Backend/public/index.php";
const totalMiembrosElement = document.getElementById('total-miembros');
const solicitudesPendientesElement = document.getElementById('solicitudes-pendientes');
const tablaUniversidadesElement = document.getElementById('tabla-universidades');

// Variable para almacenar la instancia del gráfico
let graficoPaises = null;


// Función para obtener estadísticas generales de la API
async function obtenerEstadisticas() {
    try {
        const response = await fetch(`${urlAPI}/statistics`);
        
        if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return null;
    }
}

// Función para obtener el total de miembros
async function obtenerTotalMiembros() {
    try {
    
        
        // Alternativa: obtener del endpoint miembros
        const response = await fetch(`${urlAPI}/miembros`);
        if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status}`);
        }
        
        const data = await response.json();
        return data.total || data.length || 0;
    } catch (error) {
        console.error('Error al obtener total de miembros:', error);
        return 856; // Valor por defecto
    }
}

// Función para obtener solicitudes pendientes
async function obtenerSolicitudesPendientes() {
    try {
        // Obtener datos del endpoint de solicitudes
        const response = await fetch(`${urlAPI}/solicitudesMembresias`);
        if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filtrar las solicitudes pendientes
        const solicitudesPendientes = data.solicitudes.filter(solicitud => solicitud.estado === "PENDIENTE");
        
        // Devolver la cantidad de solicitudes pendientes
        return solicitudesPendientes.length;
    } catch (error) {
        console.error('Error al obtener solicitudes pendientes:', error);
        return 24; // Valor por defecto en caso de error
    }
}

// Función para obtener datos de distribución por país
async function obtenerDistribucionPaises() {
    try {
        // Obtener datos del endpoint de estadísticas
        const response = await fetch(`${urlAPI}/statistics`);
        if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Procesar los datos para obtener la distribución por país
        const paisesCount = {};
        data.forEach(usuario => {
            const pais = usuario.pais;
            if (paisesCount[pais]) {
                paisesCount[pais]++;
            } else {
                paisesCount[pais] = 1;
            }
        });
        
        // Convertir los datos al formato requerido para el gráfico
        const labels = Object.keys(paisesCount);
        const valores = Object.values(paisesCount);
        
        return {
            labels: labels,
            data: valores
        };
    } catch (error) {
        console.error('Error al obtener distribución por país:', error);
        return datosEjemploPaises; // Fallback en caso de error
    }
}

// Función para obtener universidades
async function obtenerUniversidades() {
    try {
        // Obtener datos del endpoint de estadísticas
        const response = await fetch(`${urlAPI}/statistics`);
        if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Procesar los datos para obtener la lista de universidades con la cantidad de miembros
        const universidadesCount = {};
        data.forEach(usuario => {
            const universidad = usuario.universidad;
            if (universidadesCount[universidad]) {
                universidadesCount[universidad]++;
            } else {
                universidadesCount[universidad] = 1;
            }
        });
        
        // Convertir los datos al formato requerido para la tabla
        const universidades = Object.keys(universidadesCount).map(universidad => ({
            universidad: universidad,
            miembros: universidadesCount[universidad]
        }));
        
        return universidades;
    } catch (error) {
        console.error('Error al obtener universidades:', error);
        return datosEjemploUniversidades; // Fallback en caso de error
    }
}

// Función para mostrar el gráfico de distribución por país
function mostrarGraficoPaises(datos) {
    const ctx = document.getElementById('grafica-pais').getContext('2d');
    
    // Destruir el gráfico anterior si existe para evitar duplicación
    if (graficoPaises) {
        graficoPaises.destroy();
    }
    
    // Crear una nueva instancia del gráfico
    graficoPaises = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datos.labels,
            datasets: [{
                label: 'Miembros por País',
                data: datos.data,
                backgroundColor: '#FF9F43',
                borderRadius: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#A0AEC0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#A0AEC0'
                    }
                }
            }
        }
    });
}

// Función para mostrar la tabla de universidades
function mostrarTablaUniversidades(universidades) {
    tablaUniversidadesElement.innerHTML = '';
    
    universidades.forEach(item => {
        const fila = document.createElement('div');
        fila.className = 'fila-tabla';
        
        fila.innerHTML = `
            <div class="columna-universidad">${item.universidad}</div>
            <div class="columna-numero">${item.miembros}</div>
        `;
        
        tablaUniversidadesElement.appendChild(fila);
    });
}

// Función para actualizar el contador con animación
function actualizarContadorConAnimacion(elemento, valorFinal) {
    const duracion = 1000; // duración en milisegundos
    const valorInicial = 0;
    const incremento = Math.ceil(valorFinal / (duracion / 16)); // aprox. 60 fps
    
    let valorActual = valorInicial;
    let inicio = null;
    
    function paso(timestamp) {
        if (!inicio) inicio = timestamp;
        const progreso = timestamp - inicio;
        
        valorActual = Math.min(Math.floor((progreso / duracion) * valorFinal), valorFinal);
        elemento.textContent = valorActual;
        
        if (progreso < duracion && valorActual < valorFinal) {
            window.requestAnimationFrame(paso);
        } else {
            elemento.textContent = valorFinal;
        }
    }
    
    window.requestAnimationFrame(paso);
}

// Función de inicialización
async function inicializarDashboard() {
    try {
        // Mostrar indicadores de carga
        totalMiembrosElement.textContent = "Cargando...";
        solicitudesPendientesElement.textContent = "Cargando...";
        
        // Obtener datos de la API en paralelo
        const [totalMiembros, solicitudesPendientes, distribucionPaises, universidades] = await Promise.all([
            obtenerTotalMiembros(),
            obtenerSolicitudesPendientes(),
            obtenerDistribucionPaises(),
            obtenerUniversidades()
        ]);
        
        // Actualizar contadores con animación
        actualizarContadorConAnimacion(totalMiembrosElement, totalMiembros);
        actualizarContadorConAnimacion(solicitudesPendientesElement, solicitudesPendientes);
        
        // Crear gráfico y tabla
        mostrarGraficoPaises(distribucionPaises);
        mostrarTablaUniversidades(universidades);
    } catch (error) {
        console.error('Error al inicializar dashboard:', error);
        
        // Mostrar datos de ejemplo en caso de error
        actualizarContadorConAnimacion(totalMiembrosElement, 856);
        actualizarContadorConAnimacion(solicitudesPendientesElement, 24);
        mostrarGraficoPaises(datosEjemploPaises);
        mostrarTablaUniversidades(datosEjemploUniversidades);
    }
}

// Inicializar el dashboard cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', inicializarDashboard);