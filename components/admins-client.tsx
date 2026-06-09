"use client"

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
  email: string | null
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
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editEmail, setEditEmail] = useState("")

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(`Admin "${username}" wurde angelegt.`)
        setUsername("")
        setPassword("")
        setEmail("")
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

  const saveEmail = async (id: number) => {
    const res = await fetch("/api/admin/admins", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, email: editEmail }),
    })
    if (res.ok) {
      setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, email: editEmail || null } : a))
      setEditingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktive Administratoren</CardTitle>
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
            <div key={a.id} className="p-2 rounded bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{a.username}</span>
                </div>
                {a.username !== currentUser && (
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
              <div className="mt-1 ml-6">
                {editingId === a.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="E-Mail-Adresse"
                      className="h-7 text-xs"
                    />
                    <Button variant="ghost" size="sm" className="h-7 px-1 text-green-600" onClick={() => saveEmail(a.id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-1 text-gray-400" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <button
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                    onClick={() => { setEditingId(a.id); setEditEmail(a.email ?? "") }}
                  >
                    <Pencil className="h-3 w-3" />
                    {a.email ? a.email : "E-Mail eintragen"}
                  </button>
                )}
              </div>
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
              <Label>E-Mail <span className="text-gray-400 font-normal">(optional, für Benachrichtigungen)</span></Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ffw-raubling.de" />
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
