"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, ShieldCheck, Pencil, Check, X } from "lucide-react"

interface Admin {
  id: number
  username: string
  display_name: string | null
  email: string | null
  phone: string | null
  created_at: string
}

export default function AdminsClient({
  admins: initial,
  currentUser,
}: {
  admins: Admin[]
  currentUser: string
}) {
  const router = useRouter()
  const [admins, setAdmins] = useState(initial)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhone, setEditPhone] = useState("")

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, displayName, phone }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(`Admin "${username}" wurde angelegt.`)
        setUsername("")
        setPassword("")
        setDisplayName("")
        setEmail("")
        setPhone("")
        router.refresh()
      } else {
        setError(data.error)
      }
    } catch {
      setError("Fehler beim Anlegen")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAdmin = async (id: number, name: string) => {
    if (!window.confirm(`Admin "${name}" wirklich löschen?`)) return
    const res = await fetch("/api/admin/admins", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setAdmins((prev) => prev.filter((a) => a.id !== id))
    }
  }

  const startEdit = (a: Admin) => {
    setEditingId(a.id)
    setEditName(a.display_name ?? "")
    setEditEmail(a.email ?? "")
    setEditPhone(a.phone ?? "")
  }

  const saveEdit = async (id: number) => {
    const res = await fetch("/api/admin/admins", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, email: editEmail, displayName: editName, phone: editPhone }),
    })
    if (res.ok) {
      setAdmins((prev) => prev.map((a) =>
        a.id === id
          ? { ...a, display_name: editName || null, email: editEmail || null, phone: editPhone || null }
          : a
      ))
      setEditingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktive Administratoren</CardTitle>
          <p className="text-xs text-gray-500">
            Name und Telefon erscheinen als Ansprechpartner in der Bestätigungs-E-Mail an den Ausleiher.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded bg-gray-50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">admin</span>
            </div>
            <span className="text-xs text-gray-400">Hauptkonto</span>
          </div>
          {admins.map((a) => (
            <div key={a.id} className="p-3 rounded bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    {a.display_name || a.username}
                    {a.display_name && <span className="text-gray-400 font-normal"> ({a.username})</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {editingId !== a.id && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-500" onClick={() => startEdit(a)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {a.username !== currentUser && editingId !== a.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAdmin(a.id, a.username)}
                      className="text-red-500 hover:text-red-700 h-7 px-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {editingId === a.id ? (
                <div className="mt-2 space-y-2">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name (z.B. Max Mustermann)" className="h-8 text-sm" />
                  <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="E-Mail-Adresse" className="h-8 text-sm" />
                  <Input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Telefon (optional)" className="h-8 text-sm" />
                  <div className="flex gap-1">
                    <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => saveEdit(a.id)}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Speichern
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-gray-400" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-1 ml-6 text-xs text-gray-500 space-y-0.5">
                  <p>{a.email || <span className="text-gray-400">keine E-Mail</span>}</p>
                  {a.phone && <p>{a.phone}</p>}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Neuen Admin anlegen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createAdmin} className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert className="border-green-200 bg-green-50"><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>}
            <div className="space-y-2">
              <Label>Benutzername</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="z.B. max.mustermann" required />
            </div>
            <div className="space-y-2">
              <Label>Passwort</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Sicheres Passwort" required />
            </div>
            <div className="space-y-2">
              <Label>Name <span className="text-gray-400 font-normal">(als Ansprechpartner sichtbar)</span></Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder="z.B. Max Mustermann" />
            </div>
            <div className="space-y-2">
              <Label>E-Mail <span className="text-gray-400 font-normal">(für Benachrichtigungen)</span></Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@feuerwehr-raubling.de" />
            </div>
            <div className="space-y-2">
              <Label>Telefon <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="z.B. 0170 1234567" />
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Wird angelegt..." : "Admin anlegen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
