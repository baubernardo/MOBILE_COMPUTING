import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { Colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatters';

interface DashboardScreenProps {
  onNavigateToTab: (tab: 'stock' | 'orders' | 'sales') => void;
  onOpenAddStock: () => void;
  onOpenAddOrder: () => void;
  onOpenSale: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToTab,
  onOpenAddStock,
  onOpenAddOrder,
  onOpenSale,
}) => {
  const { stock, orders, sales, metrics, resetToInitialDemo } = useApp();

  // Calculate top models in stock
  const modelDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    const active = stock.filter(s => s.status !== 'vendido');
    active.forEach(item => {
      counts[item.model] = (counts[item.model] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [stock]);

  // Battery health distribution
  const batteryStats = useMemo(() => {
    const active = stock.filter(s => s.status !== 'vendido');
    const b100 = active.filter(s => s.batteryHealth === 100).length;
    const b90plus = active.filter(s => s.batteryHealth >= 90 && s.batteryHealth < 100).length;
    const bBelow90 = active.filter(s => s.batteryHealth < 90).length;
    return { b100, b90plus, bBelow90, total: active.length };
  }, [stock]);

  const handleResetDemo = () => {
    Alert.alert(
      'Restaurar Dados de Exemplo',
      'Deseja restaurar a base para os dados de demonstração iniciais?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restaurar', style: 'destructive', onPress: resetToInitialDemo },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        subtitle="Visão Geral & Indicadores"
        secondaryActionIcon="refresh-outline"
        onSecondaryAction={handleResetDemo}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Quick Action Bar */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary }]}
            onPress={onOpenAddStock}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={20} color={Colors.primaryLight} />
            <Text style={[styles.quickActionText, { color: Colors.primaryLight }]}>+ iPhone</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: Colors.purpleMuted, borderColor: Colors.purple }]}
            onPress={onOpenAddOrder}
            activeOpacity={0.7}
          >
            <Ionicons name="bag-add" size={20} color={Colors.purple} />
            <Text style={[styles.quickActionText, { color: Colors.purple }]}>+ Encomenda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: Colors.successMuted, borderColor: Colors.success }]}
            onPress={onOpenSale}
            activeOpacity={0.7}
          >
            <Ionicons name="cart" size={20} color={Colors.success} />
            <Text style={[styles.quickActionText, { color: Colors.success }]}>+ Venda</Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Estoque & Valuation */}
        <Text style={styles.sectionHeader}>Patrimônio em Estoque</Text>
        <View style={styles.grid2Col}>
          <StatCard
            title="Valor de Venda"
            value={formatCurrency(metrics.totalStockValue)}
            subtitle={`${metrics.totalStockItems} aparelhos disponíveis`}
            icon="logo-apple"
            variant="primary"
            onPress={() => onNavigateToTab('stock')}
          />
          <StatCard
            title="Lucro Projetado"
            value={formatCurrency(metrics.projectedProfit)}
            subtitle={`Custo: ${formatCurrency(metrics.totalStockCost)}`}
            icon="trending-up"
            variant="gold"
            onPress={() => onNavigateToTab('stock')}
          />
        </View>

        {/* Section 2: Vendas & Lucro Realizado */}
        <Text style={styles.sectionHeader}>Performance de Vendas</Text>
        <View style={styles.grid2Col}>
          <StatCard
            title="Lucro Realizado"
            value={formatCurrency(metrics.totalRealizedProfit)}
            subtitle={`Fat: ${formatCurrency(metrics.totalSalesRevenue)}`}
            icon="checkmark-circle"
            variant="success"
            onPress={() => onNavigateToTab('sales')}
          />
          <StatCard
            title="Sinais de Encomendas"
            value={formatCurrency(metrics.totalDepositsHeld)}
            subtitle={`${metrics.activeOrdersCount} pedidos ativos`}
            icon="time"
            variant="purple"
            onPress={() => onNavigateToTab('orders')}
          />
        </View>

        {/* Section 3: Model Distribution in Stock */}
        <View style={styles.cardSection}>
          <View style={styles.cardSectionHeader}>
            <Ionicons name="pie-chart-outline" size={18} color={Colors.primaryLight} />
            <Text style={styles.cardSectionTitle}>Modelos em Estoque</Text>
          </View>

          {modelDistribution.length === 0 ? (
            <Text style={styles.emptyCardText}>Nenhum modelo no estoque atualmente.</Text>
          ) : (
            modelDistribution.map(([modelName, count]) => {
              const percentage = Math.round((count / (metrics.totalStockItems || 1)) * 100);
              return (
                <View key={modelName} style={styles.barItem}>
                  <View style={styles.barItemHeader}>
                    <Text style={styles.barModelName}>{modelName}</Text>
                    <Text style={styles.barCount}>
                      {count} un ({percentage}%)
                    </Text>
                  </View>
                  <View style={styles.barBackground}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.max(5, Math.min(100, percentage))}%` },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Section 4: Battery Health Distribution */}
        <View style={styles.cardSection}>
          <View style={styles.cardSectionHeader}>
            <Ionicons name="battery-charging-outline" size={18} color={Colors.success} />
            <Text style={styles.cardSectionTitle}>Qualidade da Bateria (Estoque)</Text>
          </View>

          <View style={styles.batteryRow}>
            <View style={[styles.batteryBadgeBox, { borderColor: Colors.success }]}>
              <Text style={[styles.batteryBadgeVal, { color: Colors.success }]}>
                {batteryStats.b100}
              </Text>
              <Text style={styles.batteryBadgeLabel}>100% / Lacrados</Text>
            </View>

            <View style={[styles.batteryBadgeBox, { borderColor: Colors.primary }]}>
              <Text style={[styles.batteryBadgeVal, { color: Colors.primaryLight }]}>
                {batteryStats.b90plus}
              </Text>
              <Text style={styles.batteryBadgeLabel}>90% a 99%</Text>
            </View>

            <View style={[styles.batteryBadgeBox, { borderColor: Colors.warning }]}>
              <Text style={[styles.batteryBadgeVal, { color: Colors.warning }]}>
                {batteryStats.bBelow90}
              </Text>
              <Text style={styles.batteryBadgeLabel}>Abaixo de 90%</Text>
            </View>
          </View>
        </View>

        {/* Bottom footer button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetDemo}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={16} color={Colors.textMuted} />
          <Text style={styles.resetButtonText}>Recarregar Dados de Demonstração</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
  },
  quickActionText: {
    fontWeight: '700',
    fontSize: 12,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 6,
  },
  grid2Col: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  cardSection: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyCardText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  barItem: {
    marginBottom: 12,
  },
  barItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  barModelName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  barCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  barBackground: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  batteryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  batteryBadgeBox: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  batteryBadgeVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  batteryBadgeLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    marginTop: 10,
  },
  resetButtonText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
