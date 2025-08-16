import { sql } from "./database"

export interface Event {
  id: string
  title: string
  description: string
  date: Date
  endDate?: Date
  location: string
  address?: string
  organizerId: string
  organizerName?: string
  status: "active" | "cancelled" | "completed"
  capacity?: number
  soldTickets: number
  ticketTypes: TicketType[]
  createdAt: Date
  updatedAt: Date
  imageUrl?: string
  category: string
  currency: string
}

export interface TicketType {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  sold: number
  isActive?: boolean
  saleStartDate?: Date
  saleEndDate?: Date
  currency: string
}

export interface CreateEventData {
  title: string
  description: string
  date: Date
  endDate?: Date
  location: string
  address?: string
  category: string
  capacity?: number
  ticketTypes: Omit<TicketType, "id" | "sold">[]
  currency: string
}

export const CURRENCY_OPTIONS = [
  { code: "CVE", name: "Escudo Cabo-verdiano", symbol: "CVE" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "USD", name: "Dólar Americano", symbol: "$" },
  { code: "BRL", name: "Real Brasileiro", symbol: "R$" },
  { code: "AOA", name: "Kwanza Angolano", symbol: "AOA" },
  { code: "MZN", name: "Metical Moçambicano", symbol: "MZN" },
  { code: "GBP", name: "Libra Esterlina", symbol: "£" },
]

export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCY_OPTIONS.find((c) => c.code === currencyCode)
  return currency?.symbol || currencyCode
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Festival de Verão 2025",
    description: "O maior festival de música do verão com artistas nacionais e internacionais",
    date: new Date("2025-12-15T20:00:00"),
    location: "Parque da Cidade, Lisboa",
    address: "Parque da Cidade, Lisboa",
    organizerId: "org1",
    organizerName: "EventPro Lisboa",
    status: "active",
    capacity: 5000,
    soldTickets: 1250,
    category: "Música",
    currency: "CVE",
    ticketTypes: [
      {
        id: "tt1",
        name: "Geral",
        description: "Acesso geral ao festival",
        price: 4500.0,
        quantity: 3000,
        sold: 750,
        isActive: true,
        currency: "CVE",
      },
      {
        id: "tt2",
        name: "VIP",
        description: "Acesso VIP com bar exclusivo",
        price: 8500.0,
        quantity: 500,
        sold: 200,
        isActive: true,
        currency: "CVE",
      },
    ],
    createdAt: new Date("2025-08-01T10:00:00"),
    updatedAt: new Date("2025-08-15T14:30:00"),
    imageUrl: "/summer-music-festival.png",
  },
  {
    id: "2",
    title: "Conferência Tech Lisboa 2025",
    description: "Conferência sobre as últimas tendências em tecnologia e inovação",
    date: new Date("2025-11-20T09:00:00"),
    location: "Centro de Congressos de Lisboa",
    address: "Centro de Congressos de Lisboa",
    organizerId: "org2",
    organizerName: "Tech Events",
    status: "active",
    capacity: 800,
    soldTickets: 320,
    category: "Tecnologia",
    currency: "EUR",
    ticketTypes: [
      {
        id: "tt3",
        name: "Early Bird",
        description: "Bilhete com desconto para inscrições antecipadas",
        price: 120.0,
        quantity: 200,
        sold: 180,
        isActive: false,
        currency: "EUR",
      },
      {
        id: "tt4",
        name: "Regular",
        description: "Bilhete regular para a conferência",
        price: 150.0,
        quantity: 600,
        sold: 140,
        isActive: true,
        currency: "EUR",
      },
    ],
    createdAt: new Date("2025-07-15T09:00:00"),
    updatedAt: new Date("2025-08-10T16:45:00"),
    imageUrl: "/tech-conference-audience-screens.png",
  },
]

