"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Check, RotateCcw, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { ConfirmRentalDialog } from "./confirm-rental-dialog"

interface RentalActionsProps {
  rental: {
    id: number
    status: string
    renter_name: string
    renter_email: string
    item_name: string
    start_date: string
    end_date: string
  }
}

export default function RentalActions({ rental }: RentalActionsProps) {
  const router = useRouter()
  const [dialogMode, setDialogMode] = useState<"confirm" | "cancel" | null>(null)

  const updateStatus = async (newStatus: string, pickupInfo = "", adminMessage = "") => {
    try {
      const response = await fetch(`/api/rentals/${rental.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, pickupInfo, adminMessage }),
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating rental status:", error)
    }
  }

  if (rental.status === "pending") {
    return (
      <>
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={() => setDialogMode("confirm")}
            className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-2"
          >
            <Check className="h-3 w-3 mr-1" />
            Bestätigen
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialogMode("cancel")}
            className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Ablehnen
          </Button>
        </div>
        {dialogMode && (
          <ConfirmRentalDialog
            isOpen={true}
            onClose={() => setDialogMode(null)}
            onConfirm={(pickupInfo, adminMessage) => {
              updateStatus(dialogMode === "confirm" ? "confirmed" : "cancelled", pickupInfo, adminMessage)
              setDialogMode(null)
            }}
            renterName={rental.renter_name}
            itemName={rental.item_name}
            startDate={rental.start_date}
            endDate={rental.end_date}
            mode={dialogMode}
          />
        )}
      </>
    )
  }

  const getAvailableActions = () => {
    switch (rental.status) {
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
