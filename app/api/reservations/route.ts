import { type NextRequest, NextResponse } from "next/server"
import { createRental, ensureRentalsSchema, getInventoryById, sql } from "@/lib/db"
import { MAIL_FROM, escapeHtml } from "@/lib/mail"
import { Resend } from "resend"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { renterName, renterEmail, renterPhone, startDate, endDate, notes, itemIds, requesterType } = data
    // Gewünschte Stückzahl je Artikel-ID (z.B. { "12": 5 }); fehlt sie, gilt 1
    const quantities: Record<number, number> = data.quantities || {}

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: "Mindestens einen Artikel auswählen" }, { status: 400 })
    }
    if (!renterName || !renterEmail || !startDate || !endDate) {
      return NextResponse.json({ error: "Alle Pflichtfelder müssen ausgefüllt werden" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (start < today) {
      return NextResponse.json({ error: "Das Startdatum darf nicht in der Vergangenheit liegen" }, { status: 400 })
    }
    if (end < start) {
      return NextResponse.json({ error: "Das Enddatum muss nach dem Startdatum liegen" }, { status: 400 })
    }

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const items = await Promise.all((itemIds as number[]).map((id) => getInventoryById(id)))
    const unavailable = items.filter((item) => !item || !item.is_available)
    if (unavailable.length > 0) {
      return NextResponse.json({ error: "Ein oder mehrere Artikel sind nicht verfügbar" }, { status: 400 })
    }

    // Schema sicherstellen (u.a. quantity-Spalte) bevor wir Mengen prüfen
    await ensureRentalsSchema()

    // Verfügbarkeit prüfen: bereits bestätigte Stückzahl im Zeitraum gegen
    // den Gesamtbestand und die jetzt gewünschte Menge abgleichen
    for (const item of items) {
      const requested = Math.max(1, Number(quantities[item!.id] ?? 1))
      const stock = Number(item!.quantity ?? 1)
      const rows = await sql`
        SELECT COALESCE(SUM(quantity), 0)::int AS reserved FROM rentals
        WHERE item_id = ${item!.id}
          AND status = 'confirmed'
          AND start_date <= ${endDate}
          AND end_date >= ${startDate}
      `
      const reserved = Number(rows[0]?.reserved ?? 0)
      const free = stock - reserved
      if (requested > free) {
        const msg = free <= 0
          ? `"${item!.name}" ist im gewählten Zeitraum bereits komplett vergeben. Bitte anderen Zeitraum wählen.`
          : `Von "${item!.name}" ${free === 1 ? "ist im gewählten Zeitraum nur noch 1 Stück" : `sind im gewählten Zeitraum nur noch ${free} Stück`} verfügbar (du hast ${requested} angefragt).`
        return NextResponse.json({ error: msg }, { status: 400 })
      }
    }

    // All items in this submission share one group id
    const requestGroup = randomUUID()
    const rType = (requesterType as string) || "external"

    const rentals = await Promise.all(
      items.map((item) =>
        createRental({
          item_id: item!.id,
          renter_name: renterName,
          renter_email: renterEmail,
          renter_phone: renterPhone,
          start_date: startDate,
          end_date: endDate,
          total_price: item!.price_per_day, // Pauschale pro Gegenstand
          notes,
          request_group: requestGroup,
          requester_type: rType,
          quantity: quantities[item!.id] ?? 1,
        })
      )
    )

    // Notify all admins
    if (process.env.RESEND_API_KEY) {
      try {
        const adminRows = await sql`SELECT email FROM admins WHERE email IS NOT NULL AND email != ''`
        const adminEmails = adminRows.map((r) => r.email as string)

        if (adminEmails.length > 0) {
          const resend = new Resend(process.env.RESEND_API_KEY)
          // Pauschalpreis: einmal pro Gegenstand, unabhängig von Menge und Tagen
          const itemList = items.map((i) => `${escapeHtml(i!.name)} (${i!.price_per_day}€)`).join(", ")
          const totalPrice = items.reduce((sum, i) => sum + Number(i!.price_per_day), 0)

          await resend.emails.send({
            from: MAIL_FROM,
            to: adminEmails,
            replyTo: renterEmail || undefined,
            subject: `Neue Ausleihanfrage von ${escapeHtml(renterName)}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px;">
                <h2 style="color: #dc2626;">Neue Ausleihanfrage – FFW Raubling</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 6px 0; color: #666;">Artikel</td><td style="padding: 6px 0; font-weight: bold;">${itemList}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Von</td><td style="padding: 6px 0;">${escapeHtml(renterName)}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">E-Mail</td><td style="padding: 6px 0;">${escapeHtml(renterEmail)}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Telefon</td><td style="padding: 6px 0;">${escapeHtml(renterPhone) || "–"}</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Zeitraum</td><td style="padding: 6px 0;">${startDate} bis ${endDate} (${days} Tag${days !== 1 ? "e" : ""})</td></tr>
                  <tr><td style="padding: 6px 0; color: #666;">Gesamtpreis</td><td style="padding: 6px 0; font-weight: bold; color: #dc2626;">${totalPrice}€ Pauschale</td></tr>
                  ${notes ? `<tr><td style="padding: 6px 0; color: #666;">Notizen</td><td style="padding: 6px 0;">${escapeHtml(notes)}</td></tr>` : ""}
                </table>
              </div>
            `,
          })
        }
      } catch (emailError) {
        console.error("E-Mail konnte nicht gesendet werden:", emailError)
      }
    }

    return NextResponse.json({ success: true, rentals })
  } catch (error) {
    console.error("Reservation error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
