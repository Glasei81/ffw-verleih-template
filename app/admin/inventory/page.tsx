import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getInventoryItems } from "@/lib/db"
import Link from "next/link"
import SeedInventoryButton from "@/components/seed-inventory-button"
import InventoryCategoryList from "@/components/inventory-category-list"

const CATEGORY_ORDER = ["Küche/Gastro", "Mobiliar", "Deko", "Sonstiges"]

function extractCategory(description: string | null | undefined): string {
  if (!description) return "Sonstiges"
  return description.split("·")[0].trim() || "Sonstiges"
}

export const dynamic = "force-dynamic"

export default async function InventoryPage() {
  const inventory = await getInventoryItems()

  // Group by category, preserve defined order
  const map = new Map<string, typeof inventory>()
  for (const item of inventory) {
    const cat = extractCategory(item.description as string | null)
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(item)
  }

  const grouped = [
    ...CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({ category: c, items: map.get(c)! })),
    ...[...map.entries()]
      .filter(([c]) => !CATEGORY_ORDER.includes(c))
      .map(([c, items]) => ({ category: c, items })),
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventar</h1>
          <p className="text-gray-600 mt-1">{inventory.length} Artikel</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {inventory.length === 0 && <SeedInventoryButton />}
          <Link href="/admin/inventory/add">
            <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">Neuen Artikel hinzufügen</Button>
          </Link>
        </div>
      </div>

      {inventory.length > 0 ? (
        <InventoryCategoryList grouped={grouped} />
      ) : (
        <Card>
          <CardContent>
            <SeedInventoryButton />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
