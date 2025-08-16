"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getRP, getRPSales, calculateRPStats, updateRPEventAssignments, type RP, type RPSale } from "@/lib/rps"
import { getEvents } from "@/lib/events"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, ArrowLeft, Mail, Phone, ExternalLink, Calendar, Ticket, Settings } from "lucide-react"

export default function RPDetailsPage() {
  const params = useParams()
  const [rp, setRP] = useState<RP | null>(null)
  const [sales, setSales] = useState<RPSale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEventAssignment, setShowEventAssignment] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [isUpdatingEvents, setIsUpdatingEvents] = useState(false)
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    if (params.id) {
      loadRPData(params.id as string)
    }
  }, [params.id])

  const loadRPData = async (rpId: string) => {
    try {
      setIsLoading(true)
      const [rpData, salesData, eventsData] = await Promise.all([getRP(rpId), getRPSales(rpId), getEvents()])

      setRP(rpData)
      setSales(salesData)
      setEvents(eventsData)
      if (rpData) {
        setSelectedEvents(rpData.assignedEvents || [])
      }
    } catch (error) {
      console.error("Error loading RP data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventToggle = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents((prev) => [...prev, eventId])
    } else {
      setSelectedEvents((prev) => prev.filter((id) => id !== eventId))
    }
  }

  const handleUpdateEventAssignments = async () => {
    if (!rp) return

    try {
      setIsUpdatingEvents(true)
      const updatedRP = await updateRPEventAssignments(rp.id, selectedEvents)
      if (updatedRP) {
        setRP(updatedRP)
        setShowEventAssignment(false)
      }
    } catch (error) {
      console.error("Error updating event assignments:", error)
      alert("Erro ao atualizar eventos. Tente novamente.")
    } finally {
      setIsUpdatingEvents(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>A carregar dados do RP...</p>
        </div>
      </div>
    )
  }

  if (!rp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">RP não encontrado</h2>
          <Button asChild>
            <Link href="/dashboard/rps">Voltar aos RPs</Link>
          </Button>
        </div>
      </div>
    )
  }

  const stats = calculateRPStats(rp, sales)
  const assignedEventTitles = events.filter((event) => rp.assignedEvents.includes(event.id)).map((event) => event.title)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/rps">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{rp.name}</h1>
            <Badge variant={rp.isActive ? "default" : "secondary"}>{rp.isActive ? "Ativo" : "Inativo"}</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* RP Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do RP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{rp.email}</span>
                  </div>
                  {rp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{rp.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-mono break-all">{rp.uniqueLink}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Desde {formatDate(rp.createdAt)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{rp.commissionRate}%</div>
                    <div className="text-sm text-gray-600">Taxa de Comissão</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eventos Atribuídos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Eventos Atribuídos
                  <Button variant="outline" size="sm" onClick={() => setShowEventAssignment(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Gerir
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedEventTitles.length === 0 ? (
                  <p className="text-sm text-gray-600">Nenhum evento atribuído</p>
                ) : (
                  <div className="space-y-2">
                    {assignedEventTitles.map((title, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">€{stats.totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Vendas Totais</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">€{stats.totalCommission.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Comissões</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">{stats.totalTickets}</div>
                    <div className="text-xs text-gray-600">Bilhetes Vendidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">€{stats.averageTicketValue.toFixed(0)}</div>
                    <div className="text-xs text-gray-600">Valor Médio</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Este Mês</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">€{stats.monthRevenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Vendas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        €{stats.monthCommission.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Comissões</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Histórico de Vendas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
                <CardDescription>{sales.length} venda(s) registada(s)</CardDescription>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <div className="text-center py-8">
                    <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma venda registada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sales.map((sale) => (
                      <div key={sale.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{sale.eventTitle}</h4>
                            <p className="text-sm text-gray-600">{sale.ticketTypeName}</p>
                          </div>
                          <Badge variant={sale.status === "completed" ? "default" : "secondary"}>
                            {sale.status === "completed" ? "Concluída" : "Pendente"}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Cliente:</span>
                            <p className="font-medium">{sale.customerName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Quantidade:</span>
                            <p className="font-medium">{sale.quantity} bilhete(s)</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Total:</span>
                            <p className="font-medium text-green-600">€{sale.totalAmount}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Comissão:</span>
                            <p className="font-medium text-blue-600">€{sale.commissionAmount.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">{formatDate(sale.saleDate)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gerir Eventos Atribuídos */}
        {showEventAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Gerir Eventos Atribuídos</CardTitle>
                <CardDescription>Selecione os eventos que {rp.name} pode vender bilhetes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={`event-${event.id}`}
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={(checked) => handleEventToggle(event.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <label htmlFor={`event-${event.id}`} className="text-sm font-medium cursor-pointer">
                          {event.title}
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(event.date).toLocaleDateString("pt-PT")} • {event.location}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.ticketTypes.length} tipo(s) de bilhete disponível(is)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpdateEventAssignments} className="flex-1" disabled={isUpdatingEvents}>
                    {isUpdatingEvents ? "A atualizar..." : "Guardar Alterações"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEventAssignment(false)
                      setSelectedEvents(rp.assignedEvents || [])
                    }}
                    disabled={isUpdatingEvents}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
