export interface RP {
  id: string
  name: string
  email: string
  phone?: string
  organizerId: string
  organizerName: string
  commissionRate: number // Percentage (e.g., 10 for 10%)
  isActive: boolean
  createdAt: Date
  totalSales: number
  totalCommission: number
  uniqueLink: string
  assignedEvents: string[] // Array of event IDs assigned to this RP
}

export interface RPSale {
  id: string
  rpId: string
  rpName: string
  eventId: string
  eventTitle: string
  ticketTypeId: string
  ticketTypeName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  commissionRate: number
  commissionAmount: number
  customerName: string
  customerEmail: string
  saleDate: Date
  status: "completed" | "pending" | "cancelled"
}

export interface CreateRPData {
  name: string
  email: string
  phone?: string
  commissionRate: number
}

export interface AddRPSaleData {
  eventId: string
  eventTitle: string
  ticketTypeId: string
  ticketTypeName: string
  quantity: number
  unitPrice: number
  customerName: string
  customerEmail: string
}

// Mock RPs data
export const mockRPs: RP[] = [
  {
    id: "rp-1",
    name: "Ana Costa",
    email: "ana@email.com",
    phone: "+351 912 345 678",
    organizerId: "2",
    organizerName: "Event Organizer",
    commissionRate: 15,
    isActive: true,
    createdAt: new Date("2024-12-01"),
    totalSales: 12500,
    totalCommission: 1875,
    uniqueLink: "evently.com/rp/ana-costa-abc123",
    assignedEvents: ["1", "2"], // Assigned to Festival de Verão and Conferência Tech
  },
  {
    id: "rp-2",
    name: "Carlos Silva",
    email: "carlos@email.com",
    phone: "+351 913 456 789",
    organizerId: "2",
    organizerName: "Event Organizer",
    commissionRate: 12,
    isActive: true,
    createdAt: new Date("2024-11-15"),
    totalSales: 8750,
    totalCommission: 1050,
    uniqueLink: "evently.com/rp/carlos-silva-def456",
    assignedEvents: ["2"], // Only assigned to Conferência Tech
  },
  {
    id: "rp-3",
    name: "Maria Santos",
    email: "maria.rp@email.com",
    phone: "+351 914 567 890",
    organizerId: "2",
    organizerName: "Event Organizer",
    commissionRate: 10,
    isActive: false,
    createdAt: new Date("2024-10-20"),
    totalSales: 3200,
    totalCommission: 320,
    uniqueLink: "evently.com/rp/maria-santos-ghi789",
    assignedEvents: [], // No events assigned
  },
]

// Mock RP Sales data
export const mockRPSales: RPSale[] = [
  {
    id: "sale-1",
    rpId: "rp-1",
    rpName: "Ana Costa",
    eventId: "1",
    eventTitle: "Festival de Verão 2025",
    ticketTypeId: "1",
    ticketTypeName: "Bilhete Geral",
    quantity: 5,
    unitPrice: 45,
    totalAmount: 225,
    commissionRate: 15,
    commissionAmount: 33.75,
    customerName: "João Pereira",
    customerEmail: "joao.p@email.com",
    saleDate: new Date("2025-01-10T14:30:00"),
    status: "completed",
  },
  {
    id: "sale-2",
    rpId: "rp-1",
    rpName: "Ana Costa",
    eventId: "1",
    eventTitle: "Festival de Verão 2025",
    ticketTypeId: "2",
    ticketTypeName: "VIP",
    quantity: 2,
    unitPrice: 120,
    totalAmount: 240,
    commissionRate: 15,
    commissionAmount: 36,
    customerName: "Sofia Rodrigues",
    customerEmail: "sofia@email.com",
    saleDate: new Date("2025-01-12T09:15:00"),
    status: "completed",
  },
  {
    id: "sale-3",
    rpId: "rp-2",
    rpName: "Carlos Silva",
    eventId: "2",
    eventTitle: "Conferência Tech Lisboa",
    ticketTypeId: "5",
    ticketTypeName: "Bilhete Normal",
    quantity: 3,
    unitPrice: 120,
    totalAmount: 360,
    commissionRate: 12,
    commissionAmount: 43.2,
    customerName: "Pedro Oliveira",
    customerEmail: "pedro@email.com",
    saleDate: new Date("2025-01-08T16:45:00"),
    status: "completed",
  },
]

export async function getRPs(organizerId: string): Promise<RP[]> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockRPs.filter((rp) => rp.organizerId === organizerId)
}

export async function getRP(id: string): Promise<RP | null> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockRPs.find((rp) => rp.id === id) || null
}

export async function createRP(data: CreateRPData, organizerId: string): Promise<RP> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const rpId = `rp-${Date.now()}`
  const uniqueLink = generateUniqueLink(data.name, rpId)

  const newRP: RP = {
    id: rpId,
    ...data,
    organizerId,
    organizerName: "Event Organizer", // In real app, get from user data
    isActive: true,
    createdAt: new Date(),
    totalSales: 0,
    totalCommission: 0,
    uniqueLink,
    assignedEvents: [], // Start with no events assigned
  }

  mockRPs.push(newRP)
  return newRP
}

