"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"

interface InventoryItem {
  id: number
  name: string
}

export default function CreateManualRental({ inventoryItems }: { inventoryItems: InventoryItem[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [renterName, setRenterName] = useState("")
  const [renterEmail, setRenterEmail] = useState("")
  const [renterPhone, setRenterPhone] = useState("")
  const [requesterType, setRequesterType] = useState("external")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [notes, setNotes] = useState("")
  const [sendEmail, setSendEmail] = useState(true)

  const [items, setItems] = useState<Array<{ itemId: string; itemName: string; quantity: number }>>([
    { itemId: "", itemName: "", quantity: 1 },
  ])

  const handleAddItem = () => {
    setItems([...items, { itemId: "", itemName: "", quantity: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, fieldName: string, value: string | number) => {
    const newItems = [...items]
    if (fieldName === "itemId") {
      const selected = inventoryItems.find((i) => i.id.toString() === value)
      newItems[index] = { itemId: value as string, itemName: selected?.name || "", quantity: newItems[index].quantity }
    } else if (fieldName === "quantity") {
      newItems[index].quantity = Math.max(1, Number(value))
    }
    setItems(newItems)
  }

  const handleSubmit = async () => {
    if (loading) return
    setLoading(true)
    setError("")

    if (!renterName.trim()) {
      setError("Name ist erforderlich")
      setLoading(false)
      return
    }

    if (!startDate || !endDate) {
      setError("Zeitraum ist erforderlich")
      setLoading(false)
      return
    }

    if (items.some((i) => !i.itemId)) {
      setError("Alle Artikel müssen ausgewählt sein")
      setLoading(false)
      return
    }

    if (sendEmail && !renterEmail.trim()) {
      setError("E-Mail ist erforderlich, wenn E-Mail-Versand aktiviert ist")
      setLoading(false)
      return
    }
    try {
      const res = await fetch("/api/rentals/create-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          renterName: renterName.trim(),
          renterEmail: renterEmail.trim() || null,
          renterPhone: renterPhone.trim() || null,
          requesterType,
          startDate,
          endDate,
          notes: notes.trim() || null,
          sendEmail: sendEmail && renterEmail.trim(),
          items: items.map((i) => ({
            itemId: Number(i.itemId),
            itemName: i.itemName,
            quantity: i.quantity,
          })),
        }),
      })

      if (res.ok) {
        setOpen(false)
        setRenterName("")
        setRenterEmail("")
        setRenterPhone("")
        setRequesterType("external")
        setStartDate("")
        setEndDate("")
        setNotes("")
        setSendEmail(true)
        setItems([{ itemId: "", itemName: "", quantity: 1 }])
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Fehler beim Anlegen der Ausleihe")
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
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
      >
        <Plus className="h-4 w-4" />
        Neue Ausleihe anlegen
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Neue Ausleihe manuell anlegen</h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Ausleiher-Daten */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Ausleiher-Daten</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="renter-name">Name *</Label>
                    <Input
                      id="renter-name"
                      value={renterName}
                      onChange={(e) => setRenterName(e.target.value)}
                      placeholder="Max Mustermann"
                    />
                  </div>

                  <div>
                    <Label htmlFor="renter-email">E-Mail (optional)</Label>
                    <Input
                      id="renter-email"
                      type="email"
                      value={renterEmail}
                      onChange={(e) => setRenterEmail(e.target.value)}
                      placeholder="max@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="renter-phone">Telefon (optional)</Label>
                    <Input
                      id="renter-phone"
                      type="tel"
                      value={renterPhone}
                      onChange={(e) => setRenterPhone(e.target.value)}
                      placeholder="+49 123 456789"
                    />
                  </div>

                  <div>
                    <Label htmlFor="requester-type">Anfragesteller-Typ</Label>
                    <select
                      id="requester-type"
                      value={requesterType}
                      onChange={(e) => setRequesterType(e.target.value)}
                      className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                    >
                      <option value="ffw_member">FFW Mitglied</option>
                      <option value="partner">Verein / Gemeinde</option>
                      <option value="external">Extern</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Artikel */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Artikel *</h3>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`item-select-${index}`}>Artikel</Label>
                        <select
                          id={`item-select-${index}`}
                          value={item.itemId}
                          onChange={(e) => handleItemChange(index, "itemId", e.target.value)}
                          className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                        >
                          <option value="">– bitte wählen –</option>
                          {inventoryItems.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <Label htmlFor={`qty-${index}`}>Menge</Label>
                        <Input
                          id={`qty-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="h-10"
                        />
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-sm text-red-600 hover:underline mt-2 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Weiterer Artikel
                  </button>
                </div>
              </div>

              {/* Zeitraum */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Zeitraum *</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="start-date">Von</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">Bis</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Optionale Felder */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Optionales</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="notes">Notiz</Label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Interne Notizen..."
                      className="w-full h-20 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="send-email"
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="send-email" className="mb-0 cursor-pointer">
                      E-Mail an Ausleiher versenden{renterEmail ? "" : " (nur wenn E-Mail angegeben)"}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Hinweis zur Kaution */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-900">
                <p className="font-medium mb-1">⚠️ Wichtig: Kaution</p>
                <p>
                  Die 50€ Kaution ist in jedem Fall bindend und nicht verhandelbar. Es ist deine Verantwortung, dass
                  der Ausleiher dies versteht und die Kaution hinterlegt, bevor das Material rausgeht.
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

            <div className="flex gap-2 mt-5 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                {loading ? "Wird angelegt…" : "Anlegen"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
