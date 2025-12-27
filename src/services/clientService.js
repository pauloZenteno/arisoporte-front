import api from './api';

export const getClients = async () => {
  const response = await api.get('/administration/Clients');
  return response.data;
};

export const getClientsFiltered = async (params) => {
  const response = await api.get('/administration/Clients/Filtered', { params });
  return response.data;
};

export const updateClientStatus = async (id, status, addDays = false) => {
  try {
    const response = await api.put(`/administration/Clients/${id}/Status`, {
      status,
      addDays
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};