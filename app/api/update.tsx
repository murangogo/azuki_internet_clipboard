// app/api/update/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function POST(request: Request) {
  const { key, content } = await request.json();

  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE clipboard SET content = $1 WHERE namekey = $2 RETURNING *',
      [content, key]
    );
    client.release();

    if (result.rows.length > 0) {
      return NextResponse.json(result.rows[0]);
    } else {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
