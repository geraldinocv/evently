import { createHash } from "crypto"
import fetch from "node-fetch"

export const VINTI4_CONFIG = {
  posID: "90000392",
  posAutCode: "jFRDNQvRStRCNNZ1",
  merchantID: "9000384",
  paymentURL: "https://mc.vinti4net.cv/3ds_middleware_php/public/3ds_init.php",
  currency: "132", // CVE - Escudo Cabo-Verdiano
}

function toBase64(buffer: Buffer): string {
  return buffer.toString("base64")
}

function generateSHA512StringToBase64(input: string): string {
  const hash = createHash("sha512")
  hash.update(input, "utf8")
  return toBase64(hash.digest())
}

export function gerarFingerPrintEnvio(
  posAutCode: string,
  timestamp: string,
  amount: string,
  merchantRef: string,
  merchantSession: string,
  posID: string,
  currency: string,
  transactionCode: string,
  entityCode?: string,
  referenceNumber?: string,
): string {
  let toHash =
    generateSHA512StringToBase64(posAutCode) +
    timestamp +
    (Number(Number.parseFloat(amount)) * 100).toString() +
    merchantRef.trim() +
    merchantSession.trim() +
    posID.trim() +
    currency.trim() +
    transactionCode.trim()

  if (entityCode) {
    toHash += Number(entityCode.trim()).toString()
  }

  if (referenceNumber) {
    toHash += Number(referenceNumber.trim()).toString()
  }

  return generateSHA512StringToBase64(toHash)
}

export function gerarFingerPrintRespostaBemSucedida(
  posAutCode: string,
  messageType: string,
  clearingPeriod: string,
  transactionID: string,
  merchantReference: string,
  merchantSession: string,
  amount: string,
  messageID: string,
  pan: string,
  merchantResponse: string,
  timestamp: string,
  entityCode?: string,
  referenceNumber?: string,
  clientReceipt?: string,
  additionalErrorMessage?: string,
  reloadCode?: string,
): string {
  const toHash =
    generateSHA512StringToBase64(posAutCode) +
    messageType +
    clearingPeriod +
    transactionID +
    merchantReference +
    merchantSession +
    amount +
    messageID +
    pan +
    merchantResponse +
    timestamp +
    (entityCode ? Number(entityCode.trim()).toString() : "") +
    (referenceNumber ? Number(referenceNumber.trim()).toString() : "") +
    clientReceipt +
    additionalErrorMessage +
    reloadCode

  return generateSHA512StringToBase64(toHash)
}

export function gerarFingerPrintRespostaErro(
  posAutCode: string,
  messageType: string,
  messageID: string,
  errorCode: string,
  errorDetail: string,
  errorDescription: string,
  merchantRef: string,
  merchantSession: string,
  additionalErrorMessage: string,
  timestamp: string,
): string {
  const hashedPosAutCode = generateSHA512StringToBase64(posAutCode)

  const toHash =
    hashedPosAutCode +
    messageType.trim() +
    messageID.trim() +
    errorCode.trim() +
    errorDetail.trim() +
    errorDescription.trim() +
    merchantRef.trim() +
    merchantSession.trim() +
    additionalErrorMessage.trim() +
    timestamp

  return generateSHA512StringToBase64(toHash)
}

export interface Vinti4PaymentData {
  transactionCode: string
  posID: string
  merchantRef: string
  merchantSession: string
  amount: string
  currency: string
  is3DSec: string
  urlMerchantResponse: string
  languageMessages: string
  TimeStamp: string // Official SISP parameter name
  FingerPrint?: string // Official SISP parameter name
  FingerPrintVersion: string // Official SISP parameter name
  entityCode?: string
  referenceNumber?: string
  // 3DServer 2.2.0 required fields
  email?: string
  billAddrCountry?: string
  billAddrCity?: string
  billAddrLine1?: string
  billAddrLine2?: string
  billAddrLine3?: string
  billAddrPostCode?: string
  billAddrState?: string
  // 3DServer 2.2.0 optional fields
  acctID?: string
  acctInfo?: string // JSON object as string
  addrMatch?: string
  shipAddrCity?: string
  shipAddrState?: string
  shipAddrCountry?: string
  shipAddrLine1?: string
  shipAddrPostCode?: string
  workPhone?: string // JSON object as string
  mobilePhone?: string // JSON object as string
  purchaseRequest?: string // Base64 encoded JSON
}

