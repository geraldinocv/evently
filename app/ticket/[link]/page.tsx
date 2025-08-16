"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getTicketByLink, type Ticket } from "@/lib/tickets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TicketIcon, Calendar, User, Mail, Phone, Download, Share2 } from "lucide-react"

export default function TicketPage() {
  const params = useParams()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.link) {
      loadTicket(params.link as string)
    }
  }, [params.link])

  const loadTicket = async (uniqueLink: string) => {
    try {
      setIsLoading(true)
      const ticketData = await getTicketByLink(uniqueLink)
      if (ticketData) {
        setTicket(ticketData)
      } else {
        setError("Bilhete não encontrado")
      }
    } catch (error) {
      console.error("Error loading ticket:", error)
      setError("Erro ao carregar bilhete")
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && ticket) {
      try {
        await navigator.share({
          title: `Bilhete - ${ticket.eventTitle}`,
          text: `Meu bilhete para ${ticket.eventTitle}`,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>A carregar bilhete...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || "Bilhete não encontrado"}</h2>
          <p className="text-gray-600 mb-4">Verifique se o link está correto ou contacte o suporte.</p>
          <Button asChild>
            <Link href="/events">Ver Eventos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TicketIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Meu Bilhete</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Partilhar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descarregar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{ticket.eventTitle}</CardTitle>
                <p className="text-blue-100 mt-1">{ticket.ticketTypeName}</p>
              </div>
              <Badge
                variant={ticket.status === "valid" ? "default" : "secondary"}
                className="bg-white/20 text-white border-white/30"
              >
                {ticket.status === "valid" ? "Válido" : ticket.status === "used" ? "Usado" : "Cancelado"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* QR Code */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qrCode)}`}
                  alt="QR Code do Bilhete"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">Apresente este QR Code na entrada do evento</p>
            </div>

            <Separator className="my-6" />

            {/* Ticket Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium">{ticket.customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{ticket.customerEmail}</p>
                  </div>
                </div>

                {ticket.customerPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="font-medium">{ticket.customerPhone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Data de Compra</p>
                    <p className="font-medium">{new Date(ticket.purchaseDate).toLocaleDateString("pt-PT")}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ID do Bilhete</p>
                  <p className="font-mono text-sm">{ticket.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Preço</p>
                  <p className="font-semibold text-lg">€{ticket.price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1" asChild>
                <Link href="/tickets/lookup">Ver Todos os Bilhetes</Link>
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href="/events">Outros Eventos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
