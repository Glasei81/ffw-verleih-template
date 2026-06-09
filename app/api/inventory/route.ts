import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, description, price_per_day, is_available } = await request.json()

    if (!name || price_per_day === undefined) {
      return NextResponse.json({ error: "Name und Preis sind erforderlich" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO inventory (name, description, price_per_day, is_available)
      VALUES (${name}, ${description || null}, ${price_per_day}, ${is_available})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Error creating inventory item:", message)
    return NextResponse.json({ error: "Datenbankfehler", detail: message }, { status: 500 })
  }
}
