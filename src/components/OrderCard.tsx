import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PreOrderItem } from '../types';
import { Colors } from '../theme/colors';
import { Badge } from './Badge';
import { formatCurrency, formatDate, getOrderStatusInfo, getConditionInfo } from '../utils/formatters';

interface OrderCardProps {
  order: PreOrderItem;
  onPress: () => void;
  onReceiveStock?: () => void;
  onCompleteSale?: () => void;
  onStatusChange?: () => void;
  onDelete?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onReceiveStock,
  onCompleteSale,
  onStatusChange,
  onDelete,
}) => {
  const statusInfo = getOrderStatusInfo(order.status);
  const conditionInfo = getConditionInfo(order.condition);

  const openWhatsApp = () => {
    if (!order.customerPhone) return;
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá ${order.customerName}! Aqui é da loja de iPhones referente à sua encomenda do ${order.model} ${order.storage} (${order.color}).`
    );
    const url = `whatsapp://send?phone=${fullPhone}&text=${text}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/${fullPhone}?text=${text}`);
      }
    }).catch(() => {
      Alert.alert('Aviso', 'Não foi possível abrir o WhatsApp.');
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Top Customer Bar */}
      <View style={styles.customerRow}>
        <View style={styles.customerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {order.customerName ? order.customerName.charAt(0).toUpperCase() : 'C'}
            </Text>
          </View>
          <View>
            <Text style={styles.customerName}>{order.customerName}</Text>
            <Text style={styles.customerPhone}>{order.customerPhone || 'Sem telefone'}</Text>
          </View>
        </View>

        <View style={styles.topRight}>
          <Badge
            label={statusInfo.label}
            variant={
              order.status === 'entregue'
                ? 'success'
                : order.status === 'recebido'
                ? 'purple'
                : order.status === 'a_caminho'
                ? 'primary'
                : order.status === 'cancelado'
                ? 'danger'
                : 'warning'
            }
          />
          {order.customerPhone ? (
            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={openWhatsApp}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Model & Specs */}
      <View style={styles.modelSection}>
        <Text style={styles.modelTitle}>{order.model}</Text>
        <View style={styles.specsRow}>
          <Text style={styles.storageTag}>{order.storage}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.colorTag}>{order.color}</Text>
          <Text style={styles.dot}>•</Text>
          <Badge label={conditionInfo.label} variant="gold" size="sm" />
        </View>
      </View>

      {/* Financials & Status Details */}
      <View style={styles.financialContainer}>
        <View style={styles.finCol}>
          <Text style={styles.finLabel}>Valor Total</Text>
          <Text style={styles.finValue}>{formatCurrency(order.agreedPrice)}</Text>
        </View>
        <View style={styles.finDivider} />
        <View style={styles.finCol}>
          <Text style={styles.finLabel}>Sinal Pago</Text>
          <Text style={[styles.finValue, { color: Colors.success }]}>
            {formatCurrency(order.depositPaid)}
          </Text>
        </View>
        <View style={styles.finDivider} />
        <View style={styles.finCol}>
          <Text style={styles.finLabel}>Restante</Text>
          <Text style={[styles.finValue, { color: Colors.warning }]}>
            {formatCurrency(order.remainingAmount)}
          </Text>
        </View>
      </View>

      {/* Estimated Arrival / Notes */}
      {order.estimatedArrival && (
        <View style={styles.arrivalRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.arrivalText}>
            Previsão de Chegada: <Text style={styles.arrivalBold}>{formatDate(order.estimatedArrival)}</Text>
          </Text>
        </View>
      )}

      {/* Action Buttons based on status */}
      <View style={styles.actionsRow}>
        {(order.status === 'pendente' || order.status === 'a_caminho') && onReceiveStock && (
          <TouchableOpacity
            style={styles.receiveBtn}
            onPress={onReceiveStock}
            activeOpacity={0.7}
          >
            <Ionicons name="cube-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Receber no Estoque</Text>
          </TouchableOpacity>
        )}

        {order.status === 'recebido' && onCompleteSale && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={onCompleteSale}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Concluir Entrega / Venda</Text>
          </TouchableOpacity>
        )}

        {onStatusChange && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onStatusChange}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  customerPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whatsappBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelSection: {
    marginTop: 12,
  },
  modelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  storageTag: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  dot: {
    fontSize: 12,
    color: Colors.textMuted,
    marginHorizontal: 6,
  },
  colorTag: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  financialContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  finCol: {
    flex: 1,
    alignItems: 'center',
  },
  finDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  finLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  finValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  arrivalText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  arrivalBold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  receiveBtn: {
    flex: 1,
    backgroundColor: Colors.purple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  completeBtn: {
    flex: 1,
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.dangerMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
});
