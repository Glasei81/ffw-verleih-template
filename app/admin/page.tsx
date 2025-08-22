import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getInventoryItems, getRentals } from "@/lib/db"

export default async function AdminDashboard() {
  const [inventory, rentals] = await Promise.all([getInventoryItems(), getRentals()])

  const availableItems = inventory.filter((item) => item.is_available).length
  const activeRentals = rentals.filter((rental) => rental.status === "active").length
  const pendingRentals = rentals.filter((rental) => rental.status === "pending").length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Übersicht über Ihr Club-Inventar und Vermietungen</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Gesamt Artikel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inventory.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Verfügbar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aktive Vermietungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeRentals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Wartende Anfragen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRentals}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Neueste Vermietungsanfragen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rentals.slice(0, 5).map((rental) => (
                <div key={rental.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{rental.item_name}</p>
                    <p className="text-sm text-gray-600">{rental.renter_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {rental.start_date} - {rental.end_date}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        rental.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : rental.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : rental.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {rental.status === "pending"
                        ? "Wartend"
                        : rental.status === "confirmed"
                          ? "Bestätigt"
                          : rental.status === "active"
                            ? "Aktiv"
                            : rental.status === "returned"
                              ? "Zurückgegeben"
                              : "Storniert"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventar Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventory.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.price_per_day}€ / Tag</p>
                  </div>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      item.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
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