export interface Vinti43DSServerData {
  email: string // Required
  billAddrCountry: string // Required - ISO 3166-1 3-digit numeric code
  billAddrCity: string // Required
  billAddrLine1: string // Required
  billAddrPostCode: string // Required
  // Optional account information
  acctID?: string
  acctInfo?: {
    chAccAgeInd?: "01" | "02" | "03" | "04" | "05"
    chAccChange?: string // YYYYMMDD format
    chAccDate?: string // YYYYMMDD format
    chAccPwChange?: string // YYYYMMDD format
    chAccPwChangeInd?: "01" | "02" | "03" | "04" | "05"
    suspiciousAccActivity?: "01" | "02" // 01=Not suspicious, 02=Suspicious
  }
  addrMatch?: "Y" | "N"
  billAddrLine2?: string
  billAddrLine3?: string
  billAddrState?: string // ISO 3166-2 subdivision code
  // Shipping address (optional)
  shipAddrCity?: string
  shipAddrState?: string
  shipAddrCountry?: string
  shipAddrLine1?: string
  shipAddrPostCode?: string
  // Phone numbers (optional)
  workPhone?: {
    cc: string // Country code
    subscriber: string // Phone number
  }
  mobilePhone?: {
    cc: string // Country code
    subscriber: string // Phone number
  }
}

export function createVinti4PaymentData(
  amount: number,
  responseUrl: string,
  transactionCode = "1",
  threeDSData?: Vinti43DSServerData,
  entityCode?: string,
  referenceNumber?: string,
): Vinti4PaymentData {
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace("T", " ")
  const merchantRef =
    "R" +
    now
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14)
  const merchantSession =
    "S" +
    now
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14)

  const formData: Vinti4PaymentData = {
    transactionCode,
    posID: VINTI4_CONFIG.posID,
    merchantRef,
    merchantSession,
    amount: amount.toString(),
    currency: VINTI4_CONFIG.currency,
    is3DSec: "1",
    urlMerchantResponse: responseUrl,
    languageMessages: "pt",
    TimeStamp: timestamp,
    FingerPrintVersion: "1",
  }

  // Add entity code and reference number for service payments and recharges
  if (transactionCode === "2" || transactionCode === "3") {
    if (entityCode) formData.entityCode = entityCode
    if (referenceNumber) formData.referenceNumber = referenceNumber
  }

  // Add 3DServer 2.2.0 fields if provided (required for international cards)
  if (threeDSData) {
    formData.email = threeDSData.email
    formData.billAddrCountry = threeDSData.billAddrCountry
    formData.billAddrCity = threeDSData.billAddrCity
    formData.billAddrLine1 = threeDSData.billAddrLine1
    formData.billAddrPostCode = threeDSData.billAddrPostCode || "0000" // Default if not provided

    // Optional billing address fields
    if (threeDSData.billAddrLine2) formData.billAddrLine2 = threeDSData.billAddrLine2
    if (threeDSData.billAddrLine3) formData.billAddrLine3 = threeDSData.billAddrLine3
    if (threeDSData.billAddrState) formData.billAddrState = threeDSData.billAddrState

    // Account information
    if (threeDSData.acctID) formData.acctID = threeDSData.acctID
    if (threeDSData.acctInfo) {
      formData.acctInfo = JSON.stringify(threeDSData.acctInfo)
    }

    // Address matching
    if (threeDSData.addrMatch) formData.addrMatch = threeDSData.addrMatch

    // Shipping address
    if (threeDSData.shipAddrCity) formData.shipAddrCity = threeDSData.shipAddrCity
    if (threeDSData.shipAddrState) formData.shipAddrState = threeDSData.shipAddrState
    if (threeDSData.shipAddrCountry) formData.shipAddrCountry = threeDSData.shipAddrCountry
    if (threeDSData.shipAddrLine1) formData.shipAddrLine1 = threeDSData.shipAddrLine1
    if (threeDSData.shipAddrPostCode) formData.shipAddrPostCode = threeDSData.shipAddrPostCode

    // Phone numbers
    if (threeDSData.workPhone) {
      formData.workPhone = JSON.stringify(threeDSData.workPhone)
    }
    if (threeDSData.mobilePhone) {
      formData.mobilePhone = JSON.stringify(threeDSData.mobilePhone)
    }

    // Create purchaseRequest (Base64 encoded JSON) - Required for 3DServer 2.2.0
    const purchaseRequestData = {
      email: threeDSData.email,
      billAddrCountry: threeDSData.billAddrCountry,
      billAddrCity: threeDSData.billAddrCity,
      billAddrLine1: threeDSData.billAddrLine1,
      billAddrPostCode: formData.billAddrPostCode,
      ...threeDSData,
    }

    formData.purchaseRequest = Buffer.from(JSON.stringify(purchaseRequestData)).toString("base64")
  }

  // Generate fingerprint
  formData.FingerPrint = gerarFingerPrintEnvio(
    VINTI4_CONFIG.posAutCode,
    timestamp,
    amount.toString(),
    merchantRef,
    merchantSession,
    VINTI4_CONFIG.posID,
    VINTI4_CONFIG.currency,
    transactionCode,
    entityCode,
    referenceNumber,
  )

  return formData
}

