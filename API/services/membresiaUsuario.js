import apiClient from '../apiClient.js';

const ENDPOINT = 'api/membresiaUsuario';

const membresiaUsuarioService = {
    // Obtener membresías de un usuario por ID (en la URL)
    getByUserId: (userId) => {
        return apiClient.get(`${ENDPOINT}/${userId}`);
    },

    // Obtener membresías de un usuario enviando el ID en el cuerpo
    getByUser: (userId) => {
        return apiClient.post(ENDPOINT, { usuarioId: userId });
    },

}

export default membresiaUsuarioService;