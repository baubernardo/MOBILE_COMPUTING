import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { StockItem, PreOrderItem, SaleItem, DashboardMetrics, OrderStatus, StockStatus } from '../types';
import { StorageService } from '../services/storage';

interface AppContextData {
  stock: StockItem[];
  orders: PreOrderItem[];
  sales: SaleItem[];
  isLoading: boolean;
  metrics: DashboardMetrics;
  
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
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [orders, setOrders] = useState<PreOrderItem[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await StorageService.initData();
      setStock(data.stock);
      setOrders(data.orders);
      setSales(data.sales);
    } catch (error) {
      console.error('Error loading app data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Dashboard Metrics
  const metrics: DashboardMetrics = useMemo(() => {
    // Only items that are in stock ('disponivel' or 'reservado')
    const availableStock = stock.filter(item => item.status !== 'vendido');
    const totalStockItems = availableStock.length;
    const totalStockCost = availableStock.reduce((acc, item) => acc + (item.costPrice || 0), 0);
    const totalStockValue = availableStock.reduce((acc, item) => acc + (item.salePrice || 0), 0);
    const projectedProfit = totalStockValue - totalStockCost;

    // Active pre-orders (not completed/cancelled)
    const activeOrders = orders.filter(
      order => order.status === 'pendente' || order.status === 'a_caminho' || order.status === 'recebido'
    );
    const activeOrdersCount = activeOrders.length;
    const totalDepositsHeld = activeOrders.reduce((acc, order) => acc + (order.depositPaid || 0), 0);

    // Sales metrics
    const totalSalesCount = sales.length;
    const totalSalesRevenue = sales.reduce((acc, sale) => acc + (sale.salePrice || 0), 0);
    const totalRealizedProfit = sales.reduce((acc, sale) => acc + (sale.profit || 0), 0);

    // This month's sales
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

  // Stock CRUD
  const addStockItem = async (itemData: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<StockItem> => {
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
    const updated = stock.map(item =>
      item.id === updatedItem.id ? { ...updatedItem, updatedAt: new Date().toISOString() } : item
    );
    setStock(updated);
    await StorageService.saveStock(updated);
  };

  const deleteStockItem = async (id: string): Promise<void> => {
    const updated = stock.filter(item => item.id !== id);
    setStock(updated);
    await StorageService.saveStock(updated);
  };

  // Pre-orders CRUD
  const addPreOrderItem = async (
    itemData: Omit<PreOrderItem, 'id' | 'createdAt' | 'updatedAt' | 'remainingAmount'>
  ): Promise<PreOrderItem> => {
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
    const updated = orders.map(order =>
      order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order
    );
    setOrders(updated);
    await StorageService.saveOrders(updated);
  };

  const deletePreOrderItem = async (id: string): Promise<void> => {
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

  // Register Sales
  const registerSale = async (
    saleData: Omit<SaleItem, 'id' | 'profit'>,
    options?: { stockItemId?: string; orderId?: string }
  ): Promise<SaleItem> => {
    const profit = (saleData.salePrice || 0) - (saleData.costPrice || 0);
    const newSale: SaleItem = {
      ...saleData,
      profit,
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };

    const updatedSales = [newSale, ...sales];
    let updatedStock = [...stock];
    let updatedOrders = [...orders];

    // If stock item was sold, mark as 'vendido'
    const targetStockId = options?.stockItemId || saleData.stockItemId;
    if (targetStockId) {
      updatedStock = updatedStock.map(item =>
        item.id === targetStockId
          ? { ...item, status: 'vendido' as StockStatus, updatedAt: new Date().toISOString() }
          : item
      );
    }

    // If linked to an order, mark order as 'entregue'
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
    const updated = sales.filter(s => s.id !== id);
    setSales(updated);
    await StorageService.saveSales(updated);
  };

  const reloadAllData = async () => {
    await loadData();
  };

  const resetToInitialDemo = async () => {
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
