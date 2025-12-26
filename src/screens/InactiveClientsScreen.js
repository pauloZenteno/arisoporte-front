import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const INACTIVE_DATA = [
  { id: '1', name: '17.02STUDIO', alias: '17.02studio', inactiveDays: 31, lastDate: '11/11/2025' },
  { id: '2', name: '360 INSTALACIONES', alias: '360instalaciones', inactiveDays: 28, lastDate: '11/06/2025' },
  { id: '3', name: 'SUBWAY MID', alias: 'subway_centro', inactiveDays: 24, lastDate: '19/11/2023' },
];

const InactiveClientCard = ({ item, isExpanded, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.cardMainRow}>
      <View style={styles.infoContainer}>
        <Text style={styles.clientName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.clientAlias}>@{item.alias}</Text>
        <View style={styles.statusBadge}>
            <Ionicons name="alert-circle" size={14} color="#B91C1C" style={{marginRight: 4}} />
            <Text style={styles.statusText}>Suspendido</Text>
        </View>
      </View>
      <View style={styles.kpiContainer}>
        <Text style={styles.kpiLabel}>Tiempo inactivo</Text>
        <Text style={styles.kpiValue}>{item.inactiveDays} <Text style={{fontSize: 12, fontWeight: 'normal'}}>días</Text></Text>
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" style={{ marginTop: 8, alignSelf: 'flex-end' }} />
      </View>
    </View>
    {isExpanded && (
      <View style={styles.expandedContent}>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>Última actividad: {item.lastDate}</Text>
        </View>
        <View style={styles.actionsContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.btnReactivate]}><Ionicons name="refresh" size={18} color="white" /><Text style={styles.actionText}>Reactivar</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.btnContact]}><Ionicons name="call" size={18} color="white" /><Text style={styles.actionText}>Contactar</Text></TouchableOpacity>
        </View>
      </View>
    )}
  </TouchableOpacity>
);

export default function InactiveClientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredData = INACTIVE_DATA.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.alias.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExpand = (id) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpandedId(expandedId === id ? null : id); };

  return (
    // PADDING TOP REDUCIDO
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Buscar cliente suspendido..." placeholderTextColor="#9ca3af" value={searchQuery} onChangeText={setSearchQuery} />
        {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color="#9ca3af" /></TouchableOpacity>}
      </View>
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <InactiveClientCard item={item} isExpanded={expandedId === item.id} onPress={() => handleExpand(item.id)} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron clientes inactivos.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: 20 }, // 20px
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#374151' },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#9ca3af' },
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#F59E0B' }, 
  cardMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoContainer: { flex: 1, marginRight: 10 },
  clientName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 },
  clientAlias: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }, 
  statusText: { color: '#B91C1C', fontSize: 11, fontWeight: '700' },
  kpiContainer: { alignItems: 'flex-end' },
  kpiLabel: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
  kpiValue: { fontSize: 18, fontWeight: '800', color: '#EF4444' }, 
  expandedContent: { marginTop: 15 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  metaText: { fontSize: 13, color: '#6B7280', marginLeft: 6 },
  actionsContainer: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  btnReactivate: { backgroundColor: '#10B981' }, 
  btnContact: { backgroundColor: '#3B82F6' },
  actionText: { color: 'white', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
});