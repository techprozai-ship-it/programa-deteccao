import { NextResponse } from 'next/server'

// Claude integration removed — this endpoint kept as a 410 to avoid 404s from clients
export async function GET() {
  return NextResponse.json({ error: 'Claude integration removed' }, { status: 410 })
}

export async function POST() {
  return NextResponse.json({ error: 'Claude integration removed' }, { status: 410 })
}
