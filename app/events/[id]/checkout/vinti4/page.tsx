"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { createVinti4PaymentData, createVinti4PaymentForm } from "@/lib/payments/vinti4"

export default function Vinti4CheckoutPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [paymentForm, setPaymentForm] = useState<string>("")

  useEffect(() => {
    const eventId = params.id as string
    const amount = Number.parseFloat(searchParams.get("amount") || "0")
    const ticketTypeId = searchParams.get("ticketTypeId")
    const quantity = Number.parseInt(searchParams.get("quantity") || "1")
    const customerName = searchParams.get("customerName") || ""
    const customerEmail = searchParams.get("customerEmail") || ""
    const customerPhone = searchParams.get("customerPhone") || ""

    if (amount > 0) {
      const responseUrl = `${window.location.origin}/api/payments/vinti4/callback?eventId=${eventId}&ticketTypeId=${ticketTypeId}&quantity=${quantity}&customerName=${encodeURIComponent(customerName)}&customerEmail=${encodeURIComponent(customerEmail)}&customerPhone=${encodeURIComponent(customerPhone)}`

      const paymentData = createVinti4PaymentData(amount, responseUrl)

      const formHtml = createVinti4PaymentForm(paymentData)
      setPaymentForm(formHtml)

      console.log("[v0] Vinti4 payment data created:", paymentData)
    }
  }, [params.id, searchParams])

  if (paymentForm) {
    return <div dangerouslySetInnerHTML={{ __html: paymentForm }} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Preparando pagamento Vinti4...</p>
      </div>
    </div>
  )
}
