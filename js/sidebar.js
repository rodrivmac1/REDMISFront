import loginService from '../API/services/login.js';


document.addEventListener("DOMContentLoaded", function() {

    const userRole = loginService.getUserRole(); // Obtener el rol del usuario desde el servicio de autenticación
    const sidebarUser = 'sidebar.html';
    const sidebarAdmin = 'SidebarAdmin.html';

    if (userRole === 1) { 
        loadSidebar(sidebarAdmin);
    } else if (userRole === 2) { 
        loadSidebar(sidebarUser);
    } 
});


const displaySidebar = () => {
    const sidebarDiv = document.getElementById("sidebar");
    sidebarDiv.style.display = "flex";
}

const displaySidebarBtn = document.getElementById("display-sidebar");
displaySidebarBtn.addEventListener("click", displaySidebar);





const loadSidebar = (sidebarPath) => {

  const sidebarDiv = document.getElementById('sidebar');

  fetch(sidebarPath)
      .then(res => res.text())
      .then(html => {
          sidebarDiv.innerHTML = html;
          const path = window.location.pathname.split('/').pop();
          const links = document.querySelectorAll('.sidebar-menu-item');
          
          // Marcar enlaces normales como activos
          links.forEach(link => {
              if (link.getAttribute('href') === path) {
                  link.classList.add('active');
              }
          });

          // Verificar si estamos en una página del submenú Agregar
          const agregarPages = ['AgregarPais.html', 'AgregarEstado.html', 'AgregarUniversidad.html'];
          if (agregarPages.includes(path)) {
              const agregarMenu = document.querySelector('.sidebar-menu-with-submenu');
              if (agregarMenu) {
                  agregarMenu.classList.add('active');
              }
          }

          // Bloque de cierre de sesión
          const logout_btn = document.getElementById("logout-button");
          if (logout_btn) {
              logout_btn.addEventListener('click', async () => {
                  try {
                      const confirmation = confirm("¿Estás seguro de que deseas cerrar sesión?");
                      if (!confirmation) {
                          return; 
                      }
                      await loginService.logout();   
                      window.location.href = 'login.html';
                  } catch (error) {
                      console.error('Error al cerrar sesión:', error);
                  }
              });
          }

          const hideSidebar = () => {
            const sidebarDiv = document.getElementById("sidebar");
            sidebarDiv.style.display = "none";
          };

          const hideSidebarBtn = document.getElementById("hide-sidebar");
          hideSidebarBtn.addEventListener("click", hideSidebar);
      })
      .catch(error => {
          console.error('Error loading sidebar:', error);
      });
}