export interface Vinti4TokenRequestData {
  transactionCode: "5" // Requisição de Token
  posID: string
  merchantRef: string
  merchantSession: string
  amount: "0" // Always 0 for token request
  currency: "132"
  urlMerchantResponse: string
  languageMessages: "pt" | "en"
  timeStamp: string
  fingerPrint: string
  fingerPrintVersion: "1"
}

export interface Vinti4TokenPaymentData {
  transactionCode: "2" | "3" | "6" // 2=Serviço, 3=Recarga, 6=Compra
  posID: string
  merchantRef: string
  merchantSession: string
  amount: string
  currency: "132"
  token: string // 9 digits token
  urlMerchantResponse: string
  languageMessages: "pt" | "en"
  timeStamp: string
  fingerPrint: string
  fingerPrintVersion: "1"
  entityCode?: string // For transactionCode 2 and 3
  referenceNumber?: string // For transactionCode 2 and 3
}

export interface Vinti4TokenCancelData {
  transactionCode: "7" // Cancelar Token
  posID: string
  merchantRef: string
  merchantSession: string
  amount: "0" // Always 0 for token cancellation
  currency: "132"
  token: string
  urlMerchantResponse: string
  languageMessages: "pt" | "en"
  timeStamp: string
  fingerPrint: string
  fingerPrintVersion: "1"
}

export interface Vinti4TokenResponse {
  merchantRespMerchantRef: string
  merchantRespMerchantSession: string
  merchantRespErrorCode?: string
  merchantRespErrorDescription?: string
  merchantRespErrorDetail?: string
  merchantRespAdditionalErrorMessage?: string
  merchantRespCP: string
  merchantRespTid: string
  token?: string // Only for token request response
  tokenDescription?: string
  maxNumberOfTransactions?: string
  maxAmountAllowed?: string
  limitDate?: string
  merchantRespPan?: string
  merchantRespMessageID: string
  merchantResp: "0" | null // 0 = success, null = error
  languageMessages: "pt" | "en"
  messageType: "A" | "B" | "C" | "6" | null // A=Token created, B=Token payment, C=Token cancelled
  merchantRespTimeStamp: string
  resultFingerPrint: string
  resultFingerPrintVersion: "1"
}

export function createVinti4TokenRequest(
  minAmount: number,
  responseUrl: string,
  languageMessages: "pt" | "en" = "pt",
): Vinti4TokenRequestData {
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace("T", " ")
  const merchantRef =
    "TKN" +
    now
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14)
  const merchantSession =
    "SES" +
    now
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14)

  const tokenRequestData: Vinti4TokenRequestData = {
    transactionCode: "5",
    posID: VINTI4_CONFIG.posID,
    merchantRef,
    merchantSession,
    amount: "0", // Always 0 for token request (minimum amount is for validation only)
    currency: "132",
    urlMerchantResponse: responseUrl,
    languageMessages,
    timeStamp: timestamp,
    fingerPrint: "",
    fingerPrintVersion: "1",
  }

  tokenRequestData.fingerPrint = gerarFingerPrintEnvio(
    VINTI4_CONFIG.posAutCode,
    timestamp,
    "0",
    merchantRef,
    merchantSession,
    VINTI4_CONFIG.posID,
    "132",
    "5",
  )

  return tokenRequestData
}

