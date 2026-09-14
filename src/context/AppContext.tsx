import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { StockItem, PreOrderItem, SaleItem, DashboardMetrics, OrderStatus, StockStatus } from '../types';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';

export type BackendMode = 'api' | 'offline';

interface AppContextData {
  stock: StockItem[];
  orders: PreOrderItem[];
  sales: SaleItem[];
  isLoading: boolean;
  metrics: DashboardMetrics;
  backendMode: BackendMode;
  isOnline: boolean;
  
  // Stock operations
  addStockItem: (item: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StockItem>;
  updateStockItem: (item: StockItem) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
  
  // Order operations
  addPreOrderItem: (item: Omit<PreOrderItem, 'id' | 'createdAt' | 'updatedAt' | 'remainingAmount'>) => Promise<PreOrderItem>;
  updatePreOrderItem: (item: PreOrderItem) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deletePreOrderItem: (id: string) => Promise<void>;
  convertOrderToStock: (order: PreOrderItem, imei: string, costPrice: number, batteryHealth: number) => Promise<StockItem>;
  
  // Sales operations
  registerSale: (
    sale: Omit<SaleItem, 'id' | 'profit'>,
    options?: { stockItemId?: string; orderId?: string }
  ) => Promise<SaleItem>;
  deleteSale: (id: string) => Promise<void>;
  
  // Utility
  reloadAllData: () => Promise<void>;
  resetToInitialDemo: () => Promise<void>;
  checkBackendConnection: () => Promise<boolean>;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [orders, setOrders] = useState<PreOrderItem[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendMode, setBackendMode] = useState<BackendMode>('offline');

  const checkBackendConnection = useCallback(async (): Promise<boolean> => {
    try {
      const isAvailable = await ApiService.checkHealth();
      setBackendMode(isAvailable ? 'api' : 'offline');
      return isAvailable;
    } catch {
      setBackendMode('offline');
      return false;
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Tenta conectar à API PostgreSQL
      const hasApi = await ApiService.checkHealth();
      
      if (hasApi) {
        setBackendMode('api');
        const [stockData, ordersData, salesData] = await Promise.all([
          ApiService.getStock(),
          ApiService.getOrders(),
          ApiService.getSales(),
        ]);
        setStock(stockData);
        setOrders(ordersData);
        setSales(salesData);

        // Atualiza cache offline
        StorageService.saveStock(stockData).catch(() => {});
        StorageService.saveOrders(ordersData).catch(() => {});
        StorageService.saveSales(salesData).catch(() => {});
      } else {
        // 2. Fallback gracioso para armazenamento local (AsyncStorage)
        setBackendMode('offline');
        const localData = await StorageService.initData();
        setStock(localData.stock);
        setOrders(localData.orders);
        setSales(localData.sales);
      }
    } catch (error) {
      console.warn('[AppContext] Falha ao sincronizar com backend, usando armazenamento local:', error);
      setBackendMode('offline');
      const localData = await StorageService.initData();
      setStock(localData.stock);
      setOrders(localData.orders);
      setSales(localData.sales);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute Dashboard Metrics localmente ou via API
  const metrics: DashboardMetrics = useMemo(() => {
    const availableStock = stock.filter(item => item.status !== 'vendido');
    const totalStockItems = availableStock.length;
    const totalStockCost = availableStock.reduce((acc, item) => acc + (item.costPrice || 0), 0);
    const totalStockValue = availableStock.reduce((acc, item) => acc + (item.salePrice || 0), 0);
    const projectedProfit = totalStockValue - totalStockCost;

    const activeOrders = orders.filter(
      order => order.status === 'pendente' || order.status === 'a_caminho' || order.status === 'recebido'
    );
    const activeOrdersCount = activeOrders.length;
    const totalDepositsHeld = activeOrders.reduce((acc, order) => acc + (order.depositPaid || 0), 0);

    const totalSalesCount = sales.length;
    const totalSalesRevenue = sales.reduce((acc, sale) => acc + (sale.salePrice || 0), 0);
    const totalRealizedProfit = sales.reduce((acc, sale) => acc + (sale.profit || 0), 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    const monthSalesRevenue = monthSales.reduce((acc, sale) => acc + (sale.salePrice || 0), 0);
    const monthRealizedProfit = monthSales.reduce((acc, sale) => acc + (sale.profit || 0), 0);

    return {
      totalStockItems,
      totalStockCost,
      totalStockValue,
      projectedProfit,
      activeOrdersCount,
      totalDepositsHeld,
      totalSalesCount,
      totalSalesRevenue,
      totalRealizedProfit,
      monthSalesRevenue,
      monthRealizedProfit,
    };
  }, [stock, orders, sales]);

  // --------------------------------------------------------------------------
  // OPERAÇÕES DE ESTOQUE
  // --------------------------------------------------------------------------
  const addStockItem = async (itemData: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<StockItem> => {
    if (backendMode === 'api') {
      try {
        const created = await ApiService.addStock(itemData);
        setStock(prev => [created, ...prev]);
        return created;
      } catch (err) {
        console.error('Erro na API ao adicionar estoque, salvando localmente:', err);
      }
    }

    const newItem: StockItem = {
      ...itemData,
      id: `stock-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...stock];
    setStock(updated);
    await StorageService.saveStock(updated);
    return newItem;
  };

  const updateStockItem = async (updatedItem: StockItem): Promise<void> => {
    if (backendMode === 'api') {
      try {
        await ApiService.updateStock(updatedItem);
        setStock(prev => prev.map(item => (item.id === updatedItem.id ? updatedItem : item)));
        return;
      } catch (err) {
        console.error('Erro na API ao atualizar estoque:', err);
      }
    }

    const updated = stock.map(item =>
      item.id === updatedItem.id ? { ...updatedItem, updatedAt: new Date().toISOString() } : item
    );
    setStock(updated);
    await StorageService.saveStock(updated);
  };

  const deleteStockItem = async (id: string): Promise<void> => {
    if (backendMode === 'api') {
      try {
        await ApiService.deleteStock(id);
        setStock(prev => prev.filter(item => item.id !== id));
        return;
      } catch (err) {
        console.error('Erro na API ao remover estoque:', err);
      }
    }

    const updated = stock.filter(item => item.id !== id);
    setStock(updated);
    await StorageService.saveStock(updated);
  };

  // --------------------------------------------------------------------------
  // OPERAÇÕES DE ENCOMENDAS
  // --------------------------------------------------------------------------
  const addPreOrderItem = async (
    itemData: Omit<PreOrderItem, 'id' | 'createdAt' | 'updatedAt' | 'remainingAmount'>
  ): Promise<PreOrderItem> => {
    if (backendMode === 'api') {
      try {
        const created = await ApiService.addOrder(itemData);
        setOrders(prev => [created, ...prev]);
        return created;
      } catch (err) {
        console.error('Erro na API ao adicionar encomenda:', err);
      }
    }

    const remainingAmount = Math.max(0, (itemData.agreedPrice || 0) - (itemData.depositPaid || 0));
    const newOrder: PreOrderItem = {
      ...itemData,
      remainingAmount,
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    await StorageService.saveOrders(updated);
    return newOrder;
  };

  const updatePreOrderItem = async (updatedOrder: PreOrderItem): Promise<void> => {
    if (backendMode === 'api') {
      try {
        await ApiService.updateOrder(updatedOrder);
        setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
        return;
      } catch (err) {
        console.error('Erro na API ao atualizar encomenda:', err);
      }
    }

    const remainingAmount = Math.max(0, (updatedOrder.agreedPrice || 0) - (updatedOrder.depositPaid || 0));
    const updated = orders.map(order =>
      order.id === updatedOrder.id
        ? { ...updatedOrder, remainingAmount, updatedAt: new Date().toISOString() }
        : order
    );
    setOrders(updated);
    await StorageService.saveOrders(updated);
  };

  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    if (backendMode === 'api') {
      try {
        await ApiService.updateOrderStatus(id, status);
        setOrders(prev =>
          prev.map(order => (order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order))
        );
        return;
      } catch (err) {
        console.error('Erro na API ao atualizar status:', err);
      }
    }

    const updated = orders.map(order =>
      order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order
    );
    setOrders(updated);
    await StorageService.saveOrders(updated);
  };

  const deletePreOrderItem = async (id: string): Promise<void> => {
    if (backendMode === 'api') {
      try {
        await ApiService.deleteOrder(id);
        setOrders(prev => prev.filter(order => order.id !== id));
        return;
      } catch (err) {
        console.error('Erro na API ao remover encomenda:', err);
      }
    }

    const updated = orders.filter(order => order.id !== id);
    setOrders(updated);
    await StorageService.saveOrders(updated);
  };

  const convertOrderToStock = async (
    order: PreOrderItem,
    imei: string,
    costPrice: number,
    batteryHealth: number
  ): Promise<StockItem> => {
    if (backendMode === 'api') {
      try {
        const result = await ApiService.convertOrderToStock(order.id, imei, costPrice, batteryHealth);
        setStock(prev => [result.stockItem, ...prev]);
        setOrders(prev =>
          prev.map(o =>
            o.id === order.id
              ? { ...o, status: 'recebido' as OrderStatus, linkedStockId: result.stockItem.id, updatedAt: new Date().toISOString() }
              : o
          )
        );
        return result.stockItem;
      } catch (err) {
        console.error('Erro na API ao converter encomenda:', err);
      }
    }

    const newStockItem: StockItem = {
      id: `stock-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      model: order.model,
      storage: order.storage,
      color: order.color,
      batteryHealth,
      condition: order.condition,
      imei: imei || 'SEM-IMEI',
      costPrice,
      salePrice: order.agreedPrice,
      supplier: order.supplier,
      status: 'reservado',
      notes: `Encomenda de ${order.customerName} (${order.customerPhone}). Sinal pago: R$ ${order.depositPaid}.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedStock = [newStockItem, ...stock];
    const updatedOrders = orders.map(o =>
      o.id === order.id
        ? { ...o, status: 'recebido' as OrderStatus, linkedStockId: newStockItem.id, updatedAt: new Date().toISOString() }
        : o
    );

    setStock(updatedStock);
    setOrders(updatedOrders);

    await Promise.all([
      StorageService.saveStock(updatedStock),
      StorageService.saveOrders(updatedOrders),
    ]);

    return newStockItem;
  };

  // --------------------------------------------------------------------------
  // OPERAÇÕES DE VENDAS
  // --------------------------------------------------------------------------
  const registerSale = async (
    saleData: Omit<SaleItem, 'id' | 'profit'>,
    options?: { stockItemId?: string; orderId?: string }
  ): Promise<SaleItem> => {
    if (backendMode === 'api') {
      try {
        const newSale = await ApiService.registerSale(saleData, options);
        setSales(prev => [newSale, ...prev]);

        // Atualiza status local
        const targetStockId = options?.stockItemId || saleData.stockItemId;
        if (targetStockId) {
          setStock(prev =>
            prev.map(item =>
              item.id === targetStockId
                ? { ...item, status: 'vendido' as StockStatus, updatedAt: new Date().toISOString() }
                : item
            )
          );
        }

        const targetOrderId = options?.orderId || saleData.orderId;
        if (targetOrderId) {
          setOrders(prev =>
            prev.map(order =>
              order.id === targetOrderId
                ? { ...order, status: 'entregue' as OrderStatus, updatedAt: new Date().toISOString() }
                : order
            )
          );
        }

        return newSale;
      } catch (err) {
        console.error('Erro na API ao registrar venda:', err);
      }
    }

    const profit = (saleData.salePrice || 0) - (saleData.costPrice || 0);
    const newSale: SaleItem = {
      ...saleData,
      profit,
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };

    const updatedSales = [newSale, ...sales];
    let updatedStock = [...stock];
    let updatedOrders = [...orders];

    const targetStockId = options?.stockItemId || saleData.stockItemId;
    if (targetStockId) {
      updatedStock = updatedStock.map(item =>
        item.id === targetStockId
          ? { ...item, status: 'vendido' as StockStatus, updatedAt: new Date().toISOString() }
          : item
      );
    }

    const targetOrderId = options?.orderId || saleData.orderId;
    if (targetOrderId) {
      updatedOrders = updatedOrders.map(order =>
        order.id === targetOrderId
          ? { ...order, status: 'entregue' as OrderStatus, updatedAt: new Date().toISOString() }
          : order
      );
    }

    setSales(updatedSales);
    setStock(updatedStock);
    setOrders(updatedOrders);

    await Promise.all([
      StorageService.saveSales(updatedSales),
      StorageService.saveStock(updatedStock),
      StorageService.saveOrders(updatedOrders),
    ]);

    return newSale;
  };

  const deleteSale = async (id: string): Promise<void> => {
    if (backendMode === 'api') {
      try {
        await ApiService.deleteSale(id);
        setSales(prev => prev.filter(s => s.id !== id));
        return;
      } catch (err) {
        console.error('Erro na API ao excluir venda:', err);
      }
    }

    const updated = sales.filter(s => s.id !== id);
    setSales(updated);
    await StorageService.saveSales(updated);
  };

  const reloadAllData = async () => {
    await loadData();
  };

  const resetToInitialDemo = async () => {
    if (backendMode === 'api') {
      try {
        await ApiService.resetDemo();
        await loadData();
        return;
      } catch (err) {
        console.error('Erro ao resetar demo na API:', err);
      }
    }

    await StorageService.clearAll();
    await loadData();
  };

  return (
    <AppContext.Provider
      value={{
        stock,
        orders,
        sales,
        isLoading,
        metrics,
        backendMode,
        isOnline: backendMode === 'api',
        addStockItem,
        updateStockItem,
        deleteStockItem,
        addPreOrderItem,
        updatePreOrderItem,
        updateOrderStatus,
        deletePreOrderItem,
        convertOrderToStock,
        registerSale,
        deleteSale,
        reloadAllData,
        resetToInitialDemo,
        checkBackendConnection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
