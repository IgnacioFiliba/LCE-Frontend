"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify/${token}`, {
          method: "GET",
          credentials: "include",
        })

        if (res.ok) {
          setStatus("success")
          setTimeout(() => router.push("/validation/success"), 1500)
        } else {
          setStatus("error")
          setTimeout(() => router.push("/validation/failed"), 2000)
        }
      } catch (err) {
        setStatus("error")
        setTimeout(() => router.push("/validation/failed"), 2000)
      }
    }

    verify()
  }, [token, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {status === "loading" && <p className="text-lg">🔄 Validando tu cuenta...</p>}
      {status === "success" && <p className="text-green-600 text-lg">✅ Cuenta verificada, redirigiendo...</p>}
      {status === "error" && <p className="text-red-600 text-lg">❌ Error verificando cuenta...</p>}
    </div>
  )
}
