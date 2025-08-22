"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

interface InventoryItem {
  id: number
  name: string
  price_per_day: number
  description: string
}

interface ReservationFormProps {
  availableItems: InventoryItem[]
}

export default function ReservationForm({ availableItems }: ReservationFormProps) {
  const [formData, setFormData] = useState({
    itemId: "",
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

  const selectedItem = availableItems.find((item) => item.id.toString() === formData.itemId)
  const totalDays =
    formData.startDate && formData.endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24),
          ) + 1,
        )
      : 0
  const totalPrice = selectedItem && totalDays ? selectedItem.price_per_day * totalDays : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          itemId: Number.parseInt(formData.itemId),
          totalPrice,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFormData({
          itemId: "",
          renterName: "",
          renterEmail: "",
          renterPhone: "",
          startDate: "",
          endDate: "",
          notes: "",
        })
      } else {
        setError(data.error || "Fehler beim Senden der Reservierung")
      }
    } catch (error) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Reservierung erfolgreich gesendet!</h3>
        <p className="text-gray-600 mb-6">Ihre Anfrage wurde übermittelt. Wir werden uns in Kürze bei Ihnen melden.</p>
        <Button onClick={() => setSuccess(false)} className="bg-blue-600 hover:bg-blue-700">
          Neue Reservierung
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="itemId">Artikel auswählen *</Label>
        <Select value={formData.itemId} onValueChange={(value) => setFormData({ ...formData, itemId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Wählen Sie einen Artikel" />
          </SelectTrigger>
          <SelectContent>
            {availableItems.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name} - {item.price_per_day}€/Tag
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Startdatum *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Enddatum *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            min={formData.startDate || new Date().toISOString().split("T")[0]}
            required
          />
        </div>
      </div>

      {totalPrice > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">
              Gesamtpreis ({totalDays} Tag{totalDays !== 1 ? "e" : ""}):
            </span>
            <span className="text-xl font-bold text-blue-600">{totalPrice.toFixed(2)}€</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="renterName">Ihr Name *</Label>
        <Input
          id="renterName"
          value={formData.renterName}
          onChange={(e) => setFormData({ ...formData, renterName: e.target.value })}
          required
          placeholder="Max Mustermann"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="renterEmail">E-Mail Adresse *</Label>
        <Input
          id="renterEmail"
          type="email"
          value={formData.renterEmail}
          onChange={(e) => setFormData({ ...formData, renterEmail: e.target.value })}
          required
          placeholder="max@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="renterPhone">Telefonnummer</Label>
        <Input
          id="renterPhone"
          type="tel"
          value={formData.renterPhone}
          onChange={(e) => setFormData({ ...formData, renterPhone: e.target.value })}
          placeholder="+49 123 456789"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Zusätzliche Notizen</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Besondere Wünsche oder Anmerkungen..."
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={isLoading || availableItems.length === 0}
      >
        {isLoading ? "Wird gesendet..." : "Reservierung anfragen"}
      </Button>

      <p className="text-sm text-gray-600 text-center">
        * Pflichtfelder. Ihre Anfrage wird an unsere Administratoren weitergeleitet.
      </p>
    </form>
  )
}
