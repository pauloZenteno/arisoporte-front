import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Animated, LayoutAnimation, Platform, UIManager, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useClients } from '../context/ClientContext';
import ClientFilterHeader from '../components/ClientFilterHeader';
import ClientCard from '../components/cards/ClientCard';
import Header from '../components/Header'; // Importamos tu Header personalizado

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() { 
  const navigation = useNavigation();

  // 1. Ocultar Header nativo para usar el nuestro con zIndex correcto
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  // --- VARIABLES DE ANIMACIÓN Y MEDIDAS ---
  const [headerHeight, setHeaderHeight] = useState(0);      
  const [controlsHeight, setControlsHeight] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current; 
  
  // Contexto de datos
  const { demos, loadingDemos, fetchDemos, refreshDemos, applyDemoFilter, activeDemoFilter, hasMoreDemos } = useClients();

  // --- LÓGICA DE COLAPSO (Sticky Header) ---
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

  const handleExpand = (id) => { 
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
      setExpandedId(expandedId === id ? null : id); 
  };

  const dataToRender = demos.filter(item => 
    (item.businessName || item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Renderizado condicional del loader inicial para evitar saltos
  const isReady = headerHeight > 0 && controlsHeight > 0;

  return (
    <View style={styles.container}>
      
      {/* 1. SECCIÓN FIJA (Header Global) */}
      <View 
        style={styles.fixedHeaderWrapper}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <Header navigation={navigation} />
      </View>

      {/* 2. SECCIÓN COLAPSABLE (Filtros) */}
      <Animated.View 
        style={[
            styles.collapsibleWrapper, 
            { 
                top: headerHeight, // Se coloca justo debajo del Header
                transform: [{ translateY }],
                opacity: isReady ? 1 : 0 // Invisible hasta calcular medidas
            }
        ]}
        onLayout={(e) => setControlsHeight(e.nativeEvent.layout.height)}
      >
        <ClientFilterHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={activeDemoFilter}
            onApplyFilter={applyDemoFilter}
            titleSellers="Vendedores"
        />
      </Animated.View>

      {/* 3. LISTA DE DEMOS */}
      {isReady ? (
          <Animated.FlatList
            data={dataToRender}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            renderItem={({ item }) => (
                <ClientCard 
                    item={item} 
                    isExpanded={expandedId === item.id} 
                    onPress={() => handleExpand(item.id)} 
                />
            )}
            
            // Padding dinámico: Header + Filtros + Espacio extra
            contentContainerStyle={{
                paddingTop: headerHeight + controlsHeight + 10,
                paddingBottom: 120,
                paddingHorizontal: 20
            }}
            
            showsVerticalScrollIndicator={false}
            
            // Conectamos el scroll a la animación
            onScroll={onScroll}
            scrollEventThrottle={16}

            // Optimizaciones
            initialNumToRender={8}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}

            onEndReached={fetchDemos} 
            onEndReachedThreshold={0.5} 
            onRefresh={refreshDemos}
            refreshing={loadingDemos && demos.length === 0} 
            
            ListFooterComponent={ 
                loadingDemos && demos.length > 0 && hasMoreDemos 
                ? <View style={{ padding: 20 }}><ActivityIndicator size="small" color="#2b5cb5" /></View> 
                : null 
            }
            ListEmptyComponent={ 
                !loadingDemos && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="folder-open-outline" size={48} color="#E5E7EB" />
                        <Text style={styles.emptyText}>No hay demos disponibles</Text>
                    </View>
                ) 
            }
          />
      ) : (
          // Loader de pantalla completa mientras calculamos layout
          <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#2b5cb5" />
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  
  // Wrapper Fijo: Header
  fixedHeaderWrapper: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    elevation: 10,
    backgroundColor: '#F0F2F5', // Fondo sólido para tapar scroll
    paddingBottom: 5,
    paddingTop: Platform.OS === 'android' ? 0 : 0 
  },

  // Wrapper Colapsable: Filtros
  collapsibleWrapper: {
    position: 'absolute',
    left: 0, right: 0,
    zIndex: 50,
    elevation: 5,
    backgroundColor: '#F0F2F5',
  },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 10, color: '#9CA3AF', fontSize: 15 },
  
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0F2F5',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center'
  }
});