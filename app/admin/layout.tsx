import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import AdminHeader from "@/components/admin-header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={session} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
