import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CotizadorScreen from './src/screens/CotizadorScreen';
import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';

import { ClientProvider } from './src/context/ClientContext'; 

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SolicitudesScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
    <Text style={{ fontSize: 18, color: '#6B7280', fontWeight: '600' }}>Solicitudes en construcción</Text>
  </View>
);

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />} 
      screenOptions={({ navigation }) => ({
        header: () => <Header navigation={navigation} />, 
        headerShown: true,
        headerTransparent: false, 
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
        options={{ tabBarLabel: 'Cotizar', tabBarIconName: 'calculator', headerShown: false }} 
      />
      <Tab.Screen 
        name="Solicitudes" 
        component={SolicitudesScreen} 
        options={{ tabBarLabel: 'Solicitudes', tabBarIconName: 'file-tray-full' }} 
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
        <StatusBar style="light" backgroundColor="#2b5cb5" />
        
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
        </Stack.Navigator>
      </NavigationContainer>
    </ClientProvider>
  );
}