import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import InventoryForm from "@/components/inventory-form"

async function getInventoryItem(id: number) {
  const result = await sql`
    SELECT * FROM inventory WHERE id = ${id}
  `
  return result[0] || null
}

export default async function EditInventoryPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const item = await getInventoryItem(id)

  if (!item) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Artikel bearbeiten</h1>
        <p className="text-gray-600 mt-2">Bearbeiten Sie die Details des Artikels</p>
      </div>

      <div className="max-w-2xl">
        <InventoryForm item={item} />
      </div>
    </div>
  )
}
