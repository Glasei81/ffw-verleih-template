import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAvailableItems } from "@/lib/db"
import ReservationForm from "@/components/reservation-form"
import Link from "next/link"

export const dynamic = "force-dynamic"

const fmt = (p: unknown) => Number(p).toLocaleString("de-DE")

export default async function HomePage() {
  const availableItems = await getAvailableItems()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-red-600 leading-tight">FFW Raubling</h1>
              <p className="text-base font-semibold text-gray-700">Geräteverleih</p>
              <p className="text-sm text-gray-500">Geräte und Ausstattung ausleihen</p>
            </div>
            <Link href="/login" className="text-sm text-gray-400 hover:text-red-600 font-medium mt-1">Admin</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Verfügbare Artikel</h2>
            <div className="space-y-3">
              {availableItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-1 pt-4">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{item.name}</span>
                      <span className="text-base font-bold text-red-600 whitespace-nowrap ml-2">{fmt(item.price_per_day)}€</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 pt-1">
                    {item.description && <p className="text-gray-600 text-sm mb-1">{item.description}</p>}
                    <p className="text-xs text-gray-400">{item.quantity ?? 1} Stück vorhanden</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ausleihe anfragen</h2>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <ReservationForm availableItems={availableItems} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-gray-400 text-sm">Freiwillige Feuerwehr Raubling</p>
        </div>
      </footer>
    </div>
  )
}
