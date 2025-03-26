// Espera a que todo el DOM se cargue
document.addEventListener('DOMContentLoaded', () => {
    // Selecciona todos los botones con la clase "download-certificate"
    // (Ten en cuenta que es mejor asignar IDs únicos, pero en este ejemplo usamos querySelectorAll para manejar varios)
    const downloadButtons = document.querySelectorAll('.download-certificate');
  
    // Itera sobre cada botón para agregarle un event listener
    downloadButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault(); // Evita el comportamiento por defecto (por ejemplo, si es parte de un formulario)
  
        // Creamos dinámicamente un elemento div que contendrá la constancia de ejemplo
        const certificateContent = document.createElement('div');
  
        // Agregamos contenido HTML a ese div, el cual será la constancia a convertir a PDF
        certificateContent.innerHTML = `
          <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
            <h1 style="color: #0d173a;">Constancia de Ejemplo</h1>
            <p style="font-size: 16px;">Se certifica que el usuario ha completado el proceso de registro.</p>
            <p style="font-size: 14px;">Fecha: ${new Date().toLocaleDateString()}</p>
            <p style="font-size: 12px; color: gray;">Este documento se genera como ejemplo y no se almacena en la base de datos.</p>
          </div>
        `;
  
        // Opciones de configuración para html2pdf
        const options = {
          margin:       1, // Margen de 1 pulgada
          filename:     'constancia_ejemplo.pdf', // Nombre del archivo PDF resultante
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 }, // Aumenta la resolución de la imagen generada
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
  
        // Se utiliza html2pdf para convertir el contenido del div en un PDF y descargarlo
        html2pdf().set(options).from(certificateContent).save();
      });
    });
  });  