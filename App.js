import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

// Importamos componentes y pantallas
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import InactiveClientsScreen from './src/screens/InactiveClientsScreen';
import ActiveClientsScreen from './src/screens/ActiveClientsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Este es el grupo de pestañas que tendrá el Header y Nav estáticos
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />} // Usamos nuestro Nav personalizado
      screenOptions={({ navigation }) => ({
        header: () => <Header navigation={navigation} />, // Header estático para todas las tabs
        headerShown: true, // Aseguramos que se muestre
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: 'Demos',
          tabBarIconName: 'browsers' 
        }} 
      />
      <Tab.Screen 
        name="InactiveClients" 
        component={InactiveClientsScreen} 
        options={{ 
          tabBarLabel: 'Inactivos',
          tabBarIconName: 'alert-circle'
        }} 
      />
      <Tab.Screen 
        name="ActiveClients" 
        component={ActiveClientsScreen} 
        options={{ 
          tabBarLabel: 'Activos',
          tabBarIconName: 'people'
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'default' }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        
        {/* Aquí cargamos el grupo de Tabs como si fuera una sola pantalla */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}