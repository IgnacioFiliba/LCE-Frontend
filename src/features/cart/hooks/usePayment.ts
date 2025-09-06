/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import {
  CreatePaymentPreferenceRequest,
  CreatePaymentPreferenceResponse,
} from "../types/payments"
import { paymentsService } from "../services/payment-service"

// Hook para crear preferencias de pago de MercadoPago
export const usePaymentPreference = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] =
    useState<CreatePaymentPreferenceResponse | null>(null)

  // ✅ CAMBIO: orderId → cartId
  const createPaymentPreference = async (
    cartId: string, // ✅ Cambiar parámetro
    additionalData?: Partial<CreatePaymentPreferenceRequest>
  ): Promise<CreatePaymentPreferenceResponse> => {
    setIsCreating(true)
    setError(null)

    try {
      // ✅ CAMBIO: Pasar cartId al service
      const response = await paymentsService.createPaymentPreference(
        cartId, // ✅ Cambiar aquí también
        additionalData
      )
      setLastResponse(response)
      return response
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al crear preferencia de pago"
      setError(errorMessage)
      console.error("Error creating payment preference:", err)
      throw err
    } finally {
      setIsCreating(false)
    }
  }

  const reset = () => {
    setError(null)
    setLastResponse(null)
  }

  // Función para redirigir a MercadoPago
  const redirectToMercadoPago = (initPoint: string) => {
    if (typeof window !== "undefined") {
      window.location.href = initPoint
    }
  }

  return {
    createPaymentPreference,
    redirectToMercadoPago,
    isCreating,
    error,
    lastResponse,
    reset,
  }
}

// Hook para confirmar pagos (sin cambios)
export const usePaymentConfirmation = () => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const confirmSuccess = async (paymentData: any) => {
    setIsProcessing(true)
    setError(null)

    try {
      const result = await paymentsService.confirmPaymentSuccess(paymentData)
      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al confirmar pago exitoso"
      setError(errorMessage)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  const confirmFailure = async (paymentData: any) => {
    setIsProcessing(true)
    setError(null)

    try {
      const result = await paymentsService.confirmPaymentFailure(paymentData)
      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al confirmar pago fallido"
      setError(errorMessage)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    confirmSuccess,
    confirmFailure,
    isProcessing,
    error,
  }
}