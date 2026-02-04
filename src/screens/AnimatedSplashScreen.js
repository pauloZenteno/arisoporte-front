import React from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import LottieView from 'lottie-react-native';

export default function AnimatedSplashScreen({ onFinish }) {
  return (
    <ImageBackground 
      source={require('../../assets/splash-icon.png')} 
      style={styles.container}
      resizeMode="cover"
    >
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