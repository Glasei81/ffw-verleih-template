import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DocsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bedienungsanleitungen</h1>
        <p className="text-gray-600 mt-2">Laden Sie die ausführlichen Anleitungen für Administratoren und Endbenutzer herunter</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Manual */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Anleitung für Administratoren
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Umfassende Anleitung für Admin-Mitarbeiter mit:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
              <li>Dashboard und Übersicht</li>
              <li>Anfragen verwalten (bestätigen/ablehnen)</li>
              <li>Manuell Ausleihen anlegen</li>
              <li>Inventarverwaltung</li>
              <li>Admin-Benutzerverwaltung</li>
              <li>Verfügbarkeitsprüfung und Kaution-Hinweise</li>
            </ul>
            <div className="pt-4 space-y-2">
              <a href="/api/docs/pdf?type=admin" className="inline-block w-full">
                <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4" />
                  Als PDF herunterladen
                </Button>
              </a>
              <a href="/docs/admin" className="inline-block w-full">
                <Button variant="outline" className="w-full gap-2">
                  <FileText className="h-4 w-4" />
                  Im Browser lesen
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* End User Manual */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Anleitung für Endbenutzer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Ausführliche Anleitung für Ausleiher mit:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
              <li>Wie das System funktioniert</li>
              <li>Anfrage stellen (Schritt-für-Schritt)</li>
              <li>Artikel auswählen und Mengen</li>
              <li>Zeiträume festlegen</li>
              <li>Kaution-Erklärung</li>
              <li>Bestätigung und Abholung</li>
              <li>Rückgabe und FAQ</li>
            </ul>
            <div className="pt-4 space-y-2">
              <a href="/api/docs/pdf?type=enduser" className="inline-block w-full">
                <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4" />
                  Als PDF herunterladen
                </Button>
              </a>
              <a href="/docs/enduser" className="inline-block w-full">
                <Button variant="outline" className="w-full gap-2">
                  <FileText className="h-4 w-4" />
                  Im Browser lesen
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Wie nutze ich diese Anleitungen?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Für Administratoren:</strong> Nutzen Sie die Admin-Anleitung zur Einarbeitung neuer Mitarbeiter und als Referenz für tägliche Aufgaben.
          </p>
          <p>
            <strong>Für Endbenutzer:</strong> Stellen Sie die Endbenutzer-Anleitung auf Ihrer Website zur Verfügung oder drucken Sie sie aus. Sie erklärt den gesamten Ausleihprozess von Anfang bis Ende.
          </p>
          <p>
            <strong>PDF-Format:</strong> Die PDFs sind optimiert für den Druck und den Bildschirm. Sie können sie jederzeit herunterladen, teilen oder ausdrucken.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
