import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';
import { stockRouter } from './routes/stock.js';
import { ordersRouter } from './routes/orders.js';
import { salesRouter } from './routes/sales.js';
import { dashboardRouter } from './routes/dashboard.js';
import { adminRouter } from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check route
app.get('/health', async (_req, res) => {
  try {
    const dbCheck = await pool.query('SELECT 1 as alive');
    res.json({
      status: 'ok',
      service: 'istock-backend-api',
      timestamp: new Date().toISOString(),
      database: dbCheck.rows[0].alive === 1 ? 'connected' : 'error',
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'degraded',
      service: 'istock-backend-api',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message,
    });
  }
});

// Register API routes
app.use('/api/stock', stockRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/sales', salesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRouter);

// Start server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 iStock Backend API rodando na porta ${PORT}`);
  console.log(`📡 URL Health Check: http://localhost:${PORT}/health`);
  console.log(`=========================================`);
});
