"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Check, RotateCcw, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface RentalActionsProps {
  rental: {
    id: number
    status: string
  }
}

export default function RentalActions({ rental }: RentalActionsProps) {
  const router = useRouter()

  const updateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/rentals/${rental.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating rental status:", error)
    }
  }

  const getAvailableActions = () => {
    switch (rental.status) {
      case "pending":
        return [
          { label: "Bestätigen", status: "confirmed", icon: Check, color: "text-green-600" },
          { label: "Ablehnen", status: "cancelled", icon: X, color: "text-red-600" },
        ]
      case "confirmed":
        return [
          { label: "Als zurückgegeben markieren", status: "returned", icon: RotateCcw, color: "text-gray-600" },
          { label: "Stornieren", status: "cancelled", icon: X, color: "text-red-600" },
        ]
      default:
        return []
    }
  }

  const availableActions = getAvailableActions()
  if (availableActions.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableActions.map((action) => (
          <DropdownMenuItem
            key={action.status}
            onClick={() => updateStatus(action.status)}
            className={action.color}
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
