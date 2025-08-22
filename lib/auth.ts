import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { getAdminByEmail } from "./db"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface AdminUser {
  id: number
  email: string
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // Create a simple hash using PBKDF2
  const key = await crypto.subtle.importKey("raw", data, { name: "PBKDF2" }, false, ["deriveBits"])

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  )

  // Combine salt and hash
  const hashArray = new Uint8Array(salt.length + derivedBits.byteLength)
  hashArray.set(salt)
  hashArray.set(new Uint8Array(derivedBits), salt.length)

  // Convert to base64
  return btoa(String.fromCharCode(...hashArray))
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)

    // Decode the stored hash
    const hashArray = new Uint8Array(
      atob(hashedPassword)
        .split("")
        .map((c) => c.charCodeAt(0)),
    )
    const salt = hashArray.slice(0, 16)
    const storedHash = hashArray.slice(16)

    // Recreate the hash with the same salt
    const key = await crypto.subtle.importKey("raw", data, { name: "PBKDF2" }, false, ["deriveBits"])

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    )

    const newHash = new Uint8Array(derivedBits)

    // Compare hashes
    if (newHash.length !== storedHash.length) return false

    let result = 0
    for (let i = 0; i < newHash.length; i++) {
      result |= newHash[i] ^ storedHash[i]
    }

    return result === 0
  } catch {
    return false
  }
}

export async function createToken(payload: AdminUser): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as AdminUser
  } catch {
    return null
  }
}

export async function login(email: string, password: string): Promise<AdminUser | null> {
  const admin = await getAdminByEmail(email)
  if (!admin) return null

  const isValid = await verifyPassword(password, admin.password_hash)
  if (!isValid) return null

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  }
}

export async function getSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  return await verifyToken(token)
}

export async function setSession(user: AdminUser) {
  const token = await createToken(user)
  const cookieStore = await cookies()

  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}
