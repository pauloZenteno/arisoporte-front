import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ navigation }) {
  // Estos datos podrían venir de un Context o Props en el futuro
  const userImageUri = 'https://randomuser.me/api/portraits/men/32.jpg';
  const userName = 'Paulo Zenteno';
  const userRole = 'Soporte Técnico';

  return (
    <View style={styles.header}>
      <View style={styles.profileSection}>
        <Image source={{ uri: userImageUri }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userRole}>{userRole}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Ionicons name="settings-sharp" size={26} color="#2b5cb5" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userRole: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
});