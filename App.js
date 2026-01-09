import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

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
import BottomNav from './src/components/BottomNav';
import { ClientProvider } from './src/context/ClientContext'; 

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />} 
      screenOptions={({ navigation }) => ({
        header: () => <Header navigation={navigation} />, 
        headerShown: true,
        headerTransparent: true, // IMPORTANTE: Esto ayuda a que el header flote correctamente si es necesario
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Demos', tabBarIconName: 'time' }} 
      />
      <Tab.Screen 
        name="Clients" 
        component={ClientsScreen} 
        options={{ tabBarLabel: 'Clientes', tabBarIconName: 'people' }} 
      />
      <Tab.Screen 
        name="Cotizador" 
        component={CotizadorScreen} 
        options={{ tabBarLabel: 'Cotizar', tabBarIconName: 'calculator' }} 
      />
      <Tab.Screen 
        name="Reportes" 
        component={ReportsScreen} 
        options={{ tabBarLabel: 'Reportes', tabBarIconName: 'bar-chart' }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ tabBarLabel: 'Ajustes', tabBarIconName: 'settings' }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ClientProvider>
      <NavigationContainer>
        {/* CAMBIO CLAVE: Transparente y Translúcido para que se vea el gradiente */}
        <StatusBar style="light" backgroundColor="transparent" translucent={true} />
        
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{ 
            headerShown: false,
            animation: 'default',
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="QuoteCreate" component={QuoteCreateScreen} />
          
          <Stack.Screen name="GeneralReport" component={GeneralReportScreen} />
          <Stack.Screen name="UsageReport" component={UsageReportScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </ClientProvider>
  );
}