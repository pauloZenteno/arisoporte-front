import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, FlatList, LayoutAnimation, Platform, UIManager, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClients } from '../context/ClientContext';
import ClientFilterHeader from '../components/ClientFilterHeader';
import ClientCard from '../components/cards/ClientCard'; // <--- Importamos la tarjeta

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() { 
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  const { demos, loadingDemos, fetchDemos, refreshDemos, applyDemoFilter, activeDemoFilter, hasMoreDemos } = useClients();

  const handleExpand = (id) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpandedId(expandedId === id ? null : id); };

  const dataToRender = demos.filter(item => 
    (item.businessName || item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ClientFilterHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={activeDemoFilter}
        onApplyFilter={applyDemoFilter}
        titleSellers="Vendedores"
      />

      <FlatList
        data={dataToRender}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={({ item }) => (
            <ClientCard 
                item={item} 
                isExpanded={expandedId === item.id} 
                onPress={() => handleExpand(item.id)} 
            />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        
        // Optimizaciones de lista
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}

        onEndReached={fetchDemos} 
        onEndReachedThreshold={0.5} 
        onRefresh={refreshDemos}
        refreshing={loadingDemos && demos.length === 0} 
        
        ListFooterComponent={ loadingDemos && demos.length > 0 && hasMoreDemos ? <View style={{ padding: 20 }}><ActivityIndicator size="small" color="#2b5cb5" /></View> : null }
        ListEmptyComponent={ !loadingDemos && <View style={styles.emptyContainer}><Ionicons name="folder-open-outline" size={48} color="#E5E7EB" /><Text style={styles.emptyText}>No hay demos disponibles</Text></View> }
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