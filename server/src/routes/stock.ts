import { Router, Request, Response } from 'express';
import { query, toStockItem } from '../db.js';

export const stockRouter = Router();

// GET all stock items
stockRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM stock_items ORDER BY created_at DESC'
    );
    res.json(result.rows.map(toStockItem));
  } catch (error: any) {
    console.error('[Stock GET error]', error);
    res.status(500).json({ error: 'Erro ao buscar estoque', details: error.message });
  }
});

// POST new stock item
stockRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      model,
      storage,
      color,
      batteryHealth,
      condition,
      imei,
      costPrice,
      salePrice,
      supplier,
      status = 'disponivel',
      notes,
    } = req.body;

    if (!model || !storage || !color || !condition) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const id = `stock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const insertQuery = `
      INSERT INTO stock_items (
        id, model, storage, color, battery_health, condition,
        imei, cost_price, sale_price, supplier, status, notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      id,
      model,
      storage,
      color,
      Number(batteryHealth) || 100,
      condition,
      imei || 'SEM-IMEI',
      Number(costPrice) || 0,
      Number(salePrice) || 0,
      supplier || null,
      status,
      notes || null,
    ];

    const result = await query(insertQuery, values);
    res.status(201).json(toStockItem(result.rows[0]));
  } catch (error: any) {
    console.error('[Stock POST error]', error);
    res.status(500).json({ error: 'Erro ao cadastrar item no estoque', details: error.message });
  }
});

// PUT update stock item
stockRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      model,
      storage,
      color,
      batteryHealth,
      condition,
      imei,
      costPrice,
      salePrice,
      supplier,
      status,
      notes,
    } = req.body;

    const updateQuery = `
      UPDATE stock_items SET
        model = COALESCE($2, model),
        storage = COALESCE($3, storage),
        color = COALESCE($4, color),
        battery_health = COALESCE($5, battery_health),
        condition = COALESCE($6, condition),
        imei = COALESCE($7, imei),
        cost_price = COALESCE($8, cost_price),
        sale_price = COALESCE($9, sale_price),
        supplier = COALESCE($10, supplier),
        status = COALESCE($11, status),
        notes = COALESCE($12, notes),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      model,
      storage,
      color,
      batteryHealth !== undefined ? Number(batteryHealth) : null,
      condition,
      imei,
      costPrice !== undefined ? Number(costPrice) : null,
      salePrice !== undefined ? Number(salePrice) : null,
      supplier,
      status,
      notes,
    ];

    const result = await query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item não encontrado no estoque' });
    }

    res.json(toStockItem(result.rows[0]));
  } catch (error: any) {
    console.error('[Stock PUT error]', error);
    res.status(500).json({ error: 'Erro ao atualizar item do estoque', details: error.message });
  }
});

// DELETE stock item
stockRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM stock_items WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({ success: true, id });
  } catch (error: any) {
    console.error('[Stock DELETE error]', error);
    res.status(500).json({ error: 'Erro ao excluir item do estoque', details: error.message });
  }
});
