import React from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../hooks/useThemeColors';

export default function Header() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeColors();

  const lightGradient = ['#4c7dd8', '#2b5cb5', '#1a3b8c'];
  const darkGradient = ['#152C5E', '#0F2046', '#050B1A'];

  return (
    <View style={[
        styles.container, 
        { 
            backgroundColor: colors.primary,
            shadowColor: isDark ? '#000000' : colors.primary,
            shadowOpacity: isDark ? 0.5 : 0.25,
        }
    ]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={isDark ? darkGradient : lightGradient}
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
              source={isDark 
                ? require('../assets/header_logo.png') 
                : require('../assets/header_logo.png')
              } 
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
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8, 
    zIndex: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingBottom: 15,
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