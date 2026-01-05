import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuoteCard = ({ item, onEdit, onDownload, formatCurrency, isDownloading }) => {
  const montoMensual = item.totalMonthly || item.moduleSupTotalMonthly || 0;
  const montoAnual = item.totalAnual || item.totalAnnual || item.montoAnual || 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
            <Text style={styles.companyName} numberOfLines={1}>
                {item.companyName || 'Sin Empresa'}
            </Text>
            <View style={styles.subHeaderRow}>
                <Ionicons name="person-outline" size={13} color="#6B7280" />
                <Text style={styles.clientName} numberOfLines={1}>
                    {item.clientName || 'Sin Cliente'}
                </Text>
            </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.financialContainer}>
        <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>MENSUAL</Text>
            <Text style={styles.priceMain}>
                {formatCurrency(montoMensual)}
            </Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>ANUAL</Text>
            <Text style={styles.priceSecondary}>
                {formatCurrency(montoAnual)}
            </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
            style={[styles.actionButton, styles.btnEditSoft]} 
            onPress={() => onEdit(item.id)}
            activeOpacity={0.7}
        >
            <Ionicons name="create-outline" size={18} color="#4B5563" />
            <Text style={styles.btnTextEdit}>Editar</Text>
        </TouchableOpacity>
        
        <View style={{width: 12}} />

        <TouchableOpacity 
            style={[styles.actionButton, styles.btnDownloadTinted]} 
            onPress={() => onDownload(item.id)}
            activeOpacity={0.7}
            disabled={isDownloading}
        >
            <Ionicons name="cloud-download-outline" size={18} color={isDownloading ? "#9CA3AF" : "#2b5cb5"} />
            <Text style={[styles.btnTextDownload, isDownloading && {color: '#9CA3AF'}]} numberOfLines={1}>
                {isDownloading ? '...' : 'PDF'}
            </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', marginBottom: 16 },
  headerContent: { flex: 1 },
  companyName: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4, letterSpacing: -0.3 },
  subHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clientName: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 16 },
  financialContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  priceBlock: { flex: 1, alignItems: 'center' },
  verticalDivider: { width: 1, height: 36, backgroundColor: '#E5E7EB', marginHorizontal: 10 },
  priceLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 4, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  priceMain: { fontSize: 20, fontWeight: '800', color: '#2b5cb5', letterSpacing: -0.5 },
  priceSecondary: { fontSize: 18, fontWeight: '600', color: '#6B7280', letterSpacing: -0.5 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', height: 48 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingHorizontal: 12 },
  btnEditSoft: { backgroundColor: '#F3F4F6' },
  btnTextEdit: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginLeft: 8 },
  btnDownloadTinted: { backgroundColor: '#EFF6FF' },
  btnTextDownload: { fontSize: 14, fontWeight: '700', color: '#2b5cb5', marginLeft: 8 }
});

export default memo(QuoteCard);