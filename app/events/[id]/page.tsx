"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getEvent, type Event } from "@/lib/events"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Ticket, ArrowLeft, Calendar, MapPin, Users, ShoppingCart } from "lucide-react"

const COUNTRY_CODES = [
  { code: "+93", country: "Afeganistão", flag: "🇦🇫" },
  { code: "+27", country: "África do Sul", flag: "🇿🇦" },
  { code: "+355", country: "Albânia", flag: "🇦🇱" },
  { code: "+49", country: "Alemanha", flag: "🇩🇪" },
  { code: "+376", country: "Andorra", flag: "🇦🇩" },
  { code: "+244", country: "Angola", flag: "🇦🇴" },
  { code: "+1264", country: "Anguilla", flag: "🇦🇮" },
  { code: "+1268", country: "Antígua e Barbuda", flag: "🇦🇬" },
  { code: "+966", country: "Arábia Saudita", flag: "🇸🇦" },
  { code: "+213", country: "Argélia", flag: "🇩🇿" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+374", country: "Arménia", flag: "🇦🇲" },
  { code: "+297", country: "Aruba", flag: "🇦🇼" },
  { code: "+61", country: "Austrália", flag: "🇦🇺" },
  { code: "+43", country: "Áustria", flag: "🇦🇹" },
  { code: "+994", country: "Azerbaijão", flag: "🇦🇿" },
  { code: "+1242", country: "Bahamas", flag: "🇧🇸" },
  { code: "+973", country: "Bahrein", flag: "🇧🇭" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+1246", country: "Barbados", flag: "🇧🇧" },
  { code: "+375", country: "Bielorrússia", flag: "🇧🇾" },
  { code: "+32", country: "Bélgica", flag: "🇧🇪" },
  { code: "+501", country: "Belize", flag: "🇧🇿" },
  { code: "+229", country: "Benin", flag: "🇧🇯" },
  { code: "+1441", country: "Bermudas", flag: "🇧🇲" },
  { code: "+975", country: "Butão", flag: "🇧🇹" },
  { code: "+591", country: "Bolívia", flag: "🇧🇴" },
  { code: "+387", country: "Bósnia e Herzegovina", flag: "🇧🇦" },
  { code: "+267", country: "Botswana", flag: "🇧🇼" },
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+673", country: "Brunei", flag: "🇧🇳" },
  { code: "+359", country: "Bulgária", flag: "🇧🇬" },
  { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
  { code: "+257", country: "Burundi", flag: "🇧🇮" },
  { code: "+238", country: "Cabo Verde", flag: "🇨🇻" },
  { code: "+855", country: "Camboja", flag: "🇰🇭" },
  { code: "+237", country: "Camarões", flag: "🇨🇲" },
  { code: "+1", country: "Canadá", flag: "🇨🇦" },
  { code: "+974", country: "Catar", flag: "🇶🇦" },
  { code: "+7", country: "Cazaquistão", flag: "🇰🇿" },
  { code: "+235", country: "Chade", flag: "🇹🇩" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+357", country: "Chipre", flag: "🇨🇾" },
  { code: "+57", country: "Colômbia", flag: "🇨🇴" },
  { code: "+269", country: "Comores", flag: "🇰🇲" },
  { code: "+242", country: "Congo", flag: "🇨🇬" },
  { code: "+243", country: "Congo (RDC)", flag: "🇨🇩" },
  { code: "+850", country: "Coreia do Norte", flag: "🇰🇵" },
  { code: "+82", country: "Coreia do Sul", flag: "🇰🇷" },
  { code: "+225", country: "Costa do Marfim", flag: "🇨🇮" },
  { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { code: "+385", country: "Croácia", flag: "🇭🇷" },
  { code: "+53", country: "Cuba", flag: "🇨🇺" },
  { code: "+599", country: "Curaçao", flag: "🇨🇼" },
  { code: "+45", country: "Dinamarca", flag: "🇩🇰" },
  { code: "+253", country: "Djibouti", flag: "🇩🇯" },
  { code: "+1767", country: "Dominica", flag: "🇩🇲" },
  { code: "+20", country: "Egito", flag: "🇪🇬" },
  { code: "+503", country: "El Salvador", flag: "🇸🇻" },
  { code: "+971", country: "Emirados Árabes Unidos", flag: "🇦🇪" },
  { code: "+593", country: "Equador", flag: "🇪🇨" },
  { code: "+291", country: "Eritreia", flag: "🇪🇷" },
  { code: "+421", country: "Eslováquia", flag: "🇸🇰" },
  { code: "+386", country: "Eslovénia", flag: "🇸🇮" },
  { code: "+34", country: "Espanha", flag: "🇪🇸" },
  { code: "+1", country: "Estados Unidos", flag: "🇺🇸" },
  { code: "+372", country: "Estónia", flag: "🇪🇪" },
  { code: "+268", country: "Eswatini", flag: "🇸🇿" },
  { code: "+251", country: "Etiópia", flag: "🇪🇹" },
  { code: "+679", country: "Fiji", flag: "🇫🇯" },
  { code: "+358", country: "Finlândia", flag: "🇫🇮" },
  { code: "+33", country: "França", flag: "🇫🇷" },
  { code: "+241", country: "Gabão", flag: "🇬🇦" },
  { code: "+220", country: "Gâmbia", flag: "🇬🇲" },
  { code: "+233", country: "Gana", flag: "🇬🇭" },
  { code: "+995", country: "Geórgia", flag: "🇬🇪" },
  { code: "+350", country: "Gibraltar", flag: "🇬🇮" },
  { code: "+1473", country: "Granada", flag: "🇬🇩" },
  { code: "+30", country: "Grécia", flag: "🇬🇷" },
  { code: "+299", country: "Gronelândia", flag: "🇬🇱" },
  { code: "+590", country: "Guadalupe", flag: "🇬🇵" },
  { code: "+1671", country: "Guam", flag: "🇬🇺" },
  { code: "+502", country: "Guatemala", flag: "🇬🇹" },
  { code: "+44", country: "Guernsey", flag: "🇬🇬" },
  { code: "+224", country: "Guiné", flag: "🇬🇳" },
  { code: "+245", country: "Guiné-Bissau", flag: "🇬🇼" },
  { code: "+240", country: "Guiné Equatorial", flag: "🇬🇶" },
  { code: "+592", country: "Guiana", flag: "🇬🇾" },
  { code: "+594", country: "Guiana Francesa", flag: "🇬🇫" },
  { code: "+509", country: "Haiti", flag: "🇭🇹" },
  { code: "+504", country: "Honduras", flag: "🇭🇳" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { code: "+36", country: "Hungria", flag: "🇭🇺" },
  { code: "+967", country: "Iêmen", flag: "🇾🇪" },
  { code: "+500", country: "Ilhas Falkland", flag: "🇫🇰" },
  { code: "+298", country: "Ilhas Faroé", flag: "🇫🇴" },
  { code: "+692", country: "Ilhas Marshall", flag: "🇲🇭" },
  { code: "+677", country: "Ilhas Salomão", flag: "🇸🇧" },
  { code: "+1340", country: "Ilhas Virgens (EUA)", flag: "🇻🇮" },
  { code: "+91", country: "Índia", flag: "🇮🇳" },
  { code: "+62", country: "Indonésia", flag: "🇮🇩" },
  { code: "+98", country: "Irão", flag: "🇮🇷" },
  { code: "+964", country: "Iraque", flag: "🇮🇶" },
  { code: "+353", country: "Irlanda", flag: "🇮🇪" },
  { code: "+354", country: "Islândia", flag: "🇮🇸" },
  { code: "+972", country: "Israel", flag: "🇮🇱" },
  { code: "+39", country: "Itália", flag: "🇮🇹" },
  { code: "+1876", country: "Jamaica", flag: "🇯🇲" },
  { code: "+81", country: "Japão", flag: "🇯🇵" },
  { code: "+44", country: "Jersey", flag: "🇯🇪" },
  { code: "+962", country: "Jordânia", flag: "🇯🇴" },
  { code: "+996", country: "Quirguistão", flag: "🇰🇬" },
  { code: "+686", country: "Kiribati", flag: "🇰🇮" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+856", country: "Laos", flag: "🇱🇦" },
  { code: "+266", country: "Lesoto", flag: "🇱🇸" },
  { code: "+371", country: "Letónia", flag: "🇱🇻" },
  { code: "+961", country: "Líbano", flag: "🇱🇧" },
  { code: "+231", country: "Libéria", flag: "🇱🇷" },
  { code: "+218", country: "Líbia", flag: "🇱🇾" },
  { code: "+423", country: "Liechtenstein", flag: "🇱🇮" },
  { code: "+370", country: "Lituânia", flag: "🇱🇹" },
  { code: "+352", country: "Luxemburgo", flag: "🇱🇺" },
  { code: "+853", country: "Macau", flag: "🇲🇴" },
  { code: "+389", country: "Macedónia do Norte", flag: "🇲🇰" },
  { code: "+261", country: "Madagáscar", flag: "🇲🇬" },
  { code: "+60", country: "Malásia", flag: "🇲🇾" },
  { code: "+265", country: "Malawi", flag: "🇲🇼" },
  { code: "+960", country: "Maldivas", flag: "🇲🇻" },
  { code: "+223", country: "Mali", flag: "🇲🇱" },
  { code: "+356", country: "Malta", flag: "🇲🇹" },
  { code: "+44", country: "Ilha de Man", flag: "🇮🇲" },
  { code: "+212", country: "Marrocos", flag: "🇲🇦" },
  { code: "+596", country: "Martinica", flag: "🇲🇶" },
  { code: "+230", country: "Maurícia", flag: "🇲🇺" },
  { code: "+222", country: "Mauritânia", flag: "🇲🇷" },
  { code: "+262", country: "Mayotte", flag: "🇾🇹" },
  { code: "+52", country: "México", flag: "🇲🇽" },
  { code: "+691", country: "Micronésia", flag: "🇫🇲" },
  { code: "+373", country: "Moldávia", flag: "🇲🇩" },
  { code: "+377", country: "Mónaco", flag: "🇲🇨" },
  { code: "+976", country: "Mongólia", flag: "🇲🇳" },
  { code: "+382", country: "Montenegro", flag: "🇲🇪" },
  { code: "+1664", country: "Montserrat", flag: "🇲🇸" },
  { code: "+258", country: "Moçambique", flag: "🇲🇿" },
  { code: "+95", country: "Myanmar", flag: "🇲🇲" },
  { code: "+264", country: "Namíbia", flag: "🇳🇦" },
  { code: "+674", country: "Nauru", flag: "🇳🇷" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+505", country: "Nicarágua", flag: "🇳🇮" },
  { code: "+227", country: "Níger", flag: "🇳🇪" },
  { code: "+234", country: "Nigéria", flag: "🇳🇬" },
  { code: "+683", country: "Niue", flag: "🇳🇺" },
  { code: "+47", country: "Noruega", flag: "🇳🇴" },
  { code: "+687", country: "Nova Caledónia", flag: "🇳🇨" },
  { code: "+64", country: "Nova Zelândia", flag: "🇳🇿" },
  { code: "+968", country: "Omã", flag: "🇴🇲" },
  { code: "+31", country: "Países Baixos", flag: "🇳🇱" },
  { code: "+680", country: "Palau", flag: "🇵🇼" },
  { code: "+970", country: "Palestina", flag: "🇵🇸" },
  { code: "+507", country: "Panamá", flag: "🇵🇦" },
  { code: "+675", country: "Papua-Nova Guiné", flag: "🇵🇬" },
  { code: "+92", country: "Paquistão", flag: "🇵🇰" },
  { code: "+595", country: "Paraguai", flag: "🇵🇾" },
  { code: "+51", country: "Peru", flag: "🇵🇪" },
  { code: "+689", country: "Polinésia Francesa", flag: "🇵🇫" },
  { code: "+48", country: "Polónia", flag: "🇵🇱" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+1787", country: "Porto Rico", flag: "🇵🇷" },
  { code: "+254", country: "Quénia", flag: "🇰🇪" },
  { code: "+44", country: "Reino Unido", flag: "🇬🇧" },
  { code: "+236", country: "República Centro-Africana", flag: "🇨🇫" },
  { code: "+420", country: "República Checa", flag: "🇨🇿" },
  { code: "+1809", country: "República Dominicana", flag: "🇩🇴" },
  { code: "+262", country: "Reunião", flag: "🇷🇪" },
  { code: "+40", country: "Roménia", flag: "🇷🇴" },
  { code: "+250", country: "Ruanda", flag: "🇷🇼" },
  { code: "+7", country: "Rússia", flag: "🇷🇺" },
  { code: "+679", country: "Samoa", flag: "🇼🇸" },
  { code: "+1684", country: "Samoa Americana", flag: "🇦🇸" },
  { code: "+378", country: "San Marino", flag: "🇸🇲" },
  { code: "+239", country: "São Tomé e Príncipe", flag: "🇸🇹" },
  { code: "+221", country: "Senegal", flag: "🇸🇳" },
  { code: "+232", country: "Serra Leoa", flag: "🇸🇱" },
  { code: "+381", country: "Sérvia", flag: "🇷🇸" },
  { code: "+248", country: "Seychelles", flag: "🇸🇨" },
  { code: "+65", country: "Singapura", flag: "🇸🇬" },
  { code: "+963", country: "Síria", flag: "🇸🇾" },
  { code: "+252", country: "Somália", flag: "🇸🇴" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+249", country: "Sudão", flag: "🇸🇩" },
  { code: "+216", country: "Tunísia", flag: "🇹🇳" },
  { code: "+993", country: "Turquemenistão", flag: "🇹🇲" },
  { code: "+90", country: "Turquia", flag: "🇹🇷" },
  { code: "+688", country: "Tuvalu", flag: "🇹🇻" },
  { code: "+380", country: "Ucrânia", flag: "🇺🇦" },
  { code: "+256", country: "Uganda", flag: "🇺🇬" },
  { code: "+598", country: "Uruguai", flag: "🇺🇾" },
  { code: "+998", country: "Uzbequistão", flag: "🇺🇿" },
  { code: "+678", country: "Vanuatu", flag: "🇻🇺" },
  { code: "+39", country: "Vaticano", flag: "🇻🇦" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+84", country: "Vietname", flag: "🇻🇳" },
  { code: "+681", country: "Wallis e Futuna", flag: "🇼🇫" },
  { code: "+260", country: "Zâmbia", flag: "🇿🇲" },
  { code: "+263", country: "Zimbabwe", flag: "🇿🇼" },
]

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [purchaseForm, setPurchaseForm] = useState({
    ticketTypeId: "",
    quantity: 1,
    customerName: "",
    customerEmail: "",
    countryCode: "+351", // Default to Portugal
    customerPhone: "",
  })

  useEffect(() => {
    if (params.id) {
      loadEvent(params.id as string)
    }
  }, [params.id])

  const loadEvent = async (eventId: string) => {
    try {
      setIsLoading(true)
      const eventData = await getEvent(eventId)
      setEvent(eventData)
      if (eventData?.ticketTypes.length) {
        setPurchaseForm((prev) => ({
          ...prev,
          ticketTypeId: eventData.ticketTypes.find((tt) => tt.isActive)?.id || "",
        }))
      }
    } catch (error) {
      console.error("Error loading event:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    setError("")

    if (!purchaseForm.customerName.trim()) {
      setError("Nome é obrigatório")
      return
    }

    if (!purchaseForm.customerEmail.trim()) {
      setError("Email é obrigatório")
      return
    }

    if (!purchaseForm.customerPhone.trim()) {
      setError("Telefone é obrigatório")
      return
    }

    if (!purchaseForm.ticketTypeId) {
      setError("Selecione um tipo de bilhete")
      return
    }

    const fullPhone = `${purchaseForm.countryCode}${purchaseForm.customerPhone}`
    const checkoutUrl =
      `/events/${event.id}/checkout?` +
      `ticketType=${purchaseForm.ticketTypeId}&` +
      `quantity=${purchaseForm.quantity}&` +
      `name=${encodeURIComponent(purchaseForm.customerName)}&` +
      `email=${encodeURIComponent(purchaseForm.customerEmail)}&` +
      `phone=${encodeURIComponent(fullPhone)}`

    router.push(checkoutUrl)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>A carregar evento...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Evento não encontrado</h2>
          <Button asChild>
            <Link href="/events">Ver Outros Eventos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const selectedTicketType = event.ticketTypes.find((tt) => tt.id === purchaseForm.ticketTypeId)
  const totalPrice = selectedTicketType ? selectedTicketType.price * purchaseForm.quantity : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Evently</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="space-y-6">
            {event.imageUrl && (
              <img
                src={event.imageUrl || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h2>
              <Badge variant="default">Publicado</Badge>
            </div>

            <p className="text-gray-600 leading-relaxed">{event.description}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Data e Hora</p>
                  <p className="text-gray-600">{formatDate(event.date)}</p>
                  {event.endDate && <p className="text-sm text-gray-500">Até {formatDate(event.endDate)}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  <p className="text-gray-600">{event.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Capacidade</p>
                  <p className="text-gray-600">
                    {event.soldTickets} / {event.capacity} bilhetes vendidos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Comprar Bilhetes
              </CardTitle>
              <CardDescription>Selecione o tipo de bilhete e quantidade desejada</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProceedToCheckout} className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Bilhete</Label>
                  <div className="space-y-2">
                    {event.ticketTypes
                      .filter((tt) => tt.isActive && tt.quantity > tt.sold)
                      .map((ticketType) => (
                        <div
                          key={ticketType.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            purchaseForm.ticketTypeId === ticketType.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setPurchaseForm((prev) => ({ ...prev, ticketTypeId: ticketType.id }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{ticketType.name}</p>
                              {ticketType.description && (
                                <p className="text-sm text-gray-600">{ticketType.description}</p>
                              )}
                              <p className="text-sm text-gray-500">
                                {ticketType.quantity - ticketType.sold} disponíveis
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">€{ticketType.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedTicketType ? selectedTicketType.quantity - selectedTicketType.sold : 1}
                    value={purchaseForm.quantity}
                    onChange={(e) =>
                      setPurchaseForm((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Nome Completo</Label>
                  <Input
                    id="customerName"
                    value={purchaseForm.customerName}
                    onChange={(e) => setPurchaseForm((prev) => ({ ...prev, customerName: e.target.value }))}
                    required
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={purchaseForm.customerEmail}
                    onChange={(e) => setPurchaseForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
                    required
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Telefone</Label>
                  <div className="flex gap-2">
                    <Select
                      value={purchaseForm.countryCode}
                      onValueChange={(value) => setPurchaseForm((prev) => ({ ...prev, countryCode: value }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          {(() => {
                            const selectedCountry = COUNTRY_CODES.find((c) => c.code === purchaseForm.countryCode)
                            return selectedCountry ? (
                              <div className="flex items-center gap-2">
                                <span>{selectedCountry.flag}</span>
                                <span>{selectedCountry.code}</span>
                              </div>
                            ) : (
                              purchaseForm.countryCode
                            )
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="customerPhone"
                      type="tel"
                      className="flex-1"
                      value={purchaseForm.customerPhone}
                      onChange={(e) => setPurchaseForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                      required
                      placeholder="912 345 678"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Receberá um SMS com o link do bilhete</p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Total:</span>
                    <span className="text-2xl font-bold text-green-600">€{totalPrice.toFixed(2)}</span>
                  </div>

                  <Button type="submit" className="w-full" disabled={!selectedTicketType}>
                    Prosseguir para Pagamento
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
