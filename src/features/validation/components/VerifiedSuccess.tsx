"use client"

import { useRouter } from "next/navigation"

export default function VerifiedSuccess() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold text-green-600">✅ Cuenta verificada</h1>
      <p className="mt-2">Tu cuenta fue activada correctamente.</p>
      <button
        onClick={() => router.push("/login")}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Ir al login
      </button>
    </div>
  )
}
