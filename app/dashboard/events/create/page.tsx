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
import { Ticket, ArrowLeft, ImageIcon } from "lucide-react"

export default function CreateEventPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createEvent, null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
    maxAttendees: "",
    imageUrl: "",
  })

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
                <Label htmlFor="imageUrl" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Cartaz do Evento (URL da Imagem)
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://exemplo.com/cartaz-evento.jpg"
                />
                <p className="text-sm text-gray-500">
                  Cole o URL de uma imagem para o cartaz do seu evento. Recomendamos imagens com proporção 16:9.
                </p>
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl || "/placeholder.svg"}
                      alt="Preview do cartaz"
                      className="w-full max-w-md h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
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
