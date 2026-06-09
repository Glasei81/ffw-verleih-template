"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Check, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface InventoryItem {
  id: number
  name: string
  price_per_day: number
  description: string
  quantity: number
}

interface ReservationFormProps {
  availableItems: InventoryItem[]
}

export default function ReservationForm({ availableItems }: ReservationFormProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
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

  const toggleItem = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  const totalPrice = selectedIds.reduce((sum, id) => {
    const item = availableItems.find((i) => i.id === id)
    return sum + (item?.price_per_day ?? 0)
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.length === 0) {
      setError("Bitte mindestens einen Artikel auswählen.")
      return
    }
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, itemIds: selectedIds }),
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
          <Button onClick={() => { setSuccess(false); setSelectedIds([]) }} variant="outline">
            Weitere Anfrage
          </Button>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">Zur Startseite</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Welche Artikel? *</Label>
        <div className="space-y-2">
          {availableItems.map((item) => {
            const selected = selectedIds.includes(item.id)
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selected ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex-1 mr-3">
                  <p className="font-medium text-sm">{item.name}</p>
                  {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                  <p className="text-xs text-gray-400">{item.quantity ?? 1} Stück verfügbar</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-red-600">{item.price_per_day}€</span>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                    selected ? "bg-red-600 border-red-600" : "border-gray-300"
                  }`}>
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {totalPrice > 0 && (
        <div className="bg-red-50 p-3 rounded-lg flex justify-between items-center">
          <span className="font-medium text-sm">{selectedIds.length} Artikel ausgewählt:</span>
          <span className="text-lg font-bold text-red-600">{totalPrice}€ Pauschale</span>
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
          placeholder="Besondere Wünsche oder Hinweise..." rows={3} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Hinweis:</strong> Dieses Angebot ist für FFW-Mitglieder. Schäden am Ausleihgut sind vom Ausleiher selbst zu tragen. Die FFW Raubling behält sich vor, Anfragen abzulehnen.
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
