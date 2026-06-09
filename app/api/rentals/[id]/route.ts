import { type NextRequest, NextResponse } from "next/server"
import { updateRentalStatus } from "@/lib/db"
import { getSession } from "@/lib/auth"

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
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status ist erforderlich" }, { status: 400 })
    }

    const validStatuses = ["pending", "confirmed", "returned", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 })
    }

    const result = await updateRentalStatus(id, status)

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Ausleihe nicht gefunden" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating rental status:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
