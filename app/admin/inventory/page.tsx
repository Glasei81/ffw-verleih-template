import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getInventoryItems } from "@/lib/db"
import Link from "next/link"
import InventoryActions from "@/components/inventory-actions"
import SeedInventoryButton from "@/components/seed-inventory-button"

const fmt = (p: unknown) => Number(p).toLocaleString("de-DE")

export default async function InventoryPage() {
  const inventory = await getInventoryItems()

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventar</h1>
          <p className="text-gray-600 mt-1">{inventory.length} Artikel</p>
        </div>
        <Link href="/admin/inventory/add">
          <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">Neuen Artikel hinzufügen</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{item.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {item.is_available ? "Verfügbar" : "Gesperrt"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.description && <p className="text-gray-500 text-sm mb-3">{item.description}</p>}
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

      {inventory.length === 0 && (
        <Card>
          <CardContent>
            <SeedInventoryButton />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
