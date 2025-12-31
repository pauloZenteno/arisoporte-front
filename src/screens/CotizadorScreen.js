import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Animated, Platform, StatusBar } from 'react-native';
import { useClients } from '../context/ClientContext';
import { Ionicons } from '@expo/vector-icons';
import ClientFilterHeader from '../components/ClientFilterHeader';
import Header from '../components/Header'; // Importamos el Header Estático
import { SELLER_OPTIONS } from '../utils/constants';

// --- CÁLCULO DE ALTURAS FIJAS ---
// Header Azul: StatusBar + PaddingTop(10) + LogoHeight(60) + PaddingBottom(15)
const HEADER_HEIGHT = Platform.OS === 'ios' ? 135 : (StatusBar.currentHeight || 24) + 85;
const CREATE_BTN_HEIGHT = 80; // Altura reservada para el botón de crear
const FILTERS_HEIGHT = 140;   // Altura aproximada del buscador y filtros

const CotizadorScreen = ({ navigation }) => {
  const { quotes, loadingQuotes, fetchQuotes } = useClients();
  
  // --- ANIMACIÓN ---
  const scrollY = useRef(new Animated.Value(0)).current;
  const diffClamp = Animated.diffClamp(scrollY, 0, FILTERS_HEIGHT);
  const translateY = diffClamp.interpolate({
    inputRange: [0, FILTERS_HEIGHT],
    outputRange: [0, -FILTERS_HEIGHT], // Se mueve hacia arriba para esconderse
  });

  // Estados de Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({ 
    sortParam: 'TrialEndsAt', 
    isDescending: false, 
    sellerId: null 
  });

  useEffect(() => {
    fetchQuotes();
  }, []);

  // Lógica de Filtrado
  const filteredData = useMemo(() => {
    let data = [...quotes];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(item => 
        (item.clientName || '').toLowerCase().includes(query) ||
        (item.companyName || '').toLowerCase().includes(query) ||
        (item.folio || '').toLowerCase().includes(query)
      );
    }

    if (activeFilters.sellerId) {
      const sellerOption = SELLER_OPTIONS.find(s => s.id === activeFilters.sellerId);
      if (sellerOption) {
        data = data.filter(item => 
          (item.employeeName || '').toLowerCase().includes(sellerOption.name.toLowerCase())
        );
      }
    }

    if (activeFilters.sortParam === 'BusinessName') {
      data.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
    } else {
      data.sort((a, b) => new Date(b.created) - new Date(a.created));
    }

    return data;
  }, [quotes, searchQuery, activeFilters]);

  const handleApplyFilter = (sortParam, isDescending, sellerId) => {
    setActiveFilters(prev => ({
      ...prev,
      sortParam: sortParam !== undefined ? sortParam : prev.sortParam,
      isDescending: isDescending !== undefined ? isDescending : prev.isDescending,
      sellerId: sellerId !== undefined ? sellerId : prev.sellerId
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  // Handlers
  const handleCreate = () => Alert.alert("Crear", "Nueva cotización");
  const handleDownload = (id) => Alert.alert("Descargar", `ID: ${id}`);
  const handleEdit = (id) => Alert.alert("Editar", `ID: ${id}`);

  // Render Item
  const renderQuoteItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerText}>
            <Text style={styles.companyName} numberOfLines={1}>{item.companyName || 'Sin Empresa'}</Text>
            <Text style={styles.clientName} numberOfLines={1}>{item.clientName || 'Sin Cliente'}</Text>
            <Text style={styles.folioText}>{item.folio}</Text>
        </View>
        <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.isActive ? 'Activa' : 'Inactiva'}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
            <Ionicons name="person-circle-outline" size={20} color="#6B7280" />
            <Text style={styles.infoLabel}>Vendedor:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
                {item.employeeName ? item.employeeName.split(' ')[0] : 'N/A'}
            </Text>
        </View>
        <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#6B7280" />
            <Text style={styles.infoLabel}>Total:</Text>
            <Text style={styles.amountValue}>
                {formatCurrency(item.totalMonthly || item.moduleSupTotalMonthly || 0)}
            </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.filterButtonStyle} onPress={() => handleEdit(item.id)}>
            <Ionicons name="create-outline" size={18} color="#4B5563" />
            <Text style={styles.filterButtonText}>Editar</Text>
        </TouchableOpacity>
        <View style={{width: 10}} />
        <TouchableOpacity style={styles.filterButtonStyle} onPress={() => handleDownload(item.id)}>
            <Ionicons name="cloud-download-outline" size={18} color="#2b5cb5" />
            <Text style={[styles.filterButtonText, { color: '#2b5cb5' }]}>Descargar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* 1. HEADER AZUL (ESTÁTICO - CAPA SUPERIOR) */}
      <View style={styles.staticHeaderWrapper}>
          <Header navigation={navigation} />
      </View>

      {/* 2. BOTÓN CREAR (ESTÁTICO - CAPA MEDIA) */}
      <View style={styles.staticActionWrapper}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate} activeOpacity={0.9}>
              <View style={styles.createIconBg}>
                  <Ionicons name="add" size={24} color="#2b5cb5" />
              </View>
              <Text style={styles.createButtonText}>Nueva Cotización</Text>
              <Ionicons name="chevron-forward" size={20} color="white" style={{ opacity: 0.8 }} />
          </TouchableOpacity>
      </View>

      {/* 3. FILTROS Y BUSCADOR (COLAPSABLE - SE ESCONDE DETRÁS) */}
      <Animated.View 
        style={[
            styles.collapsibleFilterWrapper, 
            { transform: [{ translateY }] } // Se mueve hacia arriba
        ]}
      >
          <ClientFilterHeader 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={activeFilters}
              onApplyFilter={handleApplyFilter}
              titleSellers="Vendedor"
          />
      </Animated.View>

      {/* 4. LISTA DE COTIZACIONES */}
      <Animated.FlatList
        data={filteredData}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        renderItem={renderQuoteItem}
        
        // Padding superior calculado para que empiece después de todo
        contentContainerStyle={{ 
            paddingTop: HEADER_HEIGHT + CREATE_BTN_HEIGHT + FILTERS_HEIGHT, 
            paddingBottom: 100, 
            paddingHorizontal: 20 
        }}
        
        refreshing={loadingQuotes}
        onRefresh={fetchQuotes}
        
        // Conexión del Scroll con la animación
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}

        ListEmptyComponent={
          <View style={styles.center}>
              <Ionicons name="document-text-outline" size={48} color="#E5E7EB" />
              <Text style={styles.emptyText}>
                  {searchQuery ? 'No hay resultados.' : 'No hay cotizaciones.'}
              </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  // CAPA 1: Header Azul
  staticHeaderWrapper: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 30, // El más alto
    elevation: 10,
  },

  // CAPA 2: Botón Crear (Justo debajo del header)
  staticActionWrapper: {
    position: 'absolute',
    top: HEADER_HEIGHT - 20, // Ajuste fino para pegar con el header (compensando márgenes)
    left: 0, right: 0,
    zIndex: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#F9FAFB', // Cubre lo que pasa por debajo
    height: CREATE_BTN_HEIGHT,
    justifyContent: 'center',
  },

  // CAPA 3: Filtros (Se mueven)
  collapsibleFilterWrapper: {
    position: 'absolute',
    top: HEADER_HEIGHT + CREATE_BTN_HEIGHT - 25, // Empieza debajo del botón
    left: 0, right: 0,
    zIndex: 10, // El más bajo de los headers
    backgroundColor: '#F9FAFB',
    height: FILTERS_HEIGHT,
  },

  // ESTILOS DEL BOTÓN CREAR (Más profesional)
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#2b5cb5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2b5cb5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4
  },
  createIconBg: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    marginRight: 12
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    flex: 1
  },

  // ESTILOS GENERALES
  center: { marginTop: 100, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 10, color: '#9CA3AF', fontSize: 16 },

  // TARJETA
  card: { 
    backgroundColor: 'white', borderRadius: 16, marginBottom: 16, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 12 },
  headerText: { flex: 1, marginRight: 10 },
  companyName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  clientName: { fontSize: 14, color: '#4B5563' },
  folioText: { fontSize: 12, color: '#9CA3AF', marginTop: 4, fontWeight: '500' },
  statusBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
  cardBody: { padding: 16, paddingTop: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#6B7280', marginLeft: 8, marginRight: 6 },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#374151', flex: 1 },
  amountValue: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  cardActions: { flexDirection: 'row', padding: 16, paddingTop: 0, justifyContent: 'space-between' },
  filterButtonStyle: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  filterButtonText: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginLeft: 6 }
});

export default CotizadorScreen;