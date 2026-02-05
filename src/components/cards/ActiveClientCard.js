import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SELLER_MAP } from '../../utils/constants';
import { openWhatsApp } from '../../utils/actions';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS, hasPermission } from '../../utils/permissions';
import { useThemeColors } from '../../hooks/useThemeColors';

const ActiveClientCard = React.memo(({ item, isExpanded, onPress, onSuspend }) => {
  if (!item) return null; 

  const { colors, isDark } = useThemeColors();
  const { userProfile } = useAuth();
  
  const canSuspend = useMemo(() => 
      hasPermission(userProfile?.roleId, PERMISSIONS.MANAGE_CLIENT_STATUS), 
  [userProfile]);

  const sellerIdStr = item.sellerId ? String(item.sellerId) : null;
  const sellerName = SELLER_MAP[sellerIdStr];

  const handleContact = () => {
    const message = `Hola ${item.name || 'Cliente'}, te contacto desde Ari Soporte respecto a tu cuenta activa.`;
    openWhatsApp(item.phoneNumber, message);
  };

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
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card }]} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View style={styles.cardMainRow}>
        <View style={styles.infoContainer}>
          <Text style={[styles.clientName, { color: colors.text }]} numberOfLines={1}>
            {item.businessName || item.name}
          </Text>
          <Text style={[styles.clientAlias, { color: colors.textSecondary }]}>
            @{item.alias}
          </Text>
        </View>
        
        <View style={styles.rightContainer}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }
            ]}>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} style={{marginRight: 4}} />
                <Text style={[styles.statusText, { color: colors.success }]}>Activo</Text>
            </View>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.textSecondary} 
              style={{ marginTop: 8 }} 
            />
        </View>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          {sellerName && (
            <View style={styles.metaRow}>
                <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{sellerName}</Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.btnWhatsapp]}
                onPress={handleContact}
              >
                  <Ionicons name="logo-whatsapp" size={18} color="white" />
                  <Text style={[styles.actionText, { color: 'white' }]}>Contactar</Text>
              </TouchableOpacity>
              
              {canSuspend && (
                  <TouchableOpacity 
                    style={[
                      styles.actionButton, 
                      styles.btnSuspend, 
                      { 
                        backgroundColor: colors.card, 
                        borderColor: colors.danger 
                      }
                    ]}
                    onPress={handleSuspend}
                  >
                      <Ionicons name="ban" size={18} color={colors.danger} />
                      <Text style={[styles.actionText, styles.textSuspend, { color: colors.danger }]}>Suspender</Text>
                  </TouchableOpacity>
              )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  cardMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoContainer: { flex: 1, marginRight: 10, justifyContent: 'center' },
  rightContainer: { alignItems: 'flex-end', justifyContent: 'flex-start' },
  clientName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  clientAlias: { fontSize: 13, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }, 
  statusText: { fontSize: 11, fontWeight: '700' },
  expandedContent: { marginTop: 20 },
  divider: { height: 1, marginBottom: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  metaText: { fontSize: 13, marginLeft: 8, fontWeight: '500' },
  actionsContainer: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  btnWhatsapp: { backgroundColor: '#25D366', shadowColor: '#25D366', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2 },
  btnSuspend: { borderWidth: 1 },
  textSuspend: { },
  actionText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
});

export default ActiveClientCard;