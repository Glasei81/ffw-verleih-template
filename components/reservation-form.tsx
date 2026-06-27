"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Check, AlertTriangle, Minus, Plus, ChevronDown, ChevronRight, Search } from "lucide-react"
import Link from "next/link"

interface InventoryItem {
  id: number
  name: string
  price_per_day: number | string
  description: string
  quantity: number
}

const fmt = (p: number | string) => Number(p).toLocaleString("de-DE")

const CATEGORY_ORDER = ["Küche/Gastro", "Mobiliar", "Deko", "Sonstiges"]

function extractCategory(description: string): string {
  return description?.split("·")[0].trim() || "Sonstiges"
}

function extractDetail(description: string): string {
  const parts = description?.split("·")
  return parts?.length > 1 ? parts.slice(1).join("·").trim() : ""
}

interface ReservationFormProps {
  availableItems: InventoryItem[]
}

export default function ReservationForm({ availableItems }: ReservationFormProps) {
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({})
  const [requesterType] = useState("external")
  const [formData, setFormData] = useState({
    renterName: "",
    renterEmail: "",
    renterPhone: "",
    startDate: "",
    endDate: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [itemSearch, setItemSearch] = useState("")

  // Artikel nach Suchbegriff filtern (Name oder Beschreibung)
  const search = itemSearch.trim().toLowerCase()
  const visibleItems = search
    ? availableItems.filter((i) =>
        i.name.toLowerCase().includes(search) || (i.description ?? "").toLowerCase().includes(search)
      )
    : availableItems

  // Group items by category
  const categoryMap = new Map<string, InventoryItem[]>()
  for (const item of visibleItems) {
    const cat = extractCategory(item.description)
    if (!categoryMap.has(cat)) categoryMap.set(cat, [])
    categoryMap.get(cat)!.push(item)
  }
  const grouped = [
    ...CATEGORY_ORDER.filter((c) => categoryMap.has(c)).map((c) => ({ category: c, items: categoryMap.get(c)! })),
    ...[...categoryMap.entries()].filter(([c]) => !CATEGORY_ORDER.includes(c)).map(([c, items]) => ({ category: c, items })),
  ]

  // Kategorien standardmäßig zugeklappt
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({})
  const toggleCat = (cat: string) => setOpenCats((prev) => ({ ...prev, [cat]: !prev[cat] }))

  // Beim Suchen: Kategorien mit Treffern automatisch aufklappen
  const catOpen = (cat: string) => (search ? true : !!openCats[cat])

  const selectedIds = Object.keys(selectedItems).map(Number)

  const toggleItem = (id: number) => {
    setSelectedItems((prev) => {
      if (id in prev) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: 1 }
    })
  }

  const setQty = (id: number, qty: number) => {
    setSelectedItems((prev) => ({ ...prev, [id]: Math.max(1, qty) }))
  }

  // Pauschale: Preis einmal pro Artikel, unabhängig von der Menge
  const totalPrice = selectedIds.reduce((sum, id) => {
    const item = availableItems.find((i) => i.id === id)
    return sum + Number(item?.price_per_day ?? 0)
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.length === 0) {
      setError("Bitte mindestens einen Artikel auswählen.")
      return
    }
    setIsLoading(true)
    setError("")

    const qtyInfo = selectedIds
      .map((id) => {
        const item = availableItems.find((i) => i.id === id)
        const qty = selectedItems[id]
        return qty > 1 ? `${item?.name}: ${qty} Stück` : null
      })
      .filter(Boolean)
      .join(", ")

    const combinedNotes = [qtyInfo, formData.notes].filter(Boolean).join(" | ")

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, notes: combinedNotes, itemIds: selectedIds, quantities: selectedItems, requesterType }),
      })
      const data = await response.json()
      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Fehler beim Senden der Anfrage")
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuch es nochmal.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Anfrage erfolgreich gesendet!</h3>
        <p className="text-gray-600 mb-6">
          Deine Anfrage ist bei uns angekommen – noch <strong>nicht verbindlich</strong>.
          Ein Mitglied der FFW Raubling prüft sie und meldet sich per E-Mail.
          Nach der Bestätigung bekommst du deinen festen <strong>Ansprechpartner</strong>
          mit allen Infos zur Abholung; ab dann läuft alles direkt über ihn.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => { setSuccess(false); setSelectedItems({}) }} variant="outline">Weitere Anfrage</Button>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">Zur Startseite</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="space-y-2">
        <Label>Welche Artikel? *</Label>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
            placeholder="Artikel suchen…"
            className="pl-9"
          />
        </div>

        {selectedIds.length > 0 && (
          <p className="text-xs text-gray-500">{selectedIds.length} Artikel ausgewählt</p>
        )}

        <div className="space-y-2">
          {grouped.map(({ category, items }) => (
            <div key={category} className="rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCat(category)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <span className="font-semibold text-sm text-gray-700">
                  {category}
                  <span className="ml-2 text-xs font-normal text-gray-400">{items.length}</span>
                  {items.some((i) => i.id in selectedItems) && (
                    <span className="ml-2 text-xs bg-red-600 text-white rounded-full px-1.5 py-0.5">
                      {items.filter((i) => i.id in selectedItems).length}
                    </span>
                  )}
                </span>
                {catOpen(category)
                  ? <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                  : <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />}
              </button>

              {catOpen(category) && (
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const selected = item.id in selectedItems
                    const qty = selectedItems[item.id] ?? 1
                    const detail = extractDetail(item.description)
                    return (
                      <div key={item.id} className={`transition-colors ${selected ? "bg-red-50" : "bg-white"}`}>
                        <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => toggleItem(item.id)}>
                          <div className="flex-1 mr-3">
                            <p className="font-medium text-sm">{item.name}</p>
                            {detail && <p className="text-xs text-gray-500">{detail}</p>}
                            <p className="text-xs text-gray-400">{item.quantity ?? 1} Stück vorhanden</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-bold text-red-600">{fmt(item.price_per_day)}€</span>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                              selected ? "bg-red-600 border-red-600" : "border-gray-300 bg-white"
                            }`}>
                              {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </div>
                          </div>
                        </div>
                        {selected && (
                          <div className="flex items-center gap-3 px-3 pb-3">
                            <span className="text-xs text-gray-500">Benötigte Menge:</span>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={(e) => { e.stopPropagation(); setQty(item.id, qty - 1) }}
                                className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-100">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{qty}</span>
                              <button type="button" onClick={(e) => { e.stopPropagation(); setQty(item.id, qty + 1) }}
                                className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-100">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
          {grouped.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Keine Artikel gefunden für „{itemSearch}".
            </p>
          )}
        </div>
      </div>

      {totalPrice > 0 && (
        <div className="bg-red-50 p-3 rounded-lg flex justify-between items-center">
          <span className="font-medium text-sm">{selectedIds.length} Artikel ausgewählt:</span>
          <span className="text-lg font-bold text-red-600">{fmt(totalPrice)}€ Pauschale</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="startDate">Abholung *</Label>
          <Input id="startDate" type="date" value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            min={new Date().toISOString().split("T")[0]} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Rückgabe *</Label>
          <Input id="endDate" type="date" value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            min={formData.startDate || new Date().toISOString().split("T")[0]} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="renterName">Dein Name *</Label>
        <Input id="renterName" value={formData.renterName}
          onChange={(e) => setFormData({ ...formData, renterName: e.target.value })}
          required placeholder="Max Mustermann" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="renterEmail">Deine E-Mail *</Label>
        <Input id="renterEmail" type="email" value={formData.renterEmail}
          onChange={(e) => setFormData({ ...formData, renterEmail: e.target.value })}
          required placeholder="max@example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="renterPhone">Telefonnummer</Label>
        <Input id="renterPhone" type="tel" value={formData.renterPhone}
          onChange={(e) => setFormData({ ...formData, renterPhone: e.target.value })}
          placeholder="+49 123 456789" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Anmerkungen</Label>
        <Textarea id="notes" value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Besondere Wünsche oder Hinweise..." rows={2} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Hinweis:</strong> Schäden oder Verluste am Ausleihgut gehen zu Lasten des Ausleihers
          und werden auf dessen Rechnung nachgekauft bzw. repariert.
          Die FFW Raubling behält sich vor, Anfragen abzulehnen.
          Nach Bestätigung erhältst du eine E-Mail mit Abholzeit und -ort.
        </p>
      </div>

      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700"
        disabled={isLoading || availableItems.length === 0}>
        {isLoading ? "Wird gesendet..." : "Jetzt anfragen"}
      </Button>

      <p className="text-xs text-gray-400 text-center">* Pflichtfelder. Deine Anfrage geht direkt an den Admin.</p>
    </form>
  )
}
