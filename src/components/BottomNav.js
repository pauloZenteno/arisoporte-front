import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomNav({ state, descriptors, navigation }) {
  
  return (
    <View style={styles.container}>
      <View style={styles.glassBackground}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          let label = options.tabBarLabel;
          // Si no hay label, usa el nombre de la ruta
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

          if (isFocused) {
            return (
              <View key={route.key} style={styles.navPillContainer}>
                <View style={[styles.navPill, { backgroundColor: '#2b5cb5' }]}>
                  <Ionicons name={iconName} size={20} color="white" />
                  <Text style={styles.navPillText}>{label}</Text>
                </View>
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
  },
  glassBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // --- AJUSTES PARA 5 ITEMS ---
    width: '92%', // Aumentado de 85% a 92%
    maxWidth: 400, // Aumentado de 350 a 400
    // ----------------------------
    height: 70,
    borderRadius: 35,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.95)',
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
    flex: 1, // Usar flex para distribuir espacio equitativamente
  },
  navPillContainer: {
    shadowColor: '#2b5cb5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14, // Reducido ligeramente el padding horizontal
    borderRadius: 25,
  },
  navPillText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12, // Reducido ligeramente el tamaño de fuente
    marginLeft: 4,
  },
});