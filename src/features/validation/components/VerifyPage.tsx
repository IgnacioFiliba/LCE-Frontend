"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { verifyAccount } from "../services/validation-services"

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const router = useRouter()
  const params = useParams() as { token: string }

  useEffect(() => {
    const check = async () => {
      try {
        const res = await verifyAccount(params.token)
        if (res.success) {
          setStatus("success")
          setTimeout(() => router.push("/validation/success"), 1500)
        } else {
          setStatus("error")
          setTimeout(() => router.push("/validation/failed"), 2000)
        }
      } catch {
        setStatus("error")
        setTimeout(() => router.push("/validation/failed"), 2000)
      }
    }

    check()
  }, [params.token, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {status === "loading" && <p className="text-lg">🔄 Validando tu cuenta...</p>}
      {status === "success" && <p className="text-green-600 text-lg">✅ Cuenta verificada, redirigiendo...</p>}
      {status === "error" && <p className="text-red-600 text-lg">❌ Error verificando cuenta...</p>}
    </div>
  )
}
