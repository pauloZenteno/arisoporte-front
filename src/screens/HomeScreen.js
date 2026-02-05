import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Animated, LayoutAnimation, Platform, UIManager, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useClients } from '../context/ClientContext';
import ClientFilterHeader from '../components/ClientFilterHeader';
import ClientCard from '../components/cards/ClientCard';

// 1. ELIMINAMOS EL IMPORT ESTÁTICO DE COLORS
// import { COLORS } from '../utils/colors'; 

// 2. IMPORTAMOS NUESTRO HOOK MÁGICO
import { useThemeColors } from '../hooks/useThemeColors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() { 
  // 3. OBTENEMOS LOS COLORES DEL TEMA ACTUAL
  const { colors, isDark } = useThemeColors();
  
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  const [controlsHeight, setControlsHeight] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current; 
  
  useEffect(() => {
    const listenerId = scrollY.addListener(() => {});
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, []);

  const { demos, loadingDemos, fetchDemos, refreshDemos, applyDemoFilter, activeDemoFilter, hasMoreDemos } = useClients();

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

  const isReady = controlsHeight > 0;

  return (
    // 4. APLICAMOS EL COLOR DE FONDO DINÁMICO
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <Animated.View 
        style={[
            styles.collapsibleWrapper, 
            { 
                top: 0, 
                transform: [{ translateY }],
                opacity: isReady ? 1 : 0,
                // 5. FONDO DEL ENCABEZADO DINÁMICO
                // Importante para que al scrollear no se vea transparente sobre el texto
                backgroundColor: colors.background 
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
            
            contentContainerStyle={{
                paddingTop: controlsHeight + 10,
                paddingBottom: 120,
                paddingHorizontal: 20
            }}
            
            showsVerticalScrollIndicator={false}
            
            onScroll={onScroll}
            scrollEventThrottle={16}

            initialNumToRender={8}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}

            onEndReached={fetchDemos} 
            onEndReachedThreshold={0.5} 
            onRefresh={refreshDemos}
            // 6. CONTROLAMOS EL SPINNER DE REFRESH CON LOS COLORES NUEVOS
            refreshing={loadingDemos && demos.length === 0} 
            progressBackgroundColor={colors.card} // Fondo del círculo de carga en Android
            colors={[colors.primary]} // Color de la flecha de carga en Android
            tintColor={colors.primary} // Color en iOS
            
            ListFooterComponent={ 
                loadingDemos && demos.length > 0 && hasMoreDemos 
                ? <View style={{ padding: 20 }}><ActivityIndicator size="small" color={colors.primary} /></View> 
                : null 
            }
            ListEmptyComponent={ 
                !loadingDemos && (
                    <View style={styles.emptyContainer}>
                        {/* 7. ICONOS Y TEXTOS VACÍOS DINÁMICOS */}
                        <Ionicons name="folder-open-outline" size={48} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No hay demos disponibles
                        </Text>
                    </View>
                ) 
            }
          />
      ) : (
          // 8. OVERLAY DE CARGA INICIAL
          <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // 9. LIMPIEZA DE ESTILOS
  // Quitamos backgroundColor de aquí porque ahora se inyecta dinámicamente en el componente
  container: { 
    flex: 1, 
    // backgroundColor: COLORS.background <-- BORRADO
  },
  
  collapsibleWrapper: {
    position: 'absolute',
    left: 0, right: 0,
    zIndex: 50,
    elevation: 5,
    // backgroundColor: COLORS.background, <-- BORRADO
    paddingTop: 10,
  },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  
  emptyText: { 
    marginTop: 10, 
    fontSize: 15 
    // color: COLORS.textSecondary, <-- BORRADO (Movido a inline style)
  },
  
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: COLORS.background, <-- BORRADO
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center'
  }
});