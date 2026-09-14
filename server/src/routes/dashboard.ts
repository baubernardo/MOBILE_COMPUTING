import { Router, Request, Response } from 'express';
import { query } from '../db.js';

export const dashboardRouter = Router();

dashboardRouter.get('/metrics', async (_req: Request, res: Response) => {
  try {
    // 1. Stock metrics (items != 'vendido')
    const stockQuery = `
      SELECT
        COUNT(*) AS total_items,
        COALESCE(SUM(cost_price), 0) AS total_cost,
        COALESCE(SUM(sale_price), 0) AS total_value
      FROM stock_items
      WHERE status != 'vendido';
    `;

    // 2. Active orders metrics
    const ordersQuery = `
      SELECT
        COUNT(*) AS active_orders_count,
        COALESCE(SUM(deposit_paid), 0) AS total_deposits_held
      FROM pre_order_items
      WHERE status IN ('pendente', 'a_caminho', 'recebido');
    `;

    // 3. Sales metrics (All time)
    const salesAllQuery = `
      SELECT
        COUNT(*) AS total_sales_count,
        COALESCE(SUM(sale_price), 0) AS total_sales_revenue,
        COALESCE(SUM(profit), 0) AS total_realized_profit
      FROM sale_items;
    `;

    // 4. Sales metrics (Current month)
    const salesMonthQuery = `
      SELECT
        COALESCE(SUM(sale_price), 0) AS month_sales_revenue,
        COALESCE(SUM(profit), 0) AS month_realized_profit
      FROM sale_items
      WHERE DATE_TRUNC('month', sale_date) = DATE_TRUNC('month', CURRENT_DATE);
    `;

    const [stockRes, ordersRes, salesAllRes, salesMonthRes] = await Promise.all([
      query(stockQuery),
      query(ordersQuery),
      query(salesAllQuery),
      query(salesMonthQuery),
    ]);

    const s = stockRes.rows[0];
    const o = ordersRes.rows[0];
    const sa = salesAllRes.rows[0];
    const sm = salesMonthRes.rows[0];

    const totalStockCost = Number(s.total_cost);
    const totalStockValue = Number(s.total_value);

    res.json({
      totalStockItems: Number(s.total_items),
      totalStockCost,
      totalStockValue,
      projectedProfit: totalStockValue - totalStockCost,
      activeOrdersCount: Number(o.active_orders_count),
      totalDepositsHeld: Number(o.total_deposits_held),
      totalSalesCount: Number(sa.total_sales_count),
      totalSalesRevenue: Number(sa.total_sales_revenue),
      totalRealizedProfit: Number(sa.total_realized_profit),
      monthSalesRevenue: Number(sm.month_sales_revenue),
      monthRealizedProfit: Number(sm.month_realized_profit),
    });
  } catch (error: any) {
    console.error('[Dashboard Metrics error]', error);
    res.status(500).json({ error: 'Erro ao calcular métricas do dashboard', details: error.message });
  }
});
