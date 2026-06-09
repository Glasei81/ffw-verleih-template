import { NextResponse } from "next/server"

export async function GET() {
  const url = process.env.DATABASE_URL

  if (!url) {
    return NextResponse.json({ status: "FEHLER", problem: "DATABASE_URL ist nicht gesetzt" })
  }

  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    return NextResponse.json({
      status: "FEHLER",
      problem: "DATABASE_URL hat falsches Format",
      beginnt_mit: url.substring(0, 20) + "..."
    })
  }

  try {
    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(url)
    await sql`SELECT 1`
    return NextResponse.json({
      status: "OK",
      meldung: "Datenbankverbindung funktioniert"
    })
  } catch (error) {
    return NextResponse.json({
      status: "FEHLER",
      problem: error instanceof Error ? error.message : String(error)
    })
  }
}
