import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEMO_DATA = [
  { id: '1', name: 'TELMEX', alias: 'telmex_corp', daysLeft: 15, seller: 'Fernanda Salomé', progress: 0.8, colorStart: '#F2C94C', colorEnd: '#6FCF97' },
  { id: '2', name: 'GEPP', alias: 'gepp_logistica', daysLeft: 1, seller: 'Samantha Puebla', progress: 0.1, colorStart: '#F2994A', colorEnd: '#F2C94C' },
  { id: '3', name: 'Niplito', alias: 'niplito_sur', daysLeft: 3, seller: 'José Figueroa', progress: 0.3, colorStart: '#F2C94C', colorEnd: '#F2F2F2' },
  { id: '4', name: 'Del sol', alias: 'delsol_bajio', daysLeft: 3, seller: 'Rodrigo Argaez', progress: 0.3, colorStart: '#F2C94C', colorEnd: '#F2F2F2' },
  { id: '5', name: 'SEARS', alias: 'sears_mx', daysLeft: 7, seller: 'José Figueroa', progress: 0.5, colorStart: '#F2994A', colorEnd: '#F2C94C' },
];

const ClientCard = ({ item, isExpanded, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.cardMainRow}>
      <View style={styles.infoContainer}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientAlias}>@{item.alias}</Text>
        <View style={styles.typeBadge}>
            <Ionicons name="time" size={12} color="#4F46E5" style={{marginRight: 4}} />
            <Text style={styles.typeText}>Demo</Text>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.daysHighlight}>{item.daysLeft} días</Text>
        <Text style={styles.daysLabel}>restantes</Text>
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" style={{ marginTop: 8 }} />
      </View>
    </View>
    <View style={styles.progressBarContainer}>
      <LinearGradient colors={[item.colorStart, item.colorEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressBarFill, { width: `${item.progress * 100}%` }]} />
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

export default function HomeScreen() { 
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredData = DEMO_DATA.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleExpand = (id) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpandedId(expandedId === id ? null : id); };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Buscar demo..." placeholderTextColor="#9ca3af" value={searchQuery} onChangeText={setSearchQuery} />
        {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color="#9ca3af" /></TouchableOpacity>}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ClientCard item={item} isExpanded={expandedId === item.id} onPress={() => handleExpand(item.id)} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron demos.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // ELIMINADO padding top excesivo. Ahora solo un pequeño margen standard (20)
  container: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: 20 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#374151' },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#9ca3af' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderLeftWidth: 5, borderLeftColor: '#F59E0B' },
  cardMainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  infoContainer: { flex: 1, justifyContent: 'center' },
  clientName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 },
  clientAlias: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { fontSize: 11, color: '#4F46E5', fontWeight: '600' }, 
  statusContainer: { alignItems: 'flex-end' },
  daysHighlight: { fontSize: 18, fontWeight: '800', color: '#F59E0B' },
  daysLabel: { fontSize: 11, color: '#6B7280' },
  progressBarContainer: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  expandedContent: { marginTop: 15 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 15 },
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