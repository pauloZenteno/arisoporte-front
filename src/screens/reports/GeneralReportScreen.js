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
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getClients } from '../../services/clientService';
import { useThemeColors } from '../../hooks/useThemeColors';

const StatCard = ({ title, value, icon, color, fullWidth, bg, colors, isDark }) => (
    <View style={[
        styles.statCard, 
        fullWidth && styles.fullWidthCard,
        { backgroundColor: bg ? (isDark ? colors.card : bg) : colors.card, borderColor: colors.border }
    ]}>
        <View style={[
            styles.iconContainer, 
            { backgroundColor: bg ? (isDark ? 'transparent' : 'white') : (isDark ? 'rgba(255,255,255,0.05)' : color + '20') }
        ]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: bg && !isDark ? color : colors.text }]}>{value}</Text>
            <Text style={[styles.statTitle, { color: bg && !isDark ? color : colors.textSecondary, opacity: 0.8 }]}>{title}</Text>
        </View>
    </View>
);

export default function GeneralReportScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useThemeColors();
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
        { name: "Activos", population: stats.clientActive, color: "#10B981", legendFontColor: colors.textSecondary, legendFontSize: 12 },
        { name: "Suspendidos", population: stats.clientSuspended, color: "#F59E0B", legendFontColor: colors.textSecondary, legendFontSize: 12 },
        { name: "Cancelados", population: stats.clientCancelled, color: "#EF4444", legendFontColor: colors.textSecondary, legendFontSize: 12 }
    ];

    const demoChartData = [
        { name: "Activos", population: stats.demoActive, color: "#8B5CF6", legendFontColor: colors.textSecondary, legendFontSize: 12 },
        { name: "Vencidos", population: stats.demoSuspended, color: "#F59E0B", legendFontColor: colors.textSecondary, legendFontSize: 12 },
        { name: "Cancelados", population: stats.demoCancelled, color: "#EF4444", legendFontColor: colors.textSecondary, legendFontSize: 12 }
    ];

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.card} />
            
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
                <Text style={[styles.headerTitle, { color: colors.text }]}>Reporte General</Text>
                <View style={styles.headerRightPlaceholder} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <View style={styles.headerSection}>
                    <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Actualizado: {new Date().toLocaleDateString()}</Text>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Cartera (Clientes)</Text>
                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                </View>

                <View style={styles.sectionContainer}>
                    <StatCard 
                        title="Total Cartera" 
                        value={stats.clientTotal} 
                        icon="briefcase" 
                        color={colors.primary}
                        fullWidth
                        bg={isDark ? null : "#EFF6FF"}
                        colors={colors}
                        isDark={isDark}
                    />
                </View>

                <View style={[styles.chartCard, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : '#000' }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Estatus de Clientes</Text>
                    <PieChart
                        data={clientChartData}
                        width={screenWidth - 60}
                        height={200}
                        chartConfig={{ 
                            color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        center={[10, 0]}
                        absolute
                    />
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.row}>
                        <StatCard title="Activos" value={stats.clientActive} icon="checkmark-circle" color="#10B981" colors={colors} isDark={isDark} />
                        <StatCard title="Suspendidos" value={stats.clientSuspended} icon="warning" color="#F59E0B" colors={colors} isDark={isDark} />
                    </View>
                    <View style={styles.row}>
                        <StatCard title="Cancelados" value={stats.clientCancelled} icon="close-circle" color="#EF4444" colors={colors} isDark={isDark} />
                        <View style={{flex: 1}} />
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Prospectos (Demos)</Text>
                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                </View>

                <View style={styles.sectionContainer}>
                    <StatCard 
                        title="Total Prospectos" 
                        value={stats.demoTotal} 
                        icon="flask" 
                        color="#8B5CF6"
                        fullWidth
                        bg={isDark ? null : "#F5F3FF"}
                        colors={colors}
                        isDark={isDark}
                    />
                </View>

                <View style={[styles.chartCard, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : '#000' }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Estatus de Demos</Text>
                    <PieChart
                        data={demoChartData}
                        width={screenWidth - 60}
                        height={200}
                        chartConfig={{ 
                            color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        center={[10, 0]}
                        absolute
                    />
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.row}>
                        <StatCard title="En Prueba" value={stats.demoActive} icon="timer" color="#8B5CF6" colors={colors} isDark={isDark} />
                        <StatCard title="Vencidos" value={stats.demoSuspended} icon="alert-circle" color="#F59E0B" colors={colors} isDark={isDark} />
                    </View>
                    <View style={styles.row}>
                        <StatCard title="Cancelados" value={stats.demoCancelled} icon="close-circle" color="#EF4444" colors={colors} isDark={isDark} />
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

    scrollContent: {
        padding: 20,
        paddingTop: 10
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerSection: {
        marginBottom: 5,
        alignItems: 'flex-start'
    },
    dateLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        marginBottom: 0
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginRight: 12,
        textTransform: 'uppercase'
    },
    line: {
        flex: 1,
        height: 2,
    },
    sectionContainer: {
        marginBottom: 12
    },
    chartCard: {
        borderRadius: 16,
        padding: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 16
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
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
        marginBottom: 2
    },
    statTitle: {
        fontSize: 13,
        fontWeight: '500'
    }
});