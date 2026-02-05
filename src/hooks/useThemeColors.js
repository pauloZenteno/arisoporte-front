// src/hooks/useThemeColors.js
import { useColorScheme } from 'react-native';
import { THEME } from '../utils/colors';

export function useThemeColors() {
  const scheme = useColorScheme(); // Detecta si es 'light' o 'dark'
  const isDark = scheme === 'dark';

  // Devuelve los colores correctos automáticamente
  return {
    colors: isDark ? THEME.dark : THEME.light,
    isDark,
  };
}