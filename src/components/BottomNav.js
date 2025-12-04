import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function BottomNav({ state, descriptors, navigation }) {
  
  return (
    <View style={styles.container}>
      <View style={styles.glassBackground}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          // Definimos etiqueta e icono según la ruta
          let label = options.tabBarLabel;
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

          if (isFocused) {
            return (
              <View key={route.key} style={styles.navPillContainer}>
                <LinearGradient
                  colors={['#2b5cb5', '#4A90E2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.navPill}
                >
                  <Ionicons name={iconName} size={20} color="white" />
                  <Text style={styles.navPillText}>{label}</Text>
                </LinearGradient>
                <View style={styles.pillGlassShine} />
              </View>
            );
          }

          return (
            <TouchableOpacity 
              key={route.key}
              style={styles.navItem} 
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Ionicons name={iconName + "-outline"} size={24} color="#6B7280" />
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
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    // Eliminamos zIndex excesivo para evitar conflictos
  },
  glassBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '85%',
    maxWidth: 350,
    height: 70,
    borderRadius: 35,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#2b5cb5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  navItem: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 60,
  },
  navPillContainer: {
    position: 'relative',
    shadowColor: '#2b5cb5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
  },
  navPillText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  pillGlassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  }
});