export function createVinti4TokenPayment(
  token: string,
  amount: number,
  transactionCode: "2" | "3" | "6",
  responseUrl: string,
  entityCode?: string,
  referenceNumber?: string,
  languageMessages: "pt" | "en" = "pt",
): Vinti4TokenPaymentData {
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace("T", " ")
  const merchantRef =
    "PAY" +
    now
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14)
  const merchantSession =
    "SES" +
    now
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14)

  const tokenPaymentData: Vinti4TokenPaymentData = {
    transactionCode,
    posID: VINTI4_CONFIG.posID,
    merchantRef,
    merchantSession,
    amount: amount.toString(),
    currency: "132",
    token,
    urlMerchantResponse: responseUrl,
    languageMessages,
    timeStamp: timestamp,
    fingerPrint: "",
    fingerPrintVersion: "1",
  }

  // Add entity code and reference number for service payments and recharges
  if (transactionCode === "2" || transactionCode === "3") {
    if (entityCode) tokenPaymentData.entityCode = entityCode
    if (referenceNumber) tokenPaymentData.referenceNumber = referenceNumber
  }

  tokenPaymentData.fingerPrint = gerarFingerPrintEnvio(
    VINTI4_CONFIG.posAutCode,
    timestamp,
    amount.toString(),
    merchantRef,
    merchantSession,
    VINTI4_CONFIG.posID,
    "132",
    transactionCode,
    entityCode,
    referenceNumber,
  )

  return tokenPaymentData
}

export function createVinti4TokenCancellation(
  token: string,
  responseUrl: string,
  languageMessages: "pt" | "en" = "pt",
): Vinti4TokenCancelData {
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace("T", " ")
  const merchantRef =
    "CAN" +
    now
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14)
  const merchantSession =
    "SES" +
    now
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14)

  const tokenCancelData: Vinti4TokenCancelData = {
    transactionCode: "7",
    posID: VINTI4_CONFIG.posID,
    merchantRef,
    merchantSession,
    amount: "0",
    currency: "132",
    token,
    urlMerchantResponse: responseUrl,
    languageMessages,
    timeStamp: timestamp,
    fingerPrint: "",
    fingerPrintVersion: "1",
  }

  tokenCancelData.fingerPrint = gerarFingerPrintEnvio(
    VINTI4_CONFIG.posAutCode,
    timestamp,
    "0",
    merchantRef,
    merchantSession,
    VINTI4_CONFIG.posID,
    "132",
    "7",
  )

  return tokenCancelData
}

export function validateVinti4TokenResponse(responseData: Vinti4TokenResponse): {
  success: boolean
  message: string
  fingerPrintValid?: boolean
  token?: string
  tokenDetails?: {
    description?: string
    maxTransactions?: number
    maxAmount?: number
    limitDate?: string
    pan?: string
  }
  operationType: "token_request" | "token_payment" | "token_cancel" | "payment" | "refund" | "error"
} {
  // Handle user cancellation
  if ((responseData as any).userCancelled === "true") {
    return {
      success: false,
      message: "Utilizador cancelou a operação",
      operationType: "error",
    }
  }

  // Validate fingerprint for successful operations
  if (responseData.merchantResp === "0" && responseData.messageType) {
    const fingerPrintCalculado = gerarFingerPrintRespostaBemSucedida(
      VINTI4_CONFIG.posAutCode,
      responseData.messageType,
      responseData.merchantRespCP || "",
      responseData.merchantRespTid || "",
      responseData.merchantRespMerchantRef || "",
      responseData.merchantRespMerchantSession || "",
      responseData.merchantRespPurchaseAmount || "",
      responseData.merchantRespMessageID || "",
      responseData.merchantRespPan || "",
      responseData.merchantResp || "",
      responseData.merchantRespTimeStamp || "",
      responseData.merchantRespEntityCode || "",
      responseData.merchantRespReferenceNumber || "",
      responseData.merchantRespClientReceipt || "",
      responseData.merchantRespAdditionalErrorMessage || "",
      responseData.merchantRespReloadCode || "",
    )

    const fingerPrintValid = responseData.resultFingerPrint === fingerPrintCalculado

    if (!fingerPrintValid) {
      return {
        success: false,
        message: "Operação sem sucesso: Finger Print de Resposta Inválida",
        fingerPrintValid: false,
        operationType: "error",
      }
    }

    // Handle different message types
    switch (responseData.messageType) {
      case "A": // Token created successfully
        return {
          success: true,
          message: "Token Vinti4 criado com sucesso",
          fingerPrintValid: true,
          token: responseData.token,
          tokenDetails: {
            description: responseData.tokenDescription,
            maxTransactions: responseData.maxNumberOfTransactions
              ? Number.parseInt(responseData.maxNumberOfTransactions)
              : undefined,
            maxAmount: responseData.maxAmountAllowed ? Number.parseInt(responseData.maxAmountAllowed) : undefined,
            limitDate: responseData.limitDate,
            pan: responseData.merchantRespPan,
          },
          operationType: "token_request",
        }

      case "B": // Token payment successful
        return {
          success: true,
          message: "Pagamento com Token realizado com sucesso",
          fingerPrintValid: true,
          operationType: "token_payment",
        }

      case "C": // Token cancelled successfully
        return {
          success: true,
          message: "Token cancelado com sucesso",
          fingerPrintValid: true,
          operationType: "token_cancel",
        }

      case "8": // Regular payment successful
        return {
          success: true,
          message: "Pagamento realizado com sucesso",
          fingerPrintValid: true,
          operationType: "payment",
        }

      case "10": // Refund successful
        return {
          success: true,
          message: "Estorno realizado com sucesso",
          fingerPrintValid: true,
          operationType: "refund",
        }

      default:
        return {
          success: false,
          message: "Tipo de resposta não reconhecido",
          operationType: "error",
        }
    }
  }

  // Handle error responses
  const errorMessage =
    responseData.merchantRespAdditionalErrorMessage ||
    responseData.merchantRespErrorDescription ||
    "Operação sem sucesso"

  return {
    success: false,
    message: errorMessage,
    operationType: "error",
  }
}

