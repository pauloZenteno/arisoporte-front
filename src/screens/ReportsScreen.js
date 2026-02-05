import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../hooks/useThemeColors';

const ReportOptionCard = ({ title, icon, color, bg, description, onPress, colors }) => (
    <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card }]} 
        activeOpacity={0.7} 
        onPress={onPress}
    >
        <View style={[styles.iconContainer, { backgroundColor: bg }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.textContainer}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
);

export default function ReportsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useThemeColors();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      
      <ReportOptionCard 
        title="Reporte General"
        description="Vista global de clientes, estatus y cartera."
        icon="pie-chart"
        color={colors.primary}
        bg={isDark ? 'rgba(96, 165, 250, 0.15)' : '#EFF6FF'}
        onPress={() => navigation.navigate('GeneralReport')}
        colors={colors}
      />

      <ReportOptionCard 
        title="Días sin Uso"
        description="Identifica clientes inactivos para seguimiento."
        icon="alert-circle"
        color="#F59E0B"
        bg={isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB'}
        onPress={() => navigation.navigate('UsageReport')}
        colors={colors}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 30
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  textContainer: {
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18
  }
});