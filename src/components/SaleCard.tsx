import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SaleItem } from '../types';
import { Colors } from '../theme/colors';
import { Badge } from './Badge';
import { formatCurrency, formatDateTime, formatIMEI } from '../utils/formatters';

interface SaleCardProps {
  sale: SaleItem;
  onPress?: () => void;
  onDelete?: () => void;
}

export const SaleCard: React.FC<SaleCardProps> = ({ sale, onPress, onDelete }) => {
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'pix':
        return 'Pix (À vista)';
      case 'cartao_credito':
        return sale.installments ? `Cartão (${sale.installments}x)` : 'Cartão de Crédito';
      case 'cartao_debito':
        return 'Cartão de Débito';
      case 'dinheiro':
        return 'Dinheiro';
      case 'misto':
        return 'Misto (Pix + Cartão)';
      default:
        return method;
    }
  };

  const shareReceipt = async () => {
    try {
      const receiptText = `
📱 *COMPROVANTE DE VENDA - LOJA DE IPHONES* 📱
-------------------------------------------
👤 *Cliente:* ${sale.customerName}
📞 *Contato:* ${sale.customerPhone || 'Não informado'}
📅 *Data:* ${formatDateTime(sale.saleDate)}

📦 *PRODUTO VENDIDO:*
• *Modelo:* ${sale.model} ${sale.storage}
• *Cor:* ${sale.color}
• *Condição:* ${sale.condition}
${sale.imei ? `• *IMEI:* ${sale.imei}` : ''}

💳 *PAGAMENTO:*
• *Forma de Pagamento:* ${getPaymentMethodLabel(sale.paymentMethod)}
• *Valor Total:* ${formatCurrency(sale.salePrice)}

${sale.notes ? `📝 *Observações:* ${sale.notes}\n` : ''}
-------------------------------------------
Obrigado pela preferência!
Garantia e suporte direto com a nossa loja.
      `.trim();

      await Share.share({
        message: receiptText,
        title: `Comprovante - ${sale.model}`,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o recibo.');
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
    >
      {/* Top Bar with Date & Customer */}
      <View style={styles.topRow}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{sale.customerName}</Text>
          <Text style={styles.dateText}>{formatDateTime(sale.saleDate)}</Text>
        </View>
        <View style={styles.profitBadge}>
          <Text style={styles.profitLabel}>LUCRO</Text>
          <Text style={styles.profitValue}>+{formatCurrency(sale.profit)}</Text>
        </View>
      </View>

      {/* Product Details */}
      <View style={styles.productSection}>
        <Text style={styles.modelTitle}>{sale.model}</Text>
        <View style={styles.specsRow}>
          <Text style={styles.specText}>{sale.storage}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.specText}>{sale.color}</Text>
          <Text style={styles.dot}>•</Text>
          <Badge label={sale.condition === 'Novo / Lacrado' ? 'Lacrado' : sale.condition} variant="gold" size="sm" />
        </View>
      </View>

      {/* Financials & Payment method */}
      <View style={styles.financialContainer}>
        <View style={styles.finCol}>
          <Text style={styles.finLabel}>Preço Venda</Text>
          <Text style={styles.salePrice}>{formatCurrency(sale.salePrice)}</Text>
        </View>
        <View style={styles.finDivider} />
        <View style={styles.finCol}>
          <Text style={styles.finLabel}>Custo</Text>
          <Text style={styles.costPrice}>{formatCurrency(sale.costPrice)}</Text>
        </View>
        <View style={styles.finDivider} />
        <View style={styles.finCol}>
          <Text style={styles.finLabel}>Pagamento</Text>
          <Text style={styles.paymentMethodText} numberOfLines={1}>
            {getPaymentMethodLabel(sale.paymentMethod)}
          </Text>
        </View>
      </View>

      {sale.imei ? (
        <View style={styles.imeiRow}>
          <Ionicons name="barcode-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.imeiText}>IMEI: {formatIMEI(sale.imei)}</Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={shareReceipt}
          activeOpacity={0.7}
        >
          <Ionicons name="share-social-outline" size={16} color={Colors.primaryLight} />
          <Text style={styles.shareBtnText}>Compartilhar Recibo</Text>
        </TouchableOpacity>

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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  profitBadge: {
    backgroundColor: Colors.successMuted,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.3)',
  },
  profitLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.success,
    letterSpacing: 0.5,
  },
  profitValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.success,
  },
  productSection: {
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
  specText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dot: {
    fontSize: 12,
    color: Colors.textMuted,
    marginHorizontal: 6,
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
  salePrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  costPrice: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  imeiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  imeiText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Courier',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: Colors.primaryMuted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  shareBtnText: {
    color: Colors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.dangerMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
});
