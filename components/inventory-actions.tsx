"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, ToggleLeft, ToggleRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface InventoryActionsProps {
  item: {
    id: number
    name: string
    is_available: boolean
  }
}

export default function InventoryActions({ item }: InventoryActionsProps) {
  const router = useRouter()

  const toggleAvailability = async () => {
    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: !item.is_available }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error toggling availability:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/admin/inventory/edit/${item.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Bearbeiten
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleAvailability}>
          {item.is_available ? (
            <>
              <ToggleLeft className="h-4 w-4 mr-2" />
              Deaktivieren
            </>
          ) : (
            <>
              <ToggleRight className="h-4 w-4 mr-2" />
              Aktivieren
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
