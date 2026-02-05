import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image, Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { 
  login, setSession, setUserInfo, getUserInfo, clearFullStorage, 
  storeUserCredentials, getUserCredentials 
} from '../services/authService';
import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import { useThemeColors } from '../hooks/useThemeColors';

const HARDCODED_SELLER_RELATIONS = {
  'b8QWwNJYxAGr5gER': 'NZ9DezJWqMQOnRE3', 
  '5m2XOBMXzJ4NZkwr': 'lK20zbAk4JRDVEa1', 
};

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const [savedUser, setSavedUser] = useState(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { isBiometricSupported, biometricType, isChecking: isCheckingBiometrics, authenticate } = useBiometricAuth();
  const { loadInitialData, setUserProfile } = useClients();
  const { signIn } = useAuth();
  const { colors, isDark } = useThemeColors();

  useEffect(() => {
    checkSavedUser();
  }, []);

  const checkSavedUser = async () => {
    try {
      const user = await getUserInfo();
      if (user && user.firstName) {
        setSavedUser(user);
      }
    } catch (error) {
    } finally {
      setIsCheckingUser(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500, 
        useNativeDriver: true,
      }).start();
    }
  };

  const performLoginSuccess = async (data, currentPassword) => {
    const { 
        accessToken, 
        refreshToken, 
        id, 
        firstName, 
        lastName, 
        jobPosition,
        roleId, 
        username: apiUsername 
    } = data;

    let finalSellerId = data.sellerId;
    
    if (!finalSellerId && HARDCODED_SELLER_RELATIONS[id]) {
        finalSellerId = HARDCODED_SELLER_RELATIONS[id];
    }

    await setSession(accessToken, refreshToken);
    
    const userToSave = apiUsername || username || savedUser?.username;

    if (userToSave && currentPassword) {
      await storeUserCredentials(userToSave, currentPassword);
    }

    const userData = { 
      id, 
      firstName: firstName || '', 
      lastName: lastName || '', 
      jobPosition: jobPosition || '',
      roleId: roleId,
      sellerId: finalSellerId, 
      username: userToSave
    };

    setUserProfile(userData);

    if (rememberMe || savedUser) {
      await setUserInfo(userData);
    }

    loadInitialData(userData);

    await signIn(userData);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Campos vacíos', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(username, password);
      await performLoginSuccess(data, password);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Alert.alert('Credenciales Incorrectas', 'El usuario o la contraseña no coinciden.');
      } else if (error.message && error.message.includes('Network Error')) {
        Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor.');
      } else {
        Alert.alert('Error', 'Ocurrió un problema inesperado.');
      }
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
      Alert.alert('Actualización requerida', 'Por favor inicia sesión manualmente.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(savedUser.username, password);
      await performLoginSuccess(data, password);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Alert.alert('Contraseña Incorrecta', 'La contraseña ingresada no es válida.');
      } else {
        Alert.alert('Error', 'No se pudo validar la sesión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const success = await authenticate();
    
    if (success) {
      setIsLoading(true);
      try {
        const { username: storedUser, password: storedPassword } = await getUserCredentials();

        if (storedUser && storedPassword) {
            const data = await login(storedUser, storedPassword);
            await performLoginSuccess(data, storedPassword);
        } else {
            setIsLoading(false);
            Alert.alert('Aviso', 'Por seguridad, ingresa tu contraseña esta vez para habilitar el acceso biométrico futuro.');
        }
      } catch (error) {
        setIsLoading(false);
        Alert.alert('Error', 'Hubo un problema al validar tus credenciales guardadas. Ingresa tu contraseña manualmente.');
      }
    }
  };

  const handleSwitchAccount = async () => {
    await clearFullStorage(); 
    setSavedUser(null);
    setUsername('');
    setPassword('');
  };

  const renderBiometricIcon = () => {
    if (biometricType === 'FACE') {
      return (
         <Image 
           source={require('../assets/faceid_icon.png')} 
           style={{ width: 50, height: 50, tintColor: colors.primary, resizeMode: 'contain' }} 
         />
      );
    }
    return <Ionicons name="finger-print" size={50} color={colors.primary} />;
  };

  if (isCheckingUser) {
    return (
        <View style={styles.mainContainer}>
            <View style={styles.backgroundContainer}>
                <Image 
                  source={isDark 
                    ? require('../assets/dark_bg.png') 
                    : require('../assets/login_background.png')
                  }
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
            </View>
        </View>
    );
  }

  const content = savedUser ? (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.verticalContainer}>
          <View style={styles.topSection}>
            <Image source={require('../assets/logo_arisoporte.png')} style={styles.logoVertical} />
          </View>

          <View style={styles.middleSection}>
            <Text style={[styles.greetingLabel, isDark && { color: colors.textSecondary }]}>Hola de nuevo,</Text>
            <Text style={[styles.greetingName, isDark && { color: colors.text }]}>
                {savedUser.firstName || savedUser.name || 'Usuario'}
            </Text>
          </View>

          <View style={styles.bottomSection}>
            {!isCheckingBiometrics && isBiometricSupported && (
              <TouchableOpacity 
                style={[styles.biometricIconBtn, { backgroundColor: colors.card }]} 
                onPress={handleBiometricLogin} 
                disabled={isLoading}
              >
                {isLoading && !password ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  renderBiometricIcon()
                )}
              </TouchableOpacity>
            )}

            <View style={styles.quickLoginContainer}>
              <View style={[styles.passwordInputWrapper, { backgroundColor: colors.card }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={{marginLeft: 10}} />
                <TextInput
                  style={[styles.quickPasswordInput, { color: colors.text }]}
                  placeholder="Contraseña"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{ padding: 10 }}>
                  <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.quickLoginBtn} onPress={handleQuickLogin} disabled={isLoading}>
                {isLoading && password ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="arrow-forward" size={24} color="white" />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.switchUserLink} onPress={handleSwitchAccount}>
              <Text style={[styles.switchUserText, isDark && { color: colors.textSecondary }]}>Cambiar usuario</Text>
            </TouchableOpacity>
          </View>
    </KeyboardAvoidingView>
  ) : (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/logo_arisoporte.png')} style={styles.logoImage} />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                  styles.input, 
                  { backgroundColor: colors.card, color: colors.text }
              ]}
              placeholder="Usuario"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <View style={[styles.passwordContainer, { backgroundColor: colors.card }]}>
              <TextInput
                style={[styles.passwordInputInternal, { color: colors.text }]}
                placeholder="Contraseña"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
              <Ionicons name={rememberMe ? "checkbox" : "square-outline"} size={20} color={isDark ? colors.text : "white"} />
              <Text style={[styles.checkboxText, isDark && { color: colors.text }]}>Recordarme</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.loginButtonText}>INICIAR SESIÓN</Text>}
          </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.backgroundContainer}>
          <Image 
              source={isDark 
                ? require('../assets/dark_bg.png') 
                : require('../assets/login_background.png')
              }
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
          />
      </View>
      
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {content}
      </Animated.View>
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
  input: { borderRadius: 12, paddingVertical: 15, paddingHorizontal: 20, fontSize: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  passwordInputInternal: { flex: 1, paddingVertical: 15, fontSize: 16 },
  optionsRow: { flexDirection: 'row', marginBottom: 40 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkboxText: { color: 'white', marginLeft: 8 },
  loginButton: { backgroundColor: '#6FCF97', borderRadius: 30, paddingVertical: 18, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  loginButtonDisabled: { backgroundColor: '#a5d6b9' },
  loginButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  verticalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  topSection: { marginBottom: 10, alignItems: 'center', width: '100%' },
  logoVertical: { width: 280, height: 180, resizeMode: 'contain' },
  middleSection: { alignItems: 'center', marginBottom: 30 },
  greetingLabel: { fontSize: 20, color: 'white', fontWeight: '300', marginBottom: 5 },
  greetingName: { fontSize: 34, color: 'white', fontWeight: '800', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 3 },
  bottomSection: { width: '100%', alignItems: 'center' },
  biometricIconBtn: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  quickLoginContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, width: '100%', maxWidth: 320 },
  passwordInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 15, marginRight: 10, height: 55, paddingHorizontal: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  quickPasswordInput: { flex: 1, height: '100%', paddingHorizontal: 10, fontSize: 16 },
  quickLoginBtn: { backgroundColor: '#6FCF97', width: 55, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  switchUserLink: { padding: 10, marginTop: 5 },
  switchUserText: { color: 'white', fontSize: 15, fontWeight: '600', textDecorationLine: 'underline', opacity: 0.9 },
});