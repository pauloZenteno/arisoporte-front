import { Linking, Alert } from 'react-native';

export const openWhatsApp = async (phoneNumber, message = '') => {
  if (!phoneNumber) {
    Alert.alert('Falta información', 'Este cliente no tiene un número de teléfono registrado.');
    return;
  }

  let cleanNumber = phoneNumber.toString().replace(/[^\d]/g, '');
  if (cleanNumber.length === 10) {
    cleanNumber = '52' + cleanNumber;
  }

  const appUrl = `whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
  const webUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

  console.log(`[WhatsApp] Intentando conectar con: ${cleanNumber}`);

  try {
    const supported = await Linking.canOpenURL(appUrl);

    if (supported) {
      await Linking.openURL(appUrl);
    } else {
      console.log('App no detectada directamente, usando enlace web universal...');
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    console.error("Error al intentar abrir URL:", error);
    try {
        await Linking.openURL(webUrl);
    } catch (e) {
        Alert.alert('Error', 'No se pudo abrir WhatsApp ni el navegador.');
    }
  }
};