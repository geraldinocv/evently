"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { getTicketsByEmail, generateQRCodeURL, type Ticket } from "@/lib/tickets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { TicketIcon, ArrowLeft, Search, QrCode, Download } from "lucide-react"

export default function TicketLookupPage() {
  const [email, setEmail] = useState("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSearched(true)

    try {
      const userTickets = await getTicketsByEmail(email)
      setTickets(userTickets)
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setIsLoading(false)
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "default"
      case "used":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "valid":
        return "Válido"
      case "used":
        return "Utilizado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <TicketIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Meus Bilhetes</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Consultar Bilhetes</h2>
          <p className="text-gray-600">Insira seu email para ver todos os bilhetes comprados</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Pesquisar Bilhetes
            </CardTitle>
            <CardDescription>Digite o email usado na compra dos bilhetes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="email" className="sr-only">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "A pesquisar..." : "Pesquisar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>A pesquisar bilhetes...</p>
          </div>
        ) : searched && tickets.length === 0 ? (
          <div className="text-center py-12">
            <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum bilhete encontrado</h3>
            <p className="text-gray-600 mb-6">Não encontrámos bilhetes associados a este email</p>
            <Button asChild>
              <Link href="/events">Comprar Bilhetes</Link>
            </Button>
          </div>
        ) : (
          tickets.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">{tickets.length} bilhete(s) encontrado(s)</h3>

              <div className="grid gap-6">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{ticket.eventTitle}</CardTitle>
                          <CardDescription className="mt-1">
                            {ticket.ticketTypeName} • Comprado em {formatDate(ticket.purchaseDate)}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusColor(ticket.status) as any}>{getStatusLabel(ticket.status)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Ticket Details */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Detalhes do Bilhete</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">ID do Bilhete:</span>
                                <span className="font-mono">{ticket.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Preço:</span>
                                <span className="font-semibold">€{ticket.price}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Titular:</span>
                                <span>{ticket.customerName}</span>
                              </div>
                              {ticket.validatedAt && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Utilizado em:</span>
                                  <span>{formatDate(ticket.validatedAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <Alert>
                            <QrCode className="h-4 w-4" />
                            <AlertDescription>
                              Apresente este QR Code na entrada do evento para validação.
                            </AlertDescription>
                          </Alert>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                            <img
                              src={generateQRCodeURL(ticket.qrCode) || "/placeholder.svg"}
                              alt={`QR Code para ${ticket.id}`}
                              className="w-32 h-32"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 font-mono break-all">{ticket.qrCode}</p>
                          </div>
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            <Download className="h-4 w-4 mr-2" />
                            Baixar Bilhete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        )}
      </main>
    </div>
  )
}
