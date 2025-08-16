"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { Ticket, Users, QrCode, BarChart3, Calendar, MapPin, Euro } from "lucide-react"

const mockEvents = [
  {
    id: "1",
    title: "Festival de Verão 2025",
    description: "O maior festival de música do verão",
    date: "2025-12-15T20:00:00",
    location: "Parque da Cidade, Lisboa",
    imageUrl: "/summer-music-festival.png",
    ticketTypes: [
      { id: "1", name: "Geral", price: 25, quantity: 500 },
      { id: "2", name: "VIP", price: 75, quantity: 100 },
    ],
  },
  {
    id: "2",
    title: "Conferência Tech Lisboa",
    description: "Conferência sobre as últimas tendências em tecnologia",
    date: "2025-11-20T09:00:00",
    location: "Centro de Congressos, Lisboa",
    imageUrl: "/tech-conference-audience-screens.png",
    ticketTypes: [
      { id: "3", name: "Standard", price: 50, quantity: 200 },
      { id: "4", name: "Premium", price: 120, quantity: 50 },
    ],
  },
]

export default function HomePage() {
  const upcomingEvents = mockEvents.filter((event) => new Date(event.date) > new Date()).slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Evently</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Registar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Plataforma Completa de Gestão de Eventos</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Venda bilhetes, gerencie RPs e controle entradas com QR Codes. Tudo numa plataforma simples e eficiente.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/register">Começar Agora</Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <QrCode className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Bilhetes com QR Code</CardTitle>
              <CardDescription>
                Bilhetes digitais com QR Codes únicos enviados por email. Segurança e praticidade garantidas.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Gestão de RPs</CardTitle>
              <CardDescription>
                Permita que RPs vendam bilhetes com relatórios detalhados de vendas e desempenho.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Controle de Entradas</CardTitle>
              <CardDescription>
                Scanner de QR Codes para controle rápido e seguro de entradas no evento.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {upcomingEvents.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Eventos em Destaque</h3>
              <p className="text-gray-600">Descubra os próximos eventos disponíveis na nossa plataforma</p>
            </div>

            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent className="-ml-2 md:-ml-4">
                {upcomingEvents.map((event) => (
                  <CarouselItem key={event.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <img
                          src={event.imageUrl || "/placeholder.svg"}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-blue-600">Evento</Badge>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h4>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(event.date).toLocaleDateString("pt-PT", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Euro className="h-4 w-4" />
                            <span>A partir de €{Math.min(...event.ticketTypes.map((t) => t.price))}</span>
                          </div>
                        </div>
                        <Button asChild className="w-full">
                          <Link href={`/events/${event.id}`}>Ver Detalhes</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            <div className="text-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <Link href="/events">Ver Todos os Eventos</Link>
              </Button>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Pronto para revolucionar seus eventos?</h3>
          <p className="text-gray-600 mb-6">Junte-se a centenas de organizadores que já confiam na Evently</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/register">Criar Conta</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
