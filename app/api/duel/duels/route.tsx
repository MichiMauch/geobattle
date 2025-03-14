import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const duels = await client.execute({
      sql: `SELECT id, challengerUserName, challengerScore FROM duels WHERE opponentUserId = ? AND status = 'pending' ORDER BY createdAt DESC`,
      args: [session.user.email],
    });

    return NextResponse.json({
      duels: duels.rows.map((row) => ({
        id: row.id,
        challengerUserName: row.challengerUserName,
        challengerScore: row.challengerScore,
      })),
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
