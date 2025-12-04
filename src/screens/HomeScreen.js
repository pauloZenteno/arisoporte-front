import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// YA NO IMPORTAMOS Header NI BottomNav AQUÍ

// ... (UIManager y DEMO_DATA se mantienen igual) ...
const DEMO_DATA = [
  { id: '1', name: 'TELMEX', daysLeft: 15, seller: 'Fernanda Salomé', progress: 0.8, colorStart: '#F2C94C', colorEnd: '#6FCF97' },
  { id: '2', name: 'GEPP', daysLeft: 1, seller: 'Samantha Puebla', progress: 0.1, colorStart: '#F2994A', colorEnd: '#F2C94C' },
  { id: '3', name: 'Niplito', daysLeft: 3, seller: 'José Figueroa', progress: 0.3, colorStart: '#F2C94C', colorEnd: '#F2F2F2' },
  { id: '4', name: 'Del sol', daysLeft: 3, seller: 'Rodrigo Argaez', progress: 0.3, colorStart: '#F2C94C', colorEnd: '#F2F2F2' },
  { id: '5', name: 'SEARS', daysLeft: 7, seller: 'José Figueroa', progress: 0.5, colorStart: '#F2994A', colorEnd: '#F2C94C' },
];

const ClientCard = ({ item, isExpanded, onPress }) => (
  // ... (El código de ClientCard se mantiene IDÉNTICO)
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.cardHeader}>
      <Text style={styles.clientName}>{item.name}</Text>
      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9ca3af" />
    </View>
    <View style={styles.progressBarContainer}>
      <LinearGradient colors={[item.colorStart, item.colorEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressBarFill, { width: `${item.progress * 100}%` }]} />
    </View>
    <View style={styles.cardFooter}>
      <Text style={styles.daysText}>Días restantes: <Text style={styles.daysHighlight}>{item.daysLeft} días</Text></Text>
    </View>
    {isExpanded && (
      <View style={styles.expandedContent}>
        <View style={styles.divider} />
        <View style={styles.sellerRow}>
          <Ionicons name="person-circle-outline" size={18} color="#6B7280" />
          <Text style={styles.sellerText}> Vendedor: <Text style={styles.sellerHighlight}>{item.seller}</Text></Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.btnContact]}><Ionicons name="chatbubble-ellipses-outline" size={16} color="white" /><Text style={styles.actionText}>Contactar</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.btnActivate]}><Ionicons name="checkmark-circle-outline" size={16} color="white" /><Text style={styles.actionText}>Activar</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.btnSuspend]}><Ionicons name="pause-circle-outline" size={16} color="white" /><Text style={styles.actionText}>Suspender</Text></TouchableOpacity>
        </View>
      </View>
    )}
  </TouchableOpacity>
);

export default function HomeScreen() { // Navigation ya no es crítico aquí para header
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredData = DEMO_DATA.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleExpand = (id) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpandedId(expandedId === id ? null : id); };

  return (
    <View style={styles.container}>
      {/* ELIMINADO <Header /> - Ahora lo maneja el TabNavigator */}

      <Text style={styles.sectionTitle}>Demos activas</Text>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Buscar cliente..." placeholderTextColor="#9ca3af" value={searchQuery} onChangeText={setSearchQuery} />
        {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color="#9ca3af" /></TouchableOpacity>}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ClientCard item={item} isExpanded={expandedId === item.id} onPress={() => handleExpand(item.id)} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron clientes.</Text>}
      />

      {/* ELIMINADO <BottomNav /> - Ahora lo maneja el TabNavigator */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  // Eliminamos estilos de header y bottomNav
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 20, marginBottom: 15, marginTop: 10, color: '#111827' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#374151' },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 }, // Aumentamos padding bottom para que no tape el nav flotante
  emptyText: { textAlign: 'center', marginTop: 20, color: '#9ca3af' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  clientName: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  progressBarContainer: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, marginBottom: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-start' },
  daysText: { fontSize: 13, color: '#6B7280' },
  daysHighlight: { color: '#10B981', fontWeight: 'bold' },
  expandedContent: { marginTop: 10 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sellerText: { fontSize: 14, color: '#4B5563', marginLeft: 5 },
  sellerHighlight: { fontWeight: 'bold', color: '#1F2937' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, flex: 1, marginHorizontal: 3 },
  btnContact: { backgroundColor: '#3B82F6' },
  btnActivate: { backgroundColor: '#10B981' },
  btnSuspend: { backgroundColor: '#EF4444' },
  actionText: { color: 'white', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
});