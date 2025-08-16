"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

export async function createEvent(prevState: any, formData: FormData) {
  try {
    console.log("[v0] Creating event with form data:", Object.fromEntries(formData))

    const supabase = createSupabaseServerClient()

    const title = formData.get("title")?.toString()
    const description = formData.get("description")?.toString()
    const date = formData.get("date")?.toString()
    const location = formData.get("location")?.toString()
    const maxAttendees = Number.parseInt(formData.get("maxAttendees")?.toString() || "0")
    const organizerId = formData.get("organizerId")?.toString()

    if (!title || !description || !date || !location || !organizerId) {
      console.log("[v0] Validation failed: missing required fields")
      return { error: "Todos os campos obrigatórios devem ser preenchidos" }
    }

    const ticketTypes: any[] = []
    let index = 0
    while (formData.get(`ticketTypes[${index}][name]`)) {
      const ticketType = {
        name: formData.get(`ticketTypes[${index}][name]`)?.toString(),
        price: Number.parseFloat(formData.get(`ticketTypes[${index}][price]`)?.toString() || "0"),
        quantity: Number.parseInt(formData.get(`ticketTypes[${index}][quantity]`)?.toString() || "0"),
        description: formData.get(`ticketTypes[${index}][description]`)?.toString() || "",
      }
      if (ticketType.name && ticketType.price > 0 && ticketType.quantity > 0) {
        ticketTypes.push(ticketType)
      }
      index++
    }

    if (ticketTypes.length === 0) {
      return { error: "Pelo menos um tipo de bilhete deve ser configurado" }
    }

    console.log("[v0] Inserting event into database...")

    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .insert({
        title,
        description,
        date,
        location,
        price: ticketTypes[0].price, // Use first ticket type price as base price
        max_attendees: maxAttendees,
        image_url: null, // Will be updated with file upload later
        organizer_id: Number.parseInt(organizerId),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (eventError) {
      console.error("[v0] Database error:", eventError)
      return { error: `Erro ao criar evento: ${eventError.message}` }
    }

    const ticketTypeInserts = ticketTypes.map((ticket) => ({
      event_id: eventData.id,
      name: ticket.name,
      price: ticket.price,
      quantity: ticket.quantity,
      sold: 0,
      currency: "CVE",
      created_at: new Date().toISOString(),
    }))

    const { error: ticketTypesError } = await supabase.from("ticket_types").insert(ticketTypeInserts)

    if (ticketTypesError) {
      console.error("[v0] Ticket types error:", ticketTypesError)
      // Rollback event creation if ticket types fail
      await supabase.from("events").delete().eq("id", eventData.id)
      return { error: `Erro ao criar tipos de bilhetes: ${ticketTypesError.message}` }
    }

    console.log("[v0] Event and ticket types created successfully:", eventData)

    revalidatePath("/")
    revalidatePath("/dashboard/events")

    return { success: "Evento criado com sucesso!", eventId: eventData.id }
  } catch (error) {
    console.error("[v0] Server error:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function getPublicEvents() {
  try {
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        profiles!events_organizer_id_fkey (
          name,
          email
        ),
        ticket_types (
          id,
          name,
          price,
          quantity,
          sold,
          currency
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching public events:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Server error fetching public events:", error)
    return []
  }
}

export async function getEvents() {
  try {
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching events:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Server error:", error)
    return []
  }
}

export async function purchaseTicket(prevState: any, formData: FormData) {
  try {
    const supabase = createSupabaseServerClient()

    const eventId = Number.parseInt(formData.get("eventId")?.toString() || "0")
    const quantity = Number.parseInt(formData.get("quantity")?.toString() || "1")
    const paymentMethod = formData.get("paymentMethod")?.toString()
    const customerName = formData.get("customerName")?.toString()
    const customerEmail = formData.get("customerEmail")?.toString()
    const customerPhone = formData.get("customerPhone")?.toString()
    const totalPrice = Number.parseFloat(formData.get("totalPrice")?.toString() || "0")

    if (!eventId || !paymentMethod || !customerEmail) {
      return { error: "Dados de compra inválidos" }
    }

    // Generate unique QR code data
    const qrCodeData = `EVENTLY-${eventId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const { data, error } = await supabase
      .from("tickets")
      .insert({
        event_id: eventId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        quantity,
        payment_method: paymentMethod,
        amount_paid: totalPrice,
        status: "active",
        qr_code: qrCodeData,
        unique_link: qrCodeData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Ticket creation error:", error)
      return { error: "Erro ao criar ticket" }
    }

    revalidatePath("/dashboard/tickets")

    return {
      success: "Ticket comprado com sucesso!",
      ticketId: data.id,
      qrCode: qrCodeData,
    }
  } catch (error) {
    console.error("Purchase error:", error)
    return { error: "Erro ao processar compra" }
  }
}

export async function getUserTickets(userEmail: string) {
  try {
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from("tickets")
      .select(`
        *,
        events (
          title,
          date,
          location,
          image_url
        )
      `)
      .eq("customer_email", userEmail)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tickets:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Server error:", error)
    return []
  }
}
