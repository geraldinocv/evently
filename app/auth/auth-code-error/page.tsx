import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Erro de Autenticação</CardTitle>
          <CardDescription>Houve um problema ao confirmar sua conta</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            O link de confirmação pode ter expirado ou já foi usado. Tente fazer login novamente ou criar uma nova
            conta.
          </p>
          <div className="space-y-2">
            <Link href="/auth/login">
              <Button className="w-full">Fazer Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" className="w-full bg-transparent">
                Criar Nova Conta
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
