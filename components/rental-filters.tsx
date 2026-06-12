"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface RentalFiltersProps {
  activeCount: number
  archiveCount: number
}

export default function RentalFilters({ activeCount, archiveCount }: RentalFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.get("search") || ""
  const currentTab = searchParams.get("tab") || "aktiv"

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    params.delete("search")
    router.push(`/admin/rentals?${params.toString()}`)
  }

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
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("aktiv")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentTab === "aktiv"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Aktiv
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              currentTab === "aktiv" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {activeCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("archiv")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentTab === "archiv"
                ? "bg-gray-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Archiv
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              currentTab === "archiv" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {archiveCount}
            </span>
          </button>
        </div>
        <Input
          placeholder="Suchen nach Name, E-Mail oder Artikel..."
          value={currentSearch}
          onChange={(e) => updateSearch(e.target.value)}
        />
      </CardContent>
    </Card>
  )
}
