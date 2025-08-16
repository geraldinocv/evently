"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyEmail } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token de verificação não encontrado")
      return
    }

    verifyEmail(token)
      .then((result) => {
        setStatus(result.success ? "success" : "error")
        setMessage(result.message)
      })
      .catch(() => {
        setStatus("error")
        setMessage("Erro ao verificar email")
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verificação de Email</CardTitle>
          <CardDescription>Confirmação da sua conta Evently</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <p>Verificando seu email...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
              <p className="text-green-600 font-medium">{message}</p>
              <Button onClick={() => router.push("/auth/login")} className="w-full">
                Ir para Login
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 mx-auto text-red-600" />
              <p className="text-red-600 font-medium">{message}</p>
              <Button onClick={() => router.push("/auth/register")} variant="outline" className="w-full">
                Voltar ao Registro
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
