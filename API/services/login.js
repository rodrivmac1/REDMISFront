import apiClient from '../apiClient.js';

const ENDPOINTS = {
    login: 'api/login',
    logout: 'api/logout'
};

const TOKEN_STORAGE_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

const loginService = {
    login: async (credentials) => {
        // Format credentials properly for your backend
        const formattedCredentials = {
            email: credentials.username,
            password: credentials.password
        };
        
        const response = await apiClient.post(ENDPOINTS.login, formattedCredentials);
        
        if (response && response.token) {
            // Save token to localStorage
            localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
            // Save user data
            localStorage.setItem(USER_DATA_KEY, JSON.stringify({
                userId: response.user_id || response.id || response.user?.id
            }));
            // Set token in apiClient for subsequent requests
            apiClient.setAuthToken(response.token);
        }
        
        return response;
    },

    logout: async () => {
        try {
            await apiClient.post(ENDPOINTS.logout);
        } finally {
            // Clear stored token and user data
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(USER_DATA_KEY);
            apiClient.setAuthToken(null);
        }
    },
    
    // Check if user is logged in
    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_STORAGE_KEY);
    },
    
    // Get the stored token
    getToken: () => {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    },
    
    // Get user data
    getUserData: () => {
        const data = localStorage.getItem(USER_DATA_KEY);
        return data ? JSON.parse(data) : null;
    },
    
    // Initialize auth state on page load
    initializeAuth: () => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
            apiClient.setAuthToken(token);
            return true;
        }
        return false;
    }
}

// Initialize auth state when this module loads
loginService.initializeAuth();

export default loginService;