export async function getEvents(organizerId?: string): Promise<Event[]> {
  try {
    const connection = sql
    if (!connection) {
      console.log("Database not available, using mock data")
      return organizerId ? mockEvents.filter((e) => e.organizerId === organizerId) : mockEvents
    }

    let query = `
      SELECT 
        e.*,
        u.name as organizer_name,
        COALESCE(SUM(tt.sold), 0) as sold_tickets
      FROM evently.events e
      LEFT JOIN evently.users u ON e.organizer_id = u.id
      LEFT JOIN evently.ticket_types tt ON e.id = tt.event_id
    `

    const params: any[] = []
    if (organizerId) {
      query += ` WHERE e.organizer_id = $1`
      params.push(organizerId)
    }

    query += ` GROUP BY e.id, u.name ORDER BY e.date DESC`

    const events = await connection(query, params)

    if (!events || !Array.isArray(events)) {
      console.log("Database query returned invalid result, using mock data")
      return organizerId ? mockEvents.filter((e) => e.organizerId === organizerId) : mockEvents
    }

    // Get ticket types for each event
    const eventsWithTickets = await Promise.all(
      events.map(async (event: any) => {
        const ticketTypes = await connection(
          `SELECT * FROM evently.ticket_types WHERE event_id = $1 ORDER BY price ASC`,
          [event.id],
        )

        return {
          id: event.id,
          title: event.title,
          description: event.description || "",
          date: new Date(event.date),
          location: event.location,
          address: event.location,
          organizerId: event.organizer_id,
          organizerName: event.organizer_name,
          status: event.status,
          soldTickets: Number.parseInt(event.sold_tickets) || 0,
          category: event.category,
          currency: event.currency,
          ticketTypes: (ticketTypes || []).map((tt: any) => ({
            id: tt.id,
            name: tt.name,
            price: Number.parseFloat(tt.price),
            quantity: tt.quantity,
            sold: tt.sold,
            isActive: true,
            currency: tt.currency,
          })),
          createdAt: new Date(event.created_at),
          updatedAt: new Date(event.updated_at),
          imageUrl: event.image_url,
        } as Event
      }),
    )

    return eventsWithTickets
  } catch (error) {
    console.error("Error fetching events:", error)
    console.log("Falling back to mock data")
    return organizerId ? mockEvents.filter((e) => e.organizerId === organizerId) : mockEvents
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const connection = sql
    if (!connection) {
      console.log("Database not available, using mock data for event:", id)
      return mockEvents.find((e) => e.id === id) || null
    }

    const eventResult = await connection(
      `SELECT 
        e.*,
        u.name as organizer_name
      FROM evently.events e
      LEFT JOIN evently.users u ON e.organizer_id = u.id
      WHERE e.id = $1`,
      [id],
    )

    if (!eventResult || !Array.isArray(eventResult) || eventResult.length === 0) {
      console.log("Database query returned no results, using mock data for event:", id)
      return mockEvents.find((e) => e.id === id) || null
    }

    const event = eventResult[0]

    const ticketTypes = await connection(`SELECT * FROM evently.ticket_types WHERE event_id = $1 ORDER BY price ASC`, [
      id,
    ])

    const soldTickets = await connection(
      `SELECT COALESCE(SUM(tt.sold), 0) as total_sold 
       FROM evently.ticket_types tt 
       WHERE tt.event_id = $1`,
      [id],
    )

    return {
      id: event.id,
      title: event.title,
      description: event.description || "",
      date: new Date(event.date),
      location: event.location,
      address: event.location,
      organizerId: event.organizer_id,
      organizerName: event.organizer_name,
      status: event.status,
      soldTickets: Number.parseInt(soldTickets[0]?.total_sold) || 0,
      category: event.category,
      currency: event.currency,
      ticketTypes: (ticketTypes || []).map((tt: any) => ({
        id: tt.id,
        name: tt.name,
        price: Number.parseFloat(tt.price),
        quantity: tt.quantity,
        sold: tt.sold,
        isActive: true,
        currency: tt.currency,
      })),
      createdAt: new Date(event.created_at),
      updatedAt: new Date(event.updated_at),
      imageUrl: event.image_url,
    } as Event
  } catch (error) {
    console.error("Error fetching event:", error)
    console.log("Falling back to mock data for event:", id)
    return mockEvents.find((e) => e.id === id) || null
  }
}

export async function createEvent(data: CreateEventData, organizerId: string): Promise<Event> {
  try {
    const connection = sql
    if (!connection) {
      throw new Error("Database connection not available")
    }

    // Insert event
    const eventResult = await connection(
      `INSERT INTO evently.events (title, description, date, location, category, organizer_id, image_url, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.title,
        data.description,
        data.date.toISOString(),
        data.location,
        data.category,
        organizerId,
        data.imageUrl || null,
        data.currency,
      ],
    )

    const event = eventResult[0]

    // Insert ticket types
    const ticketTypes = await Promise.all(
      data.ticketTypes.map(async (tt) => {
        const result = await connection(
          `INSERT INTO evently.ticket_types (event_id, name, price, quantity, currency)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [event.id, tt.name, tt.price, tt.quantity, tt.currency],
        )
        return {
          id: result[0].id,
          name: result[0].name,
          price: Number.parseFloat(result[0].price),
          quantity: result[0].quantity,
          sold: 0,
          isActive: true,
          currency: result[0].currency,
        }
      }),
    )

    return {
      id: event.id,
      title: event.title,
      description: event.description || "",
      date: new Date(event.date),
      location: event.location,
      address: event.location,
      organizerId: event.organizer_id,
      status: event.status,
      soldTickets: 0,
      category: event.category,
      currency: event.currency,
      ticketTypes,
      createdAt: new Date(event.created_at),
      updatedAt: new Date(event.updated_at),
      imageUrl: event.image_url,
    } as Event
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
  }
}

export async function updateEvent(id: string, data: Partial<CreateEventData>): Promise<Event | null> {
  try {
    const connection = sql
    if (!connection) {
      console.log("Database connection not available for update")
      return null
    }

    const updateFields = []
    const params = []
    let paramIndex = 1

    if (data.title) {
      updateFields.push(`title = $${paramIndex}`)
      params.push(data.title)
      paramIndex++
    }

    if (data.description) {
      updateFields.push(`description = $${paramIndex}`)
      params.push(data.description)
      paramIndex++
    }

    if (data.date) {
      updateFields.push(`date = $${paramIndex}`)
      params.push(data.date.toISOString())
      paramIndex++
    }

    if (data.location) {
      updateFields.push(`location = $${paramIndex}`)
      params.push(data.location)
      paramIndex++
    }

    if (data.category) {
      updateFields.push(`category = $${paramIndex}`)
      params.push(data.category)
      paramIndex++
    }

    if (data.currency) {
      updateFields.push(`currency = $${paramIndex}`)
      params.push(data.currency)
      paramIndex++
    }

    updateFields.push(`updated_at = NOW()`)
    params.push(id)

    const query = `
      UPDATE evently.events 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await connection(query, params)

    if (result.length === 0) return null

    return await getEvent(id)
  } catch (error) {
    console.error("Error updating event:", error)
    return null
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    const connection = sql
    if (!connection) {
      console.log("Database connection not available for delete")
      return false
    }

    const result = await connection(`DELETE FROM evently.events WHERE id = $1`, [id])

    return result.length > 0
  } catch (error) {
    console.error("Error deleting event:", error)
    return false
  }
}
