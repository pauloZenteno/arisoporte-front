import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useClients } from '../context/ClientContext';
import ActiveClientCard from '../components/cards/ActiveClientCard';
import InactiveClientCard from '../components/cards/InactiveClientCard';
import ClientFilterHeader from '../components/ClientFilterHeader';
import Header from '../components/Header'; // Asegúrate de importar tu Header

const ClientsScreen = () => {
    const navigation = useNavigation();
    
    // --- Ocultar el Header por defecto de la navegación ---
    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const [searchQuery, setSearchQuery] = useState(''); 
    const [viewMode, setViewMode] = useState('actives');
    const [expandedId, setExpandedId] = useState(null);

    // Medidas para la animación
    const [fixedHeight, setFixedHeight] = useState(0); // Altura de Header + Tabs
    const [controlsHeight, setControlsHeight] = useState(0); // Altura de Filtros
    
    const scrollY = useRef(new Animated.Value(0)).current;

    const { 
        actives, loadingActives, fetchActives, refreshActives, applyActiveFilter, activeActiveFilter,
        inactives, loadingInactives, fetchInactives, refreshInactives, applyInactiveFilter, activeInactiveFilter,
        suspendClient, reactivateClient 
    } = useClients();

    // --- ANIMACIÓN DE COLAPSO (Igual que Cotizador) ---
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

    const toggleExpand = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const getFilteredData = (data) => {
        if (!searchQuery) return data;
        return data.filter(item => 
            (item.businessName || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.alias || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const renderFilters = () => {
        const isActives = viewMode === 'actives';
        const filters = isActives ? activeActiveFilter : activeInactiveFilter;
        const onApply = isActives ? applyActiveFilter : applyInactiveFilter;

        return (
            <ClientFilterHeader 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filters={filters}
                onApplyFilter={onApply}
                titleSellers="Vendedores"
            />
        );
    };

    const renderList = () => {
        const isActives = viewMode === 'actives';
        const baseData = isActives ? actives : inactives;
        const data = getFilteredData(baseData);

        const isLoading = isActives ? loadingActives : loadingInactives;
        const fetchMore = isActives ? fetchActives : fetchInactives;
        const refresh = isActives ? refreshActives : refreshInactives;

        // Si no sabemos la altura fija todavía, mostramos loader centrado para evitar saltos
        if (fixedHeight === 0) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2b5cb5" />
                </View>
            );
        }

        if (isLoading && baseData.length === 0) {
            return (
                <View style={[styles.center, { marginTop: fixedHeight + controlsHeight }]}>
                    <ActivityIndicator size="large" color="#2b5cb5" />
                </View>
            );
        }

        return (
            <Animated.FlatList
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
                
                // Padding superior dinámico para librar el Header + Tabs + Filtros
                contentContainerStyle={{
                    paddingTop: fixedHeight + controlsHeight + 10,
                    paddingBottom: 80,
                    paddingHorizontal: 16
                }}
                
                onScroll={onScroll}
                scrollEventThrottle={16}
                
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
            
            {/* 1. SECCIÓN FIJA (Header + Tabs) */}
            {/* Z-Index alto para que los filtros se escondan DEBAJO de esto */}
            <View 
                style={styles.fixedSectionWrapper}
                onLayout={(e) => setFixedHeight(e.nativeEvent.layout.height)}
            >
                {/* Header Global */}
                <Header navigation={navigation} />
                
                {/* Tabs de Navegación */}
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
            </View>

            {/* 2. SECCIÓN COLAPSABLE (Filtros) */}
            {/* Se posiciona justo debajo de la sección fija (top: fixedHeight) */}
            <Animated.View 
                style={[
                    styles.collapsibleWrapper, 
                    { 
                        top: fixedHeight,
                        transform: [{ translateY }],
                        // Opacidad 0 hasta que calculemos alturas para evitar parpadeo
                        opacity: (fixedHeight > 0) ? 1 : 0 
                    }
                ]}
                onLayout={(e) => setControlsHeight(e.nativeEvent.layout.height)}
            >
                {renderFilters()}
            </Animated.View>

            {/* 3. LISTA */}
            {renderList()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    
    // Wrapper Fijo: Header + Tabs
    fixedSectionWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100, // Prioridad ALTA en iOS
        elevation: 10, // Sombra/Prioridad en Android para tapar lo que pase por debajo
        backgroundColor: '#F9FAFB', // Fondo sólido para que no se vea lo de atrás
        paddingBottom: 5,
        // Ajuste para Status Bar en Android si es transparente
        paddingTop: Platform.OS === 'android' ? 0 : 0 
    },
    
    // Wrapper Colapsable: Filtros
    collapsibleWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 50, // Menor prioridad que el Header
        elevation: 5,
        backgroundColor: '#F9FAFB',
    },

    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 4,
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 12,
        // Sombras suaves
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#6B7280', fontSize: 16, textAlign: 'center', marginTop: 10 }
});

export default ClientsScreen;