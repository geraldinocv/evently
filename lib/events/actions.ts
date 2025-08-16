"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
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
    const price = Number.parseFloat(formData.get("price")?.toString() || "0")
    const maxAttendees = Number.parseInt(formData.get("maxAttendees")?.toString() || "0")
    const imageUrl = formData.get("imageUrl")?.toString()

    if (!title || !description || !date || !location) {
      console.log("[v0] Validation failed: missing required fields")
      return { error: "Todos os campos obrigatórios devem ser preenchidos" }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No authenticated user found")
      return { error: "Usuário não autenticado" }
    }

    // Get user profile to get the user ID
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", user.email).single()

    if (!profile) {
      console.log("[v0] User profile not found")
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

    const supabase = createSupabaseServerClient()

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

export async function getUserTickets(userId: number) {
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
