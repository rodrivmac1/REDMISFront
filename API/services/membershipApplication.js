import apiClient from '../apiClient.js';

const ENDPOINT = {
    solicitar: 'api/solicitarMembresia',
    aceptar: 'api/aceptarMembresia',
    rechazar: 'api/rechazarMembresia',
    obtener: 'api/solicitudesMembresias',
}

const membershipApplicationService = {
    solicitar: (membershipApplication) => {
        return apiClient.post(ENDPOINT.solicitar, membershipApplication);
    },

    aceptar: (id) => {
        return apiClient.post(`${ENDPOINT.aceptar}/${id}`);
    },

    rechazar: (id, reason) => {
        return apiClient.post(`${ENDPOINT.rechazar}/${id}`, reason);
    },
    obtener : () => {
        return apiClient.get(ENDPOINT.obtener);
    }
};

export default membershipApplicationService;