import api from './api';

export const getClientsUsageReport = async () => {
  try {
    const response = await api.get('/administration/ClientsReport/Usage');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};