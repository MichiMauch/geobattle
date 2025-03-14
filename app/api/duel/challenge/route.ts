import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { opponentUserId, opponentUserName, yourScore } = await req.json();

  if (!opponentUserId || !opponentUserName || typeof yourScore !== 'number') {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  try {
    await client.execute({
      sql: `INSERT INTO duels (challengerUserId, challengerUserName, challengerScore, opponentUserId, opponentUserName) VALUES (?, ?, ?, ?, ?)`,
      args: [
        session.user.email,
        session.user.name || 'unknown',
        yourScore,
        opponentUserId,
        opponentUserName,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Database error', details: String(error) }, { status: 500 });
  }
}
