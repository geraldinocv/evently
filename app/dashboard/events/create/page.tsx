"use client"

import React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createEvent } from "@/lib/events/actions"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Ticket, ArrowLeft, ImageIcon, Upload, Plus, Trash2 } from "lucide-react"

interface TicketType {
  id: string
  name: string
  price: string
  quantity: string
  description: string
}

export default function CreateEventPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createEvent, null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    maxAttendees: "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      id: "1",
      name: "Geral",
      price: "",
      quantity: "",
      description: "Bilhete de entrada geral",
    },
  ])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTicketType = () => {
    const newTicketType: TicketType = {
      id: Date.now().toString(),
      name: "",
      price: "",
      quantity: "",
      description: "",
    }
    setTicketTypes([...ticketTypes, newTicketType])
  }

  const removeTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((ticket) => ticket.id !== id))
    }
  }

  const updateTicketType = (id: string, field: keyof TicketType, value: string) => {
    setTicketTypes(ticketTypes.map((ticket) => (ticket.id === id ? { ...ticket, [field]: value } : ticket)))
  }

  React.useEffect(() => {
    if (state?.success) {
      router.push("/dashboard/events")
    }
  }, [state, router])

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
        <form action={formAction} className="space-y-8">
          <input type="hidden" name="organizerId" value={user?.id || "1"} />

          {ticketTypes.map((ticket, index) => (
            <div key={ticket.id}>
              <input type="hidden" name={`ticketTypes[${index}][name]`} value={ticket.name} />
              <input type="hidden" name={`ticketTypes[${index}][price]`} value={ticket.price} />
              <input type="hidden" name={`ticketTypes[${index}][quantity]`} value={ticket.quantity} />
              <input type="hidden" name={`ticketTypes[${index}][description]`} value={ticket.description} />
            </div>
          ))}

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
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Ex: Festival de Verão 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttendees">Capacidade *</Label>
                  <Input
                    id="maxAttendees"
                    name="maxAttendees"
                    type="number"
                    min="1"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxAttendees: e.target.value }))}
                    required
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  placeholder="Descreva o seu evento..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageFile" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Cartaz do Evento
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("imageFile")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Escolher Ficheiro
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Faça upload de uma imagem para o cartaz do seu evento. Recomendamos imagens com proporção 16:9 (JPG,
                  PNG, máx. 5MB).
                </p>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview do cartaz"
                      className="w-full max-w-md h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data e Hora *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (€) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    required
                    placeholder="25.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Local *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  required
                  placeholder="Ex: Pavilhão Atlântico, Lisboa"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Tipos de Bilhetes
              </CardTitle>
              <CardDescription>Configure os diferentes tipos de bilhetes para o seu evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticketTypes.map((ticket, index) => (
                <div key={ticket.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Bilhete {index + 1}</h4>
                    {ticketTypes.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeTicketType(ticket.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Bilhete *</Label>
                      <Input
                        value={ticket.name}
                        onChange={(e) => updateTicketType(ticket.id, "name", e.target.value)}
                        placeholder="Ex: VIP, Geral, Estudante"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preço (CVE) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ticket.price}
                        onChange={(e) => updateTicketType(ticket.id, "price", e.target.value)}
                        placeholder="1500.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantidade Disponível *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={ticket.quantity}
                        onChange={(e) => updateTicketType(ticket.id, "quantity", e.target.value)}
                        placeholder="100"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={ticket.description}
                        onChange={(e) => updateTicketType(ticket.id, "description", e.target.value)}
                        placeholder="Descrição do bilhete"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addTicketType} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tipo de Bilhete
              </Button>
            </CardContent>
          </Card>

          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state?.success && (
            <Alert>
              <AlertDescription>{state.success}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "A criar evento..." : "Criar Evento"}
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
