import InventoryForm from "@/components/inventory-form"

export default function AddInventoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Neuen Artikel hinzufügen</h1>
        <p className="text-gray-600 mt-2">Fügen Sie einen neuen Artikel zum Inventar hinzu</p>
      </div>

      <div className="max-w-2xl">
        <InventoryForm />
      </div>
    </div>
  )
}
