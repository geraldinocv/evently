"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Ticket, Users, LogOut, TrendingUp, Euro, Download, Filter } from "lucide-react"
import { getEvents } from "@/lib/events"
import { mockRPs } from "@/lib/rps"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function ReportsPage() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [selectedEvent, setSelectedEvent] = useState("all")
  const [selectedRP, setSelectedRP] = useState("all")
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
    if (user && user.role === "rp") {
      router.push("/dashboard/rp")
    }
  }, [isAuthenticated, isLoading, router, user])

  useEffect(() => {
    if (user && user.role !== "rp") {
      const loadEvents = async () => {
        try {
          const eventsData = await getEvents(user.id)
          setEvents(eventsData)
        } catch (error) {
          console.error("Error loading events:", error)
          setEvents([])
        }
      }
      loadEvents()
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

  if (!user || user.role === "rp") return null

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const generateSalesData = () => {
    const days = Number.parseInt(selectedPeriod)
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString("pt-PT", { month: "short", day: "numeric" }),
        vendas: Math.floor(Math.random() * 50) + 10,
        receita: Math.floor(Math.random() * 2000) + 500,
      })
    }
    return data
  }

  const generateEventData = () => {
    return events.map((event) => ({
      name: event.title.length > 15 ? event.title.substring(0, 15) + "..." : event.title,
      vendas: Math.floor(Math.random() * 200) + 50,
      receita: Math.floor(Math.random() * 10000) + 2000,
    }))
  }

  const generateRPData = () => {
    return mockRPs.map((rp) => ({
      name: rp.name,
      vendas: Math.floor(Math.random() * 100) + 20,
      comissao: Math.floor(Math.random() * 500) + 100,
    }))
  }

  const generateTicketTypeData = () => {
    const types = ["VIP", "Geral", "Estudante", "Grupo"]
    return types.map((type) => ({
      name: type,
      value: Math.floor(Math.random() * 300) + 50,
    }))
  }

  const salesData = generateSalesData()
  const eventData = generateEventData()
  const rpData = generateRPData()
  const ticketTypeData = generateTicketTypeData()

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

  const totalSales = salesData.reduce((sum, day) => sum + day.vendas, 0)
  const totalRevenue = salesData.reduce((sum, day) => sum + day.receita, 0)
  const totalCommissions = rpData.reduce((sum, rp) => sum + rp.comissao, 0)
  const avgTicketPrice = totalRevenue / totalSales

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Evently - Relatórios</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user.name}</p>
              <Badge variant="default">{user.role === "admin" ? "Administrador" : "Organizador"}</Badge>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Relatórios e Análises</h2>
          <p className="text-gray-600">Acompanhe o desempenho dos seus eventos e equipa de vendas</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="period">Período</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="365">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="event">Evento</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os eventos</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rp">RP</Label>
                <Select value={selectedRP} onValueChange={setSelectedRP}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os RPs</SelectItem>
                    {mockRPs.map((rp) => (
                      <SelectItem key={rp.id} value={rp.id}>
                        {rp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Total de Vendas
              </CardTitle>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="text-xs text-green-600">+12% vs período anterior</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Receita Total
              </CardTitle>
              <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-600">+8% vs período anterior</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Preço Médio
              </CardTitle>
              <div className="text-2xl font-bold">€{avgTicketPrice.toFixed(2)}</div>
              <p className="text-xs text-red-600">-3% vs período anterior</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Comissões RPs
              </CardTitle>
              <div className="text-2xl font-bold">€{totalCommissions.toLocaleString()}</div>
              <p className="text-xs text-green-600">+15% vs período anterior</p>
            </CardHeader>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Vendas</CardTitle>
              <CardDescription>Vendas e receita ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="vendas" fill="#3b82f6" name="Vendas" />
                  <Line yAxisId="right" type="monotone" dataKey="receita" stroke="#10b981" name="Receita (€)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Event Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Evento</CardTitle>
              <CardDescription>Vendas por evento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="vendas" fill="#3b82f6" name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* RP Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance dos RPs</CardTitle>
              <CardDescription>Vendas e comissões por representante</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rpData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="vendas" fill="#10b981" name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ticket Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo de Bilhete</CardTitle>
              <CardDescription>Vendas por categoria de bilhete</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ticketTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ticketTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
