import { Pool, neonConfig } from '@neondatabase/serverless';
import pg from 'pg';

// Enable WebSocket for Neon if needed in edge environments, standard HTTP/TCP pool for Node
const connectionString = process.env.DATABASE_URL;

let pool: any = null;

if (connectionString) {
  try {
    if (connectionString.includes('neon.tech')) {
      pool = new Pool({ connectionString });
    } else {
      pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
    }
    console.log('PostgreSQL / Neon database connection pool initialized.');
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool:', err);
  }
} else {
  console.log('No DATABASE_URL configured. App will run in memory mode.');
}

export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error('DATABASE_URL is not set. Please provide a Neon PostgreSQL connection string in environment variables.');
  }
  return pool.query(text, params);
}

export async function initDatabaseSchema() {
  if (!pool) return;
  try {
    // Create base tables if they do not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        tracking_number VARCHAR(255) NOT NULL UNIQUE,
        order_type VARCHAR(50) NOT NULL,
        payment_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        recipient_name VARCHAR(255) NOT NULL,
        recipient_phone VARCHAR(255) NOT NULL,
        recipient_address TEXT NOT NULL,
        pickup_pincode VARCHAR(20) NOT NULL,
        delivery_pincode VARCHAR(20) NOT NULL,
        declared_value NUMERIC(10, 2) NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        data JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS status_history (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        actor_name VARCHAR(255),
        actor_role VARCHAR(50),
        remarks TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Neon database tables verified/created successfully.');
  } catch (err) {
    console.error('Error initializing Neon database schema:', err);
  }
}

export function isDbConnected(): boolean {
  return !!pool;
}

export async function getAllOrdersDb() {
  if (!pool) return null;
  const res = await pool.query(`SELECT data FROM orders ORDER BY created_at DESC`);
  return res.rows.map((r: any) => r.data);
}

export async function saveOrderDb(order: any) {
  if (!pool) return null;
  const queryText = `
    INSERT INTO orders (
      id, tracking_number, order_type, payment_type, status,
      customer_name, customer_phone, customer_email,
      recipient_name, recipient_phone, recipient_address,
      pickup_pincode, delivery_pincode, declared_value, total_amount,
      data
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8,
      $9, $10, $11,
      $12, $13, $14, $15,
      $16
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      updated_at = CURRENT_TIMESTAMP,
      data = EXCLUDED.data
    RETURNING data;
  `;
  const values = [
    order.id,
    order.trackingNumber,
    order.orderType || 'DOMESTIC_STANDARD',
    order.paymentType || 'PREPAID',
    order.status || 'BOOKED',
    order.customerName || '',
    order.customerPhone || '',
    order.customerEmail || '',
    order.recipientName || '',
    order.recipientPhone || '',
    order.recipientAddress || '',
    order.pickupPincode || '',
    order.deliveryPincode || '',
    order.declaredValue || 0,
    order.billingBreakdown?.totalAmount || 0,
    JSON.stringify(order)
  ];
  const res = await pool.query(queryText, values);
  return res.rows[0]?.data;
}

