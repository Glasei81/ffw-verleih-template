"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { AdminUser } from "@/lib/auth"
import Link from "next/link"

interface AdminHeaderProps {
  user: AdminUser
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold text-blue-600">
              Club Verwaltung
            </Link>
            <nav className="flex space-x-6">
              <Link href="/admin" className="text-gray-600 hover:text-blue-600 font-medium">
                Übersicht
              </Link>
              <Link href="/admin/inventory" className="text-gray-600 hover:text-blue-600 font-medium">
                Inventar
              </Link>
              <Link href="/admin/rentals" className="text-gray-600 hover:text-blue-600 font-medium">
                Vermietungen
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Angemeldet als: <span className="font-medium">{user.name}</span>
            </span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Abmelden
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
