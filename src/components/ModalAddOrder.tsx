import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PreOrderItem, StorageCapacity, iPhoneCondition, OrderStatus } from '../types';
import { Colors } from '../theme/colors';
import { IPHONE_MODELS, STORAGE_OPTIONS, CONDITION_OPTIONS, COLOR_OPTIONS } from '../constants/iphoneData';
import { formatCurrency } from '../utils/formatters';

interface ModalAddOrderProps {
  visible: boolean;
  onClose: () => void;
  onSave: (order: Omit<PreOrderItem, 'id' | 'createdAt' | 'updatedAt' | 'remainingAmount'>) => void;
  initialOrder?: PreOrderItem | null;
}

export const ModalAddOrder: React.FC<ModalAddOrderProps> = ({
  visible,
  onClose,
  onSave,
  initialOrder,
}) => {
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [model, setModel] = useState<string>(IPHONE_MODELS[0]);
  const [storage, setStorage] = useState<StorageCapacity>('128GB');
  const [color, setColor] = useState<string>(COLOR_OPTIONS[0]);
  const [condition, setCondition] = useState<iPhoneCondition>('Novo / Lacrado');
  const [agreedPrice, setAgreedPrice] = useState<string>('');
  const [depositPaid, setDepositPaid] = useState<string>('');
  const [estimatedArrival, setEstimatedArrival] = useState<string>('');
  const [status, setStatus] = useState<OrderStatus>('pendente');
  const [supplier, setSupplier] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialOrder) {
      setCustomerName(initialOrder.customerName);
      setCustomerPhone(initialOrder.customerPhone);
      setModel(initialOrder.model);
      setStorage(initialOrder.storage);
      setColor(initialOrder.color);
      setCondition(initialOrder.condition);
      setAgreedPrice(initialOrder.agreedPrice.toString());
      setDepositPaid(initialOrder.depositPaid.toString());
      setEstimatedArrival(initialOrder.estimatedArrival || '');
      setStatus(initialOrder.status);
      setSupplier(initialOrder.supplier || '');
      setNotes(initialOrder.notes || '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setModel(IPHONE_MODELS[0]);
      setStorage('128GB');
      setColor(COLOR_OPTIONS[0]);
      setCondition('Novo / Lacrado');
      setAgreedPrice('');
      setDepositPaid('');
      // Default estimated arrival 3 days from now
      const d = new Date(Date.now() + 3 * 86400000);
      setEstimatedArrival(d.toISOString().split('T')[0]);
      setStatus('pendente');
      setSupplier('');
      setNotes('');
    }
  }, [initialOrder, visible]);

  const numAgreed = parseFloat(agreedPrice.replace(',', '.')) || 0;
  const numDeposit = parseFloat(depositPaid.replace(',', '.')) || 0;
  const remaining = Math.max(0, numAgreed - numDeposit);

  const handleSave = () => {
    if (!customerName.trim()) {
      Alert.alert('Atenção', 'Informe o nome do cliente.');
      return;
    }
    if (!agreedPrice) {
      Alert.alert('Atenção', 'Informe o valor total acordado.');
      return;
    }

    onSave({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      model,
      storage,
      color,
      condition,
      agreedPrice: numAgreed,
      depositPaid: numDeposit,
      estimatedArrival: estimatedArrival.trim() || undefined,
      status,
      supplier: supplier.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {initialOrder ? 'Editar Encomenda' : 'Nova Encomenda / Pedido'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Customer Info */}
            <Text style={styles.sectionLabel}>Dados do Cliente *</Text>
            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do Cliente *"
                  placeholderTextColor={Colors.textMuted}
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>
              <View style={styles.col}>
                <TextInput
                  style={styles.input}
                  placeholder="WhatsApp / Telefone"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                />
              </View>
            </View>

            {/* Model Selection */}
            <Text style={styles.sectionLabel}>Modelo Encomendado *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
              {IPHONE_MODELS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.pill, model === m && styles.pillActive]}
                  onPress={() => setModel(m)}
                >
                  <Text style={[styles.pillText, model === m && styles.pillTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Storage */}
            <Text style={styles.sectionLabel}>Capacidade</Text>
            <View style={styles.rowGrid}>
              {STORAGE_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.gridOption, storage === s && styles.gridOptionActive]}
                  onPress={() => setStorage(s)}
                >
                  <Text style={[styles.gridOptionText, storage === s && styles.gridOptionTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Condition */}
            <Text style={styles.sectionLabel}>Condição</Text>
            <View style={styles.wrapGrid}>
              {CONDITION_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.condOption, condition === c && styles.condOptionActive]}
                  onPress={() => setCondition(c)}
                >
                  <Text style={[styles.condOptionText, condition === c && styles.condOptionTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color */}
            <Text style={styles.sectionLabel}>Cor Desejada</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
              {COLOR_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.pill, color === c && styles.pillActive]}
                  onPress={() => setColor(c)}
                >
                  <Text style={[styles.pillText, color === c && styles.pillTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Financials */}
            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <Text style={styles.sectionLabel}>Valor Total Acordado (R$) *</Text>
                <View style={styles.inputWithIcon}>
                  <Text style={styles.currencyPrefix}>R$</Text>
                  <TextInput
                    style={styles.inputField}
                    keyboardType="decimal-pad"
                    placeholder="0,00"
                    placeholderTextColor={Colors.textMuted}
                    value={agreedPrice}
                    onChangeText={setAgreedPrice}
                  />
                </View>
              </View>

              <View style={styles.col}>
                <Text style={styles.sectionLabel}>Sinal / Entrada Paga (R$)</Text>
                <View style={styles.inputWithIcon}>
                  <Text style={styles.currencyPrefix}>R$</Text>
                  <TextInput
                    style={styles.inputField}
                    keyboardType="decimal-pad"
                    placeholder="0,00"
                    placeholderTextColor={Colors.textMuted}
                    value={depositPaid}
                    onChangeText={setDepositPaid}
                  />
                </View>
              </View>
            </View>

            {/* Remaining amount badge */}
            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryLabel}>Saldo Restante a Receber:</Text>
                <Text style={styles.summaryHelper}>(No momento da entrega)</Text>
              </View>
              <Text style={styles.remainingValue}>{formatCurrency(remaining)}</Text>
            </View>

            {/* Arrival & Supplier */}
            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <Text style={styles.sectionLabel}>Previsão de Entrega</Text>
                <TextInput
                  style={styles.input}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor={Colors.textMuted}
                  value={estimatedArrival}
                  onChangeText={setEstimatedArrival}
                />
              </View>

              <View style={styles.col}>
                <Text style={styles.sectionLabel}>Fornecedor / Origem</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Miami / SP"
                  placeholderTextColor={Colors.textMuted}
                  value={supplier}
                  onChangeText={setSupplier}
                />
              </View>
            </View>

            {/* Status */}
            <Text style={styles.sectionLabel}>Status Atual</Text>
            <View style={styles.statusGrid}>
              {(['pendente', 'a_caminho', 'recebido'] as OrderStatus[]).map(st => (
                <TouchableOpacity
                  key={st}
                  style={[styles.statusTab, status === st && styles.statusTabActive]}
                  onPress={() => setStatus(st)}
                >
                  <Text style={[styles.statusTabText, status === st && styles.statusTabTextActive]}>
                    {st === 'pendente' ? 'Pendente' : st === 'a_caminho' ? 'A Caminho' : 'Recebido'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={styles.sectionLabel}>Código de Rastreio / Notas</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Rastreio BR123456789US. Cliente prefere película fosca."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </ScrollView>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="bag-check" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Salvar Encomenda</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 10,
  },
  pillsScroll: {
    marginBottom: 8,
  },
  pill: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  pillText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rowGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  gridOption: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridOptionActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  gridOptionText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  gridOptionTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  wrapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  condOption: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  condOptionActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold,
  },
  condOptionText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  condOptionTextActive: {
    color: Colors.gold,
    fontWeight: '700',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  currencyPrefix: {
    color: Colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
    marginRight: 6,
  },
  inputField: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  textArea: {
    height: 70,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    padding: 14,
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.warningMuted,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryHelper: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  remainingValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.warning,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statusTab: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusTabActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusTabTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