export async function updateRP(id: string, data: Partial<CreateRPData>): Promise<RP | null> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 800))

  const rpIndex = mockRPs.findIndex((rp) => rp.id === id)
  if (rpIndex === -1) return null

  const updatedRP = {
    ...mockRPs[rpIndex],
    ...data,
  }

  mockRPs[rpIndex] = updatedRP
  return updatedRP
}

export async function toggleRPStatus(id: string): Promise<RP | null> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const rpIndex = mockRPs.findIndex((rp) => rp.id === id)
  if (rpIndex === -1) return null

  mockRPs[rpIndex].isActive = !mockRPs[rpIndex].isActive
  return mockRPs[rpIndex]
}

export async function getRPSales(rpId: string, startDate?: Date, endDate?: Date): Promise<RPSale[]> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  let sales = mockRPSales.filter((sale) => sale.rpId === rpId)

  if (startDate) {
    sales = sales.filter((sale) => sale.saleDate >= startDate)
  }

  if (endDate) {
    sales = sales.filter((sale) => sale.saleDate <= endDate)
  }

  return sales.sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime())
}

export async function getOrganizerSales(organizerId: string): Promise<RPSale[]> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const organizerRPs = mockRPs.filter((rp) => rp.organizerId === organizerId).map((rp) => rp.id)
  return mockRPSales
    .filter((sale) => organizerRPs.includes(sale.rpId))
    .sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime())
}

export async function addRPSale(rpId: string, saleData: AddRPSaleData): Promise<RPSale> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Get RP data for commission calculation and validation
  const rp = mockRPs.find((r) => r.id === rpId)
  if (!rp) {
    throw new Error("RP not found")
  }

  // Validate that RP is assigned to this event
  if (!rp.assignedEvents.includes(saleData.eventId)) {
    throw new Error("RP is not assigned to this event")
  }

  const totalAmount = saleData.quantity * saleData.unitPrice
  const commissionAmount = (totalAmount * rp.commissionRate) / 100

  const newSale: RPSale = {
    id: `sale-${Date.now()}`,
    rpId,
    rpName: rp.name,
    eventId: saleData.eventId,
    eventTitle: saleData.eventTitle,
    ticketTypeId: saleData.ticketTypeId,
    ticketTypeName: saleData.ticketTypeName,
    quantity: saleData.quantity,
    unitPrice: saleData.unitPrice,
    totalAmount,
    commissionRate: rp.commissionRate,
    commissionAmount,
    customerName: saleData.customerName,
    customerEmail: saleData.customerEmail,
    saleDate: new Date(),
    status: "completed",
  }

  // Add to mock data
  mockRPSales.push(newSale)

  // Update RP totals
  const rpIndex = mockRPs.findIndex((r) => r.id === rpId)
  if (rpIndex !== -1) {
    mockRPs[rpIndex].totalSales += totalAmount
    mockRPs[rpIndex].totalCommission += commissionAmount
  }

  return newSale
}

function generateUniqueLink(name: string, rpId: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  const shortId = rpId.slice(-6)
  return `evently.com/rp/${slug}-${shortId}`
}

export function calculateRPStats(rp: RP, sales: RPSale[]) {
  const completedSales = sales.filter((sale) => sale.status === "completed")
  const totalTickets = completedSales.reduce((sum, sale) => sum + sale.quantity, 0)
  const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalCommission = completedSales.reduce((sum, sale) => sum + sale.commissionAmount, 0)

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const monthSales = completedSales.filter((sale) => sale.saleDate >= thisMonth)
  const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const monthCommission = monthSales.reduce((sum, sale) => sum + sale.commissionAmount, 0)

  return {
    totalTickets,
    totalRevenue,
    totalCommission,
    monthRevenue,
    monthCommission,
    averageTicketValue: totalTickets > 0 ? totalRevenue / totalTickets : 0,
  }
}

export async function assignEventToRP(rpId: string, eventId: string): Promise<RP | null> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const rpIndex = mockRPs.findIndex((rp) => rp.id === rpId)
  if (rpIndex === -1) return null

  if (!mockRPs[rpIndex].assignedEvents.includes(eventId)) {
    mockRPs[rpIndex].assignedEvents.push(eventId)
  }

  return mockRPs[rpIndex]
}

export async function unassignEventFromRP(rpId: string, eventId: string): Promise<RP | null> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const rpIndex = mockRPs.findIndex((rp) => rp.id === rpId)
  if (rpIndex === -1) return null

  mockRPs[rpIndex].assignedEvents = mockRPs[rpIndex].assignedEvents.filter((id) => id !== eventId)

  return mockRPs[rpIndex]
}

export async function updateRPEventAssignments(rpId: string, eventIds: string[]): Promise<RP | null> {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const rpIndex = mockRPs.findIndex((rp) => rp.id === rpId)
  if (rpIndex === -1) return null

  mockRPs[rpIndex].assignedEvents = eventIds

  return mockRPs[rpIndex]
}
