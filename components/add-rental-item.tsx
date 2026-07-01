"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface InventoryOption {
  id: number
  name: string
}

export default function AddRentalItem({
  requestGroup,
  items,
}: {
  requestGroup: string
  items: InventoryOption[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [itemId, setItemId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submit = async () => {
    if (!itemId) {
      setError("Bitte einen Artikel wählen.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/rentals/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestGroup, itemId: Number(itemId), quantity }),
      })
      if (res.ok) {
        setOpen(false)
        setItemId("")
        setQuantity(1)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Fehler beim Hinzufügen")
      }
    } catch {
      setError("Verbindungsfehler")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 mt-3 text-xs text-red-600 hover:underline"
      >
        <Plus className="h-3.5 w-3.5" />
        Artikel hinzufügen
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Artikel zur Anfrage hinzufügen</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="add-item-select">Artikel</Label>
                <select
                  id="add-item-select"
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                >
                  <option value="">– bitte wählen –</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-item-qty">Menge</Label>
                <Input
                  id="add-item-qty"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-24"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
              <Button onClick={submit} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                {loading ? "Wird hinzugefügt…" : "Hinzufügen"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
