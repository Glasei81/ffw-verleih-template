import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ffw-geheim-bitte-aendern"
)

export async function login(username: string, password: string): Promise<boolean> {
  // Fallback: Benutzername "admin" mit ADMIN_PASSWORD Umgebungsvariable
  if (username === "admin" && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    return true
  }
  // Admins aus der Datenbank prüfen
  try {
    const { sql } = await import("./db")
    const bcrypt = await import("bcryptjs")
    const result = await sql`SELECT password_hash FROM admins WHERE username = ${username} LIMIT 1`
    if (result.length === 0) return false
    return await bcrypt.compare(password, result[0].password_hash)
  } catch {
    return false
  }
}

export async function createToken(username: string): Promise<string> {
  return await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET)
}

export async function getSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return (payload.username as string) || null
  } catch {
    return null
  }
}

export async function setSession(username: string) {
  const token = await createToken(username)
  const cookieStore = await cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}
