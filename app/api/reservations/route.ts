import { type NextRequest, NextResponse } from "next/server"
import { createRental, getInventoryById } from "@/lib/db"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.itemId || !data.renterName || !data.renterEmail || !data.startDate || !data.endDate) {
      return NextResponse.json({ error: "Alle Pflichtfelder müssen ausgefüllt werden" }, { status: 400 })
    }

    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      return NextResponse.json({ error: "Das Startdatum darf nicht in der Vergangenheit liegen" }, { status: 400 })
    }

    if (endDate < startDate) {
      return NextResponse.json({ error: "Das Enddatum muss nach dem Startdatum liegen" }, { status: 400 })
    }

    const rental = await createRental({
      item_id: data.itemId,
      renter_name: data.renterName,
      renter_email: data.renterEmail,
      renter_phone: data.renterPhone,
      start_date: data.startDate,
      end_date: data.endDate,
      total_price: data.totalPrice,
      notes: data.notes,
    })

    // E-Mail-Benachrichtigung (non-blocking)
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const item = await getInventoryById(data.itemId)
        const tage = Math.ceil(
          (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1

        await resend.emails.send({
          from: "FFW Raubling Verleih <onboarding@resend.dev>",
          to: process.env.ADMIN_EMAIL,
          subject: `Neue Ausleihanfrage: ${item?.name ?? "Artikel"}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px;">
              <h2 style="color: #dc2626;">Neue Ausleihanfrage – FFW Raubling</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #666;">Artikel</td><td style="padding: 6px 0; font-weight: bold;">${item?.name ?? "–"}</td></tr>
                <tr><td style="padding: 6px 0; color: #666;">Von</td><td style="padding: 6px 0;">${data.renterName}</td></tr>
                <tr><td style="padding: 6px 0; color: #666;">E-Mail</td><td style="padding: 6px 0;">${data.renterEmail}</td></tr>
                <tr><td style="padding: 6px 0; color: #666;">Telefon</td><td style="padding: 6px 0;">${data.renterPhone || "–"}</td></tr>
                <tr><td style="padding: 6px 0; color: #666;">Zeitraum</td><td style="padding: 6px 0;">${data.startDate} bis ${data.endDate} (${tage} Tag${tage !== 1 ? "e" : ""})</td></tr>
                <tr><td style="padding: 6px 0; color: #666;">Gesamtpreis</td><td style="padding: 6px 0; font-weight: bold; color: #dc2626;">${data.totalPrice}€</td></tr>
                ${data.notes ? `<tr><td style="padding: 6px 0; color: #666;">Notizen</td><td style="padding: 6px 0;">${data.notes}</td></tr>` : ""}
              </table>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("E-Mail konnte nicht gesendet werden:", emailError)
      }
    }

    return NextResponse.json({ success: true, rental: rental[0] })
  } catch (error) {
    console.error("Reservation error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
