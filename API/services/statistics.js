import apiClient from '../apiClient.js';

const ENDPOINT = 'api/statistics';

const statisticsService = {
    get: () =>{
        return apiClient.get(ENDPOINT);
    }
}

export default statisticsService;