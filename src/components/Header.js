import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LogoSvg from '../assets/logo_arisoporte.svg';

export default function Header({ navigation }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        // Gradiente de Azul Corporativo (#2b5cb5) a un Azul Profundo (#1e40af)
        // Esto crea un efecto elegante y profesional
        colors={['#2b5cb5', '#1e40af']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          
          {/* Logo (Asegúrate de que tu SVG tenga relleno blanco o se vea bien en oscuro) */}
          <View style={styles.logoContainer}>
              <LogoSvg width={90} height={40} /> 
          </View>
          
          {/* Botón con fondo translúcido (Efecto cristal) */}
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Sombra para dar elevación al header sobre el contenido
    shadowColor: '#2b5cb5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 5,
    backgroundColor: 'white', // Fondo base para evitar glitches
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden', // Necesario para que el gradiente respete los bordes redondeados
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 60,
    paddingBottom: 15,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Blanco al 20% de opacidad
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Borde sutil
  },
});