import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql, ensureRentalsSchema, getInventoryById } from "@/lib/db"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })

  try {
    const { renterName, renterEmail, renterPhone, requesterType, startDate, endDate, items, notes, sendEmail } =
      await request.json()

    // Validation
    if (!renterName || !startDate || !endDate || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Erforderliche Felder: Name, Von, Bis, mindestens ein Artikel" },
        { status: 400 }
      )
    }

    await ensureRentalsSchema()

    // Generate group UUID
    const groupUuid = randomUUID()

    // Create rental for each item
    for (const item of items) {
      const { itemId, quantity } = item

      if (!itemId || !quantity || quantity < 1) {
        return NextResponse.json({ error: "Ungültige Artikel oder Menge" }, { status: 400 })
      }

      const inventory = await getInventoryById(Number(itemId))
      if (!inventory) {
        return NextResponse.json({ error: `Artikel mit ID ${itemId} nicht gefunden` }, { status: 404 })
      }

      // Check availability against confirmed rentals
      const stock = Number(inventory.quantity ?? 1)
      const reservedRows = await sql`
        SELECT COALESCE(SUM(quantity), 0)::int AS reserved FROM rentals
        WHERE item_id = ${inventory.id}
          AND status = 'confirmed'
          AND start_date < ${endDate}
          AND end_date > ${startDate}
      `
      const reserved = Number(reservedRows[0]?.reserved ?? 0)
      const free = stock - reserved
      if (quantity > free) {
        const msg = free <= 0
          ? `"${inventory.name}" ist im Zeitraum komplett vergeben.`
          : `Von "${inventory.name}" sind nur noch ${free} Stück im Zeitraum frei (du wolltest ${quantity} hinzufügen).`
        return NextResponse.json({ error: msg }, { status: 409 })
      }

      // Create rental row
      await sql`
        INSERT INTO rentals (
          item_id, renter_name, renter_email, renter_phone,
          start_date, end_date, total_price, notes,
          request_group, requester_type, status, quantity
        )
        VALUES (
          ${inventory.id}, ${renterName}, ${renterEmail || null}, ${renterPhone || null},
          ${startDate}, ${endDate}, ${inventory.price_per_day}, ${notes || null},
          ${groupUuid}::UUID, ${requesterType || "external"}, 'pending', ${quantity}
        )
      `
    }

    // Send email if requested and email is provided
    if (sendEmail && renterEmail) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        const itemsList = items
          .map((item: any) => `${item.quantity}× ${item.itemName}`)
          .join(", ")
        const startDateFormatted = new Date(startDate).toLocaleDateString("de-DE")
        const endDateFormatted = new Date(endDate).toLocaleDateString("de-DE")

        await resend.emails.send({
          from: process.env.RESEND_FROM || "onboarding@resend.dev",
          to: renterEmail,
          subject: "Ihre Ausleihanfrage – FFW Raubling",
          html: `
            <h2>Ausleihanfrage bestätigt</h2>
            <p>Hallo ${renterName},</p>
            <p>wir haben deine Anfrage erhalten:</p>
            <p><strong>Artikel:</strong> ${itemsList}</p>
            <p><strong>Zeitraum:</strong> ${startDateFormatted} bis ${endDateFormatted}</p>
            <p><strong>Kaution:</strong> 50€ (bindend, nicht verhandelbar)</p>
            <p>Ein Mitglied der FFW Raubling wird dich in Kürze kontaktieren, um die Details zu klären und die Abholung abzusprechen.</p>
            <p>Viele Grüße,<br/>FFW Raubling</p>
          `,
        })
      } catch (emailError) {
        console.error("Fehler beim E-Mail-Versand:", emailError)
        // Nicht kritisch – Ausleihe wird trotzdem angelegt
      }
    }

    return NextResponse.json({ success: true, groupUuid })
  } catch (error) {
    console.error("Fehler beim Anlegen der Ausleihe:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
