import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Resend } from "resend";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    console.error("🚨 FEHLER: RESEND_API_KEY ist nicht gesetzt!");
    return NextResponse.json({ error: "Server-Konfigurationsfehler: RESEND_API_KEY fehlt" }, { status: 500 });
  }
  console.log("✅ RESEND_API_KEY geladen:", process.env.RESEND_API_KEY);

  try {
    const body = await req.json();
    console.log("📥 Empfangene Daten in API:", body);

    if (!body.challengerUserId || !body.challengerUserName || !body.opponentUserId || typeof body.challengerScore !== "number") {
      console.error("❌ Ungültige Daten empfangen:", body);
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }

    // 1️⃣ Speichere das Duell in der Datenbank
    const result = await client.execute({
      sql: `INSERT INTO duels (challengerUserId, challengerUserName, challengerScore, opponentUserId, opponentUserName) VALUES (?, ?, ?, ?, ?)`,
      args: [
        body.challengerUserId,
        body.challengerUserName,
        body.challengerScore,
        body.opponentUserId,
        body.opponentUserName || "Unbekannt",
      ],
    });

    console.log("✅ Datenbankeintrag erfolgreich:", result);

    // 2️⃣ Sende eine E-Mail-Benachrichtigung an den Gegner
    const emailResponse = await resend.emails.send({
      from: "michi@kokomo.house", // Diese Adresse muss in Resend bestätigt sein!
      to: body.opponentUserId, // Gegner E-Mail
      subject: "Du wurdest zu einem GeoBattle-Duell herausgefordert!",
      html: `
        <h1>Du hast eine neue Herausforderung!</h1>
        <p><strong>${body.challengerUserName}</strong> hat dich zu einem GeoBattle-Duell herausgefordert!</p>
        <p>Seine Punktzahl: <strong>${body.challengerScore}</strong></p>
        <p>Kannst du ihn schlagen?</p>
        <a href="https://geobattle.vercel.app/">Jetzt herausfordern!</a>
      `,
    });

    console.log("✅ E-Mail gesendet:", emailResponse);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Fehler in API /api/duel/challenge:", error);
    return NextResponse.json({ error: "Fehler beim Speichern", details: String(error) }, { status: 500 });
  }
}
