import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getInventoryItems } from "@/lib/db"
import ReservationForm from "@/components/reservation-form"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const inventory = await getInventoryItems()
  const availableItems = inventory.filter((item) => item.is_available)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Club Vermietung</h1>
              <p className="text-gray-600">Reservieren Sie Artikel für Ihre Veranstaltung</p>
            </div>
            <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium">
              Admin Anmeldung
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Available Items */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Verfügbare Artikel</h2>
            <div className="space-y-4">
              {availableItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <span className="text-lg font-bold text-blue-600">{item.price_per_day}€/Tag</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              ))}

              {availableItems.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">Derzeit sind keine Artikel verfügbar.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Reservation Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reservierung anfragen</h2>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <ReservationForm availableItems={availableItems} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 Club Vermietung. Alle Rechte vorbehalten.</p>
            <p className="mt-2 text-sm">
              Für Fragen kontaktieren Sie uns unter{" "}
              <a href="mailto:info@club.de" className="text-blue-600 hover:underline">
                info@club.de
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
