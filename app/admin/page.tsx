import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getInventoryItems, getRentals } from "@/lib/db"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const [inventory, rentals] = await Promise.all([getInventoryItems(), getRentals()])

  const availableItems = inventory.filter((item) => item.is_available).length
  const pendingRentals = rentals.filter((r) => r.status === "pending").length
  const confirmedRentals = rentals.filter((r) => r.status === "confirmed").length

  const statusLabel: Record<string, string> = {
    pending: "Anfrage",
    confirmed: "Bestätigt",
    returned: "Zurückgegeben",
    cancelled: "Abgelehnt",
  }

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    returned: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Übersicht</h1>
        <p className="text-gray-600 mt-2">Aktuelle Ausleihen und Inventar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Artikel im Inventar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{inventory.length}</div>
            <p className="text-sm text-green-600">{availableItems} verfügbar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Offene Anfragen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRentals}</div>
            <p className="text-sm text-gray-500">Warten auf Bestätigung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bestätigte Ausleihen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedRentals}</div>
            <p className="text-sm text-gray-500">Aktuell draußen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Neueste Anfragen</CardTitle>
            <Link href="/admin/rentals" className="text-sm text-red-600 hover:underline">Alle anzeigen</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rentals.slice(0, 5).map((rental) => (
                <div key={rental.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{rental.item_name}</p>
                    <p className="text-sm text-gray-600">{rental.renter_name}</p>
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    statusColor[rental.status] || "bg-gray-100 text-gray-800"
                  }`}>
                    {statusLabel[rental.status] || rental.status}
                  </span>
                </div>
              ))}
              {rentals.length === 0 && (
                <p className="text-gray-500 text-center py-4">Noch keine Ausleihen</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inventar</CardTitle>
            <Link href="/admin/inventory" className="text-sm text-red-600 hover:underline">Verwalten</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventory.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.price_per_day}€ / Tag</p>
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    item.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {item.is_available ? "Verfügbar" : "Nicht verfügbar"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
