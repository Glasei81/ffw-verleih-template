import { type NextRequest, NextResponse } from "next/server"
import { createRental } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.itemId || !data.renterName || !data.renterEmail || !data.startDate || !data.endDate) {
      return NextResponse.json({ error: "Alle Pflichtfelder müssen ausgefüllt werden" }, { status: 400 })
    }

    // Validate dates
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

    // Create rental
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

    return NextResponse.json({ success: true, rental: rental[0] })
  } catch (error) {
    console.error("Reservation error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
