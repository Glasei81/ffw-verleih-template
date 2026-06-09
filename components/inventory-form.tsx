"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InventoryItem {
  id?: number
  name: string
  description: string
  price_per_day: number
  is_available: boolean
  quantity: number
}

interface InventoryFormProps {
  item?: InventoryItem
}

export default function InventoryForm({ item }: InventoryFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price_per_day: item?.price_per_day || 0,
    is_available: item?.is_available ?? true,
    quantity: item?.quantity ?? 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const url = item ? `/api/inventory/${item.id}` : "/api/inventory"
      const method = item ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/admin/inventory")
        router.refresh()
      } else {
        setError(data.error || "Fehler beim Speichern des Artikels")
      }
    } catch (error) {
      setError("Ein Fehler ist aufgetreten")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? "Artikel bearbeiten" : "Neuen Artikel hinzufügen"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Artikelname *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="z.B. Beamer, Lautsprecher Set"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detaillierte Beschreibung des Artikels..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price_per_day">Preis pro Tag (€) *</Label>
            <Input
              id="price_per_day"
              type="number"
              step="0.01"
              min="0"
              value={formData.price_per_day}
              onChange={(e) => setFormData({ ...formData, price_per_day: Number.parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Anzahl verfügbar *</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
            />
            <Label htmlFor="is_available">Artikel ist verfügbar</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              {isLoading ? "Wird gespeichert..." : item ? "Änderungen speichern" : "Artikel hinzufügen"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Abbrechen
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
