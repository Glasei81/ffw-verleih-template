import { type NextRequest, NextResponse } from "next/server"
import { updateInventoryItem } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const updates = await request.json()

    const result = await updateInventoryItem(id, updates)

    if (!result) {
      return NextResponse.json({ error: "Artikel nicht gefunden" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
