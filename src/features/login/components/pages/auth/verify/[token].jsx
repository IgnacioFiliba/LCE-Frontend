import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function VerifyPage() {
  const router = useRouter()
  const { token } = router.query
  const [status, setStatus] = useState("Verificando...")

  useEffect(() => {
    if (!token) return

    const verifyUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify/${token}`,
          {
            method: "GET",
            credentials: "include", // si usás cookies
          }
        )

        if (!res.ok) {
          throw new Error("Error en la verificación")
        }

        setStatus(
          "✅ Tu cuenta fue verificada con éxito. Ahora puedes iniciar sesión."
        )

        // Redirigir al login después de 3s
        setTimeout(() => router.push("/login"), 3000)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setStatus(
          "❌ No se pudo verificar tu cuenta. El enlace puede haber expirado."
        )
      }
    }

    verifyUser()
  }, [token, router])

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{status}</h1>
    </div>
  )
}
