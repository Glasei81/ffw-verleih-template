"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminHeader() {
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
            <Link href="/admin" className="text-xl font-bold text-red-600">
              FFW Raubling – Verleih
            </Link>
            <nav className="flex space-x-6">
              <Link href="/admin" className="text-gray-600 hover:text-red-600 font-medium">
                Übersicht
              </Link>
              <Link href="/admin/inventory" className="text-gray-600 hover:text-red-600 font-medium">
                Inventar
              </Link>
              <Link href="/admin/rentals" className="text-gray-600 hover:text-red-600 font-medium">
                Ausleihen
              </Link>
            </nav>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Abmelden
          </Button>
        </div>
      </div>
    </header>
  )
}
