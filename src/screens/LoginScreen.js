import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { login, setSession, setUserInfo, getUserInfo, clearSession, checkBiometricSupport, authenticateWithBiometrics } from '../services/authService';
import { useClients } from '../context/ClientContext';
import BackgroundSvg from '../assets/login_background.svg'; 

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [savedUser, setSavedUser] = useState(null);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  const { loadInitialData, setUserProfile } = useClients();

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const bioSupported = await checkBiometricSupport();
      setHasBiometrics(bioSupported);

      const user = await getUserInfo();
      if (user && user.firstName) {
        setSavedUser(user);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(username, password);

      const { accessToken, refreshToken, id, firstName, lastName, jobPosition } = data;

      await setSession(accessToken, refreshToken);
      
      const userData = { 
        id, 
        firstName, 
        lastName, 
        jobPosition, 
        username: username 
      };

      setUserProfile(userData);

      if (rememberMe) {
        await setUserInfo(userData);
      }

      loadInitialData();
      navigation.replace('MainTabs');

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Credenciales incorrectas o error en el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    if (!password) {
      Alert.alert('Atención', 'Por favor ingresa tu contraseña para continuar.');
      return;
    }

    if (!savedUser || !savedUser.username) {
      Alert.alert(
        'Actualización requerida', 
        'Detectamos una sesión antigua. Por favor presiona "Cambiar usuario" e inicia sesión nuevamente para actualizar tus datos.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(savedUser.username, password);
      const { accessToken, refreshToken, id, firstName, lastName, jobPosition } = data;

      await setSession(accessToken, refreshToken);
      
      const userData = { 
        id, 
        firstName, 
        lastName, 
        jobPosition, 
        username: savedUser.username 
      };

      setUserProfile(userData);
      await setUserInfo(userData);

      loadInitialData();
      navigation.replace('MainTabs');

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Contraseña incorrecta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      setIsLoading(true);
      
      if (savedUser) {
        setUserProfile(savedUser);
      }

      loadInitialData();
      setTimeout(() => {
        navigation.replace('MainTabs');
      }, 500);
    }
  };

  const handleSwitchAccount = async () => {
    await clearSession();
    setSavedUser(null);
    setUsername('');
    setPassword('');
  };

  if (savedUser) {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.backgroundContainer}>
          <BackgroundSvg width={width} height={height} preserveAspectRatio="xMidYMid slice" />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.verticalContainer}
        >
          
          <View style={styles.topSection}>
            <Image 
              source={require('../assets/logo_arisoporte.png')}
              style={styles.logoVertical} 
            />
          </View>

          <View style={styles.middleSection}>
            <Text style={styles.greetingLabel}>Hola de nuevo,</Text>
            <Text style={styles.greetingName}>
              {savedUser.firstName || savedUser.name || 'Usuario'}
            </Text>
          </View>

          <View style={styles.bottomSection}>
            
            {hasBiometrics && (
              <TouchableOpacity 
                style={styles.biometricIconBtn} 
                onPress={handleBiometricLogin}
                disabled={isLoading}
              >
                {isLoading && !password ? (
                  <ActivityIndicator size="large" color="#2b5cb5" />
                ) : (
                  <Ionicons name="finger-print" size={50} color="#2b5cb5" />
                )}
              </TouchableOpacity>
            )}

            <View style={styles.quickLoginContainer}>
              <View style={styles.passwordInputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{marginLeft: 10}} />
                <TextInput
                  style={styles.quickPasswordInput}
                  placeholder="Contraseña"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={styles.quickLoginBtn}
                onPress={handleQuickLogin}
                disabled={isLoading}
              >
                {isLoading && password ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="arrow-forward" size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.switchUserLink} 
              onPress={handleSwitchAccount}
            >
              <Text style={styles.switchUserText}>Cambiar usuario</Text>
            </TouchableOpacity>

          </View>

        </KeyboardAvoidingView>
      </View>
    );
  }

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
  mainContainer: { flex: 1 },
  backgroundContainer: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
  container: { flex: 1 },
  contentContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoImage: { width: 150, height: 150, resizeMode: 'contain' },
  inputContainer: { marginBottom: 20 },
  input: {
    backgroundColor: 'white', borderRadius: 12, paddingVertical: 15, paddingHorizontal: 20,
    fontSize: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  optionsRow: { flexDirection: 'row', marginBottom: 40 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkboxText: { color: 'white', marginLeft: 8 },
  loginButton: {
    backgroundColor: '#6FCF97', borderRadius: 30, paddingVertical: 18, alignItems: 'center',
    marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
  loginButtonDisabled: { backgroundColor: '#a5d6b9' },
  loginButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  verticalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  
  topSection: {
    marginBottom: 10, 
    alignItems: 'center',
    width: '100%',
  },
  logoVertical: {
    width: 280,  
    height: 180, 
    resizeMode: 'contain',
  },

  middleSection: {
    alignItems: 'center',
    marginBottom: 30, 
  },
  greetingLabel: {
    fontSize: 20,
    color: 'white',
    fontWeight: '300',
    marginBottom: 5,
  },
  greetingName: {
    fontSize: 34,
    color: 'white',
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },

  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  
  biometricIconBtn: {
    backgroundColor: 'white',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  quickLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 320,
  },
  passwordInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    marginRight: 10,
    height: 55,
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickPasswordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#374151',
  },
  quickLoginBtn: {
    backgroundColor: '#6FCF97',
    width: 55,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  switchUserLink: {
    padding: 10,
    marginTop: 5,
  },
  switchUserText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
    opacity: 0.9,
  },
});