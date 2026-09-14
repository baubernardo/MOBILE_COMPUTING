import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { StockCard } from '../components/StockCard';
import { SegmentedFilter } from '../components/SegmentedFilter';
import { ModalAddStock } from '../components/ModalAddStock';
import { ModalRegisterSale } from '../components/ModalRegisterSale';
import { ModalItemDetails } from '../components/ModalItemDetails';
import { StockItem, StockStatus, iPhoneCondition } from '../types';
import { Colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatters';

type FilterStatus = 'all' | StockStatus;

export const StockScreen: React.FC = () => {
  const { stock, addStockItem, updateStockItem, deleteStockItem, registerSale } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [sellingItem, setSellingItem] = useState<StockItem | null>(null);
  const [detailsItem, setDetailsItem] = useState<StockItem | null>(null);

  // Filtered List
  const filteredStock = useMemo(() => {
    return stock.filter(item => {
      // Search query (model, imei, color, notes, supplier)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.model.toLowerCase().includes(q) ||
        (item.imei && item.imei.toLowerCase().includes(q)) ||
        item.color.toLowerCase().includes(q) ||
        (item.supplier && item.supplier.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      // Status filter
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

      // Condition filter
      const matchesCondition =
        selectedCondition === 'all' ||
        (selectedCondition === 'lacrado' && item.condition === 'Novo / Lacrado') ||
        (selectedCondition === 'seminovo' && item.condition !== 'Novo / Lacrado');

      return matchesSearch && matchesStatus && matchesCondition;
    });
  }, [stock, searchQuery, selectedStatus, selectedCondition]);

  // Counts for status tabs
  const statusCounts = useMemo(() => {
    return {
      all: stock.length,
      disponivel: stock.filter(s => s.status === 'disponivel').length,
      reservado: stock.filter(s => s.status === 'reservado').length,
      vendido: stock.filter(s => s.status === 'vendido').length,
    };
  }, [stock]);

  // Inventory value of displayed items
  const activeStockValue = useMemo(() => {
    const active = stock.filter(s => s.status !== 'vendido');
    const totalVal = active.reduce((acc, i) => acc + (i.salePrice || 0), 0);
    const totalCost = active.reduce((acc, i) => acc + (i.costPrice || 0), 0);
    return {
      totalVal,
      totalCost,
      profit: totalVal - totalCost,
      count: active.length,
    };
  }, [stock]);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Remover do Estoque',
      'Tem certeza de que deseja remover este iPhone do estoque?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => deleteStockItem(id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="Estoque Atual"
        subtitle={`${activeStockValue.count} iPhones prontos para venda`}
        badgeCount={activeStockValue.count}
        rightActionLabel="+ iPhone"
        onRightAction={() => {
          setEditingItem(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por modelo, IMEI, cor, fornecedor..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Segmented Status Filter */}
      <SegmentedFilter<FilterStatus>
        options={[
          { id: 'all', label: 'Todos', count: statusCounts.all },
          { id: 'disponivel', label: 'Disponíveis', count: statusCounts.disponivel },
          { id: 'reservado', label: 'Reservados', count: statusCounts.reservado },
          { id: 'vendido', label: 'Vendidos', count: statusCounts.vendido },
        ]}
        selectedId={selectedStatus}
        onSelect={setSelectedStatus}
      />

      {/* Quick Condition Pills */}
      <View style={styles.conditionFilterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.conditionScroll}>
          {[
            { id: 'all', label: 'Todas Condições' },
            { id: 'lacrado', label: '✨ Lacrados' },
            { id: 'seminovo', label: '📱 Seminovos' },
          ].map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.condChip, selectedCondition === c.id && styles.condChipActive]}
              onPress={() => setSelectedCondition(c.id)}
            >
              <Text style={[styles.condChipText, selectedCondition === c.id && styles.condChipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stock Summary Mini Banner */}
      <View style={styles.summaryBanner}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Valor em Estoque</Text>
          <Text style={styles.summaryValue}>{formatCurrency(activeStockValue.totalVal)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Lucro Previsto</Text>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>
            +{formatCurrency(activeStockValue.profit)}
          </Text>
        </View>
      </View>

      {/* Stock List */}
      <FlatList
        data={filteredStock}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <StockCard
            item={item}
            onPress={() => setDetailsItem(item)}
            onSell={() => setSellingItem(item)}
            onEdit={() => {
              setEditingItem(item);
              setIsAddModalOpen(true);
            }}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="phone-portrait-outline" size={36} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Nenhum iPhone encontrado</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Tente ajustar os termos de busca ou filtros.'
                : 'Cadastre seu primeiro aparelho no botão "+ iPhone" acima.'}
            </Text>
          </View>
        }
      />

      {/* Modals */}
      <ModalAddStock
        visible={isAddModalOpen}
        initialItem={editingItem}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={itemData => {
          if (editingItem) {
            updateStockItem({ ...editingItem, ...itemData });
          } else {
            addStockItem(itemData);
          }
        }}
      />

      <ModalRegisterSale
        visible={!!sellingItem}
        initialStockItem={sellingItem}
        onClose={() => setSellingItem(null)}
        onSave={(saleData, options) => {
          registerSale(saleData, options);
        }}
      />

      <ModalItemDetails
        visible={!!detailsItem}
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onSell={item => setSellingItem(item)}
        onEdit={item => {
          setEditingItem(item);
          setIsAddModalOpen(true);
        }}
        onDelete={id => handleDelete(id)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
    marginLeft: 8,
  },
  conditionFilterRow: {
    marginVertical: 4,
  },
  conditionScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  condChip: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  condChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  condChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  condChipTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  summaryBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 12,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  listContainer: {
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
