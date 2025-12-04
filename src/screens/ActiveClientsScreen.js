import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Sin Header ni BottomNav imports

const ACTIVE_DATA = [
  { id: '1', name: 'OXXO', activeSince: '12 Ene 2023', status: 'Al día' },
  { id: '2', name: 'WALMART', activeSince: '05 Mar 2023', status: 'Al día' },
  { id: '3', name: 'COSTCO', activeSince: '20 Feb 2022', status: 'Pendiente pago' },
  { id: '4', name: '7 ELEVEN', activeSince: '10 Nov 2023', status: 'Al día' },
];

const ActiveClientCard = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.leftBorder} />
    <View style={styles.cardContent}>
      <View style={styles.infoContainer}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.detailText}>Cliente desde: <Text style={styles.dateHighlight}>{item.activeSince}</Text></Text>
        <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
            <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="eye-outline" size={20} color="#2b5cb5" />
      </TouchableOpacity>
    </View>
  </View>
);

export default function ActiveClientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = ACTIVE_DATA.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      <Text style={styles.sectionTitle}>Clientes activos</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar cliente activo..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ActiveClientCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron clientes activos.</Text>}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 20, marginBottom: 15, marginTop: 10, color: '#111827' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#374151' },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#9ca3af' },
  card: { backgroundColor: 'white', borderRadius: 12, marginBottom: 15, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, height: 90 },
  leftBorder: { width: 5, backgroundColor: '#10B981', height: '100%' },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10 },
  infoContainer: { flex: 1, justifyContent: 'center' },
  clientName: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 4 },
  detailText: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  dateHighlight: { fontWeight: '600', color: '#374151' },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 12, color: '#10B981', fontWeight: '500', marginLeft: 4 },
  actionButton: { padding: 10, backgroundColor: '#F3F4F6', borderRadius: 50 },
});