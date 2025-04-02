import apiClient from "../apiClient.js";

const ENDPOINT = "api/paises";

const countryService = {
    get: () => {
        return apiClient.get(ENDPOINT);
    }
}

export default countryService;