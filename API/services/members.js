import apiClient from '../apiClient.js';

const ENDPOINT = 'api/miembros';

const membersService = {
    get: () =>{
        return apiClient.get(ENDPOINT);
    },

    getbyID: (id) =>{
        return apiClient.get(`${ENDPOINT}/${id}`);
    },

    addMember: (member) =>{
        return apiClient.post(ENDPOINT, member);
    },

    deleteMember: (id) =>{
        return apiClient.delete(`${ENDPOINT}/${id}`);
    },

    updateMember: (id, member) =>{
        return apiClient.patch(`${ENDPOINT}/${id}`, member);
    }
}

export default membersService;