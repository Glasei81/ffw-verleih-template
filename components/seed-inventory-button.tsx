"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SeedInventoryButton() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSeed = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/seed-inventory", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
        setTimeout(() => router.refresh(), 800)
      } else {
        setError(data.error || "Unbekannter Fehler")
      }
    } catch {
      setError("Verbindungsfehler")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-8 text-green-700 font-medium">
        86 Artikel erfolgreich eingespielt!
      </div>
    )
  }

  return (
    <div className="text-center py-8 space-y-4">
      <p className="text-gray-500 text-sm">Das Inventar ist noch leer.</p>
      <Button
        onClick={handleSeed}
        disabled={loading}
        className="bg-red-600 hover:bg-red-700"
      >
        {loading ? "Wird eingespielt…" : "Inventarliste 2025 laden (86 Artikel)"}
      </Button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
