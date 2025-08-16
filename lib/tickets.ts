export interface Ticket {
  id: string
  eventId: string
  eventTitle: string
  ticketTypeId: string
  ticketTypeName: string
  customerName: string
  customerEmail: string
  price: number
  purchaseDate: Date
  qrCode: string
  status: "valid" | "used" | "cancelled"
  validatedAt?: Date
  validatedBy?: string
}

export interface PurchaseData {
  eventId: string
  ticketTypeId: string
  quantity: number
  customerName: string
  customerEmail: string
}

// Mock tickets data
export const mockTickets: Ticket[] = [
  {
    id: "ticket-1",
    eventId: "1",
    eventTitle: "Festival de Verão 2025",
    ticketTypeId: "1",
    ticketTypeName: "Bilhete Geral",
    customerName: "João Silva",
    customerEmail: "joao@email.com",
    price: 45,
    purchaseDate: new Date("2025-01-10T14:30:00"),
    qrCode: generateQRCode("ticket-1"),
    status: "valid",
  },
  {
    id: "ticket-2",
    eventId: "1",
    eventTitle: "Festival de Verão 2025",
    ticketTypeId: "2",
    ticketTypeName: "VIP",
    customerName: "Maria Santos",
    customerEmail: "maria@email.com",
    price: 120,
    purchaseDate: new Date("2025-01-12T09:15:00"),
    qrCode: generateQRCode("ticket-2"),
    status: "valid",
  },
]

export function generateQRCode(ticketId: string): string {
  // In a real app, this would generate an actual QR code
  // For now, we'll create a unique string that represents the QR code data
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `EVENTLY-${ticketId.toUpperCase()}-${timestamp}-${random}`
}

export function generateQRCodeURL(qrData: string): string {
  // Generate QR code URL using a service like qr-server.com
  const encodedData = encodeURIComponent(qrData)
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`
}

export async function purchaseTickets(purchaseData: PurchaseData): Promise<Ticket[]> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const tickets: Ticket[] = []

  for (let i = 0; i < purchaseData.quantity; i++) {
    const ticketId = `ticket-${Date.now()}-${i}`
    const ticket: Ticket = {
      id: ticketId,
      eventId: purchaseData.eventId,
      eventTitle: "Festival de Verão 2025", // In real app, get from event data
      ticketTypeId: purchaseData.ticketTypeId,
      ticketTypeName: "Bilhete Geral", // In real app, get from ticket type data
      customerName: purchaseData.customerName,
      customerEmail: purchaseData.customerEmail,
      price: 45, // In real app, get from ticket type data
      purchaseDate: new Date(),
      qrCode: generateQRCode(ticketId),
      status: "valid",
    }
    tickets.push(ticket)
    mockTickets.push(ticket)
  }

  // Simulate email sending
  await sendTicketEmail(tickets)

  return tickets
}

export async function getTicketsByEmail(email: string): Promise<Ticket[]> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockTickets.filter((ticket) => ticket.customerEmail.toLowerCase() === email.toLowerCase())
}

export async function validateTicket(
  qrCode: string,
): Promise<{ ticket: Ticket | null; isValid: boolean; message: string }> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 800))

  const ticket = mockTickets.find((t) => t.qrCode === qrCode)

  if (!ticket) {
    return {
      ticket: null,
      isValid: false,
      message: "Bilhete não encontrado",
    }
  }

  if (ticket.status === "used") {
    return {
      ticket,
      isValid: false,
      message: "Bilhete já foi utilizado",
    }
  }

  if (ticket.status === "cancelled") {
    return {
      ticket,
      isValid: false,
      message: "Bilhete cancelado",
    }
  }

  // Mark ticket as used
  ticket.status = "used"
  ticket.validatedAt = new Date()
  ticket.validatedBy = "Scanner System"

  return {
    ticket,
    isValid: true,
    message: "Bilhete válido - Entrada autorizada",
  }
}

async function sendTicketEmail(tickets: Ticket[]): Promise<void> {
  // Mock email sending
  console.log(`[MOCK EMAIL] Sending ${tickets.length} ticket(s) to ${tickets[0].customerEmail}`)
  console.log("Email content would include:")
  tickets.forEach((ticket) => {
    console.log(`- Ticket ID: ${ticket.id}`)
    console.log(`- QR Code: ${ticket.qrCode}`)
    console.log(`- Event: ${ticket.eventTitle}`)
  })
}
