import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { calculateOrderCharges } from './services/rateEngine';
import { ALLOWED_TRANSITIONS, isValidTransition } from './services/orderService';
import { notifyOrderStatusChange } from './services/notificationService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Backend API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Relay Logistics OS Backend Service',
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/rates/calculate', (req, res) => {
    try {
      const result = calculateOrderCharges(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Rate calculation failed' });
    }
  });

  app.get('/api/orders/transitions', (req, res) => {
    res.json({ transitions: ALLOWED_TRANSITIONS });
  });

  app.post('/api/orders/validate-transition', (req, res) => {
    const { current, next } = req.body;
    const valid = isValidTransition(current, next);
    res.json({ current, next, valid });
  });

  app.post('/api/notifications/notify', async (req, res) => {
    const { orderId, status, customerContact } = req.body;
    await notifyOrderStatusChange(orderId, status, customerContact);
    res.json({ success: true, message: `Notification sent for order ${orderId}` });
  });

  // Vite Middleware integration for development / Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Relay Express Backend + Vite running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
