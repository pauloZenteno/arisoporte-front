import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useClients } from '../context/ClientContext';
import ActiveClientCard from '../components/cards/ActiveClientCard';
import InactiveClientCard from '../components/cards/InactiveClientCard';
import ClientFilterHeader from '../components/ClientFilterHeader';

const ClientsScreen = () => {
    // 1. Agregamos el estado para el buscador
    const [searchQuery, setSearchQuery] = useState(''); 
    
    const [viewMode, setViewMode] = useState('actives');
    const [expandedId, setExpandedId] = useState(null);

    const { 
        actives, loadingActives, fetchActives, refreshActives, applyActiveFilter, activeActiveFilter,
        inactives, loadingInactives, fetchInactives, refreshInactives, applyInactiveFilter, activeInactiveFilter,
        suspendClient, reactivateClient 
    } = useClients();

    const toggleExpand = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    // 2. Función para filtrar los datos localmente según lo que escriba el usuario
    const getFilteredData = (data) => {
        if (!searchQuery) return data;
        return data.filter(item => 
            (item.businessName || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.alias || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const renderHeader = () => {
        if (viewMode === 'actives') {
            return (
                <ClientFilterHeader 
                    // 3. Pasamos las props del buscador (ESTO SOLUCIONA EL ERROR)
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    
                    filters={activeActiveFilter}
                    onApplyFilter={applyActiveFilter}
                    titleSellers="Vendedores"
                />
            );
        } else {
            return (
                <ClientFilterHeader 
                    // 3. Pasamos las props del buscador también aquí
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}

                    filters={activeInactiveFilter}
                    onApplyFilter={applyInactiveFilter}
                    titleSellers="Vendedores"
                />
            );
        }
    };

    const renderContent = () => {
        const isActives = viewMode === 'actives';
        
        // Seleccionamos la lista base
        const baseData = isActives ? actives : inactives;
        // Aplicamos el filtro de búsqueda
        const data = getFilteredData(baseData);

        const isLoading = isActives ? loadingActives : loadingInactives;
        const fetchMore = isActives ? fetchActives : fetchInactives;
        const refresh = isActives ? refreshActives : refreshInactives;

        // Mostrar loading solo si no hay datos y está cargando por primera vez
        if (isLoading && baseData.length === 0) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2b5cb5" />
                </View>
            );
        }

        return (
            <FlatList
                data={data}
                keyExtractor={(item) => item?.id || Math.random().toString()}
                renderItem={({ item }) => {
                    if (!item) return null;

                    if (isActives) {
                        return (
                            <ActiveClientCard 
                                item={item} 
                                isExpanded={expandedId === item.id} 
                                onPress={() => toggleExpand(item.id)}
                                onSuspend={() => suspendClient(item.id)}
                            />
                        );
                    } else {
                        return (
                            <InactiveClientCard 
                                item={item} 
                                isExpanded={expandedId === item.id} 
                                onPress={() => toggleExpand(item.id)}
                                onReactivate={() => reactivateClient(item.id)}
                            />
                        );
                    }
                }}
                onEndReached={fetchMore}
                onEndReachedThreshold={0.5}
                refreshing={isLoading}
                onRefresh={refresh}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>
                            {searchQuery.length > 0 
                                ? 'No se encontraron coincidencias.' 
                                : `No hay clientes ${isActives ? 'activos' : 'inactivos'}.`}
                        </Text>
                    </View>
                }
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, viewMode === 'actives' && styles.activeTab]} 
                    onPress={() => setViewMode('actives')}
                >
                    <Text style={[styles.tabText, viewMode === 'actives' && styles.activeTabText]}>Activos</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.tab, viewMode === 'inactives' && styles.activeTab]} 
                    onPress={() => setViewMode('inactives')}
                >
                    <Text style={[styles.tabText, viewMode === 'inactives' && styles.activeTabText]}>Inactivos</Text>
                </TouchableOpacity>
            </View>

            {renderHeader()}

            <View style={styles.content}>
                {renderContent()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 4,
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 5,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8
    },
    activeTab: {
        backgroundColor: '#EFF6FF'
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280'
    },
    activeTabText: {
        color: '#2563EB'
    },
    content: { flex: 1 },
    listContent: { padding: 16, paddingBottom: 80 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#6B7280', fontSize: 16, textAlign: 'center', marginTop: 10 }
});

export default ClientsScreen;