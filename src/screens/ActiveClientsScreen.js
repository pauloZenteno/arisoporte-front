import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, FlatList, LayoutAnimation, Platform, UIManager, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClients } from '../context/ClientContext';
import ClientFilterHeader from '../components/ClientFilterHeader'; 
import ActiveClientCard from '../components/cards/ActiveClientCard'; // Importamos la tarjeta

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ActiveClientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const { 
    actives, loadingActives, fetchActives, refreshActives, hasMoreActives,
    activeActiveFilter, applyActiveFilter 
  } = useClients();

  const filteredData = actives ? actives.filter(item => 
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.alias || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleExpand = (id) => { 
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
      setExpandedId(expandedId === id ? null : id); 
  };

  return (
    <View style={styles.container}>
      <ClientFilterHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={activeActiveFilter}
        onApplyFilter={applyActiveFilter}
        titleSellers="Vendedores"
      />
      
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={({ item }) => (
            <ActiveClientCard 
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
        
        onEndReached={fetchActives}
        onEndReachedThreshold={0.5}
        onRefresh={refreshActives}
        refreshing={loadingActives && actives.length === 0}

        ListFooterComponent={
            loadingActives && actives.length > 0 && hasMoreActives ? (
                <View style={{ padding: 20 }}>
                    <ActivityIndicator size="small" color="#2b5cb5" />
                </View>
            ) : null
        }

        ListEmptyComponent={
          !loadingActives && (
            <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color="#E5E7EB" />
                <Text style={styles.emptyText}>No hay clientes activos</Text>
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
});