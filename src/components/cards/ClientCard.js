import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SELLER_MAP } from '../../utils/constants';

const ClientCard = React.memo(({ item, isExpanded, onPress }) => {
    const trialEnd = new Date(item.trialEndsAt || Date.now());
    const now = new Date();
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = diffDays > 0 ? diffDays : 0;
    const formattedDate = trialEnd.toLocaleDateString('es-MX');

    // Validación segura del ID
    const sellerIdStr = item.sellerId ? String(item.sellerId) : null;
    const sellerName = SELLER_MAP[sellerIdStr];

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.cardMainRow}>
                <View style={styles.infoContainer}>
                    <Text style={styles.clientName}>{item.businessName || item.name}</Text>
                    <Text style={styles.clientAlias}>@{item.alias}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <Text style={styles.daysHighlight}>{daysLeft} días</Text>
                    <Text style={styles.daysLabel}>restantes</Text>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" style={{ marginTop: 4 }} />
                </View>
            </View>
            {isExpanded && (
            <View style={styles.expandedContent}>
                <View style={styles.divider} />
                
                <View style={styles.metaContainer}>
                    {/* Solo mostrar si hay vendedor */}
                    {sellerName && (
                        <View style={styles.metaRow}>
                            <Ionicons name="person-outline" size={16} color="#6B7280" />
                            <Text style={styles.metaText}>{sellerName}</Text>
                        </View>
                    )}
                    
                    <View style={styles.metaRow}>
                        <Ionicons name="calendar-clear-outline" size={16} color="#6B7280" />
                        <Text style={styles.metaText}>Vence: {formattedDate}</Text>
                    </View>
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.btnWhatsapp]}>
                        <Ionicons name="logo-whatsapp" size={18} color="white" />
                        <Text style={styles.actionText}>Contactar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.btnActivate]}>
                        <Ionicons name="flash-outline" size={18} color="#2b5cb5" />
                        <Text style={[styles.actionText, styles.textActivate]}>Activar</Text>
                    </TouchableOpacity>
                </View>
            </View>
            )}
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  cardMainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoContainer: { flex: 1, justifyContent: 'center', paddingRight: 10 },
  clientName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  clientAlias: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  statusContainer: { alignItems: 'flex-end', justifyContent: 'center' },
  daysHighlight: { fontSize: 18, fontWeight: '800', color: '#15c899' },
  daysLabel: { fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600', marginTop: 2 },
  expandedContent: { marginTop: 20 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 15 },
  metaContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 13, color: '#4B5563', marginLeft: 8, fontWeight: '500' },
  actionsContainer: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  btnWhatsapp: { backgroundColor: '#25D366', shadowColor: '#25D366', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2 },
  btnActivate: { backgroundColor: 'white', borderWidth: 1, borderColor: '#2b5cb5' },
  actionText: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  textActivate: { color: '#2b5cb5' },
});

export default ClientCard;