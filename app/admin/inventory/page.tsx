import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getInventoryItems } from "@/lib/db"
import Link from "next/link"
import InventoryActions from "@/components/inventory-actions"

export default async function InventoryPage() {
  const inventory = await getInventoryItems()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventar Verwaltung</h1>
          <p className="text-gray-600 mt-2">Verwalten Sie Ihre Verleihgegenstände</p>
        </div>
        <Link href="/admin/inventory/add">
          <Button className="bg-red-600 hover:bg-red-700">Neuen Artikel hinzufügen</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{item.name}</span>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    item.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.is_available ? "Verfügbar" : "Gesperrt"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.description && <p className="text-gray-600 mb-3">{item.description}</p>}
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-red-600">{item.price_per_day}€ / Tag</span>
                <span className="text-sm text-gray-500">{item.quantity ?? 1} Stück</span>
              </div>
              <InventoryActions item={item} />
            </CardContent>
          </Card>
        ))}
      </div>

      {inventory.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">Noch keine Artikel im Inventar</p>
            <Link href="/admin/inventory/add">
              <Button className="bg-red-600 hover:bg-red-700">Ersten Artikel hinzufügen</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
