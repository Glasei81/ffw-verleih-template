import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">FFW Raubling</CardTitle>
          <p className="text-gray-600 mt-1">Verwaltung – Anmeldung</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
