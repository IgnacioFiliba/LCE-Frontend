"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
// components/LoginForm.tsx
import React, { useEffect, useState } from "react"
import { Formik, Form, ErrorMessage } from "formik"
import * as Yup from "yup"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, LogIn, Mail, Lock, AlertCircle } from "lucide-react"

import { LoginFormValues } from "../../types/login"
import { useRouter } from "next/navigation"
import useAuth from "../../hooks/useAuth"
import ButtonGoogle from "../ButtonGoogle"

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

// Validación con Yup
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Debe ser un email válido")
    .required("El email es obligatorio"),

  password: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es obligatoria"),
})

const initialValues: LoginFormValues = {
  email: "",
  password: "",
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { login, loading, error, clearError } = useAuth()
  const router = useRouter()

  // ⬇️ Estado para evitar parpadeo mientras verificamos sesión
  const [checkingSession, setCheckingSession] = useState(true)

  // Limpiar errores + redirigir si ya hay sesión
  useEffect(() => {
    clearError()

    // Verifica token + user en localStorage y redirige
    const checkSession = () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("token")

        const rawUser = localStorage.getItem("user")
        const parsedUser = rawUser ? JSON.parse(rawUser) : null

        if (token && parsedUser && parsedUser.id) {
          // Redirige directamente a /home
          router.replace("/home")
          if (onSuccess) onSuccess()
          return
        }
      } catch {
        // Silenciar errores de parseo
      }
      setCheckingSession(false)
    }

    checkSession()

    // Si cambia la sesión en otra pestaña, también redirigimos
    const onStorage = () => checkSession()
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [clearError, router, onSuccess])

  // ✅ Submit
  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: any
  ) => {
    try {
      const result = await login({
        email: values.email.toLowerCase().trim(),
        password: values.password,
      })

      if (result && result.token && result.user) {
        router.push("/home")
        if (onSuccess) onSuccess()
        return
      }

      // Si no vino token/user, algo falló (el hook ya debería setear error)
      console.error("❌ Login falló: no se recibió token o usuario válido")
    } catch (err) {
      console.error("❌ Login error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  // ⏳ Pantalla de verificación de sesión
  if (checkingSession) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-3" />
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-10 -mt-20">
      {/* Card limpio y moderno */}
      <Card className="bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
        {/* Borde superior rojo elegante */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />

        <CardHeader className="text-center py-8 bg-white">
          {/* Logo moderno */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-20" />
              <div className="relative w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <LogIn className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black tracking-tight bg-gradient-to-r from-black via-red-600 to-black bg-clip-text text-transparent">
              LCE
            </CardTitle>
            
          </div>
          <CardDescription className="text-gray-600 font-medium text-lg">
            Portal de Administración
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 bg-gray-50/30">
          {/* Error - Diseño limpio */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 font-medium text-sm">
                  {error}
                </span>
              </div>
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isSubmitting,
              isValid,
              dirty,
            }) => (
              <Form className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-gray-800 font-semibold text-sm"
                  >
                    <Mail className="h-4 w-4 text-red-600" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Ingresa tu email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                      touched.email && errors.email ? "border-red-500 bg-red-50" : ""
                    }`}
                    disabled={loading}
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-xs text-red-600 font-medium ml-1"
                  />
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 text-gray-800 font-semibold text-sm"
                  >
                    <Lock className="h-4 w-4 text-red-600" />
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                      touched.password && errors.password ? "border-red-500 bg-red-50" : ""
                    }`}
                    disabled={loading}
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-xs text-red-600 font-medium ml-1"
                  />
                </div>

                {/* Botón premium */}
                <Button
                  type="submit"
                  disabled={loading || isSubmitting || !isValid || !dirty}
                  className="relative w-full h-12 bg-black hover:bg.gray-800 text-white font-bold rounded-xl transition-all duration-300 overflow-hidden group disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading || isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        Iniciar Sesión
                      </>
                    )}
                  </span>
                </Button>

                <div>
                  <ButtonGoogle />
                </div>

                {/* Link registro */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    ¿No tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        if (onSwitchToRegister) onSwitchToRegister()
                        else window.location.href = "/register"
                      }}
                      className="cursor-pointer text-red-600 hover:text-red-700 font-medium transition-colors duration-200 hover:underline"
                      disabled={loading}
                    >
                      Regístrate aquí
                    </button>
                  </p>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm
