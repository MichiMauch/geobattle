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

  if (!session || !session.user || !session.user.name) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { score } = await req.json();

  if (typeof score !== 'number') {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
  }

  try {
    await client.execute({
      sql: 'INSERT INTO scores (userName, userId, score) VALUES (?, ?, ?)',
      args: [
        session.user.name,
        session.user.email || 'unknown',
        score,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Datenbankfehler:', error); // Logging hier hinzugefügt!
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await client.execute({
      sql: 'SELECT userName, score FROM scores ORDER BY score DESC',
      args: [],
    });

    return NextResponse.json({ highscores: result.rows });
  } catch (error) {
    console.error('Datenbankfehler:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
