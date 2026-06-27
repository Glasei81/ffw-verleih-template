"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X } from "lucide-react"

/** Wandelt String oder Date robust in das YYYY-MM-DD-Format für <input type="date"> um. */
function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return ""
  if (typeof value === "string") return value.slice(0, 10)
  const d = new Date(value)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface ConfirmRentalDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { pickupInfo: string; adminMessage: string; pickupDate: string; pickupTime: string }) => void
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
  // Abholtermin: Datum vorbelegt mit dem Abholdatum aus der Anfrage, Uhrzeit optional
  const [pickupDate, setPickupDate] = useState(toDateInputValue(startDate))
  const [pickupTime, setPickupTime] = useState("")

  if (!isOpen) return null

  const isConfirm = mode === "confirm"

  const handleSubmit = () => {
    onConfirm({ pickupInfo, adminMessage, pickupDate, pickupTime })
    setPickupInfo("")
    setAdminMessage("")
    setPickupTime("")
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
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="pickup-date">Abholung am</Label>
                  <Input
                    id="pickup-date"
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pickup-time">
                    Uhrzeit <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="pickup-time"
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                  />
                </div>
              </div>
              <p className="-mt-2 text-xs text-gray-500">
                Der Ausleiher bekommt einen Kalender-Termin zum Eintragen. Ohne Uhrzeit gilt der Tag als ganztägig.
              </p>

              <div className="space-y-1">
                <Label htmlFor="pickup-info">
                  Abholhinweis <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="pickup-info"
                  placeholder="z.B. im Gerätehaus Raubling (Hauptstr. 1), bitte klingeln"
                  value={pickupInfo}
                  onChange={(e) => setPickupInfo(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">Wird per E-Mail an den Ausleiher gesendet</p>
              </div>
            </>
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
