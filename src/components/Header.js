import React from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Barra de estado transparente para que luzca el degradado */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        // Mismo degradado de 3 tonos que te gustó
        colors={['#4c7dd8', '#2b5cb5', '#1a3b8c']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.8 }}
        style={[
            styles.headerGradient, 
            { paddingTop: insets.top + 8 } 
        ]}
      >
        <View style={styles.contentRow}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/header_logo.png')} 
              style={styles.logo} 
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Aumentamos un poco la sombra para dar el efecto "flotante"
    // que requieren los bordes redondeados
    shadowColor: '#1a3b8c', // Sombra con tono azulado
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8, 
    
    backgroundColor: '#2b5cb5', 
    zIndex: 10,

    // --- BORDES REDONDEADOS RESTAURADOS ---
    borderBottomLeftRadius: 24, // Un radio de 24 se ve más moderno que 16
    borderBottomRightRadius: 24,
    overflow: 'hidden', // Importante para que el degradado respete la curva
  },
  headerGradient: {
    paddingBottom: 15, // Un poco más de espacio abajo para no pegar el logo a la curva
    paddingHorizontal: 20, 
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40, 
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logo: {
    width: 130, 
    height: 32, 
    resizeMode: 'contain', 
  },
});