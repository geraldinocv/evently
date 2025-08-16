"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Clock, Mail, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getConnection } from "@/lib/database"
import { sendEmail } from "@/lib/email"

interface PendingUser {
  id: string
  name: string
  email: string
  role: string
  created_at: string
  approval_status: "pending" | "approved" | "rejected"
}

export default function AdminPage() {
  const { user } = useAuth()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPendingUsers()
  }, [])

  const loadPendingUsers = async () => {
    try {
      const sql = getConnection()
      if (!sql) {
        console.log("[v0] Database connection not available")
        setLoading(false)
        return
      }

      const users = await sql`
        SELECT id, name, email, role, created_at, approval_status
        FROM public.users 
        WHERE approval_status = 'pending'
        ORDER BY created_at DESC
      `

      setPendingUsers(users as PendingUser[])
    } catch (error) {
      console.error("[v0] Error loading pending users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (userId: string, action: "approve" | "reject") => {
    try {
      const sql = getConnection()
      if (!sql) return

      const status = action === "approve" ? "approved" : "rejected"

      await sql`
        UPDATE public.users 
        SET approval_status = ${status}, 
            approved_at = NOW(), 
            approved_by = ${user?.id}
        WHERE id = ${userId}
      `

      const [userDetails] = await sql`
        SELECT name, email FROM public.users WHERE id = ${userId}
      `

      if (action === "approve") {
        await sendEmail({
          to: userDetails.email,
          subject: "Conta Aprovada - Evently",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Conta Aprovada!</h2>
              <p>Olá ${userDetails.name},</p>
              <p>A sua conta na plataforma Evently foi aprovada pela nossa equipa.</p>
              <p>Já pode fazer login e começar a usar todos os recursos da plataforma.</p>
              <div style="margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://evently.app"}/auth/login" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Fazer Login
                </a>
              </div>
              <p>Bem-vindo à Evently!</p>
              <p><strong>Equipa Evently</strong></p>
            </div>
          `,
        })
      }

      loadPendingUsers()
    } catch (error) {
      console.error("[v0] Error updating user approval:", error)
    }
  }

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
              <p className="text-gray-600">Não tem permissões para aceder a esta página.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
        <p className="text-gray-600">Gerir solicitações de aprovação de contas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Contas Pendentes de Aprovação
          </CardTitle>
          <CardDescription>
            {pendingUsers.length} conta{pendingUsers.length !== 1 ? "s" : ""} aguardando aprovação
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">A carregar...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma conta pendente</h3>
              <p className="text-gray-600">Todas as contas foram processadas.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilizador</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Registo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role === "organizer" ? "Organizador" : user.role === "rp" ? "RP" : "Utilizador"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString("pt-PT")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(user.id, "approve")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleApproval(user.id, "reject")}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
