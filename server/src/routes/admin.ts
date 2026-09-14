import { Router, Request, Response } from 'express';
import { pool } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const adminRouter = Router();

adminRouter.post('/reset-demo', async (_req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const sqlPath = path.resolve(__dirname, '../../sql/init.sql');

    const sql = fs.readFileSync(sqlPath, 'utf8');

    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE sale_items, pre_order_items, stock_items RESTART IDENTITY CASCADE;');
    await client.query(sql);
    await client.query('COMMIT');

    res.json({ success: true, message: 'Banco de dados restaurado para dados de demonstração.' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('[Admin Reset error]', error);
    res.status(500).json({ error: 'Erro ao restaurar dados de demonstração', details: error.message });
  } finally {
    client.release();
  }
});
