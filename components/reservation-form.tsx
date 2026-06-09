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
import Link from "next/link"

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
          <Button onClick={() => setSuccess(false)} variant="outline">
            Weitere Anfrage
          </Button>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
              Zur Startseite
            </Button>
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
        <Label htmlFor="itemId">Welcher Artikel? *</Label>
        <Select value={formData.itemId} onValueChange={(value) => setFormData({ ...formData, itemId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Artikel auswählen" />
          </SelectTrigger>
          <SelectContent>
            {availableItems.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name} – {item.price_per_day}€/Tag
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="startDate">Von *</Label>
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
          <Label htmlFor="endDate">Bis *</Label>
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
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">
              Gesamtpreis ({totalDays} Tag{totalDays !== 1 ? "e" : ""}):
            </span>
            <span className="text-lg font-bold text-red-600">{totalPrice.toFixed(2)}€</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="renterName">Dein Name *</Label>
        <Input
          id="renterName"
          value={formData.renterName}
          onChange={(e) => setFormData({ ...formData, renterName: e.target.value })}
          required
          placeholder="Max Mustermann"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="renterEmail">Deine E-Mail *</Label>
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
        <Label htmlFor="notes">Anmerkungen</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Besondere Wünsche oder Hinweise..."
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700"
        disabled={isLoading || availableItems.length === 0}
      >
        {isLoading ? "Wird gesendet..." : "Jetzt anfragen"}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        * Pflichtfelder. Deine Anfrage geht direkt an den Admin.
      </p>
    </form>
  )
}
