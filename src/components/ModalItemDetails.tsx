import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StockItem } from '../types';
import { Colors } from '../theme/colors';
import { Badge } from './Badge';
import {
  formatCurrency,
  formatDateTime,
  formatIMEI,
  getStockStatusInfo,
  getConditionInfo,
} from '../utils/formatters';

interface ModalItemDetailsProps {
  visible: boolean;
  item: StockItem | null;
  onClose: () => void;
  onSell?: (item: StockItem) => void;
  onEdit?: (item: StockItem) => void;
  onDelete?: (id: string) => void;
}

export const ModalItemDetails: React.FC<ModalItemDetailsProps> = ({
  visible,
  item,
  onClose,
  onSell,
  onEdit,
  onDelete,
}) => {
  if (!item) return null;

  const statusInfo = getStockStatusInfo(item.status);
  const conditionInfo = getConditionInfo(item.condition);
  const profit = (item.salePrice || 0) - (item.costPrice || 0);

  const shareDeviceDetails = async () => {
    try {
      const message = `
📱 *${item.model} ${item.storage}*
-------------------------------------------
🎨 *Cor:* ${item.color}
🔋 *Saúde da Bateria:* ${item.batteryHealth}%
✨ *Condição:* ${item.condition}
💰 *Preço:* ${formatCurrency(item.salePrice)}
${item.imei ? `🔒 *IMEI:* ${formatIMEI(item.imei)}\n` : ''}${item.notes ? `📝 *Detalhes:* ${item.notes}\n` : ''}
Aparelho 100% testado, revisado e com garantia!
Interessados chamar no direct/WhatsApp.
      `.trim();

      await Share.share({
        message,
        title: `${item.model} ${item.storage}`,
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar os detalhes.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>{item.model}</Text>
              <Text style={styles.headerSubtitle}>
                {item.storage} • {item.color}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Status and Health Badges */}
            <View style={styles.badgesRow}>
              <Badge label={statusInfo.label} variant={item.status === 'disponivel' ? 'success' : item.status === 'reservado' ? 'warning' : 'muted'} size="md" />
              <Badge label={`Bateria ${item.batteryHealth}%`} variant="battery" value={item.batteryHealth} size="md" />
              <Badge label={conditionInfo.label} variant="gold" size="md" />
            </View>

            {/* Pricing Section */}
            <View style={styles.priceCard}>
              <View style={styles.priceMain}>
                <Text style={styles.priceMainLabel}>Preço de Venda</Text>
                <Text style={styles.priceMainValue}>{formatCurrency(item.salePrice)}</Text>
              </View>

              <View style={styles.priceDetailsRow}>
                <View style={styles.priceDetailCol}>
                  <Text style={styles.priceDetailLabel}>Custo de Aquisição</Text>
                  <Text style={styles.priceDetailValue}>{formatCurrency(item.costPrice)}</Text>
                </View>
                <View style={styles.priceDetailCol}>
                  <Text style={styles.priceDetailLabel}>Lucro Estimado</Text>
                  <Text style={[styles.priceDetailValue, { color: Colors.success }]}>
                    +{formatCurrency(profit)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Technical info */}
            <View style={styles.infoGroup}>
              <Text style={styles.infoGroupTitle}>Informações do Aparelho</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>IMEI / Serial</Text>
                <Text style={styles.infoValueMono}>{formatIMEI(item.imei) || 'Não informado'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Fornecedor / Origem</Text>
                <Text style={styles.infoValue}>{item.supplier || 'Não informado'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Cadastrado em</Text>
                <Text style={styles.infoValue}>{formatDateTime(item.createdAt)}</Text>
              </View>
            </View>

            {/* Notes */}
            {item.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Observações / Acessórios</Text>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            ) : null}

            {/* Share button */}
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={shareDeviceDetails}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social" size={18} color={Colors.primaryLight} />
              <Text style={styles.shareBtnText}>Compartilhar Oferta no WhatsApp / Instagram</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {item.status !== 'vendido' && onSell && (
              <TouchableOpacity
                style={styles.sellBtn}
                onPress={() => {
                  onClose();
                  onSell(item);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="cart" size={18} color="#FFFFFF" />
                <Text style={styles.sellBtnText}>Vender</Text>
              </TouchableOpacity>
            )}

            {onEdit && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  onClose();
                  onEdit(item);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil" size={18} color={Colors.textPrimary} />
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  onClose();
                  onDelete(item.id);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 25,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  priceCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  priceMain: {
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  priceMainLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceMainValue: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  priceDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  priceDetailCol: {
    flex: 1,
    alignItems: 'center',
  },
  priceDetailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  priceDetailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  infoGroup: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: 16,
  },
  infoGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoKey: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  infoValueMono: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryLight,
    fontFamily: 'Courier',
  },
  notesBox: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
    marginBottom: 10,
  },
  shareBtnText: {
    color: Colors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    gap: 10,
  },
  sellBtn: {
    flex: 2,
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sellBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  editBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.dangerMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
});
