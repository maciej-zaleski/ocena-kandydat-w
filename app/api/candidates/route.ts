import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// Everything is stored as one JSON blob under a single key.
// Fine for this use case (a handful of candidates per hiring round).
const KEY = 'candidates';

export async function GET() {
  const candidates = (await kv.get(KEY)) || [];
  return NextResponse.json({ candidates });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!Array.isArray(body.candidates)) {
    return NextResponse.json({ error: 'candidates must be an array' }, { status: 400 });
  }
  await kv.set(KEY, body.candidates);
  return NextResponse.json({ ok: true });
}
