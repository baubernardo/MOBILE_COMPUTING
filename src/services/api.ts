import { Platform } from 'react-native';
import { StockItem, PreOrderItem, SaleItem, DashboardMetrics, OrderStatus } from '../types';

/**
 * Configuração do Endereço da API Backend
 * 
 * - Web & iOS Simulator: http://localhost:3000
 * - Android Emulator: http://10.0.2.2:3000
 * - Celular Físico no Expo Go: altere para o IP local do seu computador (ex: http://192.168.1.15:3000)
 */
export const API_CONFIG = {
  // Altere para o IP do seu computador se for testar no celular físico via Expo Go
  LOCAL_NETWORK_IP: 'localhost',
  PORT: 3000,
  TIMEOUT_MS: 3500,

  getBaseUrl(): string {
    if (this.LOCAL_NETWORK_IP !== 'localhost') {
      return `http://${this.LOCAL_NETWORK_IP}:${this.PORT}/api`;
    }
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${this.PORT}/api`;
    }
    return `http://localhost:${this.PORT}/api`;
  },
};

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const ApiService = {
  /**
   * Verifica se o servidor Backend e PostgreSQL estão disponíveis
   */
  async checkHealth(): Promise<boolean> {
    try {
      const baseUrl = API_CONFIG.getBaseUrl().replace('/api', '');
      const res = await fetchWithTimeout(`${baseUrl}/health`, { method: 'GET' });
      if (!res.ok) return false;
      const data = await res.json();
      return data.database === 'connected';
    } catch {
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // ESTOQUE (Stock)
  // --------------------------------------------------------------------------
  async getStock(): Promise<StockItem[]> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/stock`);
    if (!res.ok) throw new Error(`Falha ao buscar estoque: ${res.statusText}`);
    return res.json();
  },

  async addStock(item: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<StockItem> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/stock`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error(`Falha ao adicionar ao estoque: ${res.statusText}`);
    return res.json();
  },

  async updateStock(item: StockItem): Promise<StockItem> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/stock/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error(`Falha ao atualizar item: ${res.statusText}`);
    return res.json();
  },

  async deleteStock(id: string): Promise<void> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/stock/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Falha ao remover item: ${res.statusText}`);
  },

  // --------------------------------------------------------------------------
  // ENCOMENDAS (Pre-Orders)
  // --------------------------------------------------------------------------
  async getOrders(): Promise<PreOrderItem[]> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/orders`);
    if (!res.ok) throw new Error(`Falha ao buscar encomendas: ${res.statusText}`);
    return res.json();
  },

  async addOrder(order: Omit<PreOrderItem, 'id' | 'createdAt' | 'updatedAt' | 'remainingAmount'>): Promise<PreOrderItem> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/orders`, {
      method: 'POST',
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error(`Falha ao cadastrar encomenda: ${res.statusText}`);
    return res.json();
  },

  async updateOrder(order: PreOrderItem): Promise<PreOrderItem> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/orders/${order.id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error(`Falha ao atualizar encomenda: ${res.statusText}`);
    return res.json();
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<PreOrderItem> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`Falha ao atualizar status da encomenda: ${res.statusText}`);
    return res.json();
  },

  async convertOrderToStock(
    id: string,
    imei: string,
    costPrice: number,
    batteryHealth: number
  ): Promise<{ stockItem: StockItem; orderId: string }> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/orders/${id}/convert-to-stock`, {
      method: 'POST',
      body: JSON.stringify({ imei, costPrice, batteryHealth }),
    });
    if (!res.ok) throw new Error(`Falha ao converter encomenda: ${res.statusText}`);
    return res.json();
  },

  async deleteOrder(id: string): Promise<void> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/orders/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Falha ao excluir encomenda: ${res.statusText}`);
  },

  // --------------------------------------------------------------------------
  // VENDAS (Sales)
  // --------------------------------------------------------------------------
  async getSales(): Promise<SaleItem[]> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/sales`);
    if (!res.ok) throw new Error(`Falha ao buscar vendas: ${res.statusText}`);
    return res.json();
  },

  async registerSale(
    sale: Omit<SaleItem, 'id' | 'profit'>,
    options?: { stockItemId?: string; orderId?: string }
  ): Promise<SaleItem> {
    const payload = {
      ...sale,
      stockItemId: options?.stockItemId || sale.stockItemId,
      orderId: options?.orderId || sale.orderId,
    };

    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/sales`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Falha ao registrar venda: ${res.statusText}`);
    return res.json();
  },

  async deleteSale(id: string): Promise<void> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/sales/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Falha ao excluir venda: ${res.statusText}`);
  },

  // --------------------------------------------------------------------------
  // DASHBOARD & ADMIN
  // --------------------------------------------------------------------------
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/dashboard/metrics`);
    if (!res.ok) throw new Error(`Falha ao buscar métricas: ${res.statusText}`);
    return res.json();
  },

  async resetDemo(): Promise<void> {
    const res = await fetchWithTimeout(`${API_CONFIG.getBaseUrl()}/admin/reset-demo`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Falha ao restaurar demonstração: ${res.statusText}`);
  },
};
