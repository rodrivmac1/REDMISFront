import apiClient from "../apiClient.js";

const ENDPOINT = "api/estados";

const statesService = {
    get: () => {
        return apiClient.get(ENDPOINT);
    }
}

export default statesService;