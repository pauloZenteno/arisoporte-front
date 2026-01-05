import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DemoReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Aquí irá el Reporte de Demos</Text>
      {/* Aquí implementaremos los gráficos de demos */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  text: { color: '#6B7280', fontSize: 16 }
});