export interface Vinti4NotificationData {
  operation: "token_created" | "token_payment" | "token_cancelled"
  customerEmail: string
  customerPhone?: string
  merchantName: string
  merchantContact: string
  transactionRef: string
  amount?: number
  currency: "CVE"
  timestamp: string
  token?: string
  tokenDescription?: string
}

export function generateTokenNotificationEmail(data: Vinti4NotificationData): string {
  const operationText = {
    token_created: "Token Vinti4 Criado",
    token_payment: "Pagamento com Token Realizado",
    token_cancelled: "Token Vinti4 Cancelado",
  }

  return `
    <h2>${operationText[data.operation]}</h2>
    <p><strong>Comerciante:</strong> ${data.merchantName}</p>
    <p><strong>Contacto:</strong> ${data.merchantContact}</p>
    <p><strong>Referência:</strong> ${data.transactionRef}</p>
    ${data.amount ? `<p><strong>Valor:</strong> ${data.amount} ${data.currency}</p>` : ""}
    <p><strong>Data:</strong> ${data.timestamp}</p>
    ${data.token ? `<p><strong>Token:</strong> ${data.token}</p>` : ""}
    ${data.tokenDescription ? `<p><strong>Descrição:</strong> ${data.tokenDescription}</p>` : ""}
    <p><em>Esta é uma notificação automática do serviço de Tokenização Vinti4.</em></p>
  `
}

export function generateTokenNotificationSMS(data: Vinti4NotificationData): string {
  const operationText = {
    token_created: "Token criado",
    token_payment: "Pagamento realizado",
    token_cancelled: "Token cancelado",
  }

  let message = `${operationText[data.operation]} - ${data.merchantName}. Ref: ${data.transactionRef}.`

  if (data.amount) {
    message += ` Valor: ${data.amount} CVE.`
  }

  if (data.token) {
    message += ` Token: ${data.token}.`
  }

  return message
}

export function createVinti4TokenForm(
  tokenData: Vinti4TokenRequestData | Vinti4TokenPaymentData | Vinti4TokenCancelData,
): string {
  let formHtml = `<html>
    <head>
      <title>Tokenização vinti4</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .loading { font-size: 18px; color: #666; }
      </style>
    </head>
    <body onload='autoPost()'>
      <div class="loading">Redirecionando para tokenização segura Vinti4...</div>
      <form action='${VINTI4_CONFIG.paymentURL}' method='post'>`

  Object.entries(tokenData).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      formHtml += `<input type='hidden' name='${key}' value='${value}'>`
    }
  })

  formHtml += `</form>
      <script>
        function autoPost() {
          document.forms[0].submit();
        }
      </script>
    </body>
  </html>`

  return formHtml
}

