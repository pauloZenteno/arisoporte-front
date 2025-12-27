import React, { useState } from 'react';
import { 
  StyleSheet, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Alert, Image, Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { login, setSession, setUserInfo } from '../services/authService';
import { useClients } from '../context/ClientContext';

import BackgroundSvg from '../assets/login_background.svg'; 

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loadInitialData } = useClients();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(username, password);

      const { 
        accessToken, 
        refreshToken, 
        firstName, 
        lastName, 
        jobPosition 
      } = data;

      await setSession(accessToken, refreshToken);
      await setUserInfo({ firstName, lastName, jobPosition });

      loadInitialData();

      navigation.replace('MainTabs');

    } catch (error) {
      console.error(error);
      Alert.alert(
        'Error de Inicio de Sesión', 
        'Credenciales incorrectas o error en el servidor.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      
      <View style={styles.backgroundContainer}>
        <BackgroundSvg width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo_arisoporte.png')}
              style={styles.logoImage} 
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Usuario"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setRememberMe(!rememberMe)}
            >
              <Ionicons 
                name={rememberMe ? "checkbox" : "square-outline"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.checkboxText}>Recordarme</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>INICIAR SESIÓN</Text>
            )}
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1, 
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 150, 
    height: 150, 
    resizeMode: 'contain',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    color: 'white',
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: '#6FCF97',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#a5d6b9',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});