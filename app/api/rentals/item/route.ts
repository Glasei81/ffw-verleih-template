import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql, ensureRentalsSchema } from "@/lib/db"

/** Menge einer einzelnen Position ändern. */
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })

  try {
    const { rentalRowId, quantity } = await request.json()
    if (!rentalRowId) {
      return NextResponse.json({ error: "Position fehlt" }, { status: 400 })
    }
    await ensureRentalsSchema()
    const qty = Math.max(1, Number(quantity ?? 1))
    const rows = await sql`
      UPDATE rentals SET quantity = ${qty}, updated_at = NOW()
      WHERE id = ${Number(rentalRowId)}
      RETURNING id
    `
    if (rows.length === 0) {
      return NextResponse.json({ error: "Position nicht gefunden" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Fehler beim Ändern der Menge:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}

/** Einzelne Position aus einer Anfrage entfernen (nicht die letzte). */
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })

  try {
    const { rentalRowId } = await request.json()
    if (!rentalRowId) {
      return NextResponse.json({ error: "Position fehlt" }, { status: 400 })
    }
    await ensureRentalsSchema()

    const target = await sql`SELECT id, request_group FROM rentals WHERE id = ${Number(rentalRowId)} LIMIT 1`
    if (target.length === 0) {
      return NextResponse.json({ error: "Position nicht gefunden" }, { status: 404 })
    }

    // Wie viele Positionen hat die Anfrage insgesamt?
    const group = target[0].request_group as string | null
    const countRows = group
      ? await sql`SELECT COUNT(*)::int AS n FROM rentals WHERE request_group = ${group}::UUID`
      : [{ n: 1 }]
    if (Number(countRows[0]?.n ?? 1) <= 1) {
      return NextResponse.json(
        { error: "Der letzte Artikel kann nicht entfernt werden. Lehne stattdessen die ganze Anfrage ab." },
        { status: 409 },
      )
    }

    await sql`DELETE FROM rentals WHERE id = ${Number(rentalRowId)}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Fehler beim Entfernen der Position:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
