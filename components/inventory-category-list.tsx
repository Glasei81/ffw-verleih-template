"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight } from "lucide-react"
import InventoryActions from "@/components/inventory-actions"

interface Item {
  id: number
  name: string
  description: string | null
  price_per_day: number | string
  is_available: boolean
  quantity: number | null
}

interface Props {
  grouped: { category: string; items: Item[] }[]
}

const fmt = (p: unknown) => Number(p).toLocaleString("de-DE")

function ItemDetail({ description }: { description: string | null }) {
  if (!description) return null
  const detail = description.includes("·") ? description.split("·").slice(1).join("·").trim() : null
  if (!detail) return null
  return <p className="text-gray-500 text-sm mb-3">{detail}</p>
}

export default function InventoryCategoryList({ grouped }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(grouped.map((g) => [g.category, true]))
  )

  const toggle = (cat: string) => setOpen((prev) => ({ ...prev, [cat]: !prev[cat] }))

  return (
    <div className="space-y-4">
      {grouped.map(({ category, items }) => (
        <div key={category} className="rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle(category)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <span className="font-semibold text-gray-800">
              {category}
              <span className="ml-2 text-xs font-normal text-gray-400">{items.length} Artikel</span>
            </span>
            {open[category] ? (
              <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />
            )}
          </button>

          {open[category] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{item.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full shrink-0 ml-2 ${
                        item.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {item.is_available ? "Verfügbar" : "Gesperrt"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ItemDetail description={item.description} />
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-red-600">{fmt(item.price_per_day)}€</span>
                        <span className="text-xs text-gray-400 ml-2">{item.quantity ?? 1} Stück</span>
                      </div>
                      <InventoryActions item={item} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
