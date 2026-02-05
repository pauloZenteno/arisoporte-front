import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PERIODICITIES } from '../../utils/quoteConstants';
import { useThemeColors } from '../../hooks/useThemeColors';

const QuoteCard = ({ item, onEdit, onDownload, formatCurrency, isDownloading }) => {
  
  const { colors, isDark } = useThemeColors();

  const periodicityId = item.periodicity || 1;
  const periodObj = PERIODICITIES.find(p => p.id === periodicityId) || PERIODICITIES[0];
  const periodLabel = periodObj.description;

  const totalService = item.total ?? item.totalMonthly ?? 0;
  
  const totalHardware = item.totalProducts || 0;
  const granTotal = totalService + totalHardware;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
            <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>
                {item.companyName || 'Sin Empresa'}
            </Text>
            <View style={styles.subHeaderRow}>
                <Ionicons name="person-outline" size={13} color={colors.textSecondary} />
                <Text style={[styles.clientName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.clientName || 'Sin Cliente'}
                </Text>
            </View>
        </View>
        <View style={[
            styles.badge, 
            { 
                backgroundColor: isDark ? 'rgba(43, 92, 181, 0.15)' : '#EFF6FF',
                borderColor: isDark ? 'rgba(43, 92, 181, 0.3)' : '#BFDBFE'
            }
        ]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{periodLabel}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.financialContainer}>
        <View style={styles.priceBlock}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>TOTAL {periodLabel}</Text>
            <Text style={[styles.priceMain, { color: colors.primary }]}>
                {formatCurrency(totalService)}
            </Text>
            {totalHardware > 0 && (
                <Text style={[styles.hardwareText, { color: colors.textSecondary }]}>
                    + {formatCurrency(totalHardware)} (Hardware)
                </Text>
            )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
            style={[
                styles.actionButton, 
                styles.btnEditSoft, 
                { backgroundColor: isDark ? colors.border : '#F3F4F6' }
            ]} 
            onPress={() => onEdit(item.id)}
            activeOpacity={0.7}
        >
            <Ionicons name="create-outline" size={18} color={isDark ? colors.text : "#4B5563"} />
            <Text style={[styles.btnTextEdit, { color: isDark ? colors.text : "#4B5563" }]}>Editar</Text>
        </TouchableOpacity>
        
        <View style={{width: 12}} />

        <TouchableOpacity 
            style={[
                styles.actionButton, 
                styles.btnDownloadTinted,
                { backgroundColor: isDark ? 'rgba(43, 92, 181, 0.15)' : '#EFF6FF' }
            ]} 
            onPress={() => onDownload(item.id)}
            activeOpacity={0.7}
            disabled={isDownloading}
        >
            <Ionicons name="cloud-download-outline" size={18} color={isDownloading ? colors.textSecondary : colors.primary} />
            <Text 
                style={[
                    styles.btnTextDownload, 
                    { color: isDownloading ? colors.textSecondary : colors.primary }
                ]} 
                numberOfLines={1}
            >
                {isDownloading ? 'Generando...' : 'PDF'}
            </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  headerContent: { flex: 1, marginRight: 10 },
  companyName: { fontSize: 17, fontWeight: '700', marginBottom: 4, letterSpacing: -0.3 },
  subHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clientName: { fontSize: 13, fontWeight: '500' },
  
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '700' },

  divider: { height: 1, marginBottom: 16 },
  
  financialContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  priceBlock: { alignItems: 'center' },
  priceLabel: { fontSize: 11, marginBottom: 6, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  priceMain: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  hardwareText: { fontSize: 12, marginTop: 4, fontWeight: '500' },

  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', height: 48 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingHorizontal: 12 },
  btnEditSoft: { },
  btnTextEdit: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  btnDownloadTinted: { },
  btnTextDownload: { fontSize: 14, fontWeight: '700', marginLeft: 8 }
});

export default memo(QuoteCard);