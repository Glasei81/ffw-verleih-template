"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Check, Play, RotateCcw, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface RentalActionsProps {
  rental: {
    id: number
    status: string
    renter_name: string
    item_name: string
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
      } else {
        console.error("Failed to update rental status")
      }
    } catch (error) {
      console.error("Error updating rental status:", error)
    }
  }

  const getAvailableActions = () => {
    const actions = []

    switch (rental.status) {
      case "pending":
        actions.push(
          { label: "Bestätigen", status: "confirmed", icon: Check, color: "text-green-600" },
          { label: "Stornieren", status: "cancelled", icon: X, color: "text-red-600" },
        )
        break
      case "confirmed":
        actions.push(
          { label: "Aktivieren", status: "active", icon: Play, color: "text-blue-600" },
          { label: "Stornieren", status: "cancelled", icon: X, color: "text-red-600" },
        )
        break
      case "active":
        actions.push({
          label: "Als zurückgegeben markieren",
          status: "returned",
          icon: RotateCcw,
          color: "text-gray-600",
        })
        break
    }

    return actions
  }

  const availableActions = getAvailableActions()

  if (availableActions.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableActions.map((action) => (
          <DropdownMenuItem key={action.status} onClick={() => updateStatus(action.status)} className={action.color}>
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
