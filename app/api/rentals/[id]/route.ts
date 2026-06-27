import { type NextRequest, NextResponse } from "next/server"
import { ensureRentalsSchema, updateRentalGroupStatus, updateRentalStatus, getAdminContact, sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { MAIL_FROM, toWhatsAppNumber, escapeHtml } from "@/lib/mail"
import { buildICS } from "@/lib/ics"
import { KAUTION_EUR } from "@/lib/config"
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
    const { status, pickupInfo, adminMessage, requestGroup, pickupDate, pickupTime } = await request.json()

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
        // Ansprechpartner-Karte mit variablem Schlusssatz (je nach Bestätigung/Absage)
        const contactCard = (note: string) =>
          contactName
            ? `
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
                <strong>Dein Ansprechpartner:</strong><br>
                ${contactName}<br>
                ${phoneLine}
                ${contactEmail ? `E-Mail: <a href="mailto:${contactEmail}" style="color:#dc2626;text-decoration:none;">${contactEmail}</a><br>` : ""}
                <span style="color:#6b7280;font-size:13px;">${note}</span>
              </div>`
            : ""
        const contactBlock = contactName
          ? contactCard("Bitte wickle diese Ausleihe ab jetzt direkt mit deinem Ansprechpartner ab – du kannst auch einfach auf diese E-Mail antworten.")
          : `<p>Bei Fragen antworte einfach auf diese E-Mail – damit erreichst du direkt deinen Ansprechpartner bei der FFW Raubling.</p>`

        // Get all item names for this group (plain für .ics, escaped fürs HTML)
        const gk = requestGroup ?? rental.request_group
        let itemNamesPlain: string
        if (gk) {
          const rows = await sql`
            SELECT i.name FROM rentals r
            JOIN inventory i ON r.item_id = i.id
            WHERE r.request_group = ${gk}::UUID
            ORDER BY r.id
          `
          itemNamesPlain = rows.map((r) => r.name as string).join(", ")
        } else {
          const row = await sql`SELECT name FROM inventory WHERE id = ${rental.item_id} LIMIT 1`
          itemNamesPlain = (row[0]?.name as string | undefined) ?? "Artikel"
        }
        const itemNamesStr = escapeHtml(itemNamesPlain)

        const renterName = escapeHtml(rental.renter_name as string)
        const pickupInfoHtml = escapeHtml(pickupInfo as string | null)
        const adminMessageHtml = escapeHtml(adminMessage as string | null)
        const startDate = new Date(rental.start_date).toLocaleDateString("de-DE")
        const endDate = new Date(rental.end_date).toLocaleDateString("de-DE")

        // Abhol-Termin als Kalender-Datei (.ics) für den Ausleiher vorbereiten
        let pickupAttachment: { filename: string; content: string }[] | undefined
        let pickupLineHtml = ""
        if (status === "confirmed" && pickupDate) {
          const hasTime = !!pickupTime
          const start = new Date(`${pickupDate}T${hasTime ? pickupTime : "00:00"}:00`)
          const end = new Date(start)
          if (hasTime) {
            end.setMinutes(end.getMinutes() + 30) // Standard-Dauer 30 Min
          } else {
            end.setDate(end.getDate() + 1) // ganztägig: Enddatum exklusiv
          }
          const descParts = [
            `Abholung: ${itemNamesPlain}`,
            pickupInfo ? `Hinweis: ${pickupInfo}` : "",
            contact?.display_name || contact?.username ? `Ansprechpartner: ${contact?.display_name || contact?.username}` : "",
            contact?.phone ? `Telefon: ${contact?.phone}` : "",
          ].filter(Boolean)
          const ics = buildICS({
            uid: `${gk ?? rental.id}@ffw-raubling-verleih`,
            summary: `Abholung Verleih: ${itemNamesPlain} – FFW Raubling`,
            description: descParts.join("\n"),
            start,
            end,
            allDay: !hasTime,
            stamp: start,
          })
          pickupAttachment = [{
            filename: "abholung.ics",
            content: Buffer.from(ics, "utf-8").toString("base64"),
          }]
          const dateLabel = start.toLocaleDateString("de-DE")
          pickupLineHtml = `<p style="margin:8px 0;"><strong>📅 Abholung:</strong> ${dateLabel}${hasTime ? ` um ${escapeHtml(pickupTime)} Uhr` : ""} <span style="color:#6b7280;font-size:13px;">(Kalender-Datei im Anhang)</span></p>`
        }

        if (status === "confirmed") {
          await resend.emails.send({
            from: MAIL_FROM,
            to: rental.renter_email,
            replyTo,
            attachments: pickupAttachment,
            subject: `Deine Ausleihanfrage wurde bestätigt – ${itemNamesStr}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px;">
                <h2 style="color: #16a34a;">Ausleihe bestätigt – FFW Raubling</h2>
                <p>Hallo ${renterName},</p>
                <p>Deine Anfrage für <strong>${itemNamesStr}</strong> (${startDate}–${endDate}) wurde bestätigt.</p>
                ${pickupLineHtml}
                ${pickupInfoHtml ? `
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
                  <strong>Abholhinweis:</strong><br>${pickupInfoHtml}
                </div>` : ""}
                ${adminMessageHtml ? `<p><em>${adminMessageHtml}</em></p>` : ""}
                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:16px 0;">
                  <p style="margin:0 0 8px;"><strong>Kaution: ${KAUTION_EUR}€.</strong> Bitte bring die Kaution zur Abholung mit. Ohne hinterlegte Kaution können wir dir die Sachen leider nicht mitgeben. Bei unbeschädigter Rückgabe bekommst du sie zurück.</p>
                  <p style="margin:0;"><strong>Schäden &amp; Verluste:</strong> Geht etwas kaputt oder fehlt etwas, kümmern wir uns um Ersatz oder Reparatur – die Kosten dafür trägst du als Ausleiher.</p>
                </div>
                ${contactBlock}
              </div>
            `,
          })
        } else {
          // Absage: ablehnenden Admin als Ansprechpartner nennen
          const rejectContact = contactName
            ? `<p>Hast du Rückfragen? Wende dich am besten an den Admin, der die Anfrage bearbeitet hat:</p>` +
              contactCard("Du erreichst ihn unter den genannten Kontaktdaten oder per Antwort auf diese E-Mail.")
            : `<p>Hast du Rückfragen? Wende dich bitte an einen Admin der FFW Raubling – am besten antwortest du einfach auf diese E-Mail.</p>`
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
                ${rejectContact}
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
