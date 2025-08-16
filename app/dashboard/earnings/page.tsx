"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react"

interface EarningsData {
  total_earnings: number
  pending_earnings: number
  total_tickets_sold: number
  events_count: number
}

interface CheckoutRequest {
  id: string
  amount: number
  status: string
  request_date: string
  notes?: string
}

export default function EarningsPage() {
  const { user } = useAuth()
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [checkoutRequests, setCheckoutRequests] = useState<CheckoutRequest[]>([])
  const [requestAmount, setRequestAmount] = useState("")
  const [requestNotes, setRequestNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchEarnings()
      fetchCheckoutRequests()
    }
  }, [user])

  const fetchEarnings = async () => {
    try {
      const response = await fetch("/api/earnings")
      if (response.ok) {
        const data = await response.json()
        setEarnings(data)
      }
    } catch (error) {
      console.error("Error fetching earnings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCheckoutRequests = async () => {
    try {
      const response = await fetch("/api/checkout-requests")
      if (response.ok) {
        const data = await response.json()
        setCheckoutRequests(data)
      }
    } catch (error) {
      console.error("Error fetching checkout requests:", error)
    }
  }

  const handleCheckoutRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestAmount || Number.parseFloat(requestAmount) <= 0) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/checkout-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseFloat(requestAmount),
          notes: requestNotes,
        }),
      })

      if (response.ok) {
        setRequestAmount("")
        setRequestNotes("")
        fetchCheckoutRequests()
        fetchEarnings()
      }
    } catch (error) {
      console.error("Error creating checkout request:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Meus Ganhos</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Arrecadado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings?.total_earnings?.toFixed(2) || "0.00"} CVE</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponível para Saque</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings?.pending_earnings?.toFixed(2) || "0.00"} CVE</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bilhetes Vendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings?.total_tickets_sold || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Criados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings?.events_count || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Solicitar Saque</CardTitle>
            <CardDescription>Solicite o saque dos valores arrecadados com seus eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckoutRequest} className="space-y-4">
              <div>
                <Label htmlFor="amount">Valor (CVE)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={earnings?.pending_earnings || 0}
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Máximo disponível: {earnings?.pending_earnings?.toFixed(2) || "0.00"} CVE
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Informações adicionais sobre o saque..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting || !requestAmount || Number.parseFloat(requestAmount) <= 0}
                className="w-full"
              >
                {submitting ? "Enviando..." : "Solicitar Saque"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Solicitações</CardTitle>
            <CardDescription>Acompanhe o status das suas solicitações de saque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checkoutRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhuma solicitação de saque ainda</p>
              ) : (
                checkoutRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{request.amount.toFixed(2)} CVE</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.request_date).toLocaleDateString("pt-PT")}
                      </p>
                      {request.notes && <p className="text-sm text-muted-foreground mt-1">{request.notes}</p>}
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status === "pending" && "Pendente"}
                      {request.status === "approved" && "Aprovado"}
                      {request.status === "paid" && "Pago"}
                      {request.status === "rejected" && "Rejeitado"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
