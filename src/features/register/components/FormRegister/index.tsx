/* eslint-disable @next/next/no-img-element */
/* eslint-disable prefer-const */
"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
// components/RegisterForm.tsx
import React, { useEffect, useState, useRef } from "react"
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

import {
  Loader2,
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Home,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  X,
  Shield,
  Calendar,
} from "lucide-react"
import useRegister from "../../hooks/useRegister"
import { useRouter } from "next/navigation"

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

interface RegisterFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  country: string
  address: string
  city: string
  age: string // ✅ Agregado
  profilePhoto?: File | null
  isAdmin?: boolean
}

// Validación con Yup - con campo age
const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .required("El nombre es obligatorio"),

  email: Yup.string()
    .email("Debe ser un email válido")
    .required("El email es obligatorio"),

  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
    .matches(/[a-z]/, "Debe contener al menos una minúscula")
    .matches(/\d/, "Debe contener al menos un número")
    .matches(/[!@#$%^&*]/, "Debe contener al menos un carácter especial")
    .required("La contraseña es obligatoria"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas deben coincidir")
    .required("Confirma tu contraseña"),

  phone: Yup.string()
    .matches(
      /^\+\d{10,15}$/,
      "Debe ser un número de teléfono válido con código de país (+573001234567)"
    )
    .required("El teléfono es obligatorio"),

  age: Yup.number()
    .min(18, "Debe ser mayor de 18 años")
    .max(100, "Edad no válida")
    .required("La edad es obligatoria"),

  country: Yup.string()
    .min(2, "El país debe tener al menos 2 caracteres")
    .required("El país es obligatorio"),

  address: Yup.string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .required("La dirección es obligatoria"),

  city: Yup.string()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .required("La ciudad es obligatoria"),

  profilePhoto: Yup.mixed()
    .required("La foto de perfil es obligatoria")
    .test("fileSize", "El archivo es muy grande (máximo 5MB)", (value) => {
      if (!value) return false
      return (value as File).size <= 5000000 // 5MB
    })
    .test("fileType", "Solo se permiten imágenes (JPG, PNG, WEBP)", (value) => {
      if (!value) return false
      return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        (value as File).type
      )
    }),
})

// Valores iniciales con age
const initialValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  country: "",
  address: "",
  city: "",
  age: "", // ✅ Agregado
  profilePhoto: null,
  isAdmin: false,
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { register, loading, error, success, clearStatus } = useRegister()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados para la foto
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Limpiar errores al montar
  useEffect(() => {
    clearStatus()
  }, [clearStatus])

  // Manejar selección de archivo
  const handleFileSelect = (file: File, setFieldValue: any) => {
    if (file && file.type.startsWith("image/")) {
      setFieldValue("profilePhoto", file)

      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent, setFieldValue: any) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0], setFieldValue)
    }
  }

  const removePhoto = (setFieldValue: any) => {
    setFieldValue("profilePhoto", null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (
    values: RegisterFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    try {
      const cleanPhone = values.phone.replace(/\D/g, "")

      const formData = new FormData()

      formData.append("name", values.name.trim())
      formData.append("email", values.email.toLowerCase().trim())
      formData.append("password", values.password)
      formData.append("confirmPassword", values.confirmPassword)

      // 🎯 Enviar como número usando toString()
      formData.append("phone", Number(cleanPhone).toString())

      formData.append("country", values.country.trim())
      formData.append("address", values.address.trim())
      formData.append("city", values.city.trim())

      // ❌ NO enviar age - el backend no lo quiere
      // formData.append("age", values.age)

      if (values.profilePhoto) {
        formData.append("file", values.profilePhoto)
      }

      console.log("Enviando FormData:")
      for (let [key, value] of formData.entries()) {
        console.log(
          `${key}:`,
          typeof value === "object" ? value.constructor.name : value
        )
      }

      await register(formData)

      resetForm()
      setPhotoPreview(null)

      if (onSuccess) {
        onSuccess()
      }

      console.log("Registro exitoso, redirigiendo al login...")
      router.push("/")
    } catch (err) {
      console.error("Register error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />

        <CardHeader className="text-center py-8 bg-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-20" />
              <div className="relative w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black tracking-tight bg-gradient-to-r from-black via-red-600 to-black bg-clip-text text-transparent">
              AutoParts
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600 font-medium text-lg">
            Crear Nueva Cuenta
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 bg-gray-50/30">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700 font-medium text-sm">
                  ¡Cuenta creada exitosamente!
                </span>
              </div>
            </div>
          )}

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
              setFieldValue,
              isSubmitting,
              isValid,
              dirty,
            }) => (
              <Form className="space-y-8">
                {/* Foto de Perfil */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                    Foto de Perfil
                  </h3>

                  <div className="space-y-4">
                    {photoPreview ? (
                      <div className="relative w-32 h-32 mx-auto">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(setFieldValue)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`relative w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                          dragActive
                            ? "border-red-500 bg-red-50"
                            : touched.profilePhoto && errors.profilePhoto
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-red-500 hover:bg-gray-50"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={(e) => handleDrop(e, setFieldValue)}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-600">
                          Haz clic o arrastra tu foto aquí
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG o WEBP (máximo 5MB)
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0], setFieldValue)
                        }
                      }}
                      disabled={loading}
                    />

                    <ErrorMessage
                      name="profilePhoto"
                      component="p"
                      className="text-xs text-red-600 font-medium text-center"
                    />
                  </div>
                </div>

                {/* Información Personal */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    Información Personal
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="flex items-center gap-2 text-gray-800 font-semibold text-sm"
                      >
                        <User className="h-4 w-4 text-red-600" />
                        Nombre Completo
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Ignacio Muestra"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                          touched.name && errors.name
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="name"
                        component="p"
                        className="text-xs text-red-600 font-medium ml-1"
                      />
                    </div>

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
                        placeholder="muestra@example.com"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                          touched.email && errors.email
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="email"
                        component="p"
                        className="text-xs text-red-600 font-medium ml-1"
                      />
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-2 text-gray-800 font-semibold text-sm"
                      >
                        <Phone className="h-4 w-4 text-red-600" />
                        Teléfono
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+573001234567"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                          touched.phone && errors.phone
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="phone"
                        component="p"
                        className="text-xs text-red-600 font-medium ml-1"
                      />
                    </div>

                    {/* Edad */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="age"
                        className="flex items-center gap-2 text-gray-800 font-semibold text-sm"
                      >
                        <Calendar className="h-4 w-4 text-red-600" />
                        Edad
                      </Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="25"
                        value={values.age}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                          touched.age && errors.age
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="age"
                        component="p"
                        className="text-xs text-red-600 font-medium ml-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    Ubicación
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* País */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="country"
                        className="flex items-center gap-2 text-gray-800 font-semibold text-sm"
                      >
                        <MapPin className="h-4 w-4 text-red-600" />
                        País
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        placeholder="Colombia"
                        value={values.country}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                          touched.country && errors.country
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="country"
                        component="p"
                        className="text-xs text-red-600 font-medium ml-1"
                      />
                    </div>

                    {/* Ciudad */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="city"
                        className="flex items-center gap-2 text-gray-800 font-semibold text-sm"
                      >
                        <Home className="h-4 w-4 text-red-600" />
                        Ciudad
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Manizales"
                        value={values.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                          touched.city && errors.city
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="city"
                        component="p"
                        className="text-xs text-red-600 font-medium ml-1"
                      />
                    </div>

                    {/* Dirección */}
                    <div className="md:col-span-2 space-y-2">
                      <Label
                        htmlFor="address"
                        className="flex items-center gap-2 text-gray-800 font-semibold text-sm"
                      >
                        <Home className="h-4 w-4 text-red-600" />
                        Dirección
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="Calle Muestra 123"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                          touched.address && errors.address
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="address"
                        component="p"
                        className="text-xs text-red-600 font-medium ml-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Seguridad */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                    Seguridad
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        placeholder="••••••••"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                          touched.password && errors.password
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="password"
                        component="p"
                        className="text-xs text-red-600 font-medium ml-1"
                      />
                    </div>

                    {/* Confirmar contraseña */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="flex items-center gap-2 text-gray-800 font-semibold text-sm"
                      >
                        <Lock className="h-4 w-4 text-red-600" />
                        Confirmar Contraseña
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 ${
                          touched.confirmPassword && errors.confirmPassword
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        name="confirmPassword"
                        component="p"
                        className="text-xs text-red-600 font-medium ml-1"
                      />
                    </div>
                  </div>

                  {/* Checkbox para admin */}
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <input
                        id="isAdmin"
                        name="isAdmin"
                        type="checkbox"
                        checked={values.isAdmin}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 text-red-600 bg-white border-2 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                        disabled={loading}
                      />
                      <div>
                        <Label
                          htmlFor="isAdmin"
                          className="flex items-center gap-2 text-amber-800 font-semibold text-sm cursor-pointer"
                        >
                          <Shield className="h-4 w-4 text-amber-600" />
                          Solicitar permisos de administrador
                        </Label>
                        <p className="text-xs text-amber-700 mt-1">
                          Los permisos de administrador permiten gestionar
                          órdenes, productos y usuarios. Esta solicitud debe ser
                          aprobada por un administrador existente.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón premium */}
                <Button
                  type="submit"
                  disabled={loading || isSubmitting || !isValid || !dirty}
                  className="relative w-full h-12 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all duration-300 overflow-hidden group disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading || isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5" />
                        Crear Cuenta {values.isAdmin ? "(Admin)" : ""}
                      </>
                    )}
                  </span>
                </Button>

                {/* Link sutil para login */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    ¿Ya tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        if (onSwitchToLogin) {
                          onSwitchToLogin()
                        } else {
                          router.push("/")
                        }
                      }}
                      className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200 hover:underline"
                      disabled={loading}
                    >
                      Inicia sesión aquí
                    </button>
                  </p>
                </div>

                {/* Información de validación */}
                <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                  La contraseña debe contener: mayúscula, minúscula, número y
                  carácter especial
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterForm
