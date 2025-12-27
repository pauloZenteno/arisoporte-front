// src/screens/InactiveClientsScreen.js
import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, FlatList, LayoutAnimation, Platform, UIManager, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClients } from '../context/ClientContext';
import ClientFilterHeader from '../components/ClientFilterHeader'; 
import InactiveClientCard from '../components/cards/InactiveClientCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function InactiveClientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // 1. Extraemos reactivateClient del contexto
  const { 
    inactives, loadingInactives, fetchInactives, refreshInactives, hasMoreInactives,
    activeInactiveFilter, applyInactiveFilter, reactivateClient 
  } = useClients();

  const filteredData = inactives ? inactives.filter(item => 
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.alias || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleExpand = (id) => { 
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
      setExpandedId(expandedId === id ? null : id); 
  };

  // 2. Función de confirmación antes de reactivar
  const handleReactivatePress = (id) => {
    Alert.alert(
        "Confirmar Reactivación",
        "¿Estás seguro de que deseas reactivar a este cliente?",
        [
            { text: "Cancelar", style: "cancel" },
            { text: "Reactivar", onPress: () => reactivateClient(id) }
        ]
    );
  };

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
                // 3. Pasamos la función a la tarjeta
                onReactivate={() => handleReactivatePress(item.id)}
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
});