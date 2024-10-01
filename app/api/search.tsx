// app/api/search/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/pg';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'No key provided' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT content FROM clipboard WHERE namekey = $1', [key]);

    client.release();

    if (result.rows.length > 0) {
      return NextResponse.json({ content: result.rows[0].content });
    } else {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
