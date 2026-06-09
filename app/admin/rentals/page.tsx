import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRentals } from "@/lib/db"
import RentalActions from "@/components/rental-actions"
import RentalFilters from "@/components/rental-filters"

export const dynamic = "force-dynamic"

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

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const allRentals = await getRentals()

  const filteredRentals = search
    ? allRentals.filter((rental) => {
        const q = search.toLowerCase()
        return (
          rental.renter_name.toLowerCase().includes(q) ||
          rental.renter_email.toLowerCase().includes(q) ||
          rental.item_name.toLowerCase().includes(q)
        )
      })
    : allRentals

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ausleihen verwalten</h1>
        <p className="text-gray-600 mt-2">Übersicht aller Anfragen und Ausleihen</p>
      </div>

      <RentalFilters />

      <div className="space-y-4">
        {filteredRentals.map((rental) => (
          <Card key={rental.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{rental.item_name}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                    statusColor[rental.status] || "bg-gray-100 text-gray-800"
                  }`}>
                    {statusLabel[rental.status] || rental.status}
                  </span>
                  <RentalActions rental={rental} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Person</p>
                  <p className="font-medium">{rental.renter_name}</p>
                  <p className="text-sm text-gray-600">{rental.renter_email}</p>
                  {rental.renter_phone && <p className="text-sm text-gray-600">{rental.renter_phone}</p>}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Zeitraum</p>
                  <p className="font-medium">
                    {new Date(rental.start_date).toLocaleDateString("de-DE")} –{" "}
                    {new Date(rental.end_date).toLocaleDateString("de-DE")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Betrag</p>
                  <p className="font-bold text-lg text-red-600">{Number(rental.total_price).toFixed(2)}€</p>
                  <p className="text-sm text-gray-500">{rental.price_per_day}€/Tag</p>
                </div>
              </div>
              {rental.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{rental.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRentals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {search ? "Keine Ergebnisse für diese Suche." : "Noch keine Ausleihen vorhanden."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
