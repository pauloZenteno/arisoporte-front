import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SELLER_OPTIONS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS, hasPermission } from '../utils/permissions';

// --- MAPA DE TRADUCCIÓN (ID Visual -> ID Real) ---
const SELLER_ID_MAP = {
  1: 'lK20zbAk4JRDVEa1', // Ana Paola
  2: 'NZ9DezJWqMQOnRE3', // Karen
};

// Componente para opciones del Modal
const ModalOption = ({ label, isActive, onPress, icon, isSecondary }) => (
  <TouchableOpacity 
    style={[
        styles.modalOption, 
        isActive && styles.modalOptionActive,
        isSecondary && { marginLeft: 10 } // Indentación visual para sub-opciones
    ]} 
    onPress={onPress}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons 
            name={icon} 
            size={20} 
            color={isActive ? "#2b5cb5" : "#6B7280"} 
            style={{ marginRight: 12 }} 
        />
        <Text style={[styles.modalOptionText, isActive && styles.modalOptionTextActive]}>
            {label}
        </Text>
    </View>
    {isActive && <Ionicons name="checkmark-circle" size={20} color="#2b5cb5" />}
  </TouchableOpacity>
);

export default function ClientFilterHeader({ 
  searchQuery, 
  onSearchChange, 
  filters,       
  onApplyFilter, 
  titleSellers = "Vendedores",
}) {
  const [showModal, setShowModal] = useState(false); 
  const { userProfile } = useAuth();

  // Validamos permiso (Solo Admins ven la sección de vendedores)
  const canViewAll = useMemo(() => {
    if (!userProfile) return false;
    return hasPermission(userProfile.roleId, PERMISSIONS.VIEW_ALL_CLIENTS);
  }, [userProfile]);

  // LOGICA DE TRADUCCIÓN DE ID
  const handleSellerSelect = (uiId) => {
    const realId = uiId ? SELLER_ID_MAP[uiId] : undefined;
    onApplyFilter(undefined, undefined, realId); 
    setShowModal(false);
  };

  const handleSortSelect = (sortParam, isDesc) => {
    onApplyFilter(sortParam, isDesc, undefined); 
    setShowModal(false);
  };

  // Verificamos selección visual
  const isOptionSelected = (optionId) => {
      if (!filters.sellerId && !optionId) return true;
      return SELLER_ID_MAP[optionId] === filters.sellerId;
  };

  // Detectar si hay filtro de vendedor activo para pintar el icono de azul
  const hasActiveSellerFilter = !!filters.sellerId;

  return (
    <View style={styles.container}>
      
      {/* --- BARRA UNIFICADA (Buscador + Botón Filtros) --- */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        
        <TextInput 
            style={styles.searchInput} 
            placeholder="Buscar cliente..." 
            placeholderTextColor="#9ca3af" 
            value={searchQuery} 
            onChangeText={onSearchChange} 
            autoCapitalize="none"
        />

        {/* Botón limpiar búsqueda */}
        {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
        )}

        {/* Divisor Vertical */}
        <View style={styles.verticalDivider} />

        {/* Botón Universal de Filtros */}
        <TouchableOpacity 
            style={styles.filterIconButton} 
            onPress={() => setShowModal(true)}
        >
            <Ionicons 
                name={hasActiveSellerFilter ? "options" : "options-outline"} 
                size={22} 
                color={hasActiveSellerFilter ? "#2b5cb5" : "#4B5563"} 
            />
        </TouchableOpacity>
      </View>


      {/* --- MODAL UNIVERSAL --- */}
      <Modal 
        visible={showModal} 
        transparent 
        animationType="fade" 
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowModal(false)}
        >
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Configuración de Lista</Text>
                    <TouchableOpacity onPress={() => setShowModal(false)}>
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    
                    {/* SECCIÓN 1: ORDENAR (Visible para todos) */}
                    <Text style={styles.sectionHeader}>ORDENAR POR</Text>
                    <ModalOption 
                        label="Alfabético (A-Z)" 
                        icon="text-outline"
                        isActive={filters.sortParam === 'BusinessName'} 
                        onPress={() => handleSortSelect('BusinessName', false)} 
                    />
                    <ModalOption 
                        label="Por Vencer / Recientes" 
                        icon="time-outline"
                        isActive={filters.sortParam !== 'BusinessName'} 
                        onPress={() => handleSortSelect('TrialEndsAt', false)} 
                    />

                    {/* SECCIÓN 2: VENDEDORES (Solo visible si tienes permiso) */}
                    {canViewAll && (
                        <>
                            <View style={styles.sectionDivider} />
                            <Text style={styles.sectionHeader}>FILTRAR POR VENDEDOR</Text>
                            
                            <ModalOption 
                                label="Ver Todos" 
                                icon="people-outline"
                                isActive={!filters.sellerId} 
                                onPress={() => handleSellerSelect(null)} 
                            />
                            
                            {SELLER_OPTIONS.map(seller => (
                                <ModalOption 
                                    key={seller.id} 
                                    label={seller.name} 
                                    icon="person-outline"
                                    isActive={isOptionSelected(seller.id)} 
                                    onPress={() => handleSellerSelect(seller.id)}
                                />
                            ))}
                        </>
                    )}

                </ScrollView>
            </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBarContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    paddingHorizontal: 15, 
    height: 50, // Altura fija para consistencia
    borderRadius: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 3, 
    elevation: 2 
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#374151', height: '100%' },
  clearBtn: { padding: 5, marginRight: 5 },
  
  verticalDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10
  },
  
  filterIconButton: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Estilos del Modal
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end', // Modal tipo "Bottom Sheet" (o center si prefieres)
    padding: 0 
  },
  modalContent: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20, 
    paddingBottom: 40,
    maxHeight: '70%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  
  sectionHeader: {
      fontSize: 12,
      fontWeight: '700',
      color: '#9CA3AF',
      marginBottom: 10,
      marginTop: 5,
      letterSpacing: 0.5
  },
  sectionDivider: {
      height: 1,
      backgroundColor: '#F3F4F6',
      marginVertical: 15
  },

  modalOption: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      paddingVertical: 14, 
      paddingHorizontal: 12, 
      borderRadius: 10,
      marginBottom: 5
  },
  modalOptionActive: { backgroundColor: '#EFF6FF' },
  modalOptionText: { fontSize: 16, color: '#374151' },
  modalOptionTextActive: { color: '#2b5cb5', fontWeight: '600' },
});