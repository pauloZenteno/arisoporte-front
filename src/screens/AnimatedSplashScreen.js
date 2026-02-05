import React from 'react';
import { StyleSheet, ImageBackground, StatusBar } from 'react-native';
import LottieView from 'lottie-react-native';
import { useThemeColors } from '../hooks/useThemeColors';

export default function AnimatedSplashScreen({ onFinish }) {
  const { isDark } = useThemeColors();

  return (
    <ImageBackground 
      source={isDark 
        ? require('../../assets/splash-dark.png') 
        : require('../../assets/splash-icon.png')
      } 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#0F172A' : '#4c7dd8' }
      ]}
      resizeMode="contain" 
    >
      <StatusBar hidden />
      <LottieView
        source={require('../../assets/splash-animation.json')}
        autoPlay
        loop={false}
        speed={0.8}
        resizeMode="contain"
        hardwareAccelerationAndroid={true}
        renderMode="HARDWARE"
        onAnimationFinish={(isCancelled) => {
          if (!isCancelled) {
             onFinish();
          }
        }}
        style={styles.lottie}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});