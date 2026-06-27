import { type NextRequest } from "next/server"
import { getSession } from "@/lib/auth"
import { sql, ensureRentalsSchema } from "@/lib/db"
import { buildICS } from "@/lib/ics"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return new Response("Nicht autorisiert", { status: 401 })
  }

  const group = request.nextUrl.searchParams.get("group")
  if (!group) {
    return new Response("Parameter 'group' fehlt", { status: 400 })
  }

  await ensureRentalsSchema()

  // Zeilen der Buchung laden – per request_group (UUID) oder per Einzel-ID
  const isUuid = group.includes("-")
  const rows = isUuid
    ? await sql`
        SELECT r.renter_name, r.renter_email, r.renter_phone, r.start_date, r.end_date,
               r.notes, r.pickup_info, r.quantity, i.name AS item_name
        FROM rentals r JOIN inventory i ON r.item_id = i.id
        WHERE r.request_group = ${group}::UUID
        ORDER BY r.id
      `
    : await sql`
        SELECT r.renter_name, r.renter_email, r.renter_phone, r.start_date, r.end_date,
               r.notes, r.pickup_info, r.quantity, i.name AS item_name
        FROM rentals r JOIN inventory i ON r.item_id = i.id
        WHERE r.id = ${Number.parseInt(group)}
        ORDER BY r.id
      `

  if (!rows || rows.length === 0) {
    return new Response("Ausleihe nicht gefunden", { status: 404 })
  }

  const first = rows[0]
  const itemList = rows
    .map((r) => (Number(r.quantity ?? 1) > 1 ? `${r.quantity}× ${r.item_name}` : r.item_name))
    .join(", ")

  const start = new Date(first.start_date as string)
  const endExclusive = new Date(first.end_date as string)
  endExclusive.setDate(endExclusive.getDate() + 1)

  const descParts = [
    `Ausleiher: ${first.renter_name}`,
    first.renter_phone ? `Telefon: ${first.renter_phone}` : "",
    first.renter_email ? `E-Mail: ${first.renter_email}` : "",
    `Artikel: ${itemList}`,
    first.pickup_info ? `Abholung: ${first.pickup_info}` : "",
    first.notes ? `Notiz: ${first.notes}` : "",
  ].filter(Boolean)

  const ics = buildICS({
    uid: `${group}@ffw-raubling-verleih`,
    summary: `Verleih: ${itemList} – ${first.renter_name}`,
    description: descParts.join("\n"),
    start,
    endExclusive,
    stamp: new Date(first.start_date as string),
  })

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="ausleihe-${group}.ics"`,
    },
  })
}
