export type StorageCapacity = '64GB' | '128GB' | '256GB' | '512GB' | '1TB';

export type iPhoneCondition = 
  | 'Novo / Lacrado'
  | 'Seminovo Grade A+'
  | 'Seminovo Grade A'
  | 'Seminovo Grade B'
  | 'Seminovo Grade C';

export type StockStatus = 'disponivel' | 'reservado' | 'vendido';

export type OrderStatus = 'pendente' | 'a_caminho' | 'recebido' | 'entregue' | 'cancelado';

export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'misto';

export interface StockItem {
  id: string;
  model: string;
  storage: StorageCapacity;
  color: string;
  batteryHealth: number;
  condition: iPhoneCondition;
  imei: string;
  costPrice: number;
  salePrice: number;
  supplier?: string;
  status: StockStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreOrderItem {
  id: string;
  customerName: string;
  customerPhone: string;
  model: string;
  storage: StorageCapacity;
  color: string;
  condition: iPhoneCondition;
  agreedPrice: number;
  depositPaid: number;
  remainingAmount: number;
  estimatedArrival?: string;
  status: OrderStatus;
  supplier?: string;
  notes?: string;
  linkedStockId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  stockItemId?: string;
  orderId?: string;
  customerName: string;
  customerPhone?: string;
  model: string;
  storage: StorageCapacity;
  color: string;
  condition: iPhoneCondition;
  imei?: string;
  costPrice: number;
  salePrice: number;
  profit: number;
  paymentMethod: PaymentMethod;
  installments?: number;
  saleDate: string;
  notes?: string;
}

export interface DashboardMetrics {
  totalStockItems: number;
  totalStockCost: number;
  totalStockValue: number;
  projectedProfit: number;
  activeOrdersCount: number;
  totalDepositsHeld: number;
  totalSalesCount: number;
  totalSalesRevenue: number;
  totalRealizedProfit: number;
  monthSalesRevenue: number;
  monthRealizedProfit: number;
}
