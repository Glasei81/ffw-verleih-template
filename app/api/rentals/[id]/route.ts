import { type NextRequest, NextResponse } from "next/server"
import { updateRentalStatus } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status ist erforderlich" }, { status: 400 })
    }

    const validStatuses = ["pending", "confirmed", "active", "returned", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 })
    }

    const result = await updateRentalStatus(id, status)

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Vermietung nicht gefunden" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating rental status:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
