"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2 } from "lucide-react"

interface RentalItem {
  id: number
  item_name: string
  quantity: number
  total_price: number
}

export default function EditRentalItems({ items }: { items: RentalItem[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const changeQty = async (rentalRowId: number, quantity: number) => {
    if (quantity < 1) return
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/rentals/item", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalRowId, quantity }),
      })
      if (res.ok) router.refresh()
      else setError((await res.json()).error || "Fehler")
    } catch {
      setError("Verbindungsfehler")
    } finally {
      setBusy(false)
    }
  }

  const removeItem = async (rentalRowId: number, name: string) => {
    if (!window.confirm(`"${name}" aus dieser Anfrage entfernen?`)) return
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/rentals/item", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalRowId }),
      })
      if (res.ok) router.refresh()
      else setError((await res.json()).error || "Fehler")
    } catch {
      setError("Verbindungsfehler")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-1 space-y-1">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={busy || item.quantity <= 1}
              onClick={() => changeQty(item.id, item.quantity - 1)}
              className="w-5 h-5 rounded border flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center font-medium">{item.quantity}×</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => changeQty(item.id, item.quantity + 1)}
              className="w-5 h-5 rounded border flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="flex-1">{item.item_name}</span>
          <span className="text-gray-500">{Number(item.total_price).toFixed(2)}€</span>
          <button
            type="button"
            disabled={busy || items.length <= 1}
            onClick={() => removeItem(item.id, item.item_name)}
            title={items.length <= 1 ? "Der letzte Artikel kann nicht entfernt werden" : "Entfernen"}
            className="text-red-500 hover:text-red-700 disabled:opacity-30"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