export function createVinti4PaymentForm(formData: Vinti4PaymentData): string {
  let formHtml = `<html>
    <head>
      <title>Pagamento vinti4</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .loading { font-size: 18px; color: #666; }
      </style>
    </head>
    <body onload='autoPost()'>
      <div class="loading">Redirecionando para pagamento seguro Vinti4...</div>
      <form action='${VINTI4_CONFIG.paymentURL}' method='post'>`

  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      formHtml += `<input type='hidden' name='${key}' value='${value}'>`
    }
  })

  formHtml += `</form>
      <script>
        function autoPost() {
          document.forms[0].submit();
        }
      </script>
    </body>
  </html>`

  return formHtml
}

export function validateVinti4Response(responseData: any): {
  success: boolean
  message: string
  fingerPrintValid?: boolean
  tokenVinti4?: string
  isTokenOperation?: boolean
  operationType:
    | "payment"
    | "service"
    | "recharge"
    | "token_request"
    | "token_payment"
    | "token_cancel"
    | "refund"
    | "error"
  transactionDetails?: {
    merchantRef: string
    merchantSession: string
    clearingPeriod?: string
    transactionID?: string
    messageID?: string
    pan?: string
    amount?: string
    timestamp?: string
    clientReceipt?: string
    reloadCode?: string
    entityCode?: string
    referenceNumber?: string
  }
} {
  // Handle user cancellation
  if (responseData.userCancelled === "true") {
    return {
      success: false,
      message: "Utilizador cancelou a operação",
      operationType: "error",
    }
  }

  // Check for successful operations
  if (responseData.merchantResp === "C" || responseData.merchantResp === "0") {
    let operationType:
      | "payment"
      | "service"
      | "recharge"
      | "token_request"
      | "token_payment"
      | "token_cancel"
      | "refund" = "payment"
    let message = "Operação realizada com sucesso"

    // Determine operation type based on messageType
    switch (responseData.messageType) {
      case "8": // Purchase success
        operationType = "payment"
        message = "Pagamento realizado com sucesso"
        break
      case "P": // Service payment success
        operationType = "service"
        message = "Pagamento de serviço realizado com sucesso"
        break
      case "M": // Recharge success
        operationType = "recharge"
        message = "Recarga realizada com sucesso"
        break
      case "A": // Token created
        operationType = "token_request"
        message = "Token Vinti4 criado com sucesso"
        break
      case "B": // Token payment success
        operationType = "token_payment"
        message = "Pagamento com Token realizado com sucesso"
        break
      case "C": // Token cancelled
        operationType = "token_cancel"
        message = "Token cancelado com sucesso"
        break
      case "10": // Refund success
        operationType = "refund"
        message = "Estorno realizado com sucesso"
        break
    }

    // Validate fingerprint for successful operations
    let fingerPrintValid = false

    if (responseData.messageType === "6" || !responseData.messageType) {
      // Error response fingerprint validation
      const calculatedFP = gerarFingerPrintRespostaErro(
        VINTI4_CONFIG.posAutCode,
        responseData.messageType || "6",
        responseData.merchantRespMessageID || "",
        responseData.merchantRespErrorCode || "",
        responseData.merchantRespErrorDetail || "",
        responseData.merchantRespErrorDescription || "",
        responseData.merchantRespMerchantRef || "",
        responseData.merchantRespMerchantSession || "",
        responseData.merchantRespAdditionalErrorMessage || "",
        responseData.merchantRespTimeStamp || "",
      )
      fingerPrintValid = responseData.resultFingerPrint === calculatedFP
    } else {
      // Success response fingerprint validation
      const calculatedFP = gerarFingerPrintRespostaBemSucedida(
        VINTI4_CONFIG.posAutCode,
        responseData.messageType,
        responseData.merchantRespCP || "",
        responseData.merchantRespTid || "",
        responseData.merchantRespMerchantRef || "",
        responseData.merchantRespMerchantSession || "",
        responseData.merchantRespPurchaseAmount || "0",
        responseData.merchantRespMessageID || "",
        responseData.merchantRespPan || "",
        responseData.merchantResp || "",
        responseData.merchantRespTimeStamp || "",
        responseData.merchantRespEntityCode || "",
        responseData.merchantRespReferenceNumber || "",
        responseData.merchantRespClientReceipt || "",
        responseData.merchantRespAdditionalErrorMessage || "",
        responseData.merchantRespReloadCode || "",
      )
      fingerPrintValid = responseData.resultFingerPrint === calculatedFP
    }

    if (!fingerPrintValid) {
      return {
        success: false,
        message: "Operação sem sucesso: FingerPrint de resposta inválido",
        fingerPrintValid: false,
        operationType: "error",
      }
    }

    return {
      success: true,
      message,
      fingerPrintValid: true,
      tokenVinti4: responseData.token,
      isTokenOperation: ["A", "B", "C"].includes(responseData.messageType),
      operationType,
      transactionDetails: {
        merchantRef: responseData.merchantRespMerchantRef,
        merchantSession: responseData.merchantRespMerchantSession,
        clearingPeriod: responseData.merchantRespCP,
        transactionID: responseData.merchantRespTid,
        messageID: responseData.merchantRespMessageID,
        pan: responseData.merchantRespPan,
        amount: responseData.merchantRespPurchaseAmount,
        timestamp: responseData.merchantRespTimeStamp,
        clientReceipt: responseData.merchantRespClientReceipt,
        reloadCode: responseData.merchantRespReloadCode,
        entityCode: responseData.merchantRespEntityCode,
        referenceNumber: responseData.merchantRespReferenceNumber,
      },
    }
  }

  // Handle error responses
  const errorMessage =
    responseData.merchantRespAdditionalErrorMessage ||
    responseData.merchantRespErrorDescription ||
    responseData.merchantRespErrorDetail ||
    "Operação sem sucesso"

  return {
    success: false,
    message: errorMessage,
    operationType: "error",
    transactionDetails: {
      merchantRef: responseData.merchantRespMerchantRef || "",
      merchantSession: responseData.merchantRespMerchantSession || "",
      messageID: responseData.merchantRespMessageID || "",
      timestamp: responseData.merchantRespTimeStamp || "",
    },
  }
}

