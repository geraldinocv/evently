import { TextEncoder } from "util"

export const VINTI4_CONFIG = {
  posID: "90000392",
  posAutCode: "jFRDNQvRStRCNNZ1",
  merchantID: "9000384",
  currency: "132", // CVE
  is3DSec: "1",
  url: "https://mc.vinti4net.cv/3ds_middleware_php/public/3ds_init.php",
  apiUrl: "https://comerciante.vinti4.cv/pos/transaction-status",
}

export interface Vinti4PaymentData {
  transactionCode: "1" | "2" | "3"
  merchantRef: string
  merchantSession: string
  amount: number
  entityCode?: string
  referenceNumber?: string
  urlMerchantResponse: string
  languageMessages: "pt" | "en"
  email: string
  billAddrCountry: string
  billAddrCity: string
  billAddrLine1: string
  billAddrLine2?: string
  billAddrLine3?: string
  billAddrPostCode: string
  billAddrState?: string
  shipAddrCity?: string
  shipAddrCountry?: string
  shipAddrLine1?: string
  shipAddrPostCode?: string
  shipAddrState?: string
  acctID?: string
  acctInfo?: {
    chAccAgeInd?: "01" | "02" | "03" | "04" | "05"
    chAccChange?: string
    chAccDate?: string
    chAccPwChange?: string
    chAccPwChangeInd?: "01" | "02" | "03" | "04" | "05"
    suspiciousAccActivity?: "01" | "02"
  }
  addrMatch?: "Y" | "N"
  workPhone?: {
    cc: string
    subscriber: string
  }
  mobilePhone?: {
    cc: string
    subscriber: string
  }
}

export interface Vinti4Response {
  merchantRespMerchantRef: string
  merchantRespMerchantSession: string
  merchantRespErrorCode?: string
  merchantRespErrorDescription?: string
  merchantRespErrorDetail?: string
  merchantRespAdditionalErrorMessage?: string
  merchantRespCP?: string
  merchantRespTid?: string
  merchantRespPan?: string
  merchantRespPurchaseAmount?: string
  merchantRespMessageID?: string
  merchantResp?: "C" | null
  languageMessages: "pt" | "en"
  messageType?: "8" | "P" | "M" | "6" | "A" | "B" | "C" | null
  merchantRespTimeStamp?: string
  merchantRespReloadCode?: string
  merchantRespClientReceipt?: string
  merchantRespScreenError?: string
  merchantRespEntityCode?: string
  merchantRespReferenceNumber?: string
  resultFingerPrint?: string
  resultFingerPrintVersion?: string
  userCancelled?: string
  dcc?: "Y" | "N"
  dccAmount?: string
  dccCurrency?: string
  dccMarkup?: string
  dccRate?: string
}

async function generateSHA512Hash(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-512", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return btoa(hashHex)
}

export async function generateVinti4FingerPrint(data: Vinti4PaymentData): Promise<string> {
  const posAutCodeHash = await generateSHA512Hash(VINTI4_CONFIG.posAutCode)
  const timeStamp = new Date().toISOString().replace("T", " ").substring(0, 19)
  const amount = Math.floor(data.amount * 1000)
  const merchantRef = data.merchantRef.trim()
  const merchantSession = data.merchantSession.trim()
  const posID = VINTI4_CONFIG.posID.trim()
  const currency = VINTI4_CONFIG.currency.replace(/^0+/, "") || "132"
  const transactionCode = data.transactionCode.trim()

  let entityCode = ""
  let referenceNumber = ""

  if (data.entityCode) {
    entityCode = data.entityCode.replace(/^0+/, "") || data.entityCode
  }

  if (data.referenceNumber) {
    referenceNumber = data.referenceNumber.replace(/^0+/, "") || data.referenceNumber
  }

  const message =
    posAutCodeHash +
    timeStamp +
    amount +
    merchantRef +
    merchantSession +
    posID +
    currency +
    transactionCode +
    entityCode +
    referenceNumber

  return await generateSHA512Hash(message)
}

