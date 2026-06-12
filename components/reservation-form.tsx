"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Check, AlertTriangle, Minus, Plus } from "lucide-react"
import Link from "next/link"

interface InventoryItem {
  id: number
  name: string
  price_per_day: number | string
  description: string
  quantity: number
}

const fmt = (p: number | string) => Number(p).toLocaleString("de-DE")

interface ReservationFormProps {
  availableItems: InventoryItem[]
}

export default function ReservationForm({ availableItems }: ReservationFormProps) {
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({})
  const [requesterType, setRequesterType] = useState("ffw_member")
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
        body: JSON.stringify({ ...formData, notes: combinedNotes, itemIds: selectedIds, requesterType }),
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
        <p className="text-gray-600 mb-6">Deine Anfrage ist bei uns angekommen. Wir melden uns bald bei dir.</p>
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
        <Label>Wer stellt die Anfrage? *</Label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: "ffw_member", label: "FFW Raubling Mitglied" },
            { value: "partner", label: "Verein / Gemeinde" },
            { value: "external", label: "Privat / Extern" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRequesterType(opt.value)}
              className={`rounded-lg border p-2 text-xs font-medium text-center transition-colors ${
                requesterType === opt.value
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {requesterType === "external" && (
          <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            Externe Anfragen werden geprüft und können je nach Verfügbarkeit abgelehnt werden.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Welche Artikel? *</Label>
        <div className="space-y-2">
          {availableItems.map((item) => {
            const selected = item.id in selectedItems
            const qty = selectedItems[item.id] ?? 1
            return (
              <div key={item.id} className={`rounded-lg border transition-colors ${
                selected ? "border-red-400 bg-red-50" : "border-gray-200"
              }`}>
                <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => toggleItem(item.id)}>
                  <div className="flex-1 mr-3">
                    <p className="font-medium text-sm">{item.name}</p>
                    {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
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
          <strong>Hinweis:</strong> Schäden am Ausleihgut sind vom Ausleiher selbst zu tragen.
          Die FFW Raubling behält sich vor, Anfragen abzulehnen.
          Nach dem Absenden erhältst du eine Bestätigungs-E-Mail mit Abholzeit und -ort.
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
