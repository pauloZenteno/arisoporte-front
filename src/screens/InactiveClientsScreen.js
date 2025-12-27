import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  LayoutAnimation, Platform, UIManager, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClients } from '../context/ClientContext';
import { SELLER_MAP } from '../utils/constants'; 
import ClientFilterHeader from '../components/ClientFilterHeader'; 

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const InactiveClientCard = React.memo(({ item, isExpanded, onPress }) => {
  // CORRECCIÓN: Convertimos el ID a String para asegurar que coincida con el mapa
  // Si item.sellerId es 2, busca "2" en el mapa.
  const sellerIdStr = item.sellerId ? String(item.sellerId) : null;
  const sellerName = SELLER_MAP[sellerIdStr] || 'Sin asignar';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardMainRow}>
        <View style={styles.infoContainer}>
          <Text style={styles.clientName} numberOfLines={1}>{item.businessName || item.name}</Text>
          <Text style={styles.clientAlias}>@{item.alias}</Text>
        </View>
        
        <View style={styles.rightContainer}>
            <View style={styles.statusBadge}>
                <Ionicons name="alert-circle" size={12} color="#B91C1C" style={{marginRight: 4}} />
                <Text style={styles.statusText}>Suspendido</Text>
            </View>
            
            <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9CA3AF" 
                style={{ marginTop: 8 }}
            />
        </View>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          
          <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{sellerName}</Text>
          </View>

          <View style={styles.actionsContainer}>
              <TouchableOpacity style={[styles.actionButton, styles.btnWhatsapp]}>
                  <Ionicons name="logo-whatsapp" size={18} color="white" />
                  <Text style={styles.actionText}>Contactar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.btnReactivate]}>
                  <Ionicons name="refresh" size={18} color="#2b5cb5" />
                  <Text style={[styles.actionText, styles.textReactivate]}>Reactivar</Text>
              </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

export default function InactiveClientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const { 
    inactives, loadingInactives, fetchInactives, refreshInactives, hasMoreInactives,
    activeInactiveFilter, applyInactiveFilter 
  } = useClients();

  const filteredData = inactives ? inactives.filter(item => 
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.alias || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleExpand = (id) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpandedId(expandedId === id ? null : id); };

  return (
    <View style={styles.container}>
      <ClientFilterHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={activeInactiveFilter}
        onApplyFilter={applyInactiveFilter}
        titleSellers="Vendedores"
      />
      
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={({ item }) => (
            <InactiveClientCard 
                item={item} 
                isExpanded={expandedId === item.id} 
                onPress={() => handleExpand(item.id)} 
            />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        
        onEndReached={fetchInactives}
        onEndReachedThreshold={0.5}
        onRefresh={refreshInactives}
        refreshing={loadingInactives && inactives.length === 0}

        ListFooterComponent={
            loadingInactives && inactives.length > 0 && hasMoreInactives ? (
                <View style={{ padding: 20 }}>
                    <ActivityIndicator size="small" color="#2b5cb5" />
                </View>
            ) : null
        }

        ListEmptyComponent={
          !loadingInactives && (
            <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color="#E5E7EB" />
                <Text style={styles.emptyText}>No hay clientes inactivos</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5', paddingTop: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 10, color: '#9CA3AF', fontSize: 15 },
  
  card: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 4 
  },
  cardMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  
  infoContainer: { flex: 1, marginRight: 10, justifyContent: 'center' },
  rightContainer: { alignItems: 'flex-end', justifyContent: 'flex-start' },

  clientName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  clientAlias: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }, 
  statusText: { color: '#B91C1C', fontSize: 11, fontWeight: '700' },
  
  expandedContent: { marginTop: 20 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 15 },
  
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  metaText: { fontSize: 13, color: '#4B5563', marginLeft: 8, fontWeight: '500' },
  
  actionsContainer: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  btnWhatsapp: { backgroundColor: '#25D366', shadowColor: '#25D366', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2 },
  btnReactivate: { backgroundColor: 'white', borderWidth: 1, borderColor: '#2b5cb5' },
  actionText: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  textReactivate: { color: '#2b5cb5' },
});