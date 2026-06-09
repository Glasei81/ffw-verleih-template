"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, ShieldCheck } from "lucide-react"

interface Admin {
  id: number
  username: string
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
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(`Admin "${username}" wurde angelegt.`)
        setUsername("")
        setPassword("")
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

  return (
    <div className="space-y-6">
      {/* Bestehende Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktive Administratoren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Fallback-Admin aus Umgebungsvariable */}
          <div className="flex items-center justify-between p-2 rounded bg-gray-50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">admin</span>
            </div>
            <span className="text-xs text-gray-400">Hauptkonto (Umgebungsvariable)</span>
          </div>
          {admins.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-2 rounded bg-gray-50">
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
          ))}
        </CardContent>
      </Card>

      {/* Neuen Admin anlegen */}
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
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Wird angelegt..." : "Admin anlegen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
