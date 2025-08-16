"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { getTransactionsByEmail, getPaymentMethodLabel, type Transaction } from "@/lib/payments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ArrowLeft, Search } from "lucide-react"

export default function TransactionsPage() {
  const [email, setEmail] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSearched(true)

    try {
      const userTransactions = await getTransactionsByEmail(email)
      setTransactions(userTransactions)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      case "refunded":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluída"
      case "pending":
        return "Pendente"
      case "failed":
        return "Falhada"
      case "refunded":
        return "Reembolsada"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Minhas Transações</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Transações</h2>
          <p className="text-gray-600">Consulte todas as suas compras e pagamentos</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Pesquisar Transações
            </CardTitle>
            <CardDescription>Digite o email usado nas compras</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="email" className="sr-only">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "A pesquisar..." : "Pesquisar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>A pesquisar transações...</p>
          </div>
        ) : searched && transactions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma transação encontrada</h3>
            <p className="text-gray-600 mb-6">Não encontrámos transações associadas a este email</p>
            <Button asChild>
              <Link href="/events">Comprar Bilhetes</Link>
            </Button>
          </div>
        ) : (
          transactions.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {transactions.length} transação(ões) encontrada(s)
              </h3>

              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{transaction.eventTitle}</CardTitle>
                          <CardDescription>
                            {formatDate(transaction.createdAt)} • {getPaymentMethodLabel(transaction.paymentMethod)}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusColor(transaction.status) as any}>
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Valor</h4>
                          <p className="text-2xl font-bold text-green-600">€{transaction.amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">ID da Transação</h4>
                          <p className="font-mono text-sm text-gray-600">{transaction.id}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Cliente</h4>
                          <p className="text-sm text-gray-600">{transaction.customerName}</p>
                          <p className="text-sm text-gray-600">{transaction.customerEmail}</p>
                        </div>
                      </div>

                      {transaction.status === "failed" && transaction.failureReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Motivo da falha:</strong> {transaction.failureReason}
                          </p>
                        </div>
                      )}

                      {transaction.completedAt && (
                        <div className="mt-4 text-sm text-gray-600">
                          Concluída em: {formatDate(transaction.completedAt)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        )}
      </main>
    </div>
  )
}
