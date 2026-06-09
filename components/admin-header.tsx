"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 gap-2">
          <Link href="/admin" className="text-base font-bold text-red-600 whitespace-nowrap">
            FFW Raubling
          </Link>
          <nav className="flex space-x-3 flex-1 justify-center">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-red-600 font-medium whitespace-nowrap">
              Übersicht
            </Link>
            <Link href="/admin/inventory" className="text-sm text-gray-600 hover:text-red-600 font-medium whitespace-nowrap">
              Inventar
            </Link>
            <Link href="/admin/rentals" className="text-sm text-gray-600 hover:text-red-600 font-medium whitespace-nowrap">
              Ausleihen
            </Link>
          </nav>
          <Button onClick={handleLogout} variant="outline" size="sm" className="text-xs whitespace-nowrap">
            Abmelden
          </Button>
        </div>
      </div>
    </header>
  )
}
