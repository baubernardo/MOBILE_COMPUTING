import { Router, Request, Response } from 'express';
import { query, pool, toPreOrderItem, toStockItem } from '../db.js';

export const ordersRouter = Router();

// GET all orders
ordersRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM pre_order_items ORDER BY created_at DESC'
    );
    res.json(result.rows.map(toPreOrderItem));
  } catch (error: any) {
    console.error('[Orders GET error]', error);
    res.status(500).json({ error: 'Erro ao buscar encomendas', details: error.message });
  }
});

// POST new pre-order
ordersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      model,
      storage,
      color,
      condition,
      agreedPrice,
      depositPaid = 0,
      estimatedArrival,
      status = 'pendente',
      supplier,
      notes,
    } = req.body;

    if (!customerName || !customerPhone || !model || !storage || !agreedPrice) {
      return res.status(400).json({ error: 'Dados obrigatórios da encomenda ausentes.' });
    }

    const remainingAmount = Math.max(0, (Number(agreedPrice) || 0) - (Number(depositPaid) || 0));
    const id = `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const insertQuery = `
      INSERT INTO pre_order_items (
        id, customer_name, customer_phone, model, storage, color,
        condition, agreed_price, deposit_paid, remaining_amount,
        estimated_arrival, status, supplier, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      id,
      customerName,
      customerPhone,
      model,
      storage,
      color,
      condition,
      Number(agreedPrice),
      Number(depositPaid),
      remainingAmount,
      estimatedArrival || null,
      status,
      supplier || null,
      notes || null,
    ];

    const result = await query(insertQuery, values);
    res.status(201).json(toPreOrderItem(result.rows[0]));
  } catch (error: any) {
    console.error('[Orders POST error]', error);
    res.status(500).json({ error: 'Erro ao cadastrar encomenda', details: error.message });
  }
});

// PUT update pre-order
ordersRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      customerPhone,
      model,
      storage,
      color,
      condition,
      agreedPrice,
      depositPaid,
      estimatedArrival,
      status,
      supplier,
      notes,
    } = req.body;

    const remainingAmount =
      agreedPrice !== undefined && depositPaid !== undefined
        ? Math.max(0, Number(agreedPrice) - Number(depositPaid))
        : null;

    const updateQuery = `
      UPDATE pre_order_items SET
        customer_name = COALESCE($2, customer_name),
        customer_phone = COALESCE($3, customer_phone),
        model = COALESCE($4, model),
        storage = COALESCE($5, storage),
        color = COALESCE($6, color),
        condition = COALESCE($7, condition),
        agreed_price = COALESCE($8, agreed_price),
        deposit_paid = COALESCE($9, deposit_paid),
        remaining_amount = COALESCE($10, remaining_amount),
        estimated_arrival = COALESCE($11, estimated_arrival),
        status = COALESCE($12, status),
        supplier = COALESCE($13, supplier),
        notes = COALESCE($14, notes),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      customerName,
      customerPhone,
      model,
      storage,
      color,
      condition,
      agreedPrice !== undefined ? Number(agreedPrice) : null,
      depositPaid !== undefined ? Number(depositPaid) : null,
      remainingAmount,
      estimatedArrival,
      status,
      supplier,
      notes,
    ];

    const result = await query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Encomenda não encontrada' });
    }

    res.json(toPreOrderItem(result.rows[0]));
  } catch (error: any) {
    console.error('[Orders PUT error]', error);
    res.status(500).json({ error: 'Erro ao atualizar encomenda', details: error.message });
  }
});

// PATCH status only
ordersRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      'UPDATE pre_order_items SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id, status]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Encomenda não encontrada' });
    }

    res.json(toPreOrderItem(result.rows[0]));
  } catch (error: any) {
    console.error('[Orders PATCH status error]', error);
    res.status(500).json({ error: 'Erro ao alterar status', details: error.message });
  }
});

// POST convert order to stock item (Transactional)
ordersRouter.post('/:id/convert-to-stock', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { imei, costPrice, batteryHealth } = req.body;

    await client.query('BEGIN');

    // 1. Get the order
    const orderRes = await client.query('SELECT * FROM pre_order_items WHERE id = $1 FOR UPDATE', [id]);
    if (orderRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Encomenda não encontrada' });
    }

    const order = orderRes.rows[0];
    const stockId = `stock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 2. Insert into stock as 'reservado'
    const insertStockQuery = `
      INSERT INTO stock_items (
        id, model, storage, color, battery_health, condition,
        imei, cost_price, sale_price, supplier, status, notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'reservado', $11, NOW(), NOW())
      RETURNING *
    `;

    const notes = `Encomenda de ${order.customer_name} (${order.customer_phone}). Sinal pago: R$ ${order.deposit_paid}.`;
    const stockValues = [
      stockId,
      order.model,
      order.storage,
      order.color,
      Number(batteryHealth) || 100,
      order.condition,
      imei || 'SEM-IMEI',
      Number(costPrice) || 0,
      Number(order.agreed_price) || 0,
      order.supplier,
      notes,
    ];

    const stockResult = await client.query(insertStockQuery, stockValues);

    // 3. Update order status to 'recebido' and link stock item
    await client.query(
      `UPDATE pre_order_items SET
        status = 'recebido',
        linked_stock_id = $2,
        updated_at = NOW()
       WHERE id = $1`,
      [id, stockId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      stockItem: toStockItem(stockResult.rows[0]),
      orderId: id,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('[Convert Order error]', error);
    res.status(500).json({ error: 'Erro ao converter encomenda para estoque', details: error.message });
  } finally {
    client.release();
  }
});

// DELETE pre-order
ordersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM pre_order_items WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Encomenda não encontrada' });
    }

    res.json({ success: true, id });
  } catch (error: any) {
    console.error('[Orders DELETE error]', error);
    res.status(500).json({ error: 'Erro ao excluir encomenda', details: error.message });
  }
});
