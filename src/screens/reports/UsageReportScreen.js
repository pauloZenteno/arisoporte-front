import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    Linking, 
    Alert, 
    TextInput, 
    Platform, 
    StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getClientsUsageReport } from '../../services/reportService';

const ClientUsageRow = React.memo(({ item, onContact }) => {
    
    let badgeStyle = styles.badgeSuccess;
    let textStyle = styles.textSuccess;
    
    if (item.daysWithoutUse > 30) {
        badgeStyle = styles.badgeDanger;
        textStyle = styles.textDanger;
    } else if (item.daysWithoutUse > 7) {
        badgeStyle = styles.badgeWarning;
        textStyle = styles.textWarning;
    }

    const businessName = item.businessName || item.name || 'Sin Nombre';
    const adminName = item.administratorName || 'Sin Admin';
    const days = item.daysWithoutUse || 0;

    return (
        <View style={styles.cardRow}>
            <View style={styles.infoLeftContainer}>
                <View style={styles.nameTagHeader}>
                    <Text style={styles.businessName} numberOfLines={1} ellipsizeMode="tail">
                        {businessName}
                    </Text>
                    {item.isTrial === true && (
                        <View style={styles.demoTag}>
                            <Text style={styles.demoText}>DEMO</Text>
                        </View>
                    )}
                </View>
                
                <View style={styles.adminRow}>
                    <Ionicons name="person-circle-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.adminName} numberOfLines={1}>
                        {adminName}
                    </Text>
                </View>
            </View>

            <View style={styles.infoRightContainer}>
                <View style={styles.statsBlock}>
                    <View style={[styles.badge, badgeStyle]}>
                        <Text style={[styles.daysText, textStyle]}>
                            {days} días
                        </Text>
                    </View>
                    <Text style={styles.labelTiny}>sin uso</Text>
                </View>

                <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => onContact(item.phoneNumber, adminName)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="logo-whatsapp" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
});

export default function UsageReportScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); 

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
    if (!phoneNumber) {
        Alert.alert("Falta Información", "El cliente no tiene número registrado.");
        return;
    }
    const cleanNumber = phoneNumber.replace(/[^\w\s]/gi, '').replace(/\s/g, '');
    const message = `Hola ${name || ''}, notamos que no han tenido actividad reciente en la plataforma Ari. ¿Podemos ayudarles en algo?`;
    const url = `whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then(supported => {
        if (supported) Linking.openURL(url);
        else Alert.alert("Error", "WhatsApp no instalado.");
    });
  }, []);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const filteredData = useMemo(() => {
    let result = [...data];
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
  }, [data, searchQuery, sortOrder]);

  return (
    <View style={styles.container}>
        <View style={styles.customHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reporte de Inactividad</Text>
            <View style={styles.headerRightPlaceholder} />
        </View>

        <View style={styles.filterContainer}>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#9CA3AF" style={{marginRight: 8}} />
                <TextInput 
                    style={styles.input}
                    placeholder="Buscar..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
                <Text style={styles.sortText}>
                    {sortOrder === 'desc' ? 'Más inactivos' : 'Menos inactivos'}
                </Text>
                <Ionicons 
                    name={sortOrder === 'desc' ? "arrow-down" : "arrow-up"} 
                    size={14} 
                    color="#4B5563" 
                    style={{marginLeft: 4}}
                />
            </TouchableOpacity>
        </View>

        {loading ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2b5cb5" />
            </View>
        ) : (
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.clientId || Math.random().toString()}
                renderItem={({ item }) => <ClientUsageRow item={item} onContact={handleContact} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>No se encontraron resultados.</Text>
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
    backgroundColor: '#F9FAFB' 
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
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 30) + 10 : 65 
  },
  backButton: { paddingRight: 16 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  headerRightPlaceholder: { width: 40 },

  filterContainer: {
    padding: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    alignItems: 'center'
  },
  input: { flex: 1, fontSize: 14, color: '#1F2937', height: '100%', paddingVertical: 0 },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  sortText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },

  listContent: { padding: 16, paddingBottom: 40 },
  
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6'
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
      color: '#111827',
      flexShrink: 1 
  },
  demoTag: { 
      backgroundColor: '#EFF6FF', 
      paddingHorizontal: 6, 
      paddingVertical: 2, 
      borderRadius: 4,
      marginLeft: 8 
  },
  demoText: { fontSize: 10, fontWeight: '700', color: '#2b5cb5' },
  
  adminRow: { flexDirection: 'row', alignItems: 'center' },
  adminName: { fontSize: 13, color: '#6B7280', marginLeft: 4 },
  
  infoRightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12 
  },
  statsBlock: {
      alignItems: 'flex-end',
      minWidth: 65
  },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginBottom: 2 },
  badgeSuccess: { backgroundColor: '#ECFDF5' },
  textSuccess: { color: '#059669', fontSize: 11, fontWeight: '700' },
  badgeWarning: { backgroundColor: '#FFFBEB' },
  textWarning: { color: '#D97706', fontSize: 11, fontWeight: '700' },
  badgeDanger: { backgroundColor: '#FEF2F2' },
  textDanger: { color: '#DC2626', fontSize: 11, fontWeight: '700' },
  labelTiny: { fontSize: 9, color: '#9CA3AF', fontWeight: '500', textTransform: 'uppercase' },

  actionBtn: {
    backgroundColor: '#25D366',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2
  },

  emptyText: { color: '#9CA3AF' }
});