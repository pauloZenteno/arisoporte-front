import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, LayoutAnimation, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function BottomNav({ state, descriptors, navigation }) {
  // 1. Obtenemos los márgenes seguros del dispositivo (Notch, Home Indicator, Botones Android)
  const insets = useSafeAreaInsets();

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [state.index]);

  return (
    // 2. Aplicamos el margen inferior dinámico
    // En Android, insets.bottom suele ser el alto de la barra de navegación.
    // Le sumamos 20 para mantener el efecto "flotante".
    <View style={[styles.container, { bottom: (Platform.OS === 'android' ? 10 : 20) + insets.bottom }]}>
      <View style={styles.glassBackground}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          let label = options.tabBarLabel;
          if (!label) label = route.name;
          
          let iconName = options.tabBarIconName; 
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={[
                styles.tabItem,
                isFocused ? styles.tabItemActive : styles.tabItemInactive
              ]}
            >
              <View style={styles.contentContainer}>
                <Ionicons 
                  name={isFocused ? iconName : `${iconName}-outline`} 
                  size={22} 
                  color={isFocused ? "#2b5cb5" : "#9CA3AF"} 
                />
                
                {isFocused && (
                  <Text style={styles.tabLabel} numberOfLines={1}>
                    {label}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // 'bottom' se controla dinámicamente en el componente
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20, 
    // Aseguramos que el menú esté por encima de cualquier otro elemento flotante
    zIndex: 100, 
  },
  glassBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%', 
    maxWidth: 500,
    height: 70,
    borderRadius: 40,
    backgroundColor: 'white',
    
    // --- MEJORA VISUAL: Sombra más pronunciada ---
    shadowColor: '#000', // Sombra negra pura para más contraste
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, // Aumentado de 0.08 a 0.15 para que resalte más
    shadowRadius: 20,
    elevation: 10, // Aumentado para Android
    
    padding: 6, 
    borderWidth: 1,
    // --- MEJORA VISUAL: Borde un poco más oscuro ---
    borderColor: '#E5E7EB', // Gris medio (antes era muy claro)
  },
  
  tabItem: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    overflow: 'hidden',
  },
  
  tabItemInactive: {
    flex: 1, 
    backgroundColor: 'transparent',
  },
  
  tabItemActive: {
    flex: 2.5, 
    backgroundColor: '#EFF6FF' 
  },
  
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  
  tabLabel: {
    color: '#2b5cb5',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
});