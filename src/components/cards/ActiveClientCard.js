import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'; // Importamos Alert
import { Ionicons } from '@expo/vector-icons';
import { SELLER_MAP } from '../../utils/constants';
import { openWhatsApp } from '../../utils/actions';

const ActiveClientCard = React.memo(({ item, isExpanded, onPress, onSuspend }) => {
  // --- VALIDACIÓN DE SEGURIDAD ---
  if (!item) return null; 

  const sellerIdStr = item.sellerId ? String(item.sellerId) : null;
  const sellerName = SELLER_MAP[sellerIdStr];

  const handleContact = () => {
    const message = `Hola ${item.name || 'Cliente'}, te contacto desde Ari Soporte respecto a tu cuenta activa.`;
    openWhatsApp(item.phoneNumber, message);
  };

  // Confirmación para suspender
  const handleSuspend = () => {
    Alert.alert(
        "Confirmar Suspensión",
        `¿Estás seguro de suspender a ${item.businessName || 'este cliente'}?`,
        [
            { text: "Cancelar", style: "cancel" },
            { text: "Suspender", style: 'destructive', onPress: onSuspend }
        ]
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardMainRow}>
        <View style={styles.infoContainer}>
          <Text style={styles.clientName} numberOfLines={1}>{item.businessName || item.name}</Text>
          <Text style={styles.clientAlias}>@{item.alias}</Text>
        </View>
        
        <View style={styles.rightContainer}>
            <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" style={{marginRight: 4}} />
                <Text style={styles.statusText}>Activo</Text>
            </View>
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" style={{ marginTop: 8 }} />
        </View>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          
          {sellerName && (
            <View style={styles.metaRow}>
                <Ionicons name="person-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{sellerName}</Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.btnWhatsapp]}
                onPress={handleContact}
              >
                  <Ionicons name="logo-whatsapp" size={18} color="white" />
                  <Text style={styles.actionText}>Contactar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.btnSuspend]}
                onPress={handleSuspend} // Usamos la función con alerta
              >
                  <Ionicons name="ban" size={18} color="#EF4444" />
                  <Text style={[styles.actionText, styles.textSuspend]}>Suspender</Text>
              </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  cardMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoContainer: { flex: 1, marginRight: 10, justifyContent: 'center' },
  rightContainer: { alignItems: 'flex-end', justifyContent: 'flex-start' },
  clientName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  clientAlias: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }, 
  statusText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  expandedContent: { marginTop: 20 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  metaText: { fontSize: 13, color: '#4B5563', marginLeft: 8, fontWeight: '500' },
  actionsContainer: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  btnWhatsapp: { backgroundColor: '#25D366', shadowColor: '#25D366', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2 },
  btnSuspend: { backgroundColor: 'white', borderWidth: 1, borderColor: '#EF4444' },
  textSuspend: { color: '#EF4444' },
  actionText: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 6 },
});

export default ActiveClientCard;