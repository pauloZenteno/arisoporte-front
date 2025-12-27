import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SELLER_OPTIONS } from '../utils/constants';

const ModalOption = ({ label, isActive, onPress, icon }) => (
  <TouchableOpacity style={[styles.modalOption, isActive && styles.modalOptionActive]} onPress={onPress}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={icon} size={20} color={isActive ? "#2b5cb5" : "#4B5563"} style={{ marginRight: 12 }} />
        <Text style={[styles.modalOptionText, isActive && styles.modalOptionTextActive]}>{label}</Text>
    </View>
    {isActive && <Ionicons name="checkmark-circle" size={20} color="#2b5cb5" />}
  </TouchableOpacity>
);

export default function ClientFilterHeader({ 
  searchQuery, 
  onSearchChange, 
  filters,       // Objeto { sortParam, isDescending, sellerId }
  onApplyFilter, // Función (sortParam, isDescending, sellerId)
  titleSellers = "Vendedores",
  titleSort = "Ordenar"
}) {
  const [activeModal, setActiveModal] = useState(null); // 'sellers' | 'sort' | null

  // Helpers para textos dinámicos
  const activeSellerName = filters.sellerId 
    ? SELLER_OPTIONS.find(s => s.id === filters.sellerId)?.name.split(' ')[0] 
    : titleSellers;

  const activeSortLabel = filters.sortParam === 'BusinessName' ? 'A-Z' : 'Por Vencer';

  // Manejadores
  const handleSellerSelect = (id) => {
    onApplyFilter(undefined, undefined, id); // Mantiene sort, cambia seller
    setActiveModal(null);
  };

  const handleSortSelect = (sortParam, isDesc) => {
    onApplyFilter(sortParam, isDesc, undefined); // Mantiene seller, cambia sort
    setActiveModal(null);
  };

  return (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput 
            style={styles.searchInput} 
            placeholder="Buscar..." 
            placeholderTextColor="#9ca3af" 
            value={searchQuery} 
            onChangeText={onSearchChange} 
        />
        {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
        )}
      </View>

      {/* Botones de Filtro */}
      <View style={styles.filtersRow}>
        
        {/* Botón Vendedores */}
        <TouchableOpacity 
            style={[styles.filterButton, filters.sellerId && styles.filterButtonActive]} 
            onPress={() => setActiveModal('sellers')}
        >
            <Ionicons name="people" size={18} color={filters.sellerId ? "#2b5cb5" : "#4B5563"} />
            <Text style={[styles.filterButtonText, filters.sellerId && styles.filterButtonTextActive]}>
                {activeSellerName}
            </Text>
            <Ionicons name="chevron-down" size={14} color={filters.sellerId ? "#2b5cb5" : "#9CA3AF"} style={{marginLeft: 4}}/>
        </TouchableOpacity>

        <View style={{width: 10}} />

        {/* Botón Ordenar */}
        <TouchableOpacity 
            style={[styles.filterButton, styles.filterButtonActive]} 
            onPress={() => setActiveModal('sort')}
        >
            <Ionicons name="filter" size={18} color="#2b5cb5" />
            <Text style={[styles.filterButtonText, styles.filterButtonTextActive]}>
                {activeSortLabel}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#2b5cb5" style={{marginLeft: 4}}/>
        </TouchableOpacity>

      </View>

      {/* MODAL: VENDEDORES */}
      <Modal visible={activeModal === 'sellers'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveModal(null)}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Filtrar por Vendedor</Text>
                <View style={styles.modalDivider} />
                
                <ModalOption 
                    label="Todos los vendedores" 
                    icon="people-outline"
                    isActive={filters.sellerId === null} 
                    onPress={() => handleSellerSelect(null)} 
                />
                {SELLER_OPTIONS.map(seller => (
                    <ModalOption 
                        key={seller.id} 
                        label={seller.name} 
                        icon="person-outline"
                        isActive={filters.sellerId === seller.id} 
                        onPress={() => handleSellerSelect(seller.id)} 
                    />
                ))}
            </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL: ORDENAR */}
      <Modal visible={activeModal === 'sort'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveModal(null)}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Ordenar lista</Text>
                <View style={styles.modalDivider} />
                
                <ModalOption 
                    label="Por Vencer / Recientes" 
                    icon="time-outline"
                    isActive={filters.sortParam !== 'BusinessName'} 
                    onPress={() => handleSortSelect('TrialEndsAt', false)} // Ojo: Aquí podrías parametrizar el default sort si cambia entre pantallas
                />
                <ModalOption 
                    label="Alfabético (A-Z)" 
                    icon="text-outline"
                    isActive={filters.sortParam === 'BusinessName'} 
                    onPress={() => handleSortSelect('BusinessName', false)} 
                />
            </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#374151' },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
  filterButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  filterButtonActive: { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' },
  filterButtonText: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginLeft: 8 },
  filterButtonTextActive: { color: '#2b5cb5' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', width: '100%', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 5 },
  modalDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 15 },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8 },
  modalOptionActive: { backgroundColor: '#EFF6FF' },
  modalOptionText: { fontSize: 16, color: '#374151' },
  modalOptionTextActive: { color: '#2b5cb5', fontWeight: '600' },
});