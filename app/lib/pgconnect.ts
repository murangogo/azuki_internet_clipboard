import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432, // 默认 PostgreSQL 端口
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
  query_timeout: 5000,
});

pool.on('error', (error) => {
  console.error('Unexpected idle database connection error:', error.message);
});

export default pool;
