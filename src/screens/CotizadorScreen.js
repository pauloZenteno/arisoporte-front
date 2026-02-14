import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useClients } from '../context/ClientContext';
import { Ionicons } from '@expo/vector-icons';
import ClientFilterHeader from '../components/ClientFilterHeader';
import QuoteCard from '../components/cards/QuoteCard';
import { SELLER_OPTIONS } from '../utils/constants';
import { getQuoteById, downloadQuotePdf } from '../services/quoteService';
import { useThemeColors } from '../hooks/useThemeColors';

const CotizadorScreen = ({ navigation }) => {
  const { quotes, loadingQuotes, hasMoreQuotes, fetchQuotes, refreshQuotes } = useClients();
  const { colors, isDark } = useThemeColors();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (quotes.length === 0) {
        fetchQuotes();
    }
  }, []);

  const [controlsHeight, setControlsHeight] = useState(0); 
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const [downloadingId, setDownloadingId] = useState(null);

  const { translateY, onScroll } = useMemo(() => {
    const heightToHide = controlsHeight || 1; 

    const clampedScrollY = scrollY.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolateLeft: 'clamp',
    });

    const diffClamp = Animated.diffClamp(clampedScrollY, 0, heightToHide);

    const translate = diffClamp.interpolate({
        inputRange: [0, heightToHide],
        outputRange: [0, -heightToHide],
        extrapolate: 'clamp',
    });

    return {
        translateY: translate,
        onScroll: Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
        )
    };
  }, [controlsHeight, scrollY]);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(''); 
  const [activeFilters, setActiveFilters] = useState({ 
    sortParam: 'CreatedAt', isDescending: true, sellerId: null 
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400); 
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredData = useMemo(() => {
    let data = [...quotes];
    
    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase();
      data = data.filter(item => 
        (item.clientName || '').toLowerCase().includes(query) ||
        (item.companyName || '').toLowerCase().includes(query) ||
        (item.folio || '').toLowerCase().includes(query)
      );
    }
    
    if (activeFilters.sellerId) {
      const sellerOption = SELLER_OPTIONS.find(s => s.id === activeFilters.sellerId);
      if (sellerOption) {
        data = data.filter(item => (item.employeeName || '').toLowerCase().includes(sellerOption.name.toLowerCase()));
      }
    }
    
    if (activeFilters.sortParam === 'BusinessName') {
      data.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
    } else {
      data.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created || 0);
          const dateB = new Date(b.createdAt || b.created || 0);
          return dateB - dateA; 
      });
    }
    
    return data;
  }, [quotes, debouncedQuery, activeFilters]);

  const handleApplyFilter = (sortParam, isDescending, sellerId) => {
    setActiveFilters(prev => ({ ...prev, sortParam, isDescending, sellerId }));
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  const handleCreate = () => navigation.navigate('QuoteCreate');
  const handleEdit = (id) => navigation.navigate('QuoteCreate', { id });

  const handleDownload = async (id) => {
    if (downloadingId) return; 
    setDownloadingId(id);
    try {
      Alert.alert("Generando PDF", "Descargando cotización, por favor espere...");
      const fullQuoteData = await getQuoteById(id);

      // --- LOGS AÑADIDOS PARA DEBUG ---
      console.log("============ DATA ENVIADA AL PDF ============");
      console.log(JSON.stringify(fullQuoteData, null, 2));
      console.log("===========================================");
      // ---------------------------------

      await downloadQuotePdf(fullQuoteData);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo descargar el archivo.");
    } finally {
      setDownloadingId(null);
    }
  };

  const renderItem = useCallback(({ item }) => (
    <QuoteCard 
      item={item} 
      onEdit={handleEdit} 
      onDownload={handleDownload} 
      formatCurrency={formatCurrency}
      isDownloading={downloadingId === item.id} 
    />
  ), [downloadingId]);

  const renderListHeader = () => (
    <View style={styles.listHeaderContainer}>
        <TouchableOpacity 
            style={[
                styles.createButton,
                isDark && { 
                    backgroundColor: 'rgba(21, 200, 153, 0.15)', 
                    borderColor: '#15c899',
                    elevation: 0,
                    shadowOpacity: 0,
                    shadowColor: 'transparent'
                }
            ]} 
            onPress={handleCreate} 
            activeOpacity={0.8}
        >
            <View style={styles.createIconBg}>
                <Ionicons name="add" size={20} color="white" />
            </View>
            <Text style={styles.createButtonText}>Crear Cotización</Text>
        </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (loadingQuotes && quotes.length > 0) {
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>Cargando más...</Text>
            </View>
        );
    }

    if (hasMoreQuotes && quotes.length > 0) {
        return (
            <TouchableOpacity 
                style={[
                    styles.loadMoreButton,
                    { 
                        backgroundColor: colors.card,
                        borderColor: colors.primary,
                        shadowColor: colors.primary
                    }
                ]} 
                onPress={fetchQuotes}
                activeOpacity={0.7}
            >
                <Text style={[styles.loadMoreText, { color: colors.primary }]}>Cargar más cotizaciones</Text>
                <Ionicons name="chevron-down-circle-outline" size={18} color={colors.primary} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
        );
    }

    return <View style={{ height: 40 }} />;
  };

  const layoutReady = controlsHeight > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <Animated.View 
        style={[
            styles.collapsibleWrapper, 
            { 
                top: 0, 
                transform: [{ translateY }],
                opacity: layoutReady ? 1 : 0,
                backgroundColor: colors.background
            }
        ]}
        onLayout={(e) => setControlsHeight(e.nativeEvent.layout.height)}
      >
          <View style={styles.controlsContent}>
              <ClientFilterHeader 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery} 
                  filters={activeFilters}
                  onApplyFilter={handleApplyFilter}
                  titleSellers="Vendedores" 
              />
          </View>
      </Animated.View>

      {layoutReady ? (
        <Animated.FlatList
            data={filteredData}
            keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
            renderItem={renderItem}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderFooter}
            
            contentContainerStyle={{ 
                paddingTop: controlsHeight, 
                paddingBottom: 120, 
                paddingHorizontal: 20 
            }}
            
            refreshing={loadingQuotes}
            onRefresh={refreshQuotes}
            onEndReached={null}
            
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={5} 
            removeClippedSubviews={true} 
            
            onScroll={onScroll}
            scrollEventThrottle={16}

            ListEmptyComponent={
                <View style={styles.center}>
                    <Ionicons name="document-text-outline" size={48} color={colors.border} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        {debouncedQuery ? 'No hay resultados.' : 'No hay cotizaciones.'}
                    </Text>
                </View>
            }
        />
      ) : (
         <View style={[styles.centerLoading, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
         </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  collapsibleWrapper: {
    position: 'absolute',
    left: 0, right: 0,
    zIndex: 50, 
    elevation: 5,
  },
  
  controlsContent: {
    paddingHorizontal: 0, 
    paddingTop: 10, 
    paddingBottom: 0, 
  },

  listHeaderContainer: {
    marginTop: 5, 
    marginBottom: 15,
  },

  createButton: {
    flexDirection: 'row',
    backgroundColor: '#ecfdf5', 
    paddingVertical: 12, 
    paddingHorizontal: 20,
    borderRadius: 14, 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#15c899', 
    shadowColor: '#15c899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  createIconBg: {
    backgroundColor: '#15c899', 
    borderRadius: 8,
    width: 28, 
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  createButtonText: {
    color: '#15c899', 
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3
  },

  center: { marginTop: 100, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 10, fontSize: 16 },

  centerLoading: {
      position: 'absolute',
      left: 0, right: 0, top: 0, bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999
  },

  loadMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginVertical: 20,
      marginHorizontal: 40,
      borderRadius: 25,
      borderWidth: 1,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
  },
  loadMoreText: {
      fontWeight: '700',
      fontSize: 14
  },
  footerLoader: {
      paddingVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 10
  },
  footerText: {
      fontSize: 13,
      fontWeight: '500'
  }
});

export default CotizadorScreen;