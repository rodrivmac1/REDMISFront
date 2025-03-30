// Función para generar y descargar el PDF de la constancia
function downloadConstancia() {
  // Se obtiene la referencia a la librería jsPDF
  const { jsPDF } = window.jspdf;
  // Se crea un nuevo documento PDF
  const doc = new jsPDF();
  // Agregar contenido de ejemplo al PDF de constancia
  doc.setFontSize(18);
  doc.text("Constancia de Membresía", 20, 30);
  doc.setFontSize(12);
  doc.text("Este documento certifica que el usuario cuenta con una membresía activa.", 20, 50);
  doc.text("Fecha de emisión: " + new Date().toLocaleDateString(), 20, 60);
  // Descargar el PDF con el nombre especificado
  doc.save("constancia_sample.pdf");
}

// Función para generar y descargar el PDF de la membresía (desde la tabla)
function downloadFromTable(event) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  // Agregar contenido de ejemplo al PDF de membresía
  doc.setFontSize(18);
  doc.text("Membresía Detallada", 20, 30);
  doc.setFontSize(12);
  doc.text("Este documento contiene los detalles de la membresía solicitada.", 20, 50);
  doc.text("Código de membresía: XYZ123", 20, 60);
  doc.text("Fecha de inicio: 11/08/24", 20, 70);
  doc.text("Fecha de vencimiento: 11/08/29", 20, 80);
  // Descargar el PDF con el nombre especificado
  doc.save("membership_sample.pdf");
}

// (Función extra si se requiere otro botón para descargar membresía)
function downloadMembership() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  // Agregar contenido de ejemplo al PDF (puedes personalizarlo)
  doc.setFontSize(18);
  doc.text("Detalle de Membresía", 20, 30);
  doc.setFontSize(12);
  doc.text("Contenido de ejemplo para el documento de membresía.", 20, 50);
  doc.save("membership_sample.pdf");
}

// Función para manejar el cierre de sesión
function logout() {
  alert("Cerrando sesión...");
}

// Se espera a que el DOM esté completamente cargado para asignar los event listeners
document.addEventListener("DOMContentLoaded", function() {
  // Asignar event listener al botón de descargar constancia
  document.getElementById("downloadConstancia").addEventListener("click", downloadConstancia);

  // Asignar event listener a todos los botones de descarga de la tabla
  let downloadButtons = document.querySelectorAll(".download-btn");
  downloadButtons.forEach(function(button) {
    button.addEventListener("click", downloadFromTable);
  });

  // Ejemplo para asignar el listener del botón de cerrar sesión (en la sidebar)
  const logoutButton = document.querySelector(".sidebar-logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", function(event) {
      event.preventDefault();
      logout();
    });
  }
});