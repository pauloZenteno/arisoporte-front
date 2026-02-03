import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, LayoutAnimation, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function BottomNav({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [state.index]);

  return (
    <View style={[
      styles.mainWrapper,
      isAndroid ? styles.androidWrapper : styles.iosWrapper,
      { paddingBottom: isAndroid ? 0 : insets.bottom } 
    ]}>
      <View style={[
        styles.navContainer,
        isAndroid ? styles.androidContainer : styles.iosContainer
      ]}>
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
                isFocused ? (isAndroid ? styles.tabItemActiveAndroid : styles.tabItemActiveIOS) : styles.tabItemInactive
              ]}
            >
              <View style={styles.contentContainer}>
                <Ionicons 
                  name={isFocused ? iconName : `${iconName}-outline`} 
                  size={24} 
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
      
      {isAndroid && <View style={{ height: insets.bottom, backgroundColor: 'white' }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
  },
  
  // --- ESTILOS iOS (Flotante) ---
  iosWrapper: {
    bottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%', 
    maxWidth: 500,
    height: 70,
    borderRadius: 40,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    padding: 6, 
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabItemActiveIOS: {
    flex: 2.5, 
    backgroundColor: '#EFF6FF',
    borderRadius: 30,
  },

  // --- ESTILOS ANDROID (Material Design / Barra Completa) ---
  androidWrapper: {
    bottom: 0,
  },
  androidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', 
    width: '100%',
    height: 65, 
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 8, 
    paddingHorizontal: 10,
  },
  tabItemActiveAndroid: {
    flex: 2, 
    backgroundColor: '#EFF6FF', 
    borderRadius: 16, 
    paddingVertical: 8, 
  },

  // --- ESTILOS COMUNES ---
  tabItem: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tabItemInactive: {
    flex: 1, 
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    color: '#2b5cb5',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
});