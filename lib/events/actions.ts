"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function createEvent(prevState: any, formData: FormData) {
  try {
    const title = formData.get("title")?.toString()
    const description = formData.get("description")?.toString()
    const date = formData.get("date")?.toString()
    const location = formData.get("location")?.toString()
    const price = Number.parseFloat(formData.get("price")?.toString() || "0")
    const maxAttendees = Number.parseInt(formData.get("maxAttendees")?.toString() || "0")
    const imageUrl = formData.get("imageUrl")?.toString()
    const organizerId = Number.parseInt(formData.get("organizerId")?.toString() || "1")

    if (!title || !description || !date || !location) {
      return { error: "Todos os campos obrigatórios devem ser preenchidos" }
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        title,
        description,
        date,
        location,
        price,
        max_attendees: maxAttendees,
        image_url: imageUrl,
        organizer_id: organizerId,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return { error: "Erro ao criar evento na base de dados" }
    }

    revalidatePath("/")
    revalidatePath("/dashboard/events")

    return { success: "Evento criado com sucesso!", eventId: data.id }
  } catch (error) {
    console.error("Server error:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function purchaseTicket(prevState: any, formData: FormData) {
  try {
    const eventId = Number.parseInt(formData.get("eventId")?.toString() || "0")
    const userId = Number.parseInt(formData.get("userId")?.toString() || "0")
    const quantity = Number.parseInt(formData.get("quantity")?.toString() || "1")
    const paymentMethod = formData.get("paymentMethod")?.toString()
    const totalPrice = Number.parseFloat(formData.get("totalPrice")?.toString() || "0")

    if (!eventId || !userId || !paymentMethod) {
      return { error: "Dados de compra inválidos" }
    }

    // Generate unique QR code data
    const qrCodeData = `EVENTLY-${eventId}-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const { data, error } = await supabase
      .from("tickets")
      .insert({
        event_id: eventId,
        user_id: userId,
        quantity,
        payment_method: paymentMethod,
        total_price: totalPrice,
        payment_status: "completed",
        qr_code: qrCodeData,
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

export async function getEvents() {
  try {
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

export async function getUserTickets(userId: number) {
  try {
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
      .eq("user_id", userId)
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
