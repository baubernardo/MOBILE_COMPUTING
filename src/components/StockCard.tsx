import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StockItem } from '../types';
import { Colors } from '../theme/colors';
import { Badge } from './Badge';
import { formatCurrency, formatIMEI, getStockStatusInfo, getConditionInfo } from '../utils/formatters';

interface StockCardProps {
  item: StockItem;
  onPress: () => void;
  onSell?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const StockCard: React.FC<StockCardProps> = ({
  item,
  onPress,
  onSell,
  onEdit,
  onDelete,
}) => {
  const statusInfo = getStockStatusInfo(item.status);
  const conditionInfo = getConditionInfo(item.condition);
  const profit = (item.salePrice || 0) - (item.costPrice || 0);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.modelRow}>
          <View style={styles.phoneIconBg}>
            <Ionicons name="phone-portrait-outline" size={18} color={Colors.primaryLight} />
          </View>
          <View style={styles.modelInfo}>
            <Text style={styles.modelText}>{item.model}</Text>
            <View style={styles.specsRow}>
              <Text style={styles.storageText}>{item.storage}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.colorText}>{item.color}</Text>
            </View>
          </View>
        </View>

        <Badge
          label={statusInfo.label}
          variant={
            item.status === 'disponivel'
              ? 'success'
              : item.status === 'reservado'
              ? 'warning'
              : 'muted'
          }
        />
      </View>

      {/* Badges Section */}
      <View style={styles.badgeRow}>
        <Badge
          label={`${item.batteryHealth}%`}
          variant="battery"
          value={item.batteryHealth}
        />
        <Badge
          label={conditionInfo.label}
          variant={item.condition === 'Novo / Lacrado' ? 'gold' : 'primary'}
        />
        {item.imei ? (
          <View style={styles.imeiChip}>
            <Ionicons name="barcode-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.imeiText}>IMEI: {formatIMEI(item.imei).slice(-6)}</Text>
          </View>
        ) : null}
      </View>

      {/* Pricing Section */}
      <View style={styles.priceContainer}>
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>Preço de Venda</Text>
          <Text style={styles.salePrice}>{formatCurrency(item.salePrice)}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>Custo / Lucro Est.</Text>
          <View style={styles.costProfitRow}>
            <Text style={styles.costPrice}>{formatCurrency(item.costPrice)}</Text>
            <Text style={styles.profitBadge}>+{formatCurrency(profit)}</Text>
          </View>
        </View>
      </View>

      {/* Card Actions */}
      {item.status !== 'vendido' && (
        <View style={styles.actionsRow}>
          {onSell && (
            <TouchableOpacity
              style={styles.sellButton}
              onPress={onSell}
              activeOpacity={0.7}
            >
              <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
              <Text style={styles.sellButtonText}>Vender</Text>
            </TouchableOpacity>
          )}

          {onEdit && (
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={styles.deleteAction}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color={Colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  phoneIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modelInfo: {
    flex: 1,
  },
  modelText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  storageText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  dot: {
    fontSize: 12,
    color: Colors.textMuted,
    marginHorizontal: 6,
  },
  colorText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  imeiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: 4,
  },
  imeiText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Courier',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  priceColumn: {
    flex: 1,
  },
  priceDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  costProfitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  costPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  profitBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  sellButton: {
    flex: 1,
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  sellButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryAction: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deleteAction: {
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
