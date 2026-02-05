import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import { useThemeColors } from '../hooks/useThemeColors';

export default function SettingsScreen() {
  const { userProfile } = useClients();
  const { signOut } = useAuth();
  const { colors, isDark } = useThemeColors();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas salir de la aplicación?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive",
          onPress: () => {
            signOut(); 
          }
        }
      ]
    );
  };

  const handleNotifications = () => {
    Alert.alert("Próximamente", "La configuración de notificaciones estará disponible pronto.");
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        
        <View style={styles.profileSection}>
            <Text style={[styles.nameText, { color: colors.text }]}>
                {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Usuario'}
            </Text>
            <Text style={[styles.jobText, { color: colors.textSecondary }]}>
                {userProfile ? userProfile.jobPosition : ''}
            </Text>
        </View>

        <View style={styles.menuContainer}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>GENERAL</Text>
            
            <TouchableOpacity 
                style={[styles.menuItem, { backgroundColor: colors.card }]} 
                onPress={handleNotifications} 
                activeOpacity={0.7}
            >
                <View style={[
                    styles.menuIconBox, 
                    { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : '#EFF6FF' }
                ]}>
                    <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuText, { color: colors.text }]}>Notificaciones</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={{ height: 20 }} />

            <TouchableOpacity 
                style={[styles.menuItem, { backgroundColor: colors.card }]} 
                onPress={handleLogout} 
                activeOpacity={0.7}
            >
                <View style={[
                    styles.menuIconBox, 
                    { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2' }
                ]}>
                    <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                </View>
                <Text style={[styles.menuText, { color: colors.danger }]}>Cerrar Sesión</Text>
                <Ionicons name="chevron-forward" size={20} color={isDark ? colors.danger : "#FCA5A5"} />
            </TouchableOpacity>
        </View>

        <View style={styles.footer}>
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>Ari Soporte v1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 30, 
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'flex-start',
    marginBottom: 40,
    marginTop: 40,
    paddingHorizontal: 4
  },
  nameText: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'left',
    letterSpacing: -0.5
  },
  jobText: {
    fontSize: 16,
    textAlign: 'left',
    fontWeight: '500'
  },
  menuContainer: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 8
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500'
  },
});