import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRentals } from "@/lib/db"
import RentalActions from "@/components/rental-actions"
import RentalFilters from "@/components/rental-filters"

interface SearchParams {
  status?: string
  search?: string
}

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const allRentals = await getRentals()

  // Filter rentals based on search params
  let filteredRentals = allRentals

  if (searchParams.status && searchParams.status !== "all") {
    filteredRentals = filteredRentals.filter((rental) => rental.status === searchParams.status)
  }

  if (searchParams.search) {
    const search = searchParams.search.toLowerCase()
    filteredRentals = filteredRentals.filter(
      (rental) =>
        rental.renter_name.toLowerCase().includes(search) ||
        rental.renter_email.toLowerCase().includes(search) ||
        rental.item_name.toLowerCase().includes(search),
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      returned: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    }

    const labels = {
      pending: "Wartend",
      confirmed: "Bestätigt",
      active: "Aktiv",
      returned: "Zurückgegeben",
      cancelled: "Storniert",
    }

    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vermietungen verwalten</h1>
        <p className="text-gray-600 mt-2">Übersicht und Verwaltung aller Reservierungen</p>
      </div>

      <RentalFilters />

      <div className="grid grid-cols-1 gap-6">
        {filteredRentals.map((rental) => (
          <Card key={rental.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{rental.item_name}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(rental.status)}
                  <RentalActions rental={rental} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mieter</p>
                  <p className="font-medium">{rental.renter_name}</p>
                  <p className="text-sm text-gray-600">{rental.renter_email}</p>
                  {rental.renter_phone && <p className="text-sm text-gray-600">{rental.renter_phone}</p>}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Zeitraum</p>
                  <p className="font-medium">
                    {new Date(rental.start_date).toLocaleDateString("de-DE")} -{" "}
                    {new Date(rental.end_date).toLocaleDateString("de-DE")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {Math.ceil(
                      (new Date(rental.end_date).getTime() - new Date(rental.start_date).getTime()) /
                        (1000 * 60 * 60 * 24),
                    ) + 1}{" "}
                    Tag(e)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Preis</p>
                  <p className="font-medium text-lg text-blue-600">{rental.total_price}€</p>
                  <p className="text-sm text-gray-600">{rental.price_per_day}€/Tag</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Erstellt</p>
                  <p className="font-medium">{new Date(rental.created_at).toLocaleDateString("de-DE")}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(rental.created_at).toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {rental.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Notizen:</p>
                  <p className="text-sm">{rental.notes}</p>
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
              {searchParams.status || searchParams.search
                ? "Keine Vermietungen gefunden, die Ihren Filterkriterien entsprechen."
                : "Noch keine Vermietungen vorhanden."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
