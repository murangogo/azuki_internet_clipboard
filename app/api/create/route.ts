// app/api/create/route.ts
import { NextResponse } from 'next/server';
import pool from '../../lib/pgconnect';

export async function POST(request: Request) {
  const { key, content } = await request.json();

  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO clipboard (namekey, content) VALUES ($1, $2) RETURNING *',
      [key, content]
    );
    client.release();

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error); // 打印错误信息到控制台
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
