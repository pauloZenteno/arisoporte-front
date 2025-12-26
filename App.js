import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import InactiveClientsScreen from './src/screens/InactiveClientsScreen';
import ActiveClientsScreen from './src/screens/ActiveClientsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />} 
      screenOptions={({ navigation }) => ({
        header: () => <Header navigation={navigation} />, 
        headerShown: true,
        // Header sólido (no transparente) para que empuje el contenido hacia abajo
        headerTransparent: false, 
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Demos', tabBarIconName: 'browsers' }} 
      />
      <Tab.Screen 
        name="InactiveClients" 
        component={InactiveClientsScreen} 
        options={{ tabBarLabel: 'Inactivos', tabBarIconName: 'alert-circle' }} 
      />
      <Tab.Screen 
        name="ActiveClients" 
        component={ActiveClientsScreen} 
        options={{ tabBarLabel: 'Activos', tabBarIconName: 'people' }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      {/* CAMBIO: style="light" para texto blanco en la barra de estado */}
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
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}