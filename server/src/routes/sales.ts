import { Router, Request, Response } from 'express';
import { query, pool, toSaleItem } from '../db.js';

export const salesRouter = Router();

// GET all sales
salesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM sale_items ORDER BY sale_date DESC'
    );
    res.json(result.rows.map(toSaleItem));
  } catch (error: any) {
    console.error('[Sales GET error]', error);
    res.status(500).json({ error: 'Erro ao buscar vendas', details: error.message });
  }
});

// POST register new sale (Transactional)
salesRouter.post('/', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      stockItemId,
      orderId,
      customerName,
      customerPhone,
      model,
      storage,
      color,
      condition,
      imei,
      costPrice,
      salePrice,
      paymentMethod,
      installments = 1,
      saleDate = new Date().toISOString(),
      notes,
    } = req.body;

    if (!customerName || !model || !storage || salePrice === undefined || costPrice === undefined) {
      return res.status(400).json({ error: 'Dados obrigatórios da venda ausentes.' });
    }

    const profit = Number(salePrice) - Number(costPrice);
    const saleId = `sale-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await client.query('BEGIN');

    // 1. Insert into sale_items
    const insertSaleQuery = `
      INSERT INTO sale_items (
        id, stock_item_id, order_id, customer_name, customer_phone,
        model, storage, color, condition, imei, cost_price, sale_price,
        profit, payment_method, installments, sale_date, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      RETURNING *
    `;

    const values = [
      saleId,
      stockItemId || null,
      orderId || null,
      customerName,
      customerPhone || null,
      model,
      storage,
      color,
      condition,
      imei || null,
      Number(costPrice),
      Number(salePrice),
      profit,
      paymentMethod,
      Number(installments) || 1,
      saleDate,
      notes || null,
    ];

    const saleResult = await client.query(insertSaleQuery, values);

    // 2. If stockItemId was provided, update status to 'vendido'
    if (stockItemId) {
      await client.query(
        "UPDATE stock_items SET status = 'vendido', updated_at = NOW() WHERE id = $1",
        [stockItemId]
      );
    }

    // 3. If orderId was provided, update order status to 'entregue'
    if (orderId) {
      await client.query(
        "UPDATE pre_order_items SET status = 'entregue', updated_at = NOW() WHERE id = $1",
        [orderId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(toSaleItem(saleResult.rows[0]));
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('[Sales POST error]', error);
    res.status(500).json({ error: 'Erro ao registrar venda', details: error.message });
  } finally {
    client.release();
  }
});

// DELETE sale
salesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM sale_items WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    res.json({ success: true, id });
  } catch (error: any) {
    console.error('[Sales DELETE error]', error);
    res.status(500).json({ error: 'Erro ao excluir venda', details: error.message });
  }
});
