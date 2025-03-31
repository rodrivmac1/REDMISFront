import loginService from './API/services/login.js';

document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const elements = {
        // Authentication elements
        username: document.getElementById('username'),
        password: document.getElementById('password'),
        loginBtn: document.getElementById('login-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        
        // Display elements
        authStatus: document.getElementById('auth-status'),
        authInfo: document.getElementById('auth-info')
    };

    // Initialize the app
    init();

    // Auth event listeners
    elements.loginBtn.addEventListener('click', handleLogin);
    elements.logoutBtn.addEventListener('click', handleLogout);

    // Initialize application state
    function init() {
        updateAuthStatus();
    }

    // Authentication functions
    async function handleLogin() {
        try {
            const credentials = {
                username: elements.username.value,
                password: elements.password.value
            };

            // Validation
            if (!credentials.username || !credentials.password) {
                displayMessage('Por favor, complete todos los campos', 'error');
                return;
            }

            displayMessage('Iniciando sesión...', 'info');
            console.log('Attempting login with credentials:', {
                email: credentials.username,
                password: '********' // Don't log actual password
            });
            
            const response = await loginService.login(credentials);
            
            console.log('Login response:', response);
            displayMessage('Sesión iniciada correctamente', 'success');
            updateAuthStatus();
            
        } catch (error) {
            const errorMsg = getErrorMessage(error);
            displayMessage(`Error de inicio de sesión: ${errorMsg}`, 'error');
            console.error('Login error:', error);
        }
    }

    async function handleLogout() {
        try {
            displayMessage('Cerrando sesión...', 'info');
            await loginService.logout();
            displayMessage('Sesión cerrada correctamente', 'success');
            updateAuthStatus();
        } catch (error) {
            displayMessage(`Error al cerrar sesión: ${getErrorMessage(error)}`, 'error');
            console.error('Logout error:', error);
        }
    }

    // Utility functions
    function updateAuthStatus() {
        const isAuthenticated = loginService.isAuthenticated();
        const userData = loginService.getUserData();
        
        elements.authStatus.textContent = isAuthenticated ? 
            'Autenticado' : 'No autenticado';
        elements.authStatus.className = 'status ' + (isAuthenticated ? 'success' : 'error');
        
        elements.authInfo.innerHTML = '';
        
        if (isAuthenticated) {
            const token = loginService.getToken();
            const tokenPreview = token.substring(0, 15) + '...';
            
            elements.authInfo.innerHTML = `
                <p><strong>Estado:</strong> Autenticado</p>
                <p><strong>User ID:</strong> ${userData?.userId || 'No disponible'}</p>
                <p><strong>Token:</strong> ${tokenPreview}</p>
            `;
        } else {
            elements.authInfo.innerHTML = '<p>No autenticado</p>';
        }
    }

    function displayMessage(message, type = 'info') {
        elements.authStatus.textContent = message;
        elements.authStatus.className = 'status ' + type;
    }

    function getErrorMessage(error) {
        if (typeof error === 'string') return error;
        if (error.message) return error.message;
        if (error.data && error.data.message) return error.data.message;
        if (error.statusText) return `${error.status} - ${error.statusText}`;
        return 'Error desconocido';
    }
});