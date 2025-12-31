import api from './api';

export const getQuotes = async () => {
  try {
    const response = await api.get('/administration/QuoteManagement');
    return response.data;
  } catch (error) {
    throw error;
  }
};