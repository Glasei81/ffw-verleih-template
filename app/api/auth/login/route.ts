import { type NextRequest, NextResponse } from "next/server"
import { login, setSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Passwort ist erforderlich" }, { status: 400 })
    }

    const valid = await login(password)

    if (!valid) {
      return NextResponse.json({ error: "Falsches Passwort" }, { status: 401 })
    }

    await setSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
