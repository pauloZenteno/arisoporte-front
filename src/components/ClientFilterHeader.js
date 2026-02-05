import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SELLER_OPTIONS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS, hasPermission } from '../utils/permissions';
import { useThemeColors } from '../hooks/useThemeColors';

const SELLER_ID_MAP = {
  1: 'lK20zbAk4JRDVEa1', 
  2: 'NZ9DezJWqMQOnRE3', 
};

const ModalOption = ({ label, isActive, onPress, icon, isSecondary, colors }) => (
  <TouchableOpacity 
    style={[
        styles.modalOption, 
        isActive && { backgroundColor: colors.isDark ? 'rgba(43, 92, 181, 0.15)' : '#EFF6FF' },
        isSecondary && { marginLeft: 10 } 
    ]} 
    onPress={onPress}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons 
            name={icon} 
            size={20} 
            color={isActive ? colors.primary : colors.textSecondary} 
            style={{ marginRight: 12 }} 
        />
        <Text style={[
            styles.modalOptionText, 
            { color: colors.text },
            isActive && { color: colors.primary, fontWeight: '600' }
        ]}>
            {label}
        </Text>
    </View>
    {isActive && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
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
  const { colors, isDark } = useThemeColors();

  const canViewAll = useMemo(() => {
    if (!userProfile) return false;
    return hasPermission(userProfile.roleId, PERMISSIONS.VIEW_ALL_CLIENTS);
  }, [userProfile]);

  const handleSellerSelect = (uiId) => {
    const realId = uiId ? SELLER_ID_MAP[uiId] : undefined;
    onApplyFilter(undefined, undefined, realId); 
    setShowModal(false);
  };

  const handleSortSelect = (sortParam, isDesc) => {
    onApplyFilter(sortParam, isDesc, undefined); 
    setShowModal(false);
  };

  const isOptionSelected = (optionId) => {
      if (!filters.sellerId && !optionId) return true;
      return SELLER_ID_MAP[optionId] === filters.sellerId;
  };

  const hasActiveSellerFilter = !!filters.sellerId;

  return (
    <View style={styles.container}>
      
      <View style={[styles.searchBarContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        
        <TextInput 
            style={[styles.searchInput, { color: colors.text }]} 
            placeholder="Buscar cliente..." 
            placeholderTextColor={colors.textSecondary} 
            value={searchQuery} 
            onChangeText={onSearchChange} 
            autoCapitalize="none"
        />

        {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
        )}

        <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

        <TouchableOpacity 
            style={styles.filterIconButton} 
            onPress={() => setShowModal(true)}
        >
            <Ionicons 
                name={hasActiveSellerFilter ? "options" : "options-outline"} 
                size={22} 
                color={hasActiveSellerFilter ? colors.primary : colors.textSecondary} 
            />
        </TouchableOpacity>
      </View>

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
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Configuración de Lista</Text>
                    <TouchableOpacity onPress={() => setShowModal(false)}>
                        <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    
                    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>ORDENAR POR</Text>
                    <ModalOption 
                        label="Alfabético (A-Z)" 
                        icon="text-outline"
                        isActive={filters.sortParam === 'BusinessName'} 
                        onPress={() => handleSortSelect('BusinessName', false)}
                        colors={{...colors, isDark}} 
                    />
                    <ModalOption 
                        label="Por Vencer / Recientes" 
                        icon="time-outline"
                        isActive={filters.sortParam !== 'BusinessName'} 
                        onPress={() => handleSortSelect('TrialEndsAt', false)}
                        colors={{...colors, isDark}} 
                    />

                    {canViewAll && (
                        <>
                            <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
                            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>FILTRAR POR VENDEDOR</Text>
                            
                            <ModalOption 
                                label="Ver Todos" 
                                icon="people-outline"
                                isActive={!filters.sellerId} 
                                onPress={() => handleSellerSelect(null)}
                                colors={{...colors, isDark}} 
                            />
                            
                            {SELLER_OPTIONS.map(seller => (
                                <ModalOption 
                                    key={seller.id} 
                                    label={seller.name} 
                                    icon="person-outline"
                                    isActive={isOptionSelected(seller.id)} 
                                    onPress={() => handleSellerSelect(seller.id)}
                                    colors={{...colors, isDark}}
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
    paddingHorizontal: 15, 
    height: 50, 
    borderRadius: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 3, 
    elevation: 2 
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },
  clearBtn: { padding: 5, marginRight: 5 },
  
  verticalDivider: {
    width: 1,
    height: '60%',
    marginHorizontal: 10
  },
  
  filterIconButton: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },

  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end', 
    padding: 0 
  },
  modalContent: { 
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
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  
  sectionHeader: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 10,
      marginTop: 5,
      letterSpacing: 0.5
  },
  sectionDivider: {
      height: 1,
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
  modalOptionText: { fontSize: 16 },
});