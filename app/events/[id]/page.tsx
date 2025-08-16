"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getEvent, type Event } from "@/lib/events"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Ticket, ArrowLeft, Calendar, MapPin, Users, ShoppingCart } from "lucide-react"

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [purchaseForm, setPurchaseForm] = useState({
    ticketTypeId: "",
    quantity: 1,
    customerName: "",
    customerEmail: "",
  })

  useEffect(() => {
    if (params.id) {
      loadEvent(params.id as string)
    }
  }, [params.id])

  const loadEvent = async (eventId: string) => {
    try {
      setIsLoading(true)
      const eventData = await getEvent(eventId)
      setEvent(eventData)
      if (eventData?.ticketTypes.length) {
        setPurchaseForm((prev) => ({
          ...prev,
          ticketTypeId: eventData.ticketTypes.find((tt) => tt.isActive)?.id || "",
        }))
      }
    } catch (error) {
      console.error("Error loading event:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    setError("")

    if (!purchaseForm.customerName.trim()) {
      setError("Nome é obrigatório")
      return
    }

    if (!purchaseForm.customerEmail.trim()) {
      setError("Email é obrigatório")
      return
    }

    if (!purchaseForm.ticketTypeId) {
      setError("Selecione um tipo de bilhete")
      return
    }

    const checkoutUrl =
      `/events/${event.id}/checkout?` +
      `ticketType=${purchaseForm.ticketTypeId}&` +
      `quantity=${purchaseForm.quantity}&` +
      `name=${encodeURIComponent(purchaseForm.customerName)}&` +
      `email=${encodeURIComponent(purchaseForm.customerEmail)}`

    router.push(checkoutUrl)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>A carregar evento...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Evento não encontrado</h2>
          <Button asChild>
            <Link href="/events">Ver Outros Eventos</Link>
          </Button>
        </div>
      </div>
    )
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

  const selectedTicketType = event.ticketTypes.find((tt) => tt.id === purchaseForm.ticketTypeId)
  const totalPrice = selectedTicketType ? selectedTicketType.price * purchaseForm.quantity : 0

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
            <Ticket className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Evently</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="space-y-6">
            {event.imageUrl && (
              <img
                src={event.imageUrl || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h2>
              <Badge variant="default">Publicado</Badge>
            </div>

            <p className="text-gray-600 leading-relaxed">{event.description}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Data e Hora</p>
                  <p className="text-gray-600">{formatDate(event.date)}</p>
                  {event.endDate && <p className="text-sm text-gray-500">Até {formatDate(event.endDate)}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  <p className="text-gray-600">{event.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Capacidade</p>
                  <p className="text-gray-600">
                    {event.soldTickets} / {event.capacity} bilhetes vendidos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Comprar Bilhetes
              </CardTitle>
              <CardDescription>Selecione o tipo de bilhete e quantidade desejada</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProceedToCheckout} className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Bilhete</Label>
                  <div className="space-y-2">
                    {event.ticketTypes
                      .filter((tt) => tt.isActive && tt.quantity > tt.sold)
                      .map((ticketType) => (
                        <div
                          key={ticketType.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            purchaseForm.ticketTypeId === ticketType.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setPurchaseForm((prev) => ({ ...prev, ticketTypeId: ticketType.id }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{ticketType.name}</p>
                              {ticketType.description && (
                                <p className="text-sm text-gray-600">{ticketType.description}</p>
                              )}
                              <p className="text-sm text-gray-500">
                                {ticketType.quantity - ticketType.sold} disponíveis
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">€{ticketType.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedTicketType ? selectedTicketType.quantity - selectedTicketType.sold : 1}
                    value={purchaseForm.quantity}
                    onChange={(e) =>
                      setPurchaseForm((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Nome Completo</Label>
                  <Input
                    id="customerName"
                    value={purchaseForm.customerName}
                    onChange={(e) => setPurchaseForm((prev) => ({ ...prev, customerName: e.target.value }))}
                    required
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={purchaseForm.customerEmail}
                    onChange={(e) => setPurchaseForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
                    required
                    placeholder="seu@email.com"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Total:</span>
                    <span className="text-2xl font-bold text-green-600">€{totalPrice.toFixed(2)}</span>
                  </div>

                  <Button type="submit" className="w-full" disabled={!selectedTicketType}>
                    Prosseguir para Pagamento
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
