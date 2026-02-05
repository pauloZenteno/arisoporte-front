import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    TextInput, 
    StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getClientsUsageReport } from '../../services/reportService';
import { openWhatsApp } from '../../utils/actions';
import { useThemeColors } from '../../hooks/useThemeColors';

const ClientUsageRow = React.memo(({ item, onContact, colors, isDark }) => {
    
    let badgeBg = isDark ? 'rgba(5, 150, 105, 0.15)' : '#ECFDF5';
    let badgeText = '#059669';
    
    if (item.daysWithoutUse > 30) {
        badgeBg = isDark ? 'rgba(220, 38, 38, 0.15)' : '#FEF2F2';
        badgeText = '#DC2626';
    } else if (item.daysWithoutUse > 7) {
        badgeBg = isDark ? 'rgba(217, 119, 6, 0.15)' : '#FFFBEB';
        badgeText = '#D97706';
    }

    const businessName = item.businessName || item.name || 'Sin Nombre';
    const adminName = item.administratorName || 'Sin Admin';
    const days = item.daysWithoutUse || 0;

    return (
        <View style={[styles.cardRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoLeftContainer}>
                <View style={styles.nameTagHeader}>
                    <Text style={[styles.businessName, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                        {businessName}
                    </Text>
                    {item.isTrial === true && (
                        <View style={[styles.demoTag, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : '#EFF6FF' }]}>
                            <Text style={[styles.demoText, { color: colors.primary }]}>DEMO</Text>
                        </View>
                    )}
                </View>
                
                <View style={styles.adminRow}>
                    <Ionicons name="person-circle-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.adminName, { color: colors.textSecondary }]} numberOfLines={1}>
                        {adminName}
                    </Text>
                </View>
            </View>

            <View style={styles.infoRightContainer}>
                <View style={styles.statsBlock}>
                    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                        <Text style={[styles.daysText, { color: badgeText }]}>
                            {days} días
                        </Text>
                    </View>
                    <Text style={[styles.labelTiny, { color: colors.textSecondary }]}>sin uso</Text>
                </View>

                <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => onContact(item.phoneNumber, adminName)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="logo-whatsapp" size={18} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
});

export default function UsageReportScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeColors();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); 
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    fetchData();
  }, [navigation]);

  const fetchData = async () => {
    try {
      const reportData = await getClientsUsageReport();
      setData(reportData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = useCallback((phoneNumber, name) => {
    const message = `Hola ${name || ''}, notamos que no han tenido actividad reciente en la plataforma Ari. ¿Podemos ayudarles en algo?`;
    openWhatsApp(phoneNumber, message);
  }, []);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    if (typeFilter === 'clients') {
        result = result.filter(item => item.isTrial === false);
    } else if (typeFilter === 'demos') {
        result = result.filter(item => item.isTrial === true);
    }

    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        result = result.filter(item => 
            (item.businessName || '').toLowerCase().includes(lowerQuery) ||
            (item.name || '').toLowerCase().includes(lowerQuery) ||
            (item.administratorName || '').toLowerCase().includes(lowerQuery)
        );
    }
    return result.sort((a, b) => {
        const diff = (a.daysWithoutUse || 0) - (b.daysWithoutUse || 0);
        return sortOrder === 'asc' ? diff : -diff;
    });
  }, [data, searchQuery, sortOrder, typeFilter]);

  const FilterTab = ({ label, value }) => {
      const isActive = typeFilter === value;
      return (
          <TouchableOpacity 
              onPress={() => setTypeFilter(value)} 
              style={[
                  styles.filterTab, 
                  { 
                      backgroundColor: isDark ? colors.background : '#F3F4F6', 
                      borderColor: isActive ? colors.primary : 'transparent' 
                  },
                  isActive && { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : '#EFF6FF' }
              ]}
          >
              <Text style={[
                  styles.filterTabText, 
                  { color: colors.textSecondary },
                  isActive && { color: colors.primary, fontWeight: '700' }
              ]}>
                  {label}
              </Text>
          </TouchableOpacity>
      );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
        
        <View style={[
            styles.customHeader, 
            { 
                paddingTop: insets.top + 10, 
                backgroundColor: colors.card, 
                borderBottomColor: colors.border 
            }
        ]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Reporte de Inactividad</Text>
            <View style={styles.headerRightPlaceholder} />
        </View>

        <View style={[styles.filterContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={[styles.searchBar, { backgroundColor: isDark ? colors.background : '#F3F4F6' }]}>
                <Ionicons name="search" size={18} color={colors.textSecondary} style={{marginRight: 8}} />
                <TextInput 
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Buscar..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity 
                style={[styles.sortButton, { backgroundColor: isDark ? colors.background : '#F9FAFB', borderColor: colors.border }]} 
                onPress={toggleSort}
            >
                <Text style={[styles.sortText, { color: colors.textSecondary }]}>
                    {sortOrder === 'desc' ? 'Más inactivos' : 'Menos inactivos'}
                </Text>
                <Ionicons 
                    name={sortOrder === 'desc' ? "arrow-down" : "arrow-up"} 
                    size={14} 
                    color={colors.textSecondary} 
                    style={{marginLeft: 4}}
                />
            </TouchableOpacity>
        </View>

        <View style={[styles.tabsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <FilterTab label="Todos" value="all" />
            <FilterTab label="Clientes" value="clients" />
            <FilterTab label="Demos" value="demos" />
        </View>

        {loading ? (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        ) : (
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.clientId || Math.random().toString()}
                renderItem={({ item }) => <ClientUsageRow item={item} onContact={handleContact} colors={colors} isDark={isDark} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No se encontraron resultados.</Text>
                    </View>
                }
            />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 50 
  },
  customHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
  },
  backButton: { paddingRight: 16 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerRightPlaceholder: { width: 40 },

  filterContainer: {
    padding: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    alignItems: 'center'
  },
  input: { flex: 1, fontSize: 14, height: '100%', paddingVertical: 0 },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  sortText: { fontSize: 12, fontWeight: '600' },

  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
  },

  listContent: { padding: 16, paddingBottom: 40 },
  
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
  },

  infoLeftContainer: { 
      flex: 1, 
      marginRight: 12 
  },
  nameTagHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4
  },
  businessName: { 
      fontSize: 15, 
      fontWeight: '700', 
      flexShrink: 1 
  },
  demoTag: { 
      paddingHorizontal: 6, 
      paddingVertical: 2, 
      borderRadius: 4,
      marginLeft: 8 
  },
  demoText: { fontSize: 10, fontWeight: '700' },
  
  adminRow: { flexDirection: 'row', alignItems: 'center' },
  adminName: { fontSize: 13, marginLeft: 4 },
  
  infoRightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12 
  },
  statsBlock: {
      alignItems: 'flex-end',
      minWidth: 65
  },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 2 },
  daysText: { fontSize: 11, fontWeight: '700' },
  labelTiny: { fontSize: 9, fontWeight: '500', textTransform: 'uppercase' },

  actionBtn: {
    backgroundColor: '#25D366',
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2
  },

  emptyText: { marginTop: 10 }
});