import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })

  const admins = await sql`SELECT id, username, created_at FROM admins ORDER BY created_at ASC`
  return NextResponse.json(admins)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })

  try {
    const { username, password } = await request.json()
    if (!username?.trim() || !password) {
      return NextResponse.json({ error: "Benutzername und Passwort erforderlich" }, { status: 400 })
    }
    if (username.trim() === "admin") {
      return NextResponse.json({ error: '"admin" ist reserviert' }, { status: 400 })
    }
    const hash = await bcrypt.hash(password, 10)
    await sql`INSERT INTO admins (username, password_hash) VALUES (${username.trim()}, ${hash})`
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : ""
    if (msg.includes("unique")) {
      return NextResponse.json({ error: "Benutzername bereits vergeben" }, { status: 409 })
    }
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })

  const { id } = await request.json()
  await sql`DELETE FROM admins WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
