"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createEvent(prevState: any, formData: FormData) {
  try {
    console.log("[v0] Creating event with form data:", Object.fromEntries(formData))

    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Authentication failed:", authError)
      return { error: "Usuário não autenticado" }
    }

    const title = formData.get("title")?.toString()
    const description = formData.get("description")?.toString()
    const date = formData.get("date")?.toString()
    const location = formData.get("location")?.toString()
    const price = Number.parseFloat(formData.get("price")?.toString() || "0")
    const maxAttendees = Number.parseInt(formData.get("maxAttendees")?.toString() || "0")
    const imageUrl = formData.get("imageUrl")?.toString()

    if (!title || !description || !date || !location) {
      console.log("[v0] Validation failed: missing required fields")
      return { error: "Todos os campos obrigatórios devem ser preenchidos" }
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", user.email)
      .single()

    if (profileError || !profile) {
      console.log("[v0] User profile not found:", profileError)
      return { error: "Perfil de usuário não encontrado" }
    }

    console.log("[v0] Inserting event into database...")

    const { data, error } = await supabase
      .from("events")
      .insert({
        title,
        description,
        date,
        location,
        price,
        max_attendees: maxAttendees,
        image_url: imageUrl || null,
        organizer_id: profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return { error: `Erro ao criar evento: ${error.message}` }
    }

    console.log("[v0] Event created successfully:", data)

    revalidatePath("/")
    revalidatePath("/dashboard/events")

    return { success: "Evento criado com sucesso!", eventId: data.id }
  } catch (error) {
    console.error("[v0] Server error:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function getPublicEvents() {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Use service role or public access for fetching events
    const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false })

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
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

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
    const supabase = createServerActionClient({ cookies: () => cookies() })

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
    const supabase = createServerActionClient({ cookies: () => cookies() })

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
