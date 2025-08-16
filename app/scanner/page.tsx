"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { validateTicket, type Ticket } from "@/lib/tickets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { QrCode, ArrowLeft, Scan, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function ScannerPage() {
  const [qrCode, setQrCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    ticket: Ticket | null
    isValid: boolean
    message: string
  } | null>(null)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrCode.trim()) return

    setIsScanning(true)
    setValidationResult(null)

    try {
      const result = await validateTicket(qrCode.trim())
      setValidationResult(result)
    } catch (error) {
      setValidationResult({
        ticket: null,
        isValid: false,
        message: "Erro ao validar bilhete. Tente novamente.",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const resetScanner = () => {
    setQrCode("")
    setValidationResult(null)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <QrCode className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Scanner de Bilhetes</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Validação de Entrada</h2>
          <p className="text-gray-600">Escaneie ou digite o código QR do bilhete para validar a entrada</p>
        </div>

        {/* Scanner Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Escanear Bilhete
            </CardTitle>
            <CardDescription>Digite ou cole o código QR do bilhete</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScan} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qrCode">Código QR</Label>
                <Input
                  id="qrCode"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="EVENTLY-TICKET-123..."
                  required
                  className="font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isScanning || !qrCode.trim()} className="flex-1">
                  {isScanning ? "A validar..." : "Validar Bilhete"}
                </Button>
                {validationResult && (
                  <Button type="button" variant="outline" onClick={resetScanner}>
                    Novo Scan
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Validation Result */}
        {validationResult && (
          <Card className={`border-2 ${validationResult.isValid ? "border-green-200" : "border-red-200"}`}>
            <CardHeader
              className={`${validationResult.isValid ? "bg-green-50" : "bg-red-50"} flex flex-row items-center gap-4`}
            >
              <div className="flex-shrink-0">
                {validationResult.isValid ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <CardTitle className={`text-lg ${validationResult.isValid ? "text-green-900" : "text-red-900"}`}>
                  {validationResult.isValid ? "Bilhete Válido" : "Bilhete Inválido"}
                </CardTitle>
                <CardDescription className={validationResult.isValid ? "text-green-700" : "text-red-700"}>
                  {validationResult.message}
                </CardDescription>
              </div>
            </CardHeader>

            {validationResult.ticket && (
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Detalhes do Bilhete</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Evento:</span>
                        <span className="font-medium">{validationResult.ticket.eventTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span>{validationResult.ticket.ticketTypeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Titular:</span>
                        <span>{validationResult.ticket.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Preço:</span>
                        <span>€{validationResult.ticket.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comprado em:</span>
                        <span>{formatDate(validationResult.ticket.purchaseDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Status</h4>
                    <div className="space-y-2">
                      <Badge
                        variant={
                          validationResult.ticket.status === "valid"
                            ? "default"
                            : validationResult.ticket.status === "used"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {validationResult.ticket.status === "valid"
                          ? "Válido"
                          : validationResult.ticket.status === "used"
                            ? "Utilizado"
                            : "Cancelado"}
                      </Badge>
                      {validationResult.ticket.validatedAt && (
                        <p className="text-sm text-gray-600">
                          Validado em: {formatDate(validationResult.ticket.validatedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {validationResult.isValid && (
                  <Alert className="mt-4 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Entrada autorizada!</strong> O bilhete foi marcado como utilizado.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Instruções
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>• Cada bilhete só pode ser utilizado uma vez</p>
            <p>• Bilhetes cancelados não permitem entrada</p>
            <p>• Verifique sempre os dados do titular na entrada</p>
            <p>• Em caso de dúvidas, contacte a organização do evento</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
