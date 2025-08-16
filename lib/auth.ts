import { getConnection } from "./database"
import { sendEmail } from "./email"
import { render } from "@react-email/render"
import VerificationEmail from "../emails/verification-email"
import { getBaseUrl } from "./utils"
import crypto from "crypto"

export type UserRole = "organizer" | "rp" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  organizerId?: string
  emailVerified: boolean
  approvalStatus?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export async function signIn(email: string, password: string): Promise<User | null> {
  try {
    const sql = getConnection()
    if (!sql) return null

    const users = await sql`
      SELECT id, email, name, role, organizer_id, email_verified, created_at, approval_status
      FROM public.users 
      WHERE email = ${email} AND password_hash = crypt(${password}, password_hash)
    `

    if (users.length === 0) return null

    const user = users[0]

    if (!user.email_verified) {
      throw new Error("Email não verificado. Verifique sua caixa de entrada.")
    }

    if (user.approval_status !== "approved") {
      throw new Error("Conta pendente de aprovação pela equipa Evently.")
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      createdAt: new Date(user.created_at),
      organizerId: user.organizer_id,
      emailVerified: user.email_verified,
      approvalStatus: user.approval_status,
    }
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: UserRole,
): Promise<{ success: boolean; message: string }> {
  try {
    const sql = getConnection()
    if (!sql) {
      return { success: false, message: "Database connection not available" }
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM public.users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return { success: false, message: "Email já está em uso" }
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const newUsers = await sql`
      INSERT INTO public.users (email, name, password_hash, role, verification_token, verification_expires_at, approval_status, email_verified)
      VALUES (${email}, ${name}, crypt(${password}, gen_salt('bf')), ${role}, ${verificationToken}, ${verificationExpires}, 'pending', false)
      RETURNING id, email, name, role, created_at
    `

    const newUser = newUsers[0]

    // Send verification email
    const baseUrl = getBaseUrl()
    const verificationUrl = `${baseUrl}/auth/verify?token=${verificationToken}`

    const emailHtml = render(
      VerificationEmail({
        name,
        verificationUrl,
      }),
    )

    await sendEmail({
      to: email,
      subject: "Confirme sua conta na Evently",
      html: emailHtml,
    })

    return {
      success: true,
      message:
        "Conta criada com sucesso! Aguarde aprovação da equipa Evently. Verifique seu email para confirmar a conta.",
    }
  } catch (error) {
    console.error("Error signing up:", error)
    return { success: false, message: "Erro ao criar conta. Tente novamente." }
  }
}

export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
  try {
    const sql = getConnection()
    if (!sql) {
      return { success: false, message: "Database connection not available" }
    }

    const users = await sql`
      UPDATE public.users 
      SET email_verified = TRUE, verification_token = NULL, verification_expires_at = NULL
      WHERE verification_token = ${token} AND verification_expires_at > NOW()
      RETURNING id, email, name
    `

    if (users.length === 0) {
      return { success: false, message: "Token inválido ou expirado" }
    }

    return {
      success: true,
      message: "Email verificado com sucesso! Aguarde aprovação da equipa Evently para fazer login.",
    }
  } catch (error) {
    console.error("Error verifying email:", error)
    return { success: false, message: "Erro ao verificar email" }
  }
}

export async function signOut(): Promise<void> {
  // Clear local storage or session
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
}
