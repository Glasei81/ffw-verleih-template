import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

const ITEMS = [
  // Küche/Gastro
  { name: 'Getränkekühlschrank "effect"', description: "Küche/Gastro · AHT", quantity: 3 },
  { name: "Kühlschrank, Unterbau", description: "Küche/Gastro · Bosch", quantity: 1 },
  { name: "Kühlschrank, mittelgroß", description: "Küche/Gastro · Liebherr premium", quantity: 1 },
  { name: "Kühl-Gefrierschrank", description: "Küche/Gastro · Liebherr comfort", quantity: 1 },
  { name: "Kühl-Gefrierschrank (Bauknecht)", description: "Küche/Gastro · Bauknecht", quantity: 1 },
  { name: "Gasherd, 4-flammig", description: "Küche/Gastro · Privilieg 3150 G", quantity: 2 },
  { name: "Holzkohlengrill, groß", description: "Küche/Gastro · Eigenbau", quantity: 1 },
  { name: "Holzkohlengrill, schmal", description: "Küche/Gastro · Eigenbau", quantity: 2 },
  { name: "Fritteuse", description: "Küche/Gastro · MKN", quantity: 1 },
  { name: "Fritteuse, Doppelbecken (Bartscher)", description: "Küche/Gastro · Bartscher", quantity: 1 },
  { name: "Fritteuse, kleines Becken", description: "Küche/Gastro · Apexa", quantity: 1 },
  { name: "Fritteuse, Doppelbecken (Royal)", description: "Küche/Gastro · Royal", quantity: 1 },
  { name: "Hockerkocher, gasbetrieben", description: "Küche/Gastro · inkl. Bratpfanne rund", quantity: 1 },
  { name: "Tischgasgrill", description: "Küche/Gastro", quantity: 1 },
  { name: "Bain Marie, gasbetrieben", description: "Küche/Gastro · inkl. Gestell schwarz", quantity: 1 },
  { name: "Bain Marie, Wagen, elektrisch, Doppelbecken", description: "Küche/Gastro · Blanco", quantity: 1 },
  { name: "Gaskocher verbaut in Rollwagen", description: "Küche/Gastro · Eigenbau", quantity: 1 },
  { name: "Gasgrill, auf Rollgestell", description: "Küche/Gastro", quantity: 1 },
  { name: "Bratraine, Stahl, mit Seitengriffen", description: "Küche/Gastro · Eigenbau", quantity: 1 },
  { name: "Bratpfanne, Guß, langstielig", description: "Küche/Gastro", quantity: 1 },
  { name: "Barelement mit Spüle", description: "Küche/Gastro", quantity: 2 },
  { name: "Thermowagen, blau (für GN-Behälter)", description: "Küche/Gastro", quantity: 1 },
  { name: "Servierwagen, 3-stöckig", description: "Küche/Gastro", quantity: 3 },
  { name: "Kochtopf, 25 l", description: "Küche/Gastro · Elo Profitherm · inkl. Deckel", quantity: 2 },
  { name: "Kochtopf, 15 l", description: "Küche/Gastro · inkl. Deckel", quantity: 1 },
  { name: "Kochtopf, 7 l", description: "Küche/Gastro · inkl. Deckel", quantity: 2 },
  { name: "Kochtopf, 2 l", description: "Küche/Gastro", quantity: 2 },
  { name: "GN-Einsatz 1/2, 15 cm", description: "Küche/Gastro", quantity: 2 },
  { name: "GN-Einsatz 1/2, 20 cm", description: "Küche/Gastro", quantity: 1 },
  { name: "GN-Einsatz 1/3, 15 cm (Kunststoff)", description: "Küche/Gastro", quantity: 2 },
  { name: "GN-Einsatz 1/3, 10 cm (Kunststoff)", description: "Küche/Gastro", quantity: 1 },
  { name: "GN-Einsatz 1/3, 15 cm", description: "Küche/Gastro", quantity: 2 },
  { name: "GN-Einsatz 1/6, 15 cm", description: "Küche/Gastro", quantity: 1 },
  { name: "GN-Einsatz 1/1, 20 cm", description: "Küche/Gastro", quantity: 12 },
  { name: "GN-Einsatz 1/1, 15 cm", description: "Küche/Gastro", quantity: 2 },
  { name: "GN-Einsatz 1/1, 10 cm", description: "Küche/Gastro", quantity: 3 },
  { name: "GN-Einsatz 1/1, 10 cm (Kunststoff)", description: "Küche/Gastro", quantity: 2 },
  { name: "Gitter 1/1", description: "Küche/Gastro", quantity: 7 },
  { name: "GN-Blech 1/1, flach", description: "Küche/Gastro", quantity: 1 },
  { name: "Deckel für GN-Einsatz 1/1", description: "Küche/Gastro", quantity: 3 },
  { name: "Deckel für GN-Einsatz 1/2", description: "Küche/Gastro · 1× Klappdeckel", quantity: 4 },
  { name: "Deckel für GN-Einsatz 1/3", description: "Küche/Gastro", quantity: 2 },
  { name: "Schüsseln, Chromstahl, diverse Größen", description: "Küche/Gastro", quantity: 5 },
  { name: "Plastikschüssel, rechteckig 40×40 cm", description: "Küche/Gastro · Curver", quantity: 12 },
  { name: "Plastikschüssel, rund, diverse Größen", description: "Küche/Gastro · Curver", quantity: 7 },
  { name: "Tellerbox inkl. Besteck, 25er Set", description: "Küche/Gastro · nicht alle vollzählig", quantity: 14 },
  { name: 'Kaffeehaferl, weiß "Bockmeier" (Kiste à 25 Stk.)', description: "Küche/Gastro · 1 Kiste nicht vollzählig", quantity: 7 },
  { name: 'Bierkrüge "Hacker Pschorr" 0,5 l (Kiste/23 Stk.)', description: "Küche/Gastro · 1 Kiste nicht vollzählig", quantity: 4 },
  { name: 'Maßkrüge "Hacker Pschorr" (Kiste/15 Stk.)', description: "Küche/Gastro", quantity: 4 },
  { name: 'Weißbiergläser "Auer Bräu" (Karton/6 Stk.)', description: "Küche/Gastro · Auer Bräu Spitzingsee", quantity: 4 },
  { name: "Barbecher, milchig, 0,3 l", description: "Küche/Gastro", quantity: 376 },
  { name: "Sektgläser", description: "Küche/Gastro", quantity: 153 },
  { name: "Aperolgläser, gemischt", description: "Küche/Gastro", quantity: 69 },
  { name: 'Weißbiergläser "Hacker Pschorr" (Kiste/24 Stk.)', description: "Küche/Gastro", quantity: 4 },
  // Mobiliar
  { name: "Biertische, schmal, orange", description: "Mobiliar · Auerbräu", quantity: 10 },
  { name: "Bierbänke, orange", description: "Mobiliar · Auerbräu", quantity: 10 },
  { name: "Biertische, breit", description: "Mobiliar", quantity: 10 },
  { name: "Holztische, braun (1,80×80 cm)", description: "Mobiliar", quantity: 6 },
  { name: "Stehtisch, hellbraun, rechteckig", description: "Mobiliar", quantity: 1 },
  { name: 'Stehtisch "Coca Cola", rund', description: "Mobiliar", quantity: 1 },
  { name: 'Stehtisch "weiß", rechteckig', description: "Mobiliar", quantity: 1 },
  { name: "Holzstühle, dunkelbraun", description: "Mobiliar", quantity: 27 },
  { name: "Dekornetz, weiß", description: "Mobiliar", quantity: 1 },
  { name: "Barhocker, Holz, mit Metallfüßen", description: "Mobiliar", quantity: 9 },
  // Deko
  { name: "Sonnenschirme, grün, klein", description: "Deko · Auerbräu", quantity: 10 },
  { name: "Sonnenschirme, blau, klein", description: "Deko · Hacker Pschorr", quantity: 15 },
  { name: "Schirmstangen für Sonnenschirme", description: "Deko", quantity: 30 },
  { name: "Schirmständer für Sonnenschirme", description: "Deko", quantity: 27 },
  { name: "Biergartentische, grün, rechteckig", description: "Deko", quantity: 4 },
  { name: "Klappstühle, grün", description: "Deko", quantity: 13 },
  // Sonstiges
  { name: "Mülltonnen, rund", description: "Sonstiges · Sülo", quantity: 6 },
  { name: "Heizschwammerl, gasbetrieben", description: "Sonstiges · ohne Gas", quantity: 2 },
  { name: "Mülltonnen, 120 l", description: "Sonstiges", quantity: 2 },
  { name: "Kabel 230 V, 4 m", description: "Sonstiges · Elektro", quantity: 2 },
  { name: "Kabel 230 V, 5 m", description: "Sonstiges · Elektro", quantity: 11 },
  { name: "Kabel 230 V, 6 m", description: "Sonstiges · Elektro", quantity: 3 },
  { name: "Kabel 230 V, 7 m", description: "Sonstiges · Elektro", quantity: 1 },
  { name: "Kabel 230 V, 10 m", description: "Sonstiges · Elektro", quantity: 6 },
  { name: "Lichterkette 10 m (9 Birnen)", description: "Sonstiges · Elektro", quantity: 3 },
  { name: "Lichterkette 12 m (15 Birnen)", description: "Sonstiges · Elektro", quantity: 1 },
  { name: "Lichterkette A, 30 m (31 Birnen)", description: "Sonstiges · Elektro", quantity: 1 },
  { name: "Lichterkette B, 28 m (34 Birnen)", description: "Sonstiges · Elektro", quantity: 1 },
  { name: "Lichterkette C, 42 m (51 Birnen)", description: "Sonstiges · Elektro", quantity: 1 },
  { name: "Lichterkette D, 40 m (47 Birnen)", description: "Sonstiges · Elektro", quantity: 1 },
  { name: "Lichterkette E, 40 m (46 Birnen)", description: "Sonstiges · Elektro", quantity: 1 },
  { name: "Lichterkette F, 40 m (48 Birnen)", description: "Sonstiges · Elektro", quantity: 1 },
]

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })
  }

  try {
    const existing = await sql`SELECT COUNT(*)::int AS count FROM inventory`
    const count = Number(existing[0]?.count ?? 0)
    if (count > 0) {
      return NextResponse.json(
        { error: `Inventar enthält bereits ${count} Artikel. Seed wird übersprungen.` },
        { status: 409 }
      )
    }

    for (const item of ITEMS) {
      await sql`
        INSERT INTO inventory (name, description, price_per_day, is_available, quantity)
        VALUES (${item.name}, ${item.description}, 0, true, ${item.quantity})
      `
    }

    return NextResponse.json({ success: true, inserted: ITEMS.length })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Fehler beim Einspielen der Daten" }, { status: 500 })
  }
}
