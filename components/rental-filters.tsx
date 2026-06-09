"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function RentalFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.get("search") || ""

  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    router.push(`/admin/rentals?${params.toString()}`)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <Input
          placeholder="Suchen nach Name, E-Mail oder Artikel..."
          value={currentSearch}
          onChange={(e) => updateSearch(e.target.value)}
        />
      </CardContent>
    </Card>
  )
}
