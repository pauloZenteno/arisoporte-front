import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Sin imports de Header/Nav

const INACTIVE_DATA = [
  { id: '1', name: 'BURGUER KING', inactiveDays: 31 },
  { id: '2', name: "Mc Donal's", inactiveDays: 28 },
  { id: '3', name: 'SUBWAY MID', inactiveDays: 24 },
  { id: '4', name: 'EMPACK', inactiveDays: 15 },
];

const InactiveClientCard = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.leftBorder} />
    <View style={styles.cardContent}>
      <View style={styles.infoContainer}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.inactiveText}>Periodo de inactividad: <Text style={styles.daysHighlight}>{item.inactiveDays} días</Text></Text>
      </View>
      <TouchableOpacity style={styles.contactButton}><Ionicons name="phone-portrait-outline" size={18} color="white" style={styles.btnIcon} /><Text style={styles.btnText}>Contactar</Text></TouchableOpacity>
    </View>
  </View>
);

export default function InactiveClientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = INACTIVE_DATA.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      <Text style={styles.sectionTitle}>Clientes inactivos</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar cliente inactivo..."
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
        renderItem={({ item }) => <InactiveClientCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron clientes inactivos.</Text>}
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
  leftBorder: { width: 5, backgroundColor: '#2b5cb5', height: '100%' },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10 },
  infoContainer: { flex: 1, justifyContent: 'center' },
  clientName: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 4, textTransform: 'uppercase' },
  inactiveText: { fontSize: 12, color: '#6B7280' },
  daysHighlight: { color: '#2b5cb5', fontWeight: 'bold' },
  contactButton: { backgroundColor: '#6FCF97', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginLeft: 10 },
  btnIcon: { marginRight: 5 },
  btnText: { color: 'white', fontSize: 12, fontWeight: '600' },
});