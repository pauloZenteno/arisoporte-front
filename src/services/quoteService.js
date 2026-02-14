import api from './api';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { INITIAL_MODULES, HARDCODED_PRODUCTS } from '../utils/quoteConstants';

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const getQuotes = async (pageNumber = 1, pageSize = 10, sortParam = 'CreatedAt', isDescending = true) => {
  try {
    const response = await api.get('/administration/QuoteManagement', {
      params: { 
        pageNumber, 
        pageSize,
        sortParam,
        isDescending
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
    // LIMPIEZA Y ENRIQUECIMIENTO DE DATOS
    const cleanData = {
        ...quoteData,
        moduleDetails: quoteData.moduleDetails
            ? quoteData.moduleDetails
                .filter(m => m.isActive && Number(m.employeeNumber) > 0)
                .map(m => {
                    // Si el nombre viene null, lo buscamos en las constantes por su moduleId
                    const localModule = INITIAL_MODULES.find(im => im.moduleId === m.moduleId);
                    return {
                        ...m,
                        name: m.name || (localModule ? localModule.name : 'Sin Nombre')
                    };
                })
            : [],
        productDetails: quoteData.productDetails
            ? quoteData.productDetails
                .filter(p => p.isActive && Number(p.quantity) > 0)
                .map(p => {
                    // Si el nombre viene null, lo buscamos en las constantes por su productId
                    const localProduct = HARDCODED_PRODUCTS.find(hp => hp.id === p.productId);
                    return {
                        ...p,
                        name: p.name || (localProduct ? localProduct.name : 'Sin Nombre')
                    };
                })
            : []
    };

    const response = await api.post('/administration/ProductPriceScheme/downloadQuote', cleanData, {
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

    // Sin await para evitar bloqueo de UI si el usuario cancela
    Sharing.shareAsync(fileUri).catch(error => {
        console.log("El usuario cerró el menú o hubo un error al compartir:", error);
    });

    return true;
  } catch (error) {
    throw error;
  }
};