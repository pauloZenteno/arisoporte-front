import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, Platform, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS, hasPermission } from '../utils/permissions';
import ActiveClientCard from '../components/cards/ActiveClientCard';
import InactiveClientCard from '../components/cards/InactiveClientCard';
import ClientFilterHeader from '../components/ClientFilterHeader';
import { COLORS } from '../utils/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ClientsScreen = () => {
    const navigation = useNavigation();
    const { userProfile } = useAuth();
    
    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const [searchQuery, setSearchQuery] = useState(''); 
    const [viewMode, setViewMode] = useState('actives');
    const [expandedId, setExpandedId] = useState(null);

    const [fixedHeight, setFixedHeight] = useState(0); 
    const [controlsHeight, setControlsHeight] = useState(0); 
    
    const scrollY = useRef(new Animated.Value(0)).current;

    // AQUI OBTENEMOS LOS DATOS YA FILTRADOS DESDE EL CONTEXTO
    const { 
        actives, loadingActives, fetchActives, refreshActives, applyActiveFilter, activeActiveFilter,
        inactives, loadingInactives, fetchInactives, refreshInactives, applyInactiveFilter, activeInactiveFilter,
        suspendClient, reactivateClient 
    } = useClients();

    const canManageStatus = useMemo(() => 
        hasPermission(userProfile?.roleId, PERMISSIONS.MANAGE_CLIENT_STATUS), 
    [userProfile]);

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

    // Función de filtrado local SOLO para búsqueda y filtros de UI (No seguridad)
    const getFilteredData = (data) => {
        let result = data;
        
        // 1. Búsqueda por texto
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item => 
                (item.businessName || item.name || '').toLowerCase().includes(query) ||
                (item.alias || '').toLowerCase().includes(query)
            );
        }

        // 2. Filtro Manual del Dropdown (Si se usa para refinar)
        const currentFilters = viewMode === 'actives' ? activeActiveFilter : activeInactiveFilter;
        if (currentFilters && currentFilters.sellerId) {
            result = result.filter(client => String(client.sellerId) === String(currentFilters.sellerId));
        }

        return result;
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

        if (fixedHeight === 0) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            );
        }

        if (isLoading && baseData.length === 0) {
            return (
                <View style={[styles.center, { marginTop: fixedHeight + controlsHeight }]}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
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
                                onSuspend={canManageStatus ? () => suspendClient(item.id) : null}
                            />
                        );
                    } else {
                        return (
                            <InactiveClientCard 
                                item={item} 
                                isExpanded={expandedId === item.id} 
                                onPress={() => toggleExpand(item.id)}
                                onReactivate={canManageStatus ? () => reactivateClient(item.id) : null}
                            />
                        );
                    }
                }}
                onEndReached={fetchMore}
                onEndReachedThreshold={0.5}
                refreshing={isLoading}
                onRefresh={refresh}
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
                                : `No hay clientes ${isActives ? 'activos' : 'inactivos'} disponibles.`}
                        </Text>
                    </View>
                }
            />
        );
    };

    return (
        <View style={styles.container}>
            <View 
                style={styles.fixedSectionWrapper}
                onLayout={(e) => setFixedHeight(e.nativeEvent.layout.height)}
            >
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
            <Animated.View 
                style={[
                    styles.collapsibleWrapper, 
                    { 
                        top: fixedHeight,
                        transform: [{ translateY }],
                        opacity: (fixedHeight > 0) ? 1 : 0 
                    }
                ]}
                onLayout={(e) => setControlsHeight(e.nativeEvent.layout.height)}
            >
                {renderFilters()}
            </Animated.View>
            {renderList()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    fixedSectionWrapper: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, elevation: 10, backgroundColor: COLORS.background, paddingBottom: 5,
        paddingTop: Platform.OS === 'android' ? 0 : 0 
    },
    collapsibleWrapper: {
        position: 'absolute', left: 0, right: 0, zIndex: 50, elevation: 5, backgroundColor: COLORS.background, paddingTop: 10,
    },
    tabContainer: {
        flexDirection: 'row', backgroundColor: COLORS.white, padding: 4, marginHorizontal: 16, marginTop: 10, borderRadius: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    activeTab: { backgroundColor: '#EFF6FF' },
    tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
    activeTabText: { color: '#2563EB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: COLORS.textSecondary, fontSize: 16, textAlign: 'center', marginTop: 10 }
});

export default ClientsScreen;