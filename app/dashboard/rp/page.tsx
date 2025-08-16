"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Ticket, QrCode, BarChart3, LogOut, Plus, TrendingUp, Euro, Eye } from "lucide-react"
import { getEvents } from "@/lib/events"
import { getRPSales, addRPSale, getRP, type RPSale, type RP } from "@/lib/rps"

export default function RPDashboardPage() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [sales, setSales] = useState<RPSale[]>([])
  const [rpData, setRPData] = useState<RP | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [showAddSale, setShowAddSale] = useState(false)
  const [newSale, setNewSale] = useState({
    eventId: "",
    ticketType: "",
    quantity: 1,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
    if (user && user.role !== "rp") {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router, user])

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          const [rpSales, rpInfo, eventsData] = await Promise.all([getRPSales(user.id), getRP(user.id), getEvents()])
          setSales(rpSales)
          setRPData(rpInfo)
          setEvents(eventsData)
        } catch (error) {
          console.error("Error loading data:", error)
          setSales([])
          setEvents([])
        }
      }
      loadData()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>A carregar...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "rp") return null

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleAddSale = async () => {
    if (!newSale.eventId || !newSale.ticketType || !newSale.customerName || !newSale.customerEmail) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    const event = events.find((e) => e.id === newSale.eventId)
    const ticketType = event?.ticketTypes.find((t) => t.name === newSale.ticketType)

    if (!event || !ticketType) {
      alert("Evento ou tipo de bilhete inválido")
      return
    }

    try {
      const saleData = {
        eventId: newSale.eventId,
        eventTitle: event.title,
        ticketTypeId: ticketType.id,
        ticketTypeName: newSale.ticketType,
        quantity: newSale.quantity,
        unitPrice: ticketType.price,
        customerName: newSale.customerName,
        customerEmail: newSale.customerEmail,
      }

      await addRPSale(user.id, saleData)

      // Reload sales after adding
      const updatedSales = await getRPSales(user.id)
      setSales(updatedSales)

      setShowAddSale(false)
      setNewSale({
        eventId: "",
        ticketType: "",
        quantity: 1,
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error adding sale:", error)
      alert("Erro ao registrar venda. Verifique se você tem permissão para vender bilhetes deste evento.")
    }
  }

  const totalSales = (sales || []).reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalCommission = (sales || []).reduce((sum, sale) => sum + sale.commissionAmount, 0)
  const totalTickets = (sales || []).reduce((sum, sale) => sum + sale.quantity, 0)

  const assignedEvents = events.filter((event) => rpData?.assignedEvents?.includes(event.id) || false)
  const selectedEvent = assignedEvents.find((e) => e.id === newSale.eventId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Evently RP</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user.name}</p>
              <Badge variant="secondary">Representante de Vendas</Badge>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Vendas</h2>
          <p className="text-gray-600">Gerencie suas vendas e acompanhe seu desempenho</p>
          {rpData && (
            <p className="text-sm text-blue-600 mt-2">{assignedEvents.length} evento(s) atribuído(s) para venda</p>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Bilhetes Vendidos
              </CardTitle>
              <div className="text-2xl font-bold">{totalTickets}</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Vendas Totais
              </CardTitle>
              <div className="text-2xl font-bold">€{totalSales.toFixed(2)}</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Comissões
              </CardTitle>
              <div className="text-2xl font-bold text-green-600">€{totalCommission.toFixed(2)}</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Vendas Este Mês
              </CardTitle>
              <div className="text-2xl font-bold">
                {(sales || []).filter((s) => new Date(s.saleDate).getMonth() === new Date().getMonth()).length}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowAddSale(true)}>
            <CardHeader className="pb-3">
              <Plus className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Registrar Venda</CardTitle>
              <CardDescription>Adicionar nova venda de bilhetes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={assignedEvents.length === 0}>
                {assignedEvents.length === 0 ? "Nenhum evento atribuído" : "Nova Venda"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <Eye className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Eventos Disponíveis</CardTitle>
              <CardDescription>Ver eventos para venda</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/events">Ver Eventos</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <QrCode className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Scanner</CardTitle>
              <CardDescription>Validar bilhetes na entrada</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/scanner">Abrir Scanner</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Add Sale Modal */}
        {showAddSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Registrar Nova Venda</CardTitle>
                <CardDescription>Preencha os detalhes da venda de bilhetes</CardDescription>
                {assignedEvents.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-yellow-800">
                      Nenhum evento foi atribuído a você ainda. Entre em contato com o organizador.
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event">Evento *</Label>
                    <Select
                      value={newSale.eventId}
                      onValueChange={(value) => setNewSale({ ...newSale, eventId: value, ticketType: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar evento" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignedEvents.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ticketType">Tipo de Bilhete *</Label>
                    <Select
                      value={newSale.ticketType}
                      onValueChange={(value) => setNewSale({ ...newSale, ticketType: value })}
                      disabled={!newSale.eventId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedEvent?.ticketTypes.map((ticket) => (
                          <SelectItem key={ticket.name} value={ticket.name}>
                            {ticket.name} - €{ticket.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newSale.quantity}
                    onChange={(e) => setNewSale({ ...newSale, quantity: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Nome do Cliente *</Label>
                    <Input
                      id="customerName"
                      value={newSale.customerName}
                      onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">Email do Cliente *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={newSale.customerEmail}
                      onChange={(e) => setNewSale({ ...newSale, customerEmail: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerPhone">Telefone do Cliente</Label>
                  <Input
                    id="customerPhone"
                    value={newSale.customerPhone}
                    onChange={(e) => setNewSale({ ...newSale, customerPhone: e.target.value })}
                    placeholder="+351 900 000 000"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={newSale.notes}
                    onChange={(e) => setNewSale({ ...newSale, notes: e.target.value })}
                    placeholder="Informações adicionais sobre a venda..."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddSale} className="flex-1" disabled={assignedEvents.length === 0}>
                    Registrar Venda
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddSale(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sales History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vendas</CardTitle>
            <CardDescription>Suas vendas recentes e detalhes</CardDescription>
          </CardHeader>
          <CardContent>
            {(sales || []).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma venda registrada ainda</p>
                <p className="text-sm">Clique em "Registrar Venda" para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(sales || []).slice(0, 10).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{sale.eventTitle}</h4>
                      <p className="text-sm text-gray-600">
                        {sale.customerName} • {sale.ticketTypeName}
                      </p>
                      <p className="text-xs text-gray-500">{sale.saleDate.toLocaleDateString("pt-PT")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">€{sale.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-green-600">Comissão: €{sale.commissionAmount.toFixed(2)}</p>
                      <Badge variant={sale.status === "completed" ? "default" : "secondary"}>
                        {sale.status === "completed" ? "Confirmada" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
