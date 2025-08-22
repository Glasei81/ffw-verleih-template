"use client"

import { CardContent } from "@/components/ui/card"

import { Card } from "@/components/ui/card"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function RentalFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get("status") || "all"
  const currentSearch = searchParams.get("search") || ""

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/admin/rentals?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/admin/rentals")
  }

  const hasFilters = currentStatus !== "all" || currentSearch

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Suchen nach Name, E-Mail oder Artikel..."
              value={currentSearch}
              onChange={(e) => updateFilters("search", e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={currentStatus} onValueChange={(value) => updateFilters("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Wartend</SelectItem>
                <SelectItem value="confirmed">Bestätigt</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="returned">Zurückgegeben</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Filter löschen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
