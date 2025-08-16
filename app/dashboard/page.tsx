"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, Users, QrCode, BarChart3, LogOut, Calendar } from "lucide-react"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
    if (user && user.role === "rp") {
      router.push("/dashboard/rp")
    }
  }, [isAuthenticated, isLoading, router, user])

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

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "organizer":
        return "Organizador"
      case "rp":
        return "Representante de Vendas"
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "organizer":
        return "default"
      case "rp":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Evently</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user.name}</p>
              <Badge variant={getRoleColor(user.role) as any}>{getRoleLabel(user.role)}</Badge>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo, {user.name}!</h2>
          <p className="text-gray-600">Gerencie seus eventos e bilhetes numa plataforma completa</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <Calendar className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Eventos</CardTitle>
              <CardDescription>Criar e gerir eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/dashboard/events">Gerir Eventos</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <QrCode className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Scanner</CardTitle>
              <CardDescription>Validar bilhetes na entrada</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/scanner">Abrir Scanner</Link>
              </Button>
            </CardContent>
          </Card>

          {(user.role === "organizer" || user.role === "admin") && (
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg">RPs</CardTitle>
                <CardDescription>Gerir representantes de vendas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/dashboard/rps">Gerir RPs</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Relatórios</CardTitle>
              <CardDescription>Análises e estatísticas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/dashboard/reports">Ver Relatórios</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Eventos Ativos</CardTitle>
              <div className="text-2xl font-bold">2</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Bilhetes Vendidos</CardTitle>
              <div className="text-2xl font-bold">1,570</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
              <div className="text-2xl font-bold">€94,250</div>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}
