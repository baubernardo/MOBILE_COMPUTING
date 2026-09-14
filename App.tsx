import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider, useApp } from './src/context/AppContext';
import { StockScreen } from './src/screens/StockScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { SalesScreen } from './src/screens/SalesScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ModalAddStock } from './src/components/ModalAddStock';
import { ModalAddOrder } from './src/components/ModalAddOrder';
import { ModalRegisterSale } from './src/components/ModalRegisterSale';
import { Colors } from './src/theme/colors';

type TabType = 'stock' | 'orders' | 'sales' | 'dashboard';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('stock');
  const { stock, orders, addStockItem, addPreOrderItem, registerSale } = useApp();

  // Quick modals state from Dashboard shortcuts
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [isRegisterSaleOpen, setIsRegisterSaleOpen] = useState(false);

  // Badge counts
  const availableStockCount = stock.filter(s => s.status !== 'vendido').length;
  const activeOrdersCount = orders.filter(
    o => o.status === 'pendente' || o.status === 'a_caminho' || o.status === 'recebido'
  ).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* Screen Content */}
      <View style={styles.content}>
        {activeTab === 'stock' && <StockScreen />}
        {activeTab === 'orders' && <OrdersScreen />}
        {activeTab === 'sales' && <SalesScreen />}
        {activeTab === 'dashboard' && (
          <DashboardScreen
            onNavigateToTab={tab => {
              if (tab === 'stock') setActiveTab('stock');
              else if (tab === 'orders') setActiveTab('orders');
              else if (tab === 'sales') setActiveTab('sales');
            }}
            onOpenAddStock={() => setIsAddStockOpen(true)}
            onOpenAddOrder={() => setIsAddOrderOpen(true)}
            onOpenSale={() => setIsRegisterSaleOpen(true)}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        {/* Tab 1: Estoque */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('stock')}
          activeOpacity={0.7}
        >
          <View>
            <Ionicons
              name={activeTab === 'stock' ? 'phone-portrait' : 'phone-portrait-outline'}
              size={22}
              color={activeTab === 'stock' ? Colors.primary : Colors.textMuted}
            />
            {availableStockCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{availableStockCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, activeTab === 'stock' && styles.tabLabelActive]}>
            Estoque
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Encomendas */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('orders')}
          activeOpacity={0.7}
        >
          <View>
            <Ionicons
              name={activeTab === 'orders' ? 'cube' : 'cube-outline'}
              size={22}
              color={activeTab === 'orders' ? Colors.purple : Colors.textMuted}
            />
            {activeOrdersCount > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: Colors.purple }]}>
                <Text style={styles.tabBadgeText}>{activeOrdersCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, activeTab === 'orders' && styles.tabLabelActivePurple]}>
            Encomendas
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Vendas */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('sales')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'sales' ? 'cart' : 'cart-outline'}
            size={22}
            color={activeTab === 'sales' ? Colors.success : Colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 'sales' && styles.tabLabelActiveSuccess]}>
            Vendas
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Dashboard */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('dashboard')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'dashboard' ? 'stats-chart' : 'stats-chart-outline'}
            size={22}
            color={activeTab === 'dashboard' ? Colors.gold : Colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActiveGold]}>
            Dashboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Global Modals for Quick Actions */}
      <ModalAddStock
        visible={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        onSave={item => addStockItem(item)}
      />

      <ModalAddOrder
        visible={isAddOrderOpen}
        onClose={() => setIsAddOrderOpen(false)}
        onSave={order => addPreOrderItem(order)}
      />

      <ModalRegisterSale
        visible={isRegisterSaleOpen}
        availableStock={stock}
        onClose={() => setIsRegisterSaleOpen(false)}
        onSave={(sale, options) => registerSale(sale, options)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 4 : 8,
    height: Platform.OS === 'ios' ? 62 : 64,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 3,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabLabelActivePurple: {
    color: Colors.purple,
    fontWeight: '700',
  },
  tabLabelActiveSuccess: {
    color: Colors.success,
    fontWeight: '700',
  },
  tabLabelActiveGold: {
    color: Colors.gold,
    fontWeight: '700',
  },
  tabBadge: {
    position: 'absolute',
    top: -3,
    right: -10,
    backgroundColor: Colors.primary,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