export interface Vinti4TransactionStatusRequest {
  posID: string
  posAuthCode: string
  merchantRef: string
}

export interface Vinti4TransactionStatusResponse {
  result: boolean
  msg: string
  transactionSuccess: boolean
  transactionStatusDescription: string
}

export async function consultarEstadoTransacao(
  merchantRef: string,
  portalID: string,
  portalPassword: string,
): Promise<Vinti4TransactionStatusResponse> {
  const apiUrl = "https://comerciante.vinti4.cv/pos/transaction-status" // Production URL

  const requestBody: Vinti4TransactionStatusRequest = {
    posID: VINTI4_CONFIG.posID,
    posAuthCode: VINTI4_CONFIG.posAutCode,
    merchantRef,
  }

  // Create Basic Auth token
  const authToken = Buffer.from(`${portalID}:${portalPassword}`).toString("base64")

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: Vinti4TransactionStatusResponse = await response.json()
    return result
  } catch (error) {
    return {
      result: false,
      msg: `Erro na consulta: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      transactionSuccess: false,
      transactionStatusDescription: "ERRO",
    }
  }
}

export function createVinti4RefundData(
  originalTransaction: {
    merchantRef: string
    merchantSession: string
    amount: string
    clearingPeriod: string
    transactionID: string
  },
  responseUrl: string,
): any {
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace("T", " ")

  const refundData = {
    transactionCode: "4", // Código para estorno
    posID: VINTI4_CONFIG.posID,
    merchantRef: originalTransaction.merchantRef,
    merchantSession: originalTransaction.merchantSession,
    amount: originalTransaction.amount,
    currency: VINTI4_CONFIG.currency,
    clearingPeriod: originalTransaction.clearingPeriod,
    transactionID: originalTransaction.transactionID,
    reversal: "R",
    urlMerchantResponse: responseUrl,
    languageMessages: "pt",
    timeStamp: timestamp,
    fingerprintversion: "1",
  }

  const fingerPrint = gerarFingerPrintEnvio(
    VINTI4_CONFIG.posAutCode,
    timestamp,
    originalTransaction.amount,
    originalTransaction.merchantRef,
    originalTransaction.merchantSession,
    VINTI4_CONFIG.posID,
    "132",
    "4",
  )

  return { ...refundData, fingerprint: fingerPrint }
}
