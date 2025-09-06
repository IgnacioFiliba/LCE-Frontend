"use client"

import { useRouter } from "next/navigation"

export default function VerifiedFailed() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold text-red-600">❌ Verificación fallida</h1>
      <p className="mt-2">El token no es válido o ya expiró.</p>
      <button
        onClick={() => router.push("/register")}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
      >
        Crear nueva cuenta
      </button>
    </div>
  )
}
