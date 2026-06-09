import { type NextRequest, NextResponse } from "next/server"
import { login, setSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Passwort ist erforderlich" }, { status: 400 })
    }

    const user = username?.trim() || "admin"
    const valid = await login(user, password)

    if (!valid) {
      return NextResponse.json({ error: "Benutzername oder Passwort falsch" }, { status: 401 })
    }

    await setSession(user)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
