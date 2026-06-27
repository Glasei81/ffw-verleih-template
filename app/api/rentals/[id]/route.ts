import { type NextRequest, NextResponse } from "next/server"
import { ensureRentalsSchema, updateRentalGroupStatus, updateRentalStatus, getAdminContact, sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { MAIL_FROM, toWhatsAppNumber, escapeHtml } from "@/lib/mail"
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

        // Ansprechpartner = der Admin, der gerade bestätigt (aus der Session)
        const contact = await getAdminContact(session)
        const contactName = escapeHtml((contact?.display_name as string) || (contact?.username as string) || "")
        const contactEmail = escapeHtml((contact?.email as string) || "")
        const contactPhone = escapeHtml((contact?.phone as string) || "")
        const waNumber = toWhatsAppNumber((contact?.phone as string) || "")
        const phoneLine = contactPhone
          ? `Telefon: <a href="tel:${contactPhone.replace(/\s/g, "")}" style="color:#dc2626;text-decoration:none;">${contactPhone}</a>` +
            (waNumber
              ? ` &nbsp;·&nbsp; <a href="https://wa.me/${waNumber}" style="color:#16a34a;text-decoration:none;font-weight:bold;">WhatsApp</a>`
              : "") +
            "<br>"
          : ""
        const contactBlock = contactName
          ? `
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
                <strong>Dein Ansprechpartner:</strong><br>
                ${contactName}<br>
                ${phoneLine}
                ${contactEmail ? `E-Mail: <a href="mailto:${contactEmail}" style="color:#dc2626;text-decoration:none;">${contactEmail}</a><br>` : ""}
                <span style="color:#6b7280;font-size:13px;">Bitte wickle diese Ausleihe ab jetzt direkt mit deinem Ansprechpartner ab – du kannst auch einfach auf diese E-Mail antworten.</span>
              </div>`
          : `<p>Bei Fragen antworte einfach auf diese E-Mail – damit erreichst du direkt deinen Ansprechpartner bei der FFW Raubling.</p>`

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
          itemNamesStr = rows.map((r) => escapeHtml(r.name as string)).join(", ")
        } else {
          const row = await sql`SELECT name FROM inventory WHERE id = ${rental.item_id} LIMIT 1`
          itemNamesStr = escapeHtml((row[0]?.name as string | undefined) ?? "Artikel")
        }

        const renterName = escapeHtml(rental.renter_name as string)
        const pickupInfoHtml = escapeHtml(pickupInfo as string | null)
        const adminMessageHtml = escapeHtml(adminMessage as string | null)
        const startDate = new Date(rental.start_date).toLocaleDateString("de-DE")
        const endDate = new Date(rental.end_date).toLocaleDateString("de-DE")

        if (status === "confirmed") {
          await resend.emails.send({
            from: MAIL_FROM,
            to: rental.renter_email,
            replyTo,
            subject: `Deine Ausleihanfrage wurde bestätigt – ${itemNamesStr}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px;">
                <h2 style="color: #16a34a;">Ausleihe bestätigt – FFW Raubling</h2>
                <p>Hallo ${renterName},</p>
                <p>Deine Anfrage für <strong>${itemNamesStr}</strong> (${startDate}–${endDate}) wurde bestätigt.</p>
                ${pickupInfoHtml ? `
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
                  <strong>Abholhinweis:</strong><br>${pickupInfoHtml}
                </div>` : ""}
                ${adminMessageHtml ? `<p><em>${adminMessageHtml}</em></p>` : ""}
                ${contactBlock}
              </div>
            `,
          })
        } else {
          await resend.emails.send({
            from: MAIL_FROM,
            to: rental.renter_email,
            replyTo,
            subject: `Deine Ausleihanfrage – ${itemNamesStr}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px;">
                <h2 style="color: #dc2626;">Anfrage konnte nicht bestätigt werden – FFW Raubling</h2>
                <p>Hallo ${renterName},</p>
                <p>Leider können wir deine Anfrage für <strong>${itemNamesStr}</strong> (${startDate}–${endDate}) nicht bestätigen.</p>
                ${adminMessageHtml ? `<p><strong>Hinweis:</strong> ${adminMessageHtml}</p>` : ""}
                <p>Für Rückfragen wende dich bitte an die Freiwillige Feuerwehr Raubling.</p>
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
