export type PaymentMethod = "card" | "paypal" | "mbway" | "multibanco" | "vint4"

export interface PaymentData {
  method: PaymentMethod
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardholderName?: string
  paypalEmail?: string
  mbwayPhone?: string
  vint4Phone?: string // Added vint4 phone field
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
    currency: "EUR",
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
    currency: "EUR",
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
    currency: "EUR",
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
  customerInfo: { name: string; email: string },
  eventInfo: { id: string; title: string },
  rpId?: string,
): Promise<PaymentResult> {
  // Mock payment processing
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Simulate different payment outcomes
  const random = Math.random()

  // 90% success rate for demo
  if (random < 0.9) {
    const transactionId = `txn-${Date.now()}`

    const transaction: Transaction = {
      id: transactionId,
      eventId: eventInfo.id,
      eventTitle: eventInfo.title,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      amount,
      currency: "EUR",
      paymentMethod: paymentData.method,
      status: "completed",
      createdAt: new Date(),
      completedAt: new Date(),
      ticketIds: [], // Will be populated after ticket generation
      rpId,
    }

    mockTransactions.push(transaction)

    return {
      success: true,
      transactionId,
    }
  } else {
    // Simulate payment failure
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
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockTransactions.find((txn) => txn.id === id) || null
}

export async function getTransactionsByEmail(email: string): Promise<Transaction[]> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockTransactions
    .filter((txn) => txn.customerEmail.toLowerCase() === email.toLowerCase())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function refundTransaction(transactionId: string): Promise<boolean> {
  // Mock refund processing
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
    case "vint4": // Added vint4 label
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
    case "vint4": // Added vint4 icon
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
      // Multibanco doesn't require additional validation
      break

    case "vint4": // Added vint4 validation
      if (!paymentData.vint4Phone || !/^9\d{8}$/.test(paymentData.vint4Phone.replace(/\s/g, ""))) {
        return "Número de telemóvel inválido para Vint4"
      }
      break

    default:
      return "Método de pagamento inválido"
  }

  return null
}
