export type PaymentMethod = "card" | "paypal" | "mbway" | "multibanco" | "vint4"

export interface PaymentData {
  method: PaymentMethod
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardholderName?: string
  paypalEmail?: string
  mbwayPhone?: string
  vint4Email?: string
  vint4BillCity?: string
  vint4BillAddress?: string
  vint4PostalCode?: string
}

export interface Transaction {
  id: string
  eventId: string
  eventTitle: string
  customerName: string
  customerEmail: string
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  status: "pending" | "completed" | "failed" | "refunded"
  createdAt: Date
  completedAt?: Date
  failureReason?: string
  ticketIds: string[]
  rpId?: string
  rpCommission?: number
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  redirectUrl?: string
}

// Mock transactions data
export const mockTransactions: Transaction[] = [
  {
    id: "txn-1",
    eventId: "1",
    eventTitle: "Festival de Verão 2025",
    customerName: "João Silva",
    customerEmail: "joao@email.com",
    amount: 225,
    currency: "CVE", // Updated default currency to CVE
    paymentMethod: "card",
    status: "completed",
    createdAt: new Date("2025-01-10T14:30:00"),
    completedAt: new Date("2025-01-10T14:31:15"),
    ticketIds: ["ticket-1", "ticket-2", "ticket-3"],
  },
  {
    id: "txn-2",
    eventId: "1",
    eventTitle: "Festival de Verão 2025",
    customerName: "Maria Santos",
    customerEmail: "maria@email.com",
    amount: 120,
    currency: "CVE", // Updated default currency to CVE
    paymentMethod: "mbway",
    status: "completed",
    createdAt: new Date("2025-01-12T09:15:00"),
    completedAt: new Date("2025-01-12T09:16:30"),
    ticketIds: ["ticket-4"],
  },
  {
    id: "txn-3",
    eventId: "2",
    eventTitle: "Conferência Tech Lisboa",
    customerName: "Pedro Oliveira",
    customerEmail: "pedro@email.com",
    amount: 360,
    currency: "CVE", // Updated default currency to CVE
    paymentMethod: "paypal",
    status: "failed",
    createdAt: new Date("2025-01-08T16:45:00"),
    failureReason: "Insufficient funds",
    ticketIds: [],
  },
]

export async function processPayment(
  paymentData: PaymentData,
  amount: number,
  customerInfo: { name: string; email: string; phone?: string },
  eventInfo: { id: string; title: string },
  rpId?: string,
): Promise<PaymentResult> {
  if (paymentData.method === "vint4") {
    try {
      const { createVinti4PaymentForm } = await import("./payments/vinti4")

      const merchantRef = `EVT${Date.now()}`
      const merchantSession = `SES${Date.now()}`

      const formHtml = createVinti4PaymentForm({
        amount,
        merchantRef,
        merchantSession,
        email: paymentData.vint4Email!,
        billAddrCity: paymentData.vint4BillCity!,
        billAddrLine1: paymentData.vint4BillAddress!,
        billAddrPostCode: paymentData.vint4PostalCode!,
        customerName: customerInfo.name,
        eventTitle: eventInfo.title,
      })

      const blob = new Blob([formHtml], { type: "text/html" })
      const formUrl = URL.createObjectURL(blob)

      window.location.href = formUrl

      return {
        success: true,
        transactionId: merchantRef,
        redirectUrl: formUrl,
      }
    } catch (error) {
      console.error("Erro ao processar pagamento Vinti4:", error)
      return {
        success: false,
        error: "Erro ao inicializar pagamento Vinti4",
      }
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 2000))

  const random = Math.random()

  if (random < 0.9) {
    const transactionId = `txn-${Date.now()}`

    const transaction: Transaction = {
      id: transactionId,
      eventId: eventInfo.id,
      eventTitle: eventInfo.title,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      amount,
      currency: "CVE",
      paymentMethod: paymentData.method,
      status: "completed",
      createdAt: new Date(),
      completedAt: new Date(),
      ticketIds: [],
      rpId,
    }

    mockTransactions.push(transaction)

    return {
      success: true,
      transactionId,
    }
  } else {
    const failureReasons = [
      "Cartão recusado",
      "Fundos insuficientes",
      "Cartão expirado",
      "Erro de comunicação com o banco",
    ]

    return {
      success: false,
      error: failureReasons[Math.floor(Math.random() * failureReasons.length)],
    }
  }
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockTransactions.find((txn) => txn.id === id) || null
}

export async function getTransactionsByEmail(email: string): Promise<Transaction[]> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockTransactions
    .filter((txn) => txn.customerEmail.toLowerCase() === email.toLowerCase())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function refundTransaction(transactionId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const transactionIndex = mockTransactions.findIndex((txn) => txn.id === transactionId)
  if (transactionIndex === -1) return false

  mockTransactions[transactionIndex].status = "refunded"
  return true
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case "card":
      return "Cartão de Crédito/Débito"
    case "paypal":
      return "PayPal"
    case "mbway":
      return "MB WAY"
    case "multibanco":
      return "Multibanco"
    case "vint4":
      return "Vint4"
    default:
      return method
  }
}

export function getPaymentMethodIcon(method: PaymentMethod): string {
  switch (method) {
    case "card":
      return "💳"
    case "paypal":
      return "🅿️"
    case "mbway":
      return "📱"
    case "multibanco":
      return "🏧"
    case "vint4":
      return "📲"
    default:
      return "💰"
  }
}

export function validatePaymentData(paymentData: PaymentData): string | null {
  switch (paymentData.method) {
    case "card":
      if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
        return "Número do cartão inválido"
      }
      if (!paymentData.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
        return "Data de validade inválida (MM/AA)"
      }
      if (!paymentData.cvv || paymentData.cvv.length < 3) {
        return "CVV inválido"
      }
      if (!paymentData.cardholderName || paymentData.cardholderName.trim().length < 2) {
        return "Nome do titular inválido"
      }
      break

    case "paypal":
      if (!paymentData.paypalEmail || !/\S+@\S+\.\S+/.test(paymentData.paypalEmail)) {
        return "Email do PayPal inválido"
      }
      break

    case "mbway":
      if (!paymentData.mbwayPhone || !/^9\d{8}$/.test(paymentData.mbwayPhone.replace(/\s/g, ""))) {
        return "Número de telemóvel inválido"
      }
      break

    case "multibanco":
      break

    case "vint4":
      if (!paymentData.vint4Email || !/\S+@\S+\.\S+/.test(paymentData.vint4Email)) {
        return "Email inválido para Vinti4"
      }
      if (!paymentData.vint4BillCity || paymentData.vint4BillCity.trim().length < 2) {
        return "Cidade inválida para Vinti4"
      }
      if (!paymentData.vint4BillAddress || paymentData.vint4BillAddress.trim().length < 5) {
        return "Endereço inválido para Vinti4"
      }
      if (!paymentData.vint4PostalCode || paymentData.vint4PostalCode.trim().length < 3) {
        return "Código postal inválido para Vinti4"
      }
      break

    default:
      return "Método de pagamento inválido"
  }

  return null
}
