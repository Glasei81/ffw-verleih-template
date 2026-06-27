import { type NextRequest, NextResponse } from "next/server"
import { ensureRentalsSchema, updateRentalGroupStatus, updateRentalStatus, sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { MAIL_FROM } from "@/lib/mail"
import { Resend } from "resend"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })
  }

  try {
    const { id: idStr } = await params
    const id = Number.parseInt(idStr)
    const { status, pickupInfo, adminMessage, requestGroup } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status ist erforderlich" }, { status: 400 })
    }

    const validStatuses = ["pending", "confirmed", "returned", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 })
    }

    await ensureRentalsSchema()

    let result
    if (requestGroup) {
      result = await updateRentalGroupStatus(requestGroup, status, pickupInfo || null)
    } else if (pickupInfo) {
      result = await sql`
        UPDATE rentals
        SET status = ${status}, pickup_info = ${pickupInfo}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
    } else {
      result = await updateRentalStatus(id, status)
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Ausleihe nicht gefunden" }, { status: 404 })
    }

    const rental = result[0]

    // Send confirmation or rejection email to renter
    if (
      process.env.RESEND_API_KEY &&
      rental.renter_email &&
      (status === "confirmed" || status === "cancelled")
    ) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Antworten der Ausleiher sollen an die Admins gehen
        const adminRows = await sql`SELECT email FROM admins WHERE email IS NOT NULL AND email != ''`
        const adminEmails = adminRows.map((r) => r.email as string)
        const replyTo = adminEmails.length > 0 ? adminEmails : undefined

        // Get all item names for this group
        const gk = requestGroup ?? rental.request_group
        let itemNamesStr: string
        if (gk) {
          const rows = await sql`
            SELECT i.name FROM rentals r
            JOIN inventory i ON r.item_id = i.id
            WHERE r.request_group = ${gk}::UUID
            ORDER BY r.id
          `
          itemNamesStr = rows.map((r) => r.name as string).join(", ")
        } else {
          const row = await sql`SELECT name FROM inventory WHERE id = ${rental.item_id} LIMIT 1`
          itemNamesStr = (row[0]?.name as string | undefined) ?? "Artikel"
        }

        const startDate = new Date(rental.start_date).toLocaleDateString("de-DE")
        const endDate = new Date(rental.end_date).toLocaleDateString("de-DE")

        if (status === "confirmed") {
          await resend.emails.send({
            from: MAIL_FROM,
            to: rental.renter_email,
            replyTo,
            subject: `Ihre Ausleihanfrage wurde bestätigt – ${itemNamesStr}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px;">
                <h2 style="color: #16a34a;">Ausleihe bestätigt – FFW Raubling</h2>
                <p>Guten Tag ${rental.renter_name},</p>
                <p>Ihre Anfrage für <strong>${itemNamesStr}</strong> (${startDate}–${endDate}) wurde bestätigt.</p>
                ${pickupInfo ? `
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
                  <strong>Abholhinweis:</strong><br>${pickupInfo}
                </div>` : ""}
                ${adminMessage ? `<p><em>${adminMessage}</em></p>` : ""}
                <p>Bei Fragen wenden Sie sich bitte an die Freiwillige Feuerwehr Raubling.</p>
              </div>
            `,
          })
        } else {
          await resend.emails.send({
            from: MAIL_FROM,
            to: rental.renter_email,
            replyTo,
            subject: `Ihre Ausleihanfrage – ${itemNamesStr}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px;">
                <h2 style="color: #dc2626;">Anfrage konnte nicht bestätigt werden – FFW Raubling</h2>
                <p>Guten Tag ${rental.renter_name},</p>
                <p>Leider können wir Ihre Anfrage für <strong>${itemNamesStr}</strong> (${startDate}–${endDate}) nicht bestätigen.</p>
                ${adminMessage ? `<p><strong>Hinweis:</strong> ${adminMessage}</p>` : ""}
                <p>Für Rückfragen wenden Sie sich bitte an die Freiwillige Feuerwehr Raubling.</p>
              </div>
            `,
          })
        }
      } catch (emailError) {
        console.error("E-Mail an Ausleiher konnte nicht gesendet werden:", emailError)
      }
    }

    return NextResponse.json(rental)
  } catch (error) {
    console.error("Error updating rental status:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
