import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { OrderCard } from '../components/OrderCard';
import { SegmentedFilter } from '../components/SegmentedFilter';
import { ModalAddOrder } from '../components/ModalAddOrder';
import { ModalRegisterSale } from '../components/ModalRegisterSale';
import { PreOrderItem, OrderStatus } from '../types';
import { Colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatters';

type FilterOrderStatus = 'all' | OrderStatus;

export const OrdersScreen: React.FC = () => {
  const {
    orders,
    addPreOrderItem,
    updatePreOrderItem,
    updateOrderStatus,
    deletePreOrderItem,
    convertOrderToStock,
    registerSale,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<FilterOrderStatus>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<PreOrderItem | null>(null);
  const [completingOrder, setCompletingOrder] = useState<PreOrderItem | null>(null);

  // Filtered list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.customerName.toLowerCase().includes(q) ||
        (order.customerPhone && order.customerPhone.toLowerCase().includes(q)) ||
        order.model.toLowerCase().includes(q) ||
        order.color.toLowerCase().includes(q) ||
        (order.notes && order.notes.toLowerCase().includes(q));

      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, selectedStatus]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pendente: orders.filter(o => o.status === 'pendente').length,
      a_caminho: orders.filter(o => o.status === 'a_caminho').length,
      recebido: orders.filter(o => o.status === 'recebido').length,
      entregue: orders.filter(o => o.status === 'entregue').length,
    };
  }, [orders]);

  // Financial summary of active orders
  const activeOrdersSummary = useMemo(() => {
    const active = orders.filter(o => o.status !== 'entregue' && o.status !== 'cancelado');
    const totalDeposits = active.reduce((acc, o) => acc + (o.depositPaid || 0), 0);
    const totalRemaining = active.reduce((acc, o) => acc + (o.remainingAmount || 0), 0);
    const totalExpected = active.reduce((acc, o) => acc + (o.agreedPrice || 0), 0);
    return {
      totalDeposits,
      totalRemaining,
      totalExpected,
      count: active.length,
    };
  }, [orders]);

  const handleReceiveStock = (order: PreOrderItem) => {
    Alert.prompt
      ? Alert.prompt(
          'Receber Aparelho no Estoque',
          `Informe o IMEI do ${order.model} recebido para vinculá-lo ao estoque:`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Confirmar Entrada',
              onPress: (imeiInput?: string) => {
                convertOrderToStock(
                  order,
                  imeiInput || 'IMEI-RECEBIDO',
                  order.depositPaid > 0 ? order.agreedPrice * 0.75 : order.agreedPrice * 0.8,
                  100
                );
                Alert.alert('Sucesso', 'Aparelho adicionado ao estoque reservado!');
              },
            },
          ],
          'plain-text',
          ''
        )
      : Alert.alert(
          'Confirmar Chegada',
          `Deseja marcar o ${order.model} de ${order.customerName} como recebido e transferir para o estoque?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sim, Receber',
              onPress: () => {
                convertOrderToStock(
                  order,
                  'IMEI-RECEBIDO',
                  order.agreedPrice * 0.75,
                  100
                );
              },
            },
          ]
        );
  };

  const handleStatusChange = (order: PreOrderItem) => {
    Alert.alert(
      'Alterar Status da Encomenda',
      `Cliente: ${order.customerName}`,
      [
        { text: 'Pendente', onPress: () => updateOrderStatus(order.id, 'pendente') },
        { text: 'A Caminho (Em Trânsito)', onPress: () => updateOrderStatus(order.id, 'a_caminho') },
        { text: 'No Estoque (Chegou)', onPress: () => updateOrderStatus(order.id, 'recebido') },
        { text: 'Entregue / Concluído', onPress: () => updateOrderStatus(order.id, 'entregue') },
        {
          text: 'Cancelar Pedido',
          style: 'destructive',
          onPress: () => updateOrderStatus(order.id, 'cancelado'),
        },
        { text: 'Voltar', style: 'cancel' },
      ]
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert('Excluir Encomenda', 'Tem certeza de que deseja remover esta encomenda?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deletePreOrderItem(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Encomendas"
        subtitle={`${activeOrdersSummary.count} pedidos em andamento`}
        badgeCount={activeOrdersSummary.count}
        rightActionLabel="+ Pedido"
        onRightAction={() => {
          setEditingOrder(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cliente, WhatsApp, modelo ou rastreio..."
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

      {/* Segmented Filter */}
      <SegmentedFilter<FilterOrderStatus>
        scrollable
        options={[
          { id: 'all', label: 'Todas', count: counts.all },
          { id: 'pendente', label: 'Pendentes', count: counts.pendente },
          { id: 'a_caminho', label: 'A Caminho', count: counts.a_caminho },
          { id: 'recebido', label: 'No Estoque', count: counts.recebido },
          { id: 'entregue', label: 'Entregues', count: counts.entregue },
        ]}
        selectedId={selectedStatus}
        onSelect={setSelectedStatus}
      />

      {/* Financial Summary */}
      <View style={styles.summaryBanner}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Sinais Retidos</Text>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>
            {formatCurrency(activeOrdersSummary.totalDeposits)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Saldo a Receber</Text>
          <Text style={[styles.summaryValue, { color: Colors.warning }]}>
            {formatCurrency(activeOrdersSummary.totalRemaining)}
          </Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => {
              setEditingOrder(item);
              setIsAddModalOpen(true);
            }}
            onReceiveStock={() => handleReceiveStock(item)}
            onCompleteSale={() => setCompletingOrder(item)}
            onStatusChange={() => handleStatusChange(item)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="cube-outline" size={36} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma encomenda encontrada</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Nenhum pedido bate com a busca.'
                : 'Registre os pedidos e adiantamentos de clientes no botão "+ Pedido".'}
            </Text>
          </View>
        }
      />

      {/* Modals */}
      <ModalAddOrder
        visible={isAddModalOpen}
        initialOrder={editingOrder}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={orderData => {
          if (editingOrder) {
            updatePreOrderItem({ ...editingOrder, ...orderData, remainingAmount: orderData.agreedPrice - orderData.depositPaid });
          } else {
            addPreOrderItem(orderData);
          }
        }}
      />

      <ModalRegisterSale
        visible={!!completingOrder}
        initialOrderItem={completingOrder}
        onClose={() => setCompletingOrder(null)}
        onSave={(saleData, options) => {
          registerSale(saleData, options);
        }}
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
  summaryBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    marginHorizontal: 20,
    marginTop: 4,
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
