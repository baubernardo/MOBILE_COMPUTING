import AsyncStorage from '@react-native-async-storage/async-storage';
import { StockItem, PreOrderItem, SaleItem } from '../types';
import { INITIAL_STOCK, INITIAL_ORDERS, INITIAL_SALES } from '../constants/iphoneData';

const KEYS = {
  STOCK: '@istock_app_stock_v1',
  ORDERS: '@istock_app_orders_v1',
  SALES: '@istock_app_sales_v1',
  INITIALIZED: '@istock_app_initialized_v1',
};

export const StorageService = {
  async initData(): Promise<{ stock: StockItem[]; orders: PreOrderItem[]; sales: SaleItem[] }> {
    try {
      const initialized = await AsyncStorage.getItem(KEYS.INITIALIZED);
      if (!initialized) {
        // First run - populate with sample demo data
        await AsyncStorage.setItem(KEYS.STOCK, JSON.stringify(INITIAL_STOCK));
        await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
        await AsyncStorage.setItem(KEYS.SALES, JSON.stringify(INITIAL_SALES));
        await AsyncStorage.setItem(KEYS.INITIALIZED, 'true');
        return {
          stock: INITIAL_STOCK,
          orders: INITIAL_ORDERS,
          sales: INITIAL_SALES,
        };
      }

      const [stockRaw, ordersRaw, salesRaw] = await Promise.all([
        AsyncStorage.getItem(KEYS.STOCK),
        AsyncStorage.getItem(KEYS.ORDERS),
        AsyncStorage.getItem(KEYS.SALES),
      ]);

      return {
        stock: stockRaw ? JSON.parse(stockRaw) : [],
        orders: ordersRaw ? JSON.parse(ordersRaw) : [],
        sales: salesRaw ? JSON.parse(salesRaw) : [],
      };
    } catch (error) {
      console.error('Error initializing storage data:', error);
      return {
        stock: INITIAL_STOCK,
        orders: INITIAL_ORDERS,
        sales: INITIAL_SALES,
      };
    }
  },

  async saveStock(stock: StockItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.STOCK, JSON.stringify(stock));
    } catch (error) {
      console.error('Error saving stock:', error);
    }
  },

  async saveOrders(orders: PreOrderItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  },

  async saveSales(sales: SaleItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SALES, JSON.stringify(sales));
    } catch (error) {
      console.error('Error saving sales:', error);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([KEYS.STOCK, KEYS.ORDERS, KEYS.SALES, KEYS.INITIALIZED]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
};
