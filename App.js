import React, { useState } from 'react';
import { View, Platform, LogBox } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CotizadorScreen from './src/screens/CotizadorScreen';
import QuoteCreateScreen from './src/screens/QuoteCreateScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import GeneralReportScreen from './src/screens/reports/GeneralReportScreen';
import UsageReportScreen from './src/screens/reports/UsageReportScreen';

import Header from './src/components/Header';
import AnimatedSplashScreen from './src/screens/AnimatedSplashScreen'; 
import { ClientProvider } from './src/context/ClientContext'; 
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useThemeColors } from './src/hooks/useThemeColors';
import { hasPermission, PERMISSIONS } from './src/utils/permissions';

LogBox.ignoreLogs(['setLayoutAnimationEnabledExperimental']);

const Stack = createNativeStackNavigator();
const NativeTab = createNativeBottomTabNavigator(); 
const StandardTab = createBottomTabNavigator();     

function IOSTabs() {
  const { colors } = useThemeColors();
  const { user } = useAuth();
  const canViewQuoter = hasPermission(user?.roleId, PERMISSIONS.VIEW_QUOTER);

  return (
    <NativeTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        translucent: true, 
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
        }
      }}
    >
      <NativeTab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: 'Demos',
          tabBarIcon: () => ({ sfSymbol: 'clock.fill' }),
        }} 
      />
      <NativeTab.Screen 
        name="Clients" 
        component={ClientsScreen} 
        options={{ 
          tabBarLabel: 'Clientes',
          tabBarIcon: () => ({ sfSymbol: 'person.2.fill' }),
        }} 
      />
      {canViewQuoter && (
        <NativeTab.Screen 
          name="Cotizador" 
          component={CotizadorScreen} 
          options={{ 
            tabBarLabel: 'Cotizar',
            tabBarIcon: () => ({ sfSymbol: 'doc.text.fill' }),
          }} 
        />
      )}
      <NativeTab.Screen 
        name="Reportes" 
        component={ReportsScreen} 
        options={{ 
          tabBarLabel: 'Reportes',
          tabBarIcon: () => ({ sfSymbol: 'chart.bar.fill' }),
        }} 
      />
      <NativeTab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          tabBarLabel: 'Ajustes',
          tabBarIcon: () => ({ sfSymbol: 'gearshape.fill' }),
        }} 
      />
    </NativeTab.Navigator>
  );
}

function AndroidTabs() {
  const { colors } = useThemeColors();
  const { user } = useAuth();
  const canViewQuoter = hasPermission(user?.roleId, PERMISSIONS.VIEW_QUOTER);

  return (
    <StandardTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          elevation: 0, 
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'clock-outline';
          else if (route.name === 'Clients') iconName = 'account-group';
          else if (route.name === 'Cotizador') iconName = 'file-document-edit';
          else if (route.name === 'Reportes') iconName = 'chart-bar';
          else if (route.name === 'Settings') iconName = 'cog';

          return <MaterialIcons name={iconName} size={26} color={color} />;
        },
      })}
    >
      <StandardTab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Demos' }} />
      <StandardTab.Screen name="Clients" component={ClientsScreen} options={{ tabBarLabel: 'Clientes' }} />
      {canViewQuoter && (
        <StandardTab.Screen name="Cotizador" component={CotizadorScreen} options={{ tabBarLabel: 'Cotizar' }} />
      )}
      <StandardTab.Screen name="Reportes" component={ReportsScreen} options={{ tabBarLabel: 'Reportes' }} />
      <StandardTab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Ajustes' }} />
    </StandardTab.Navigator>
  );
}

function MainTabs({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <Header navigation={navigation} />
      {Platform.OS === 'ios' ? <IOSTabs /> : <AndroidTabs />}
    </View>
  );
}

function AppNavigation() {
  const { isLoading, isAuthenticated } = useAuth();
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const { isDark } = useThemeColors();

  if (isLoading || !isSplashFinished) {
    return <AnimatedSplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" backgroundColor="transparent" translucent={true} />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'default' }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="QuoteCreate" component={QuoteCreateScreen} />
            <Stack.Screen name="GeneralReport" component={GeneralReportScreen} />
            <Stack.Screen name="UsageReport" component={UsageReportScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ClientProvider>
        <AppNavigation />
      </ClientProvider>
    </AuthProvider>
  );
}