import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAvailableItems } from "@/lib/db"
import ReservationForm from "@/components/reservation-form"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const availableItems = await getAvailableItems()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-red-600">FFW Raubling – Geräteverleih</h1>
              <p className="text-gray-600">Geräte und Ausstattung ausleihen</p>
            </div>
            <Link href="/login" className="text-sm text-gray-500 hover:text-red-600 font-medium">
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Verfügbare Artikel</h2>
            <div className="space-y-4">
              {availableItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <span className="text-lg font-bold text-red-600">{item.price_per_day}€/Tag</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {item.description && <p className="text-gray-600 text-sm mb-1">{item.description}</p>}
                    <p className="text-sm text-gray-400">{item.quantity ?? 1} Stück verfügbar</p>
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

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ausleihe anfragen</h2>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <ReservationForm availableItems={availableItems} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            Freiwillige Feuerwehr Raubling
          </p>
        </div>
      </footer>
    </div>
  )
}
