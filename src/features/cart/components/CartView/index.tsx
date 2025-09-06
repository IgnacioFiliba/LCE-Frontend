/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React from "react"
import {
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useCartContext } from "../../context/index"
import { usePaymentPreference } from "../../hooks/usePayment"

const ShoppingCart = () => {
  const router = useRouter()

  // ✅ Helper function para manejar errores de TypeScript
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    if (typeof error === "string") return error
    return "Error desconocido"
  }

  // ✅ Hook del carrito (existente)
  const {
    cart,
    isLoading: cartLoading,
    error,
    itemCount,
    isEmpty,
    updateQuantity,
    removeItem,
    clearCart,
    validateForCheckout,
  } = useCartContext()

  // ✅ NUEVO: Hook de MercadoPago en lugar de órdenes
  const {
    createPaymentPreference,
    redirectToMercadoPago,
    isCreating: paymentLoading,
    error: paymentError,
    reset: resetPayment,
  } = usePaymentPreference()

  // ✅ Loading combinado
  const isLoading = cartLoading || paymentLoading

  // ✅ SIMPLIFICADO: Solo calcular el total final
  const finalTotal = Number(
    cart?.summary?.total || cart?.summary?.subtotal || 0
  )

  // ✅ AGREGAR ESTA LÍNEA:
  const hasInvalidItems = Boolean(
    cart?.summary?.invalidItemsCount && cart.summary.invalidItemsCount > 0
  )

  // ✅ ACTUALIZADO: handleCheckout - NO limpiar carrito hasta después del pago
  const handleCheckout = async () => {
    try {
      console.log("🔍 Iniciando proceso de checkout...")

      // 1️⃣ PASO 1: Validar carrito
      console.log("🔍 Validando carrito para checkout...")
      const validation = await validateForCheckout()

      const isValidCart =
        validation &&
        validation.status === "pending" &&
        validation.items &&
        validation.items.length > 0 &&
        (validation.subtotal > 0 || validation.summary?.total > 0)

      if (!isValidCart) {
        toast.error("El carrito no es válido para proceder al checkout")
        console.error("❌ Carrito no válido:", validation)
        return
      }

      console.log("✅ Carrito validado correctamente:", validation)

      // 2️⃣ PASO 2: Obtener cartId del carrito actual
      // ✅ CAMBIO: Usar cartId en lugar de orderId
      const cartId = cart?.id || validation.cartId

      if (!cartId) {
        toast.error("No se pudo obtener el ID del carrito")
        console.error("❌ No se encontró cartId en:", { cart, validation })
        return
      }

      console.log("✅ Usando cartId para el pago:", cartId)

      // 3️⃣ PASO 3: Crear preferencia de pago con cartId
      console.log("💳 Creando preferencia de pago para carrito:", cartId)

      try {
        // ✅ CAMBIO: Pasar cartId en lugar de orderId
        const paymentPreference = await createPaymentPreference(cartId)

        console.log("✅ Respuesta de MercadoPago:", paymentPreference)

        // 4️⃣ PASO 4: Verificar respuesta y redirigir
        // ✅ CORREGIDO: Obtener initPoint con validación
        const initPoint =
          paymentPreference.initPoint || paymentPreference.init_point

        if (paymentPreference.ok && initPoint) {
          console.log("🔀 Preparando redirección a MercadoPago...")
          console.log("🔗 Init Point:", initPoint)

          // ✅ CAMBIO: NO limpiar carrito aquí
          // El carrito se limpiará en el webhook de success de MercadoPago
          console.log(
            "🧹 Carrito NO limpiado - se limpiará después del pago exitoso"
          )

          // Mostrar mensaje de éxito
          toast.success("Redirigiendo a MercadoPago...")

          // Redirigir a MercadoPago (ahora initPoint es garantizado como string)
          redirectToMercadoPago(initPoint)
        } else {
          // Error en la respuesta de MercadoPago
          let errorMsg = "Error al crear preferencia de pago"

          if (!initPoint) {
            errorMsg = "No se recibió URL de redirección de MercadoPago"
          } else if (!paymentPreference.ok) {
            errorMsg =
              paymentPreference.message ||
              "Error en la respuesta de MercadoPago"
          }

          console.error("❌ Error en verificación:", {
            ok: paymentPreference.ok,
            initPoint,
            response: paymentPreference,
          })
          throw new Error(errorMsg)
        }
      } catch (paymentError) {
        console.error("❌ Error al crear preferencia de pago:", paymentError)
        const errorMessage = getErrorMessage(paymentError)
        toast.error(`Error de pago: ${errorMessage}`)
        throw paymentError
      }
    } catch (error) {
      console.error("❌ Error general en checkout:", error)
      const errorMessage = getErrorMessage(error)
      toast.error(`Error en checkout: ${errorMessage}`)

      // Reset del estado de pago en caso de error
      resetPayment()
    }
  }

  // ✅ Mostrar errores de pago si existen
  React.useEffect(() => {
    if (paymentError) {
      toast.error(`Error de pago: ${paymentError}`)
    }
  }, [paymentError])

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId)
  }

  // Estado de carga
  if (cartLoading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <p className="text-red-600 mb-4">
            Error al cargar el carrito: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 flex items-center justify-center gap-3 mt-16">
            <ShoppingBag className="w-8 h-8 text-red-600" />
            Carrito de Compras
          </h1>
          <p className="text-gray-600">Revisa tus productos seleccionados</p>
        </div>

        {/* Empty Cart State */}
        {isEmpty && (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-600 mb-6">
                ¡Descubre nuestros productos y agrega algunos al carrito!
              </p>
              <button
                onClick={() => router.push("/home")}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Explorar Productos
              </button>
            </div>
          </div>
        )}

        {/* Cart with Items */}
        {!isEmpty && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-black">
                    Productos ({itemCount})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                    disabled={isLoading}
                  >
                    Vaciar carrito
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart?.items?.map((item) => {
                    // ✅ ACTUALIZADO: Usar la nueva estructura del backend
                    const itemPrice =
                      Number(
                        item.price || item.unitPrice || item.unitPriceCurrent
                      ) || 0
                    const itemQuantity = Number(item.quantity) || 1
                    const itemName = item.name || "Producto sin nombre"
                    const itemImage = item.imgUrl // ✅ Cambio: imgUrl en lugar de imageUrl

                    return (
                      <div
                        key={item.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Product Image */}
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {itemImage && (
                              <Image
                                src={itemImage}
                                alt={itemName}
                                width={80}
                                height={80}
                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200"
                              />
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-black text-lg mb-1 truncate">
                            {itemName}
                          </h3>
                          <p className="text-red-600 font-bold text-xl mb-3">
                            ${(item.lineTotal || item.total || itemPrice * itemQuantity).toFixed(2)}
                          </p>

                          {/* ✅ NUEVO: Mostrar flags si existen */}
                          {item.flags && (
                            <div className="mb-3 space-y-1">
                              {item.flags.priceChanged && (
                                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                  Precio cambió
                                </span>
                              )}
                              {item.flags.insufficientStock && (
                                <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                  Stock limitado
                                </span>
                              )}
                              {item.flags.outOfStock && (
                                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                  Sin stock
                                </span>
                              )}
                            </div>
                          )}

                          {/* ✅ CORREGIDO: Quantity Controls con iconos alineados */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-sm font-medium text-gray-700">
                                Cantidad:
                              </span>
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      itemQuantity - 1
                                    )
                                  }
                                  disabled={
                                    isLoading ||
                                    itemQuantity <= 1 ||
                                    item.flags?.outOfStock
                                  }
                                  className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg disabled:opacity-50"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                                  {itemQuantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      itemQuantity + 1
                                    )
                                  }
                                  disabled={
                                    isLoading ||
                                    item.flags?.outOfStock ||
                                    item.flags?.insufficientStock
                                  }
                                  className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg disabled:opacity-50"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ml-4"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right sm:text-left">
                          
                          {/* ✅ NUEVO: Mostrar precio unitario actual vs snapshot si cambió */}
                          {item.unitPriceSnapshot &&
                            item.unitPriceCurrent &&
                            item.unitPriceSnapshot !==
                              item.unitPriceCurrent && (
                              <p className="text-sm text-gray-500 line-through">
                                Antes: $
                                {Number(item.unitPriceSnapshot).toFixed(2)}
                              </p>
                            )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-8">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-black">
                    Resumen del Pedido
                  </h2>
                </div>

                <div className="p-6">
                  {/* ✅ NUEVO: Mostrar advertencias si hay items inválidos */}
                  {hasInvalidItems && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-700">
                        ⚠️ {cart?.summary?.invalidItemsCount} producto(s) tienen
                        problemas de stock o precio
                      </p>
                    </div>
                  )}

                  {/* ✅ LIMPIADO: Solo mostrar descuentos si existen */}
                  {cart?.summary?.discount && cart.summary.discount > 0 ? (
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-600">Descuento</span>
                      <span className="font-semibold text-green-600">
                        -${cart.summary.discount.toFixed(2)}
                      </span>
                    </div>
                  ) : null}

                  {/* ✅ LIMPIADO: Solo el total final */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-black">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-red-600">
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-3">
                  {/* ✅ ACTUALIZADO: Botón de checkout para MercadoPago */}
                  <button
                    onClick={handleCheckout}
                    disabled={isLoading || isEmpty || hasInvalidItems}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {paymentLoading ? "Procesando pago..." : "Validando..."}
                      </>
                    ) : (
                      <>
                        Pagar con MercadoPago
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => router.push("/home")}
                    className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Continuar Comprando
                  </button>
                </div>

                <div className="p-6 pt-0">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-black mb-2">
                      🔒 Pago Seguro con MercadoPago
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Pago 100% seguro con MercadoPago</li>
                      <li>✓ Múltiples métodos de pago</li>
                      <li>✓ Protección al comprador</li>
                      <li>✓ Procesamiento inmediato</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingCart
