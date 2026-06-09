import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import AdminsClient from "@/components/admins-client"

export const dynamic = "force-dynamic"

export default async function AdminsPage() {
  const currentUser = await getSession()
  let admins: { id: number; username: string; created_at: string }[] = []
  try {
    admins = await sql`SELECT id, username, created_at FROM admins ORDER BY created_at ASC` as typeof admins
  } catch {
    // Tabelle existiert noch nicht
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin-Verwaltung</h1>
        <p className="text-gray-600 mt-1">Weitere Administratoren anlegen und verwalten</p>
      </div>
      <AdminsClient admins={admins} currentUser={currentUser ?? "admin"} />
    </div>
  )
}
