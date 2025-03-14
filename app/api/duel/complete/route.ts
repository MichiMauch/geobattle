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

  const { duelId, opponentScore } = await req.json();

  if (!duelId || typeof opponentScore !== 'number') {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  try {
    // Duell-Daten abrufen
    const duelRes = await client.execute({
      sql: `SELECT challengerUserId, challengerScore FROM duels WHERE id = ?`,
      args: [duelId],
    });

    if (duelRes.rows.length === 0) {
      return NextResponse.json({ error: 'Duel not found' }, { status: 404 });
    }

    const challengerScore = duelRes.rows[0].challengerScore as number;
    const challengerUserId = duelRes.rows[0].challengerUserId as string;

    // Sieger ermitteln
    let winner: 'challenger' | 'opponent' | 'draw' = 'draw';
    if (opponentScore > challengerScore) winner = 'opponent';
    else if (challengerScore > opponentScore) winner = 'challenger';

    // Bonuspunkte vergeben
    const bonusPoints = winner === 'draw' ? 5 : 10;

    // Status des Duells aktualisieren
    await client.execute({
      sql: `
        UPDATE duels
        SET opponentScore = ?, status = 'completed', winner = ?
        WHERE id = ?
      `,
      args: [opponentScore, winner, duelId],
    });

    // Bonuspunkte in der neuen duel_scores-Tabelle speichern
    if (winner === 'opponent') {
      await client.execute({
        sql: `INSERT INTO duel_scores (userId, userName, duelId, points) VALUES (?, ?, ?, ?)`,
        args: [session.user.email, session.user.name || 'unknown', duelId, bonusPoints],
      });
    } else if (winner === 'challenger') {
      await client.execute({
        sql: `INSERT INTO duel_scores (userId, userName, duelId, points) VALUES (?, ?, ?, ?)`,
        args: [challengerUserId, 'challenger', duelId, bonusPoints],
      });
    } else if (winner === 'draw') {
      await client.execute({
        sql: `INSERT INTO duel_scores (userId, userName, duelId, points) VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
        args: [
          session.user.email, session.user.name || 'unknown', duelId, bonusPoints,
          challengerUserId, 'challenger', duelId, bonusPoints
        ],
      });
    }

    return NextResponse.json({ success: true, winner, bonusPoints });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
