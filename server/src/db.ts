import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:admin@admin@localhost:5432/istock_db';

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle PostgreSQL client', err);
});

// Helper for running queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('[DB Query]', { text: text.slice(0, 80), duration, rows: res.rowCount });
  return res;
}

// Convert snake_case db row to camelCase for mobile client
export function toStockItem(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    model: row.model,
    storage: row.storage,
    color: row.color,
    batteryHealth: Number(row.battery_health),
    condition: row.condition,
    imei: row.imei,
    costPrice: Number(row.cost_price),
    salePrice: Number(row.sale_price),
    supplier: row.supplier || undefined,
    status: row.status,
    notes: row.notes || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export function toPreOrderItem(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    model: row.model,
    storage: row.storage,
    color: row.color,
    condition: row.condition,
    agreedPrice: Number(row.agreed_price),
    depositPaid: Number(row.deposit_paid),
    remainingAmount: Number(row.remaining_amount),
    estimatedArrival: row.estimated_arrival || undefined,
    status: row.status,
    supplier: row.supplier || undefined,
    notes: row.notes || undefined,
    linkedStockId: row.linked_stock_id || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export function toSaleItem(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    stockItemId: row.stock_item_id || undefined,
    orderId: row.order_id || undefined,
    customerName: row.customer_name,
    customerPhone: row.customer_phone || undefined,
    model: row.model,
    storage: row.storage,
    color: row.color,
    condition: row.condition,
    imei: row.imei || undefined,
    costPrice: Number(row.cost_price),
    salePrice: Number(row.sale_price),
    profit: Number(row.profit),
    paymentMethod: row.payment_method,
    installments: row.installments ? Number(row.installments) : undefined,
    saleDate: row.sale_date ? new Date(row.sale_date).toISOString() : new Date().toISOString(),
    notes: row.notes || undefined,
  };
}
