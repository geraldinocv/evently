"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getRPs, toggleRPStatus, type RP } from "@/lib/rps"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Users, Plus, Search, Ticket, ArrowLeft, Mail, Phone, ExternalLink } from "lucide-react"

export default function RPsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [rps, setRPs] = useState<RP[]>([])
  const [filteredRPs, setFilteredRPs] = useState<RP[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoadingRPs, setIsLoadingRPs] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user && (user.role === "organizer" || user.role === "admin")) {
      loadRPs()
    }
  }, [user])

  useEffect(() => {
    const filtered = rps.filter(
      (rp) =>
        rp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rp.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredRPs(filtered)
  }, [rps, searchTerm])

  const loadRPs = async () => {
    if (!user) return

    try {
      setIsLoadingRPs(true)
      const rpsData = await getRPs(user.id)
      setRPs(rpsData)
    } catch (error) {
      console.error("Error loading RPs:", error)
    } finally {
      setIsLoadingRPs(false)
    }
  }

  const handleToggleStatus = async (rpId: string) => {
    try {
      const updatedRP = await toggleRPStatus(rpId)
      if (updatedRP) {
        setRPs((prev) => prev.map((rp) => (rp.id === rpId ? updatedRP : rp)))
      }
    } catch (error) {
      console.error("Error toggling RP status:", error)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>A carregar...</p>
        </div>
      </div>
    )
  }

  if (user.role !== "organizer" && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Apenas organizadores podem gerir RPs</p>
          <Button asChild>
            <Link href="/dashboard">Voltar ao Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalActiveRPs = rps.filter((rp) => rp.isActive).length
  const totalSales = rps.reduce((sum, rp) => sum + rp.totalSales, 0)
  const totalCommissions = rps.reduce((sum, rp) => sum + rp.totalCommission, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Gestão de RPs</h1>
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/rps/create">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar RP
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">RPs Ativos</CardTitle>
              <div className="text-2xl font-bold">{totalActiveRPs}</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Vendas Totais</CardTitle>
              <div className="text-2xl font-bold">€{totalSales.toLocaleString()}</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Comissões Pagas</CardTitle>
              <div className="text-2xl font-bold">€{totalCommissions.toLocaleString()}</div>
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar RPs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* RPs List */}
        {isLoadingRPs ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>A carregar RPs...</p>
          </div>
        ) : filteredRPs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "Nenhum RP encontrado" : "Nenhum RP cadastrado"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "Tente pesquisar com outros termos" : "Comece adicionando seu primeiro RP"}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/dashboard/rps/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro RP
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRPs.map((rp) => (
              <Card key={rp.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{rp.name}</CardTitle>
                        <Badge variant={rp.isActive ? "default" : "secondary"}>
                          {rp.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {rp.email}
                        </div>
                        {rp.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {rp.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          <span className="font-mono text-xs">{rp.uniqueLink}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={rp.isActive} onCheckedChange={() => handleToggleStatus(rp.id)} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">€{rp.totalSales.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Vendas Totais</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">€{rp.totalCommission.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Comissões</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">{rp.commissionRate}%</div>
                      <div className="text-xs text-gray-600">Taxa Comissão</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-600">
                        {new Intl.DateTimeFormat("pt-PT", { month: "short", year: "numeric" }).format(rp.createdAt)}
                      </div>
                      <div className="text-xs text-gray-600">Desde</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                      <Link href={`/dashboard/rps/${rp.id}`}>
                        <Ticket className="h-4 w-4 mr-1" />
                        Ver Vendas
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                      <Link href={`/dashboard/rps/${rp.id}/edit`}>Editar</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent" asChild>
                      <Link href={`/rp/${rp.uniqueLink.split("/").pop()}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
