"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getEvent, type Event } from "@/lib/events"
import {
  processPayment,
  validatePaymentData,
  getPaymentMethodLabel,
  type PaymentData,
  type PaymentMethod,
} from "@/lib/payments"
import { purchaseTickets, type PurchaseData } from "@/lib/tickets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Ticket, ArrowLeft, CreditCard, Shield, CheckCircle } from "lucide-react"

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Get purchase data from URL params
  const ticketTypeId = searchParams.get("ticketType") || ""
  const quantity = Number.parseInt(searchParams.get("quantity") || "1")
  const customerName = searchParams.get("name") || ""
  const customerEmail = searchParams.get("email") || ""
  const customerPhone = searchParams.get("phone") || ""

  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: "card",
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
    } catch (error) {
      console.error("Error loading event:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    setError("")

    // Validate payment data
    const validationError = validatePaymentData(paymentData)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsProcessing(true)

    try {
      const selectedTicketType = event.ticketTypes.find((tt) => tt.id === ticketTypeId)
      if (!selectedTicketType) {
        setError("Tipo de bilhete não encontrado")
        return
      }

      const totalAmount = selectedTicketType.price * quantity

      // Process payment
      const paymentResult = await processPayment(
        paymentData,
        totalAmount,
        { name: customerName, email: customerEmail, phone: customerPhone },
        { id: event.id, title: event.title },
      )

      if (!paymentResult.success) {
        setError(paymentResult.error || "Erro no pagamento")
        return
      }

      // Generate tickets after successful payment
      const purchaseData: PurchaseData = {
        eventId: event.id,
        ticketTypeId,
        quantity,
        customerName,
        customerEmail,
        customerPhone,
      }

      await purchaseTickets(purchaseData)
      setPaymentSuccess(true)
    } catch (err) {
      setError("Erro ao processar pagamento. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

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

  if (!event || !ticketTypeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dados de compra inválidos</h2>
          <Button asChild>
            <Link href="/events">Ver Eventos</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-600">Pagamento Confirmado!</CardTitle>
            <CardDescription>Seus bilhetes foram enviados por email e SMS</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Enviámos {quantity} bilhete(s) para <strong>{customerEmail}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Também enviámos links dos bilhetes via SMS para <strong>{customerPhone}</strong>
            </p>
            <p className="text-sm text-gray-600">Cada bilhete contém um QR Code único para entrada no evento.</p>
            <div className="flex gap-2">
              <Button className="flex-1" asChild>
                <Link href="/tickets/lookup">Ver Meus Bilhetes</Link>
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href="/events">Outros Eventos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedTicketType = event.ticketTypes.find((tt) => tt.id === ticketTypeId)
  const totalAmount = selectedTicketType ? selectedTicketType.price * quantity : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/events/${event.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-gray-600">{selectedTicketType?.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Quantidade:</span>
                    <span>{quantity} bilhete(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preço unitário:</span>
                    <span>{selectedTicketType?.price} CVE</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">{totalAmount.toFixed(0)} CVE</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Dados do Cliente</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Nome:</strong> {customerName}
                    </p>
                    <p>
                      <strong>Email:</strong> {customerEmail}
                    </p>
                    <p>
                      <strong>Telefone:</strong> {customerPhone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Seus dados estão protegidos com criptografia SSL. Os bilhetes serão enviados por email após a
                confirmação do pagamento.
              </AlertDescription>
            </Alert>
          </div>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Método de Pagamento
              </CardTitle>
              <CardDescription>Selecione como deseja pagar pelos bilhetes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label>Escolha o método de pagamento</Label>
                  <RadioGroup
                    value={paymentData.method}
                    onValueChange={(value: PaymentMethod) => setPaymentData((prev) => ({ ...prev, method: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card">{getPaymentMethodLabel("card")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mbway" id="mbway" />
                      <Label htmlFor="mbway">{getPaymentMethodLabel("mbway")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal">{getPaymentMethodLabel("paypal")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multibanco" id="multibanco" />
                      <Label htmlFor="multibanco">{getPaymentMethodLabel("multibanco")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vint4" id="vint4" />
                      <Label htmlFor="vint4">{getPaymentMethodLabel("vint4")}</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Payment Method Fields */}
                {paymentData.method === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber || ""}
                        onChange={(e) => setPaymentData((prev) => ({ ...prev, cardNumber: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Validade</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/AA"
                          value={paymentData.expiryDate || ""}
                          onChange={(e) => setPaymentData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentData.cvv || ""}
                          onChange={(e) => setPaymentData((prev) => ({ ...prev, cvv: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">Nome do Titular</Label>
                      <Input
                        id="cardholderName"
                        placeholder="Nome como aparece no cartão"
                        value={paymentData.cardholderName || ""}
                        onChange={(e) => setPaymentData((prev) => ({ ...prev, cardholderName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentData.method === "mbway" && (
                  <div className="space-y-2">
                    <Label htmlFor="mbwayPhone">Número de Telemóvel</Label>
                    <Input
                      id="mbwayPhone"
                      placeholder="912 345 678"
                      value={paymentData.mbwayPhone || ""}
                      onChange={(e) => setPaymentData((prev) => ({ ...prev, mbwayPhone: e.target.value }))}
                      required
                    />
                  </div>
                )}

                {paymentData.method === "paypal" && (
                  <div className="space-y-2">
                    <Label htmlFor="paypalEmail">Email do PayPal</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      placeholder="seu@email.com"
                      value={paymentData.paypalEmail || ""}
                      onChange={(e) => setPaymentData((prev) => ({ ...prev, paypalEmail: e.target.value }))}
                      required
                    />
                  </div>
                )}

                {paymentData.method === "multibanco" && (
                  <Alert>
                    <AlertDescription>
                      Após confirmar, receberá uma referência Multibanco para efetuar o pagamento num terminal ou
                      homebanking.
                    </AlertDescription>
                  </Alert>
                )}

                {paymentData.method === "vint4" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vint4Email">Email *</Label>
                      <Input
                        id="vint4Email"
                        type="email"
                        placeholder="seu@email.com"
                        value={paymentData.vint4Email || ""}
                        onChange={(e) => setPaymentData((prev) => ({ ...prev, vint4Email: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vint4BillCity">Cidade *</Label>
                      <Input
                        id="vint4BillCity"
                        placeholder="Praia"
                        value={paymentData.vint4BillCity || ""}
                        onChange={(e) => setPaymentData((prev) => ({ ...prev, vint4BillCity: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vint4BillAddress">Endereço *</Label>
                      <Input
                        id="vint4BillAddress"
                        placeholder="Rua, Avenida, etc."
                        value={paymentData.vint4BillAddress || ""}
                        onChange={(e) => setPaymentData((prev) => ({ ...prev, vint4BillAddress: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vint4PostalCode">Código Postal *</Label>
                      <Input
                        id="vint4PostalCode"
                        placeholder="0000"
                        value={paymentData.vint4PostalCode || ""}
                        onChange={(e) => setPaymentData((prev) => ({ ...prev, vint4PostalCode: e.target.value }))}
                        required
                      />
                    </div>

                    <Alert>
                      <AlertDescription>
                        Será redirecionado para o sistema seguro Vinti4 onde irá inserir os dados do seu cartão e
                        autenticar com OTP.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isProcessing}>
                  {isProcessing ? "A processar pagamento..." : `Pagar ${totalAmount.toFixed(0)} CVE`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
