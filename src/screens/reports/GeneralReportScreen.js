import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    RefreshControl, 
    ActivityIndicator, 
    Dimensions,
    TouchableOpacity,
    Platform,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { getClients } from '../../services/clientService';

const StatCard = ({ title, value, icon, color, fullWidth, bg }) => (
    <View style={[
        styles.statCard, 
        fullWidth && styles.fullWidthCard,
        bg && { backgroundColor: bg, borderColor: 'transparent' }
    ]}>
        <View style={[styles.iconContainer, { backgroundColor: bg ? 'white' : color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statContent}>
            <Text style={[styles.statValue, bg && { color: color }]}>{value}</Text>
            <Text style={[styles.statTitle, bg && { color: color, opacity: 0.8 }]}>{title}</Text>
        </View>
    </View>
);

export default function GeneralReportScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const [stats, setStats] = useState({
        clientActive: 0,
        clientSuspended: 0,
        clientCancelled: 0,
        clientTotal: 0,

        demoActive: 0,
        demoSuspended: 0,
        demoCancelled: 0,
        demoTotal: 0
    });

    const screenWidth = Dimensions.get('window').width;

    const calculateStats = (clients) => {
        let cActive = 0, cSusp = 0, cCanc = 0;
        let dActive = 0, dSusp = 0, dCanc = 0;

        clients.forEach(client => {
            if (client.isTrial) {
                if (client.status === 1) dActive++;
                else if (client.status === 2) dSusp++;
                else if (client.status === 3) dCanc++;
            } else {
                if (client.status === 1) cActive++;
                else if (client.status === 2) cSusp++;
                else if (client.status === 3) cCanc++;
            }
        });

        setStats({
            clientActive: cActive,
            clientSuspended: cSusp,
            clientCancelled: cCanc,
            clientTotal: cActive + cSusp + cCanc,

            demoActive: dActive,
            demoSuspended: dSusp,
            demoCancelled: dCanc,
            demoTotal: dActive + dSusp + dCanc
        });
    };

    const fetchData = async () => {
        try {
            const data = await getClients();
            if (data) {
                calculateStats(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const clientChartData = [
        { name: "Activos", population: stats.clientActive, color: "#10B981", legendFontColor: "#7F7F7F", legendFontSize: 12 },
        { name: "Suspendidos", population: stats.clientSuspended, color: "#F59E0B", legendFontColor: "#7F7F7F", legendFontSize: 12 },
        { name: "Cancelados", population: stats.clientCancelled, color: "#EF4444", legendFontColor: "#7F7F7F", legendFontSize: 12 }
    ];

    const demoChartData = [
        { name: "Activos", population: stats.demoActive, color: "#8B5CF6", legendFontColor: "#7F7F7F", legendFontSize: 12 },
        { name: "Vencidos", population: stats.demoSuspended, color: "#F59E0B", legendFontColor: "#7F7F7F", legendFontSize: 12 },
        { name: "Cancelados", population: stats.demoCancelled, color: "#EF4444", legendFontColor: "#7F7F7F", legendFontSize: 12 }
    ];

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2b5cb5" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reporte General</Text>
                <View style={styles.headerRightPlaceholder} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.headerSection}>
                    <Text style={styles.dateLabel}>Actualizado: {new Date().toLocaleDateString()}</Text>
                    {/* Texto eliminado por ti, ajustamos los márgenes abajo en styles */}
                </View>

                {/* SECCIÓN CARTERA */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Cartera (Clientes)</Text>
                    <View style={styles.line} />
                </View>

                <View style={styles.sectionContainer}>
                    <StatCard 
                        title="Total Cartera" 
                        value={stats.clientTotal} 
                        icon="briefcase" 
                        color="#2b5cb5"
                        fullWidth
                        bg="#EFF6FF"
                    />
                </View>

                <View style={styles.chartCard}>
                    <Text style={styles.cardTitle}>Estatus de Clientes</Text>
                    <PieChart
                        data={clientChartData}
                        width={screenWidth - 60}
                        height={200}
                        chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        center={[10, 0]}
                        absolute
                    />
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.row}>
                        <StatCard title="Activos" value={stats.clientActive} icon="checkmark-circle" color="#10B981" />
                        <StatCard title="Suspendidos" value={stats.clientSuspended} icon="warning" color="#F59E0B" />
                    </View>
                    <View style={styles.row}>
                        <StatCard title="Cancelados" value={stats.clientCancelled} icon="close-circle" color="#EF4444" />
                        <View style={{flex: 1}} />
                    </View>
                </View>

                {/* SECCIÓN PROSPECTOS */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Prospectos (Demos)</Text>
                    <View style={styles.line} />
                </View>

                <View style={styles.sectionContainer}>
                    <StatCard 
                        title="Total Prospectos" 
                        value={stats.demoTotal} 
                        icon="flask" 
                        color="#8B5CF6"
                        fullWidth
                        bg="#F5F3FF"
                    />
                </View>

                <View style={styles.chartCard}>
                    <Text style={styles.cardTitle}>Estatus de Demos</Text>
                    <PieChart
                        data={demoChartData}
                        width={screenWidth - 60}
                        height={200}
                        chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        center={[10, 0]}
                        absolute
                    />
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.row}>
                        <StatCard title="En Prueba" value={stats.demoActive} icon="timer" color="#8B5CF6" />
                        <StatCard title="Vencidos" value={stats.demoSuspended} icon="alert-circle" color="#F59E0B" />
                    </View>
                    <View style={styles.row}>
                        <StatCard title="Cancelados" value={stats.demoCancelled} icon="close-circle" color="#EF4444" />
                        <View style={{flex: 1}} />
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
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

    scrollContent: {
        padding: 20,
        paddingTop: 10 // Reduje el padding top del scroll
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerSection: {
        marginBottom: 5, // Reducido de 20 a 5 para acercarlo al título
        alignItems: 'flex-start'
    },
    dateLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        marginBottom: 0 // Quitamos margen extra
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8 // Reducido de 12 a 8
    },
    sectionTitle: {
        fontSize: 18, // Aumentado de 14 a 18
        fontWeight: '800', // Más negrita
        color: '#111827', // Color más oscuro (antes gris)
        marginRight: 12,
        textTransform: 'uppercase'
    },
    line: {
        flex: 1,
        height: 2, // Línea un poco más gruesa
        backgroundColor: '#E5E7EB'
    },
    sectionContainer: {
        marginBottom: 12
    },
    chartCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 16
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16
    },
    statsContainer: {
        gap: 12,
        marginBottom: 24
    },
    row: {
        flexDirection: 'row',
        gap: 12
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    fullWidthCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    statContent: {
        flex: 1
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 2
    },
    statTitle: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500'
    }
});