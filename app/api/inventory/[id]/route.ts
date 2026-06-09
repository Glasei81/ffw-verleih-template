import { type NextRequest, NextResponse } from "next/server"
import { updateInventoryItem, deleteInventoryItem } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })

  try {
    const { id: idStr } = await params
    const id = Number.parseInt(idStr)
    const updates = await request.json()
    const result = await updateInventoryItem(id, updates)
    if (!result) return NextResponse.json({ error: "Artikel nicht gefunden" }, { status: 404 })
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })

  try {
    const { id: idStr } = await params
    const id = Number.parseInt(idStr)
    await deleteInventoryItem(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
