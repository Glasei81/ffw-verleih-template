"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, X } from "lucide-react"

interface ConfirmRentalDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (pickupInfo: string, adminMessage: string) => void
  renterName: string
  itemName: string
  startDate: string
  endDate: string
  mode: "confirm" | "cancel"
}

export function ConfirmRentalDialog({
  isOpen,
  onClose,
  onConfirm,
  renterName,
  itemName,
  startDate,
  endDate,
  mode,
}: ConfirmRentalDialogProps) {
  const [pickupInfo, setPickupInfo] = useState("")
  const [adminMessage, setAdminMessage] = useState("")

  if (!isOpen) return null

  const isConfirm = mode === "confirm"

  const handleSubmit = () => {
    onConfirm(pickupInfo, adminMessage)
    setPickupInfo("")
    setAdminMessage("")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-xl font-bold mb-1 ${isConfirm ? "text-green-700" : "text-red-700"}`}>
          {isConfirm ? "Ausleihe bestätigen" : "Anfrage ablehnen"}
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          <strong>{renterName}</strong> &middot; {itemName} &middot;{" "}
          {new Date(startDate).toLocaleDateString("de-DE")} –{" "}
          {new Date(endDate).toLocaleDateString("de-DE")}
        </p>

        <div className="space-y-4">
          {isConfirm && (
            <div className="space-y-1">
              <Label htmlFor="pickup-info">
                Abholhinweis <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="pickup-info"
                placeholder="z.B. Freitag, 20.06. ab 14 Uhr im Gerätehaus Raubling (Hauptstr. 1)"
                value={pickupInfo}
                onChange={(e) => setPickupInfo(e.target.value)}
                rows={3}
                autoFocus
              />
              <p className="text-xs text-gray-500">Wird per E-Mail an den Ausleiher gesendet</p>
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="admin-message">
              {isConfirm ? "Zusätzliche Nachricht (optional)" : "Ablehnungsgrund (optional)"}
            </Label>
            <Textarea
              id="admin-message"
              placeholder={
                isConfirm
                  ? "Weitere Hinweise für den Ausleiher..."
                  : "Warum kann die Anfrage nicht erfüllt werden?"
              }
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5 justify-end">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            disabled={isConfirm && !pickupInfo.trim()}
            onClick={handleSubmit}
            className={
              isConfirm
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }
          >
            {isConfirm ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Bestätigen & E-Mail senden
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-1" />
                Ablehnen
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
