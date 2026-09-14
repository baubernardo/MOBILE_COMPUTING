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
import { StockItem, PreOrderItem, SaleItem, StorageCapacity, iPhoneCondition, PaymentMethod } from '../types';
import { Colors } from '../theme/colors';
import { IPHONE_MODELS, STORAGE_OPTIONS, CONDITION_OPTIONS, COLOR_OPTIONS } from '../constants/iphoneData';
import { formatCurrency } from '../utils/formatters';

interface ModalRegisterSaleProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    sale: Omit<SaleItem, 'id' | 'profit'>,
    options?: { stockItemId?: string; orderId?: string }
  ) => void;
  initialStockItem?: StockItem | null;
  initialOrderItem?: PreOrderItem | null;
  availableStock?: StockItem[];
}

export const ModalRegisterSale: React.FC<ModalRegisterSaleProps> = ({
  visible,
  onClose,
  onSave,
  initialStockItem,
  initialOrderItem,
  availableStock = [],
}) => {
  const [selectedStockId, setSelectedStockId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [model, setModel] = useState<string>(IPHONE_MODELS[0]);
  const [storage, setStorage] = useState<StorageCapacity>('128GB');
  const [color, setColor] = useState<string>(COLOR_OPTIONS[0]);
  const [condition, setCondition] = useState<iPhoneCondition>('Novo / Lacrado');
  const [imei, setImei] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [installments, setInstallments] = useState<string>('1');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialStockItem) {
      setSelectedStockId(initialStockItem.id);
      setModel(initialStockItem.model);
      setStorage(initialStockItem.storage);
      setColor(initialStockItem.color);
      setCondition(initialStockItem.condition);
      setImei(initialStockItem.imei);
      setCostPrice(initialStockItem.costPrice.toString());
      setSalePrice(initialStockItem.salePrice.toString());
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('pix');
      setInstallments('1');
      setNotes('');
    } else if (initialOrderItem) {
      setSelectedStockId('');
      setModel(initialOrderItem.model);
      setStorage(initialOrderItem.storage);
      setColor(initialOrderItem.color);
      setCondition(initialOrderItem.condition);
      setImei('');
      setCostPrice('');
      setSalePrice(initialOrderItem.agreedPrice.toString());
      setCustomerName(initialOrderItem.customerName);
      setCustomerPhone(initialOrderItem.customerPhone);
      setPaymentMethod('pix');
      setInstallments('1');
      setNotes(`Venda de encomenda. Sinal prévio: ${formatCurrency(initialOrderItem.depositPaid)}.`);
    } else {
      setSelectedStockId('');
      setModel(IPHONE_MODELS[0]);
      setStorage('128GB');
      setColor(COLOR_OPTIONS[0]);
      setCondition('Novo / Lacrado');
      setImei('');
      setCostPrice('');
      setSalePrice('');
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('pix');
      setInstallments('1');
      setNotes('');
    }
  }, [initialStockItem, initialOrderItem, visible]);

  const handleStockSelect = (stockItem: StockItem) => {
    setSelectedStockId(stockItem.id);
    setModel(stockItem.model);
    setStorage(stockItem.storage);
    setColor(stockItem.color);
    setCondition(stockItem.condition);
    setImei(stockItem.imei);
    setCostPrice(stockItem.costPrice.toString());
    setSalePrice(stockItem.salePrice.toString());
  };

  const numCost = parseFloat(costPrice.replace(',', '.')) || 0;
  const numSale = parseFloat(salePrice.replace(',', '.')) || 0;
  const profit = numSale - numCost;

  const handleSave = () => {
    if (!customerName.trim()) {
      Alert.alert('Atenção', 'Informe o nome do comprador.');
      return;
    }
    if (!numSale) {
      Alert.alert('Atenção', 'Informe o valor final da venda.');
      return;
    }

    const saleData: Omit<SaleItem, 'id' | 'profit'> = {
      stockItemId: selectedStockId || undefined,
      orderId: initialOrderItem?.id || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      model,
      storage,
      color,
      condition,
      imei: imei.trim() || undefined,
      costPrice: numCost,
      salePrice: numSale,
      paymentMethod,
      installments: paymentMethod === 'cartao_credito' ? parseInt(installments, 10) || 1 : undefined,
      saleDate: new Date().toISOString(),
      notes: notes.trim() || undefined,
    };

    onSave(saleData, {
      stockItemId: selectedStockId || undefined,
      orderId: initialOrderItem?.id || undefined,
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
            <Text style={styles.headerTitle}>Registrar Venda</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Quick stock selection */}
            {!initialStockItem && !initialOrderItem && availableStock.length > 0 && (
              <View style={styles.stockPickerContainer}>
                <Text style={styles.sectionLabel}>Vender item do estoque atual:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
                  {availableStock.filter(s => s.status !== 'vendido').map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.stockPill, selectedStockId === item.id && styles.stockPillActive]}
                      onPress={() => handleStockSelect(item)}
                    >
                      <Text style={[styles.stockPillText, selectedStockId === item.id && styles.stockPillTextActive]}>
                        {item.model} {item.storage} ({item.color}) - {formatCurrency(item.salePrice)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Customer info */}
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

            {/* Product summary / Model */}
            <Text style={styles.sectionLabel}>Aparelho Vendido</Text>
            <View style={styles.selectedProductBox}>
              <View style={styles.selectedProductHeader}>
                <Ionicons name="phone-portrait" size={18} color={Colors.primaryLight} />
                <Text style={styles.selectedProductTitle}>{model} {storage}</Text>
              </View>
              <Text style={styles.selectedProductSub}>
                Cor: {color} • Condição: {condition} {imei ? `• IMEI: ${imei}` : ''}
              </Text>
            </View>

            {/* Values */}
            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <Text style={styles.sectionLabel}>Preço de Custo (R$)</Text>
                <View style={styles.inputWithIcon}>
                  <Text style={styles.currencyPrefix}>R$</Text>
                  <TextInput
                    style={styles.inputField}
                    keyboardType="decimal-pad"
                    placeholder="0,00"
                    placeholderTextColor={Colors.textMuted}
                    value={costPrice}
                    onChangeText={setCostPrice}
                  />
                </View>
              </View>

              <View style={styles.col}>
                <Text style={styles.sectionLabel}>Valor da Venda (R$) *</Text>
                <View style={styles.inputWithIcon}>
                  <Text style={styles.currencyPrefix}>R$</Text>
                  <TextInput
                    style={styles.inputField}
                    keyboardType="decimal-pad"
                    placeholder="0,00"
                    placeholderTextColor={Colors.textMuted}
                    value={salePrice}
                    onChangeText={setSalePrice}
                  />
                </View>
              </View>
            </View>

            {/* Profit summary */}
            <View style={styles.profitBanner}>
              <Text style={styles.profitLabel}>Lucro Líquido desta Venda:</Text>
              <Text
                style={[
                  styles.profitNumber,
                  { color: profit >= 0 ? Colors.success : Colors.danger },
                ]}
              >
                {formatCurrency(profit)}
              </Text>
            </View>

            {/* Payment Method */}
            <Text style={styles.sectionLabel}>Forma de Pagamento</Text>
            <View style={styles.payGrid}>
              {[
                { id: 'pix', label: 'Pix', icon: 'flash-outline' },
                { id: 'cartao_credito', label: 'Crédito', icon: 'card-outline' },
                { id: 'cartao_debito', label: 'Débito', icon: 'card' },
                { id: 'dinheiro', label: 'Dinheiro', icon: 'cash-outline' },
                { id: 'misto', label: 'Misto', icon: 'options-outline' },
              ].map(pm => (
                <TouchableOpacity
                  key={pm.id}
                  style={[styles.payOption, paymentMethod === pm.id && styles.payOptionActive]}
                  onPress={() => setPaymentMethod(pm.id as PaymentMethod)}
                >
                  <Ionicons
                    name={pm.icon as any}
                    size={16}
                    color={paymentMethod === pm.id ? Colors.primaryLight : Colors.textSecondary}
                  />
                  <Text style={[styles.payOptionText, paymentMethod === pm.id && styles.payOptionTextActive]}>
                    {pm.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Installments if credit card */}
            {paymentMethod === 'cartao_credito' && (
              <View style={styles.installmentsRow}>
                <Text style={styles.sectionLabel}>Número de Parcelas</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
                  {[1, 2, 3, 4, 5, 6, 10, 12, 18].map(num => (
                    <TouchableOpacity
                      key={num}
                      style={[styles.instPill, installments === num.toString() && styles.instPillActive]}
                      onPress={() => setInstallments(num.toString())}
                    >
                      <Text style={[styles.instPillText, installments === num.toString() && styles.instPillTextActive]}>
                        {num}x {numSale > 0 ? `(${formatCurrency(numSale / num)})` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Notes */}
            <Text style={styles.sectionLabel}>Observações da Venda</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Brinde película 3D e fonte 20W inclusos..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={2}
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
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Concluir Venda</Text>
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
  stockPickerContainer: {
    marginBottom: 6,
  },
  pillsScroll: {
    marginBottom: 8,
  },
  stockPill: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stockPillActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  stockPillText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  stockPillTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
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
  selectedProductBox: {
    backgroundColor: Colors.surfaceCard,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  selectedProductHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedProductTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  selectedProductSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  profitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.successMuted,
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.3)',
  },
  profitLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  profitNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  payGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  payOptionActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  payOptionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  payOptionTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  installmentsRow: {
    marginTop: 4,
  },
  instPill: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instPillActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  instPillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  instPillTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  textArea: {
    height: 60,
    paddingTop: 8,
    textAlignVertical: 'top',
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
    backgroundColor: Colors.success,
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
