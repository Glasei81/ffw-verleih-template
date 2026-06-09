import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import InventoryForm from "@/components/inventory-form"

async function getInventoryItem(id: number) {
  const result = await sql`SELECT * FROM inventory WHERE id = ${id}`
  return result[0] || null
}

export default async function EditInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number.parseInt(idStr)
  const item = await getInventoryItem(id)

  if (!item) notFound()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Artikel bearbeiten</h1>
        <p className="text-gray-600 mt-1">{item.name}</p>
      </div>
      <div className="max-w-2xl">
        <InventoryForm item={item} />
      </div>
    </div>
  )
}
