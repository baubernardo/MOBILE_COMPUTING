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
import { StockItem, StorageCapacity, iPhoneCondition, StockStatus } from '../types';
import { Colors } from '../theme/colors';
import { IPHONE_MODELS, STORAGE_OPTIONS, CONDITION_OPTIONS, COLOR_OPTIONS } from '../constants/iphoneData';
import { formatCurrency } from '../utils/formatters';

interface ModalAddStockProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialItem?: StockItem | null;
}

export const ModalAddStock: React.FC<ModalAddStockProps> = ({
  visible,
  onClose,
  onSave,
  initialItem,
}) => {
  const [model, setModel] = useState<string>(IPHONE_MODELS[0]);
  const [storage, setStorage] = useState<StorageCapacity>('128GB');
  const [color, setColor] = useState<string>(COLOR_OPTIONS[0]);
  const [batteryHealth, setBatteryHealth] = useState<string>('100');
  const [condition, setCondition] = useState<iPhoneCondition>('Novo / Lacrado');
  const [imei, setImei] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [supplier, setSupplier] = useState<string>('');
  const [status, setStatus] = useState<StockStatus>('disponivel');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialItem) {
      setModel(initialItem.model);
      setStorage(initialItem.storage);
      setColor(initialItem.color);
      setBatteryHealth(initialItem.batteryHealth.toString());
      setCondition(initialItem.condition);
      setImei(initialItem.imei);
      setCostPrice(initialItem.costPrice.toString());
      setSalePrice(initialItem.salePrice.toString());
      setSupplier(initialItem.supplier || '');
      setStatus(initialItem.status);
      setNotes(initialItem.notes || '');
    } else {
      setModel(IPHONE_MODELS[0]);
      setStorage('128GB');
      setColor(COLOR_OPTIONS[0]);
      setBatteryHealth('100');
      setCondition('Novo / Lacrado');
      setImei('');
      setCostPrice('');
      setSalePrice('');
      setSupplier('');
      setStatus('disponivel');
      setNotes('');
    }
  }, [initialItem, visible]);

  const numCost = parseFloat(costPrice.replace(',', '.')) || 0;
  const numSale = parseFloat(salePrice.replace(',', '.')) || 0;
  const estimatedProfit = numSale - numCost;

  const handleSave = () => {
    if (!model.trim()) {
      Alert.alert('Atenção', 'Selecione o modelo do iPhone.');
      return;
    }
    if (!salePrice) {
      Alert.alert('Atenção', 'Informe o preço de venda pretendido.');
      return;
    }

    const numBattery = parseInt(batteryHealth, 10) || 100;

    onSave({
      model,
      storage,
      color,
      batteryHealth: Math.min(100, Math.max(50, numBattery)),
      condition,
      imei: imei.trim(),
      costPrice: numCost,
      salePrice: numSale,
      supplier: supplier.trim() || undefined,
      status,
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
              {initialItem ? 'Editar iPhone no Estoque' : 'Novo iPhone no Estoque'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Model Selection */}
            <Text style={styles.sectionLabel}>Modelo do iPhone *</Text>
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
            <Text style={styles.sectionLabel}>Capacidade de Armazenamento</Text>
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
                  onPress={() => {
                    setCondition(c);
                    if (c === 'Novo / Lacrado') setBatteryHealth('100');
                  }}
                >
                  <Text style={[styles.condOptionText, condition === c && styles.condOptionTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color */}
            <Text style={styles.sectionLabel}>Cor</Text>
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

            {/* Battery & IMEI */}
            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <Text style={styles.sectionLabel}>Saúde Bateria (%)</Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="battery-charging-outline" size={18} color={Colors.primaryLight} />
                  <TextInput
                    style={styles.inputField}
                    keyboardType="numeric"
                    placeholder="100"
                    placeholderTextColor={Colors.textMuted}
                    value={batteryHealth}
                    onChangeText={setBatteryHealth}
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={styles.col}>
                <Text style={styles.sectionLabel}>IMEI / Serial</Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="barcode-outline" size={18} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.inputField}
                    placeholder="15 dígitos"
                    placeholderTextColor={Colors.textMuted}
                    value={imei}
                    onChangeText={setImei}
                    maxLength={20}
                  />
                </View>
              </View>
            </View>

            {/* Prices */}
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
                <Text style={styles.sectionLabel}>Preço de Venda (R$) *</Text>
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

            {/* Live Profit Preview */}
            <View style={styles.profitBanner}>
              <Text style={styles.profitBannerLabel}>Margem de Lucro Estimada:</Text>
              <Text
                style={[
                  styles.profitBannerValue,
                  { color: estimatedProfit >= 0 ? Colors.success : Colors.danger },
                ]}
              >
                {formatCurrency(estimatedProfit)}
              </Text>
            </View>

            {/* Supplier & Status */}
            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <Text style={styles.sectionLabel}>Fornecedor</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Miami Imports"
                  placeholderTextColor={Colors.textMuted}
                  value={supplier}
                  onChangeText={setSupplier}
                />
              </View>

              <View style={styles.col}>
                <Text style={styles.sectionLabel}>Status Inicial</Text>
                <View style={styles.statusRow}>
                  <TouchableOpacity
                    style={[styles.statusChoice, status === 'disponivel' && styles.statusChoiceActive]}
                    onPress={() => setStatus('disponivel')}
                  >
                    <Text style={[styles.statusChoiceText, status === 'disponivel' && styles.statusChoiceTextActive]}>
                      Disponível
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusChoice, status === 'reservado' && styles.statusChoiceActive]}
                    onPress={() => setStatus('reservado')}
                  >
                    <Text style={[styles.statusChoiceText, status === 'reservado' && styles.statusChoiceTextActive]}>
                      Reservado
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Notes */}
            <Text style={styles.sectionLabel}>Observações adicionais</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Acompanha caixa original, cabo e fonte..."
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
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Salvar no Estoque</Text>
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
  profitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceCard,
    padding: 12,
    borderRadius: 10,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  profitBannerLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  profitBannerValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 6,
    height: 44,
  },
  statusChoice: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusChoiceActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  statusChoiceText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusChoiceTextActive: {
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
