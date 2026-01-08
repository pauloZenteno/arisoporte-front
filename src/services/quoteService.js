import api from './api';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// MODIFICADO: Ahora acepta sortParam e isDescending
export const getQuotes = async (pageNumber = 1, pageSize = 10, sortParam = 'CreatedAt', isDescending = true) => {
  try {
    const response = await api.get('/administration/QuoteManagement', {
      params: { 
        pageNumber, 
        pageSize,
        sortParam,      // <--- Agregado
        isDescending    // <--- Agregado
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getQuoteById = async (id) => {
  try {
    const response = await api.get(`/administration/QuoteManagement/${id}`, {
      params: {
        includes: ["ModuleDetails", "ProductDetails"]
      },
      paramsSerializer: params => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            const value = params[key];
            if (Array.isArray(value)) {
                value.forEach(val => searchParams.append(key, val));
            } else {
                searchParams.append(key, value);
            }
        });
        return searchParams.toString();
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createQuote = async (quoteData) => {
  try {
    const response = await api.post('/administration/QuoteManagement', quoteData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateQuote = async (id, quoteData) => {
  try {
    const response = await api.put(`/administration/QuoteManagement/${id}`, quoteData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadQuote = async (id) => {
  try {
    const response = await api.get(`/administration/QuoteManagement/${id}/download`, {
        responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadQuotePdf = async (quoteData) => {
  try {
    const response = await api.post('/administration/ProductPriceScheme/downloadQuote', quoteData, {
      responseType: 'arraybuffer'
    });

    const base64Data = arrayBufferToBase64(response.data);
    const filename = `Cotizacion_${quoteData.folio || 'Borrador'}.pdf`;
    
    const fileUri = FileSystem.documentDirectory + filename;

    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: 'base64', 
    });

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo');
      return;
    }

    await Sharing.shareAsync(fileUri);
  } catch (error) {
    throw error;
  }
};