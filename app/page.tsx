import { Card, CardContent } from "@/components/ui/card"
import { getAvailableItems } from "@/lib/db"
import ReservationForm from "@/components/reservation-form"
import Link from "next/link"
import { SKYLINE_JPG } from "@/lib/images"

export const dynamic = "force-dynamic"

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

      <div className="w-full overflow-hidden" style={{ height: "140px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SKYLINE_JPG}
          alt="FFW Raubling Skyline"
          className="w-full h-full object-cover object-right"
        />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ausleihe anfragen</h2>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <ReservationForm availableItems={availableItems} />
            </CardContent>
          </Card>
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
