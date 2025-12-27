import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, FlatList, LayoutAnimation, Platform, UIManager, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClients } from '../context/ClientContext';
import ClientFilterHeader from '../components/ClientFilterHeader'; 
import ActiveClientCard from '../components/cards/ActiveClientCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ActiveClientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // 1. Extraemos suspendClient del contexto
  const { 
    actives, loadingActives, fetchActives, refreshActives, hasMoreActives,
    activeActiveFilter, applyActiveFilter, suspendClient 
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

  // 2. Función de Confirmación
  const handleSuspendPress = (id) => {
    Alert.alert(
        "Confirmar Suspensión",
        "¿Estás seguro de que deseas suspender a este cliente? Dejará de tener acceso al sistema.",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Suspender", 
                style: "destructive", // En iOS pone el botón rojo
                onPress: () => suspendClient(id) 
            }
        ]
    );
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
                // 3. Pasamos la función a la tarjeta
                onSuspend={() => handleSuspendPress(item.id)}
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