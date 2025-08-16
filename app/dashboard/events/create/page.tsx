"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createEvent, type CreateEventData, type TicketType, CURRENCY_OPTIONS, getCurrencySymbol } from "@/lib/events"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Ticket, ArrowLeft, Plus, Trash2 } from "lucide-react"

export default function CreateEventPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState<CreateEventData>({
    title: "",
    description: "",
    date: new Date(),
    location: "",
    address: "",
    category: "Música",
    capacity: 100,
    currency: "CVE",
    ticketTypes: [
      {
        name: "Bilhete Geral",
        description: "",
        price: 0,
        quantity: 100,
        isActive: true,
        currency: "CVE",
      },
    ],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setIsLoading(true)

    try {
      await createEvent(formData, user.id)
      router.push("/dashboard/events")
    } catch (err) {
      setError("Erro ao criar evento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const addTicketType = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        {
          name: "",
          description: "",
          price: 0,
          quantity: 0,
          isActive: true,
          currency: prev.currency,
        },
      ],
    }))
  }

  const removeTicketType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
    }))
  }

  const updateTicketType = (index: number, field: keyof Omit<TicketType, "id" | "sold">, value: any) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((tt, i) => (i === index ? { ...tt, [field]: value } : tt)),
    }))
  }

  const handleCurrencyChange = (newCurrency: string) => {
    setFormData((prev) => ({
      ...prev,
      currency: newCurrency,
      ticketTypes: prev.ticketTypes.map((tt) => ({
        ...tt,
        currency: newCurrency,
      })),
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Criar Evento</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Detalhes principais do seu evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nome do Evento *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Ex: Festival de Verão 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) || 0 }))
                    }
                    required
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  placeholder="Descreva o seu evento..."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data e Hora *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date.toISOString().slice(0, 16)}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: new Date(e.target.value) }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Fim (Opcional)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate?.toISOString().slice(0, 16) || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value ? new Date(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda *</Label>
                  <Select value={formData.currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <span className="flex items-center gap-2">
                            <span className="font-medium">{currency.symbol}</span>
                            <span>{currency.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Local *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    required
                    placeholder="Ex: Pavilhão Atlântico"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    required
                    placeholder="Ex: Rossio dos Olivais, 1990-231 Lisboa"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Types */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tipos de Bilhetes</CardTitle>
                  <CardDescription>Configure os diferentes tipos de bilhetes disponíveis</CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={addTicketType}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Tipo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.ticketTypes.map((ticketType, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Tipo de Bilhete {index + 1}</h4>
                    {formData.ticketTypes.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeTicketType(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Bilhete *</Label>
                      <Input
                        value={ticketType.name}
                        onChange={(e) => updateTicketType(index, "name", e.target.value)}
                        required
                        placeholder="Ex: Bilhete Geral"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preço ({getCurrencySymbol(formData.currency)}) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ticketType.price}
                        onChange={(e) => updateTicketType(index, "price", Number.parseFloat(e.target.value) || 0)}
                        required
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição (Opcional)</Label>
                    <Input
                      value={ticketType.description || ""}
                      onChange={(e) => updateTicketType(index, "description", e.target.value)}
                      placeholder="Ex: Acesso geral ao evento"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantidade Disponível *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={ticketType.quantity}
                      onChange={(e) => updateTicketType(index, "quantity", Number.parseInt(e.target.value) || 0)}
                      required
                      placeholder="100"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "A criar evento..." : "Criar Evento"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/events">Cancelar</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
