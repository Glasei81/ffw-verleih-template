import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getInventoryItems, getRentalRequests } from "@/lib/db"
import Link from "next/link"

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

const requesterColor: Record<string, string> = {
  ffw_member: "bg-red-100 text-red-700",
  partner: "bg-blue-100 text-blue-700",
  external: "bg-orange-100 text-orange-700",
}

const requesterShort: Record<string, string> = {
  ffw_member: "FFW",
  partner: "Verein",
  external: "Extern",
}

export default async function AdminDashboard() {
  const [inventory, requests] = await Promise.all([getInventoryItems(), getRentalRequests()])

  const availableItems = inventory.filter((item) => item.is_available).length
  const pendingCount = requests.filter((r) => r.status === "pending").length
  const confirmedCount = requests.filter((r) => r.status === "confirmed").length

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
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-sm text-gray-500">Warten auf Bestätigung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bestätigte Ausleihen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
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
              {requests.slice(0, 5).map((req) => {
                const items = req.items as Array<{ item_name: string }> | null
                const itemNamesStr = items?.map((i) => i.item_name).join(", ") ?? "–"
                const rType = (req.requester_type as string) || "external"
                return (
                  <Link
                    key={req.group_key as string}
                    href="/admin/rentals"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{itemNamesStr}</p>
                      <p className="text-xs text-gray-500">{req.renter_name as string}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(req.created_at as string).toLocaleDateString("de-DE", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        statusColor[req.status as string] || "bg-gray-100 text-gray-800"
                      }`}>
                        {statusLabel[req.status as string] || req.status as string}
                      </span>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        requesterColor[rType] || "bg-gray-100 text-gray-700"
                      }`}>
                        {requesterShort[rType] || rType}
                      </span>
                    </div>
                  </Link>
                )
              })}
              {requests.length === 0 && (
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
                    <p className="text-sm text-gray-600">{item.price_per_day}€ Pauschale</p>
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

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Bedienungsanleitungen & Ressourcen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-4">
            Ausführliche Anleitungen für Administratoren und Endbenutzer stehen zur Verfügung.
            Laden Sie diese herunter oder lesen Sie sie im Browser.
          </p>
          <Link href="/admin/docs" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
            Zu den Dokumenten
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
