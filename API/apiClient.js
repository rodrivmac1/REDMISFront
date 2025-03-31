const API_Config = {
    baseURL: 'http://localhost/MembresiasREDMIS/backend/public/',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

class ApiClient {
    constructor(config = {}){
        this.config = {...API_Config, ...config};
       // this.authToken = null;
    }
    /*
    setAuthToken(token){
        this.authToken = token;
    }
    */

    getHeaders(){
        const headers = { ...this.config.headers };
        /*if (this.authToken) {
          headers['Authorization'] = `Bearer ${this.authToken}`;
        }
          */
        return headers;
    }

    async request(endpoint, method = 'GET', data = null, customConfig = {}){
        const url = `${this.config.baseURL}/${endpoint}`;

        const config = {
            method,
            ...customConfig,
            headers: this.getHeaders()
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            if (!response.ok){
                const errorData = await response.json().catch(() => ({}));
                throw {
                    status: response.status,
                    statusText: response.statusText,
                    data: errorData
                };
            }
            if (response.status === 204) return;

            return await response.json();
        } catch (error) {
            this._handleError(error);
            throw error;
        }
    }

    async get(endpoint, params = {}, config = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, 'GET', null, config);
    }

    async post(endpoint, data, config = {}) {
        return this.request(endpoint, 'POST', data, config);
    }

    async patch(endpoint, data, config = {}) {
        return this.request(endpoint, 'PATCH', data, config);
    }

    async patch(endpoint, data, config = {}) {
        return this.request(endpoint, 'PATCH', data, config);
    }

    async delete(endpoint, config = {}) {
        return this.request(endpoint, 'DELETE', null, config);
    }

    _handleError(error) {
        console.error('API Error:', error);
        
        const event = new CustomEvent('api:error', { detail: error });
        document.dispatchEvent(event);
    }
}

const apiClient = new ApiClient();
export default apiClient;

export { ApiClient };