export function generatePurchaseRequest(data: Vinti4PaymentData): string {
  const purchaseData = {
    acctID: data.acctID || "",
    acctInfo: data.acctInfo || {
      chAccAgeInd: "05",
      chAccChange: new Date().toISOString().substring(0, 10).replace(/-/g, ""),
      chAccDate: new Date().toISOString().substring(0, 10).replace(/-/g, ""),
      chAccPwChange: new Date().toISOString().substring(0, 10).replace(/-/g, ""),
      chAccPwChangeInd: "05",
      suspiciousAccActivity: "01",
    },
    email: data.email,
    addrMatch: data.addrMatch || "N",
    billAddrCity: data.billAddrCity,
    billAddrCountry: data.billAddrCountry,
    billAddrLine1: data.billAddrLine1,
    billAddrLine2: data.billAddrLine2 || "",
    billAddrLine3: data.billAddrLine3 || "",
    billAddrPostCode: data.billAddrPostCode,
    billAddrState: data.billAddrState || "",
    shipAddrCity: data.shipAddrCity || data.billAddrCity,
    shipAddrCountry: data.shipAddrCountry || data.billAddrCountry,
    shipAddrLine1: data.shipAddrLine1 || data.billAddrLine1,
    shipAddrPostCode: data.shipAddrPostCode || data.billAddrPostCode,
    shipAddrState: data.shipAddrState || data.billAddrState || "",
    workPhone: data.workPhone || { cc: "238", subscriber: "0000000" },
    mobilePhone: data.mobilePhone || { cc: "238", subscriber: "0000000" },
  }

  return btoa(JSON.stringify(purchaseData))
}

export async function createVinti4PaymentForm(data: Vinti4PaymentData): Promise<string> {
  const fingerPrint = await generateVinti4FingerPrint(data)
  const timeStamp = new Date().toISOString().replace("T", " ").substring(0, 19)
  const purchaseRequest = generatePurchaseRequest(data)

  const formData = {
    transactionCode: data.transactionCode,
    posID: VINTI4_CONFIG.posID,
    merchantRef: data.merchantRef,
    merchantSession: data.merchantSession,
    amount: Math.floor(data.amount), // Sem decimais para CVE
    currency: VINTI4_CONFIG.currency,
    is3DSec: VINTI4_CONFIG.is3DSec,
    urlMerchantResponse: data.urlMerchantResponse,
    languageMessages: data.languageMessages,
    FingerPrint: fingerPrint,
    FingerPrintVersion: "1",
    TimeStamp: timeStamp,
    entityCode: data.entityCode || "",
    referenceNumber: data.referenceNumber || "",
    email: data.email,
    billAddrCountry: data.billAddrCountry,
    billAddrCity: data.billAddrCity,
    billAddrLine1: data.billAddrLine1,
    billAddrLine2: data.billAddrLine2 || "",
    billAddrLine3: data.billAddrLine3 || "",
    billAddrPostCode: data.billAddrPostCode,
    billAddrState: data.billAddrState || "",
    shipAddrCity: data.shipAddrCity || data.billAddrCity,
    shipAddrCountry: data.shipAddrCountry || data.billAddrCountry,
    shipAddrLine1: data.shipAddrLine1 || data.billAddrLine1,
    shipAddrPostCode: data.shipAddrPostCode || data.billAddrPostCode,
    shipAddrState: data.shipAddrState || data.billAddrState || "",
    purchaseRequest: purchaseRequest,
  }

  let formHTML = `
    <html>
      <head><title>Redirecionando para Vinti4...</title></head>
      <body>
        <form id="vinti4Form" method="POST" action="${VINTI4_CONFIG.url}">
  `

  Object.entries(formData).forEach(([key, value]) => {
    if (value !== "" && value !== undefined) {
      formHTML += `<input type="hidden" name="${key}" value="${value}" />\n`
    }
  })

  formHTML += `
        </form>
        <script>
          document.getElementById('vinti4Form').submit();
        </script>
      </body>
    </html>
  `

  return formHTML
}

export function validateVinti4Response(response: Vinti4Response): {
  success: boolean
  message: string
  transactionType: string
} {
  if (response.userCancelled) {
    return {
      success: false,
      message: "Pagamento cancelado pelo utilizador",
      transactionType: "cancelled",
    }
  }

  const messageType = response.messageType
  const merchantResp = response.merchantResp

  if (messageType === "8" && merchantResp === "C") {
    return {
      success: true,
      message: "Compra realizada com sucesso",
      transactionType: "purchase",
    }
  }

  if (messageType === "P" && merchantResp === "C") {
    return {
      success: true,
      message: "Pagamento de serviço realizado com sucesso",
      transactionType: "service",
    }
  }

  if (messageType === "M" && merchantResp === "C") {
    return {
      success: true,
      message: "Recarga realizada com sucesso",
      transactionType: "reload",
    }
  }

  if (messageType === "6" || messageType === null || merchantResp !== "C") {
    const errorMessage =
      response.merchantRespAdditionalErrorMessage ||
      response.merchantRespErrorDescription ||
      "Erro no processamento do pagamento"

    return {
      success: false,
      message: errorMessage,
      transactionType: "error",
    }
  }

  return {
    success: false,
    message: "Resposta inválida do sistema de pagamento",
    transactionType: "invalid",
  }
}

export async function consultVinti4TransactionStatus(merchantRef: string): Promise<{
  result: boolean
  msg: string
  transactionSuccess: boolean
  transactionStatusDescription: string
}> {
  try {
    const response = await fetch(VINTI4_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${VINTI4_CONFIG.merchantID}:${VINTI4_CONFIG.posAutCode}`)}`,
      },
      body: JSON.stringify({
        posID: VINTI4_CONFIG.posID,
        posAuthCode: VINTI4_CONFIG.posAutCode,
        merchantRef: merchantRef,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao consultar estado da transação:", error)
    return {
      result: false,
      msg: "Erro na consulta do estado da transação",
      transactionSuccess: false,
      transactionStatusDescription: "ERRO",
    }
  }
}

export const VINTI4_ERROR_CODES = {
  "0": "Erro indefinido",
  "1": "Ocorreu um erro durante o processamento da transação. Por favor, tente novamente.",
  "2": "A autenticação segura 3D falhou.",
  "3": "Ocorreu um erro ao processar a transação.",
  "4": "Dados inválidos. Por favor, tente novamente.",
} as const

export const VINTI4_TRANSACTION_TYPES = {
  "1": "Compra",
  "2": "Pagamento de Serviço",
  "3": "Recarga, pré-pago ou doação",
} as const

export function createVinti4PaymentData(params: {
  transactionCode: "1" | "2" | "3"
  merchantRef: string
  merchantSession: string
  amount: number
  email: string
  billAddrCountry: string
  billAddrCity: string
  billAddrLine1: string
  billAddrPostCode: string
  urlMerchantResponse: string
  languageMessages?: "pt" | "en"
  entityCode?: string
  referenceNumber?: string
  billAddrLine2?: string
  billAddrLine3?: string
  billAddrState?: string
  shipAddrCity?: string
  shipAddrCountry?: string
  shipAddrLine1?: string
  shipAddrPostCode?: string
  shipAddrState?: string
  acctID?: string
  mobilePhone?: {
    cc: string
    subscriber: string
  }
}): Vinti4PaymentData {
  return {
    transactionCode: params.transactionCode,
    merchantRef: params.merchantRef,
    merchantSession: params.merchantSession,
    amount: params.amount,
    email: params.email,
    billAddrCountry: params.billAddrCountry,
    billAddrCity: params.billAddrCity,
    billAddrLine1: params.billAddrLine1,
    billAddrPostCode: params.billAddrPostCode,
    urlMerchantResponse: params.urlMerchantResponse,
    languageMessages: params.languageMessages || "pt",
    entityCode: params.entityCode,
    referenceNumber: params.referenceNumber,
    billAddrLine2: params.billAddrLine2,
    billAddrLine3: params.billAddrLine3,
    billAddrState: params.billAddrState,
    shipAddrCity: params.shipAddrCity,
    shipAddrCountry: params.shipAddrCountry,
    shipAddrLine1: params.shipAddrLine1,
    shipAddrPostCode: params.shipAddrPostCode,
    shipAddrState: params.shipAddrState,
    acctID: params.acctID,
    acctInfo: {
      chAccAgeInd: "05",
      chAccChange: new Date().toISOString().substring(0, 10).replace(/-/g, ""),
      chAccDate: new Date().toISOString().substring(0, 10).replace(/-/g, ""),
      chAccPwChange: new Date().toISOString().substring(0, 10).replace(/-/g, ""),
      chAccPwChangeInd: "05",
      suspiciousAccActivity: "01",
    },
    addrMatch: "N",
    mobilePhone: params.mobilePhone,
  }
}
