import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SELLER_MAP } from '../../utils/constants';

const InactiveClientCard = React.memo(({ item, isExpanded, onPress }) => {
  // Conversión segura a String para buscar en el mapa
  const sellerIdStr = item.sellerId ? String(item.sellerId) : null;
  const sellerName = SELLER_MAP[sellerIdStr];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardMainRow}>
        <View style={styles.infoContainer}>
          <Text style={styles.clientName} numberOfLines={1}>{item.businessName || item.name}</Text>
          <Text style={styles.clientAlias}>@{item.alias}</Text>
        </View>
        
        <View style={styles.rightContainer}>
            {/* Badge Suspendido (Rojo) */}
            <View style={styles.statusBadge}>
                <Ionicons name="alert-circle" size={12} color="#B91C1C" style={{marginRight: 4}} />
                <Text style={styles.statusText}>Suspendido</Text>
            </View>
            
            <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9CA3AF" 
                style={{ marginTop: 8 }}
            />
        </View>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          
          {/* Fila Vendedor (Solo si existe) */}
          {sellerName && (
            <View style={styles.metaRow}>
                <Ionicons name="person-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{sellerName}</Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
              <TouchableOpacity style={[styles.actionButton, styles.btnWhatsapp]}>
                  <Ionicons name="logo-whatsapp" size={18} color="white" />
                  <Text style={styles.actionText}>Contactar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.btnReactivate]}>
                  <Ionicons name="refresh" size={18} color="#2b5cb5" />
                  <Text style={[styles.actionText, styles.textReactivate]}>Reactivar</Text>
              </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

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
    elevation: 4 
  },
  cardMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoContainer: { flex: 1, marginRight: 10, justifyContent: 'center' },
  rightContainer: { alignItems: 'flex-end', justifyContent: 'flex-start' },
  clientName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  clientAlias: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }, 
  statusText: { color: '#B91C1C', fontSize: 11, fontWeight: '700' },
  expandedContent: { marginTop: 20 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  metaText: { fontSize: 13, color: '#4B5563', marginLeft: 8, fontWeight: '500' },
  actionsContainer: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  btnWhatsapp: { backgroundColor: '#25D366', shadowColor: '#25D366', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2 },
  btnReactivate: { backgroundColor: 'white', borderWidth: 1, borderColor: '#2b5cb5' },
  actionText: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  textReactivate: { color: '#2b5cb5' },
});

export default InactiveClientCard;