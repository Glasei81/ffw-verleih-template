import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql, ensureRentalsSchema, getInventoryById } from "@/lib/db"
import { randomUUID } from "crypto"

/**
 * Fügt einer bestehenden Anfrage/Ausleihe einen weiteren Artikel hinzu.
 * Der neue Datensatz erbt Ausleiher, Zeitraum und Status der Gruppe.
 */
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })
  }

  try {
    const { requestGroup, itemId, quantity } = await request.json()
    if (!requestGroup || !itemId) {
      return NextResponse.json({ error: "Gruppe und Artikel sind erforderlich" }, { status: 400 })
    }

    await ensureRentalsSchema()

    // Ankerzeile der Gruppe laden (für Ausleiher, Zeitraum, Status)
    const isUuid = String(requestGroup).includes("-")
    const anchorRows = isUuid
      ? await sql`SELECT * FROM rentals WHERE request_group = ${requestGroup}::UUID ORDER BY id LIMIT 1`
      : await sql`SELECT * FROM rentals WHERE id = ${Number.parseInt(requestGroup)} LIMIT 1`

    const anchor = anchorRows[0]
    if (!anchor) {
      return NextResponse.json({ error: "Anfrage nicht gefunden" }, { status: 404 })
    }

    // Gruppen-UUID bestimmen (Altbestand ohne Gruppe bekommt eine)
    let groupUuid = anchor.request_group as string | null
    if (!groupUuid) {
      groupUuid = randomUUID()
      await sql`UPDATE rentals SET request_group = ${groupUuid}::UUID WHERE id = ${anchor.id}`
    }

    const item = await getInventoryById(Number(itemId))
    if (!item) {
      return NextResponse.json({ error: "Artikel nicht gefunden" }, { status: 404 })
    }

    const qty = Math.max(1, Number(quantity ?? 1))

    await sql`
      INSERT INTO rentals (
        item_id, renter_name, renter_email, renter_phone,
        start_date, end_date, total_price, notes,
        request_group, requester_type, pickup_info, status, quantity
      )
      VALUES (
        ${item.id}, ${anchor.renter_name}, ${anchor.renter_email}, ${anchor.renter_phone},
        ${anchor.start_date}, ${anchor.end_date}, ${item.price_per_day}, ${null},
        ${groupUuid}::UUID, ${anchor.requester_type ?? "external"}, ${anchor.pickup_info ?? null}, ${anchor.status}, ${qty}
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Fehler beim Hinzufügen des Artikels:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
