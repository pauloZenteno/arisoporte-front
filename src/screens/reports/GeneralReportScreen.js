import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GeneralReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Aquí irá el Reporte General</Text>
      {/* Aquí implementaremos los gráficos con el JSON que me pases */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  text: { color: '#6B7280', fontSize: 16 }
});