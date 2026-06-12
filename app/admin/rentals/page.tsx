import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRentalRequests } from "@/lib/db"
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

const requesterLabel: Record<string, string> = {
  ffw_member: "FFW Mitglied",
  partner: "Verein / Gemeinde",
  external: "Extern",
}

const requesterColor: Record<string, string> = {
  ffw_member: "bg-red-100 text-red-700",
  partner: "bg-blue-100 text-blue-700",
  external: "bg-orange-100 text-orange-700",
}

function formatTs(ts: unknown) {
  if (!ts) return ""
  return new Date(ts as string).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

const ACTIVE_STATUSES = ["pending", "confirmed"]
const ARCHIVE_STATUSES = ["returned", "cancelled"]

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tab?: string }>
}) {
  const { search, tab } = await searchParams
  const allRequests = await getRentalRequests()

  const isArchive = tab === "archiv"
  const tabStatuses = isArchive ? ARCHIVE_STATUSES : ACTIVE_STATUSES

  const activeCount = allRequests.filter((r) => ACTIVE_STATUSES.includes(r.status as string)).length
  const archiveCount = allRequests.filter((r) => ARCHIVE_STATUSES.includes(r.status as string)).length

  const byTab = allRequests.filter((r) => tabStatuses.includes(r.status as string))

  const filtered = search
    ? byTab.filter((req) => {
        const q = search.toLowerCase()
        const items = req.items as Array<{ item_name: string }> | null
        const itemMatch = items?.some((i) => i.item_name.toLowerCase().includes(q)) ?? false
        return (
          (req.renter_name as string).toLowerCase().includes(q) ||
          (req.renter_email as string).toLowerCase().includes(q) ||
          itemMatch
        )
      })
    : byTab

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ausleihen verwalten</h1>
        <p className="text-gray-600 mt-2">Übersicht aller Anfragen und Ausleihen</p>
      </div>

      <RentalFilters activeCount={activeCount} archiveCount={archiveCount} />

      <div className="space-y-4">
        {filtered.map((req) => {
          const items = req.items as Array<{ item_name: string; total_price: number; price_per_day: number }>
          const itemNamesStr = items.map((i) => i.item_name).join(", ")
          const rType = (req.requester_type as string) || "external"
          const status = req.status as string

          return (
            <Card
              key={req.group_key as string}
              className={`hover:shadow-md transition-shadow ${status === "pending" ? "border-yellow-300" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base leading-tight">{itemNamesStr}</CardTitle>
                    <p className="text-xs text-gray-400 mt-0.5">Anfrage vom {formatTs(req.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                      requesterColor[rType] || "bg-gray-100 text-gray-700"
                    }`}>
                      {requesterLabel[rType] || rType}
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                      statusColor[status] || "bg-gray-100 text-gray-800"
                    }`}>
                      {statusLabel[status] || status}
                    </span>
                    <RentalActions
                      rental={{
                        id: req.id as number,
                        status,
                        group_key: req.group_key as string,
                        renter_name: req.renter_name as string,
                        renter_email: req.renter_email as string,
                        item_name: itemNamesStr,
                        start_date: req.start_date as string,
                        end_date: req.end_date as string,
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Person</p>
                    <p className="font-medium">{req.renter_name as string}</p>
                    <p className="text-sm text-gray-600">{req.renter_email as string}</p>
                    {req.renter_phone && <p className="text-sm text-gray-600">{req.renter_phone as string}</p>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Zeitraum</p>
                    <p className="font-medium">
                      {new Date(req.start_date as string).toLocaleDateString("de-DE")} –{" "}
                      {new Date(req.end_date as string).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gesamtbetrag</p>
                    <p className="font-bold text-lg text-red-600">
                      {Number(req.total_price).toFixed(2)}€
                    </p>
                    {items.length > 1 && (
                      <ul className="mt-1 space-y-0.5">
                        {items.map((item, i) => (
                          <li key={i} className="text-xs text-gray-500">
                            {item.item_name}: {Number(item.total_price).toFixed(2)}€
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {req.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">Notiz</p>
                    <p className="text-sm text-gray-600">{req.notes as string}</p>
                  </div>
                )}
                {req.pickup_info && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs font-medium text-green-700 mb-1">Abholhinweis (an Ausleiher gesendet)</p>
                    <p className="text-sm text-green-800">{req.pickup_info as string}</p>
                  </div>
                )}
                {req.updated_at && status !== "pending" && (
                  <p className="text-xs text-gray-400 mt-3">
                    Zuletzt aktualisiert: {formatTs(req.updated_at)}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {search
              ? "Keine Ergebnisse für diese Suche."
              : isArchive
              ? "Noch keine archivierten Einträge."
              : "Keine aktiven Anfragen vorhanden."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
