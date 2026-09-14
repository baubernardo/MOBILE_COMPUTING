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
import { SaleCard } from '../components/SaleCard';
import { StatCard } from '../components/StatCard';
import { ModalRegisterSale } from '../components/ModalRegisterSale';
import { Colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatters';

export const SalesScreen: React.FC = () => {
  const { sales, stock, registerSale, deleteSale } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        sale.customerName.toLowerCase().includes(q) ||
        (sale.customerPhone && sale.customerPhone.toLowerCase().includes(q)) ||
        sale.model.toLowerCase().includes(q) ||
        (sale.imei && sale.imei.toLowerCase().includes(q)) ||
        sale.color.toLowerCase().includes(q)
      );
    });
  }, [sales, searchQuery]);

  // Overall Financial Metrics
  const salesSummary = useMemo(() => {
    const totalRev = sales.reduce((acc, s) => acc + (s.salePrice || 0), 0);
    const totalProf = sales.reduce((acc, s) => acc + (s.profit || 0), 0);
    const avgTicket = sales.length > 0 ? totalRev / sales.length : 0;
    return {
      totalRev,
      totalProf,
      avgTicket,
      count: sales.length,
    };
  }, [sales]);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Remover Venda',
      'Deseja remover este registro de venda do histórico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => deleteSale(id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Vendas & Lucro"
        subtitle={`${salesSummary.count} vendas registradas`}
        badgeCount={salesSummary.count}
        rightActionLabel="+ Venda"
        onRightAction={() => setIsRegisterModalOpen(true)}
      />

      {/* Stats summary cards */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Faturamento"
          value={formatCurrency(salesSummary.totalRev)}
          icon="cash-outline"
          variant="primary"
          compact
        />
        <StatCard
          title="Lucro Realizado"
          value={formatCurrency(salesSummary.totalProf)}
          icon="trending-up-outline"
          variant="success"
          compact
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente, modelo, IMEI..."
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

      {/* Sales List */}
      <FlatList
        data={filteredSales}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SaleCard
            sale={item}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="receipt-outline" size={36} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma venda registrada</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Nenhuma venda encontrada para esta busca.'
                : 'Registre suas vendas ou dê baixa em iPhones do estoque.'}
            </Text>
          </View>
        }
      />

      {/* Modal */}
      <ModalRegisterSale
        visible={isRegisterModalOpen}
        availableStock={stock}
        onClose={() => setIsRegisterModalOpen(false)}
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
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
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
