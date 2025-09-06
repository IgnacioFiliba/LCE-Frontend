"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ProductForm.tsx
import React, { useEffect, useState } from "react"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  Package,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

import useCategories from "../../hooks/useCategories"
import ProductFormFields from "../ProductFormFields"
import { ProductFormClean } from "@/features/form/types/productClean"
import { useCreateProductClean } from "@/features/form/hooks/useCreateForm"
import Image from "next/image"

interface ProductFormProps {
  onSuccess?: (productId: string) => void
  onCancel?: () => void
}

// Validación con Yup actualizada para incluir archivo
const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .required("El nombre es obligatorio"),

  price: Yup.string()
    .required("El precio es obligatorio")
    .test("is-number", "Debe ser un número válido", (value) => {
      if (!value) return false
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    }),

  stock: Yup.string()
    .required("El stock es obligatorio")
    .test("is-number", "Debe ser un número entero válido", (value) => {
      if (!value) return false
      const num = parseInt(value)
      return !isNaN(num) && num >= 0
    }),

  year: Yup.string()
    .matches(/^\d{4}$/, "Debe ser un año válido (4 dígitos)")
    .test("year-range", "El año debe ser mayor a 1900", function (value) {
      if (!value) return false
      const year = parseInt(value)
      const currentYear = new Date().getFullYear()
      return year > 1900 && year <= currentYear
    })
    .required("El año es obligatorio"),

  brand: Yup.string()
    .min(2, "La marca debe tener al menos 2 caracteres")
    .max(50, "La marca no puede exceder 50 caracteres")
    .required("La marca es obligatoria"),

  model: Yup.string()
    .min(1, "El modelo debe tener al menos 1 caracter")
    .max(50, "El modelo no puede exceder 50 caracteres")
    .required("El modelo es obligatorio"),

  engine: Yup.string()
    .min(1, "El motor debe tener al menos 1 caracter")
    .max(50, "El motor no puede exceder 50 caracteres")
    .required("El motor es obligatorio"),

  categoryId: Yup.string().required("La categoría es obligatoria"),
})

const initialValues: ProductFormClean = {
  name: "",
  price: "",
  stock: "",
  imgUrl: "",
  year: "",
  brand: "",
  model: "",
  engine: "",
  categoryId: "",
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel }) => {
  
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const { createProduct, loading, error, success, clearStatus } =
    useCreateProductClean()
  const {
    categories,
    loading: loadingCategories,
    error: categoriesError,
  } = useCategories()

  // Limpiar estado cuando se monta el componente
  useEffect(() => {
    clearStatus()
  }, [clearStatus])

  // Redirección después del éxito
  useEffect(() => {
    if (success) {
      console.log("✅ Producto creado exitosamente, redirigiendo a /home...")

      const timer = setTimeout(() => {
        router.push("/home")
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [success, router])

  // ✅ MANEJAR SELECCIÓN DE ARCHIVO
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona solo archivos de imagen")
        return
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo debe ser menor a 5MB")
        return
      }

      setSelectedFile(file)

      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // ✅ REMOVER ARCHIVO SELECCIONADO
  const removeFile = () => {
    setSelectedFile(null)
    setPreview(null)
  }

  const handleSubmit = async (values: ProductFormClean, { resetForm }: any) => {
    try {
      console.log("🎯 Form Clean - Form values:", values)

      // ✅ VALIDAR QUE HAYA ARCHIVO SELECCIONADO
      if (!selectedFile) {
        throw new Error("Debes seleccionar una imagen del producto")
      }

      // ✅ VALIDAR Y CONVERTIR VALORES ANTES DE ENVIAR
      const price = parseFloat(values.price)
      const stock = parseInt(values.stock)

      if (isNaN(price) || price <= 0) {
        console.error("❌ Price inválido:", values.price, "→", price)
        throw new Error("El precio debe ser un número válido mayor a 0")
      }

      if (isNaN(stock) || stock < 0) {
        console.error("❌ Stock inválido:", values.stock, "→", stock)
        throw new Error("El stock debe ser un número válido mayor o igual a 0")
      }

      // ✅ CREAR FORMDATA EN LUGAR DE OBJETO
      const formData = new FormData()
      formData.append("name", values.name.trim())
      formData.append("price", price.toString())
      formData.append("stock", stock.toString())
      formData.append("year", values.year.trim())
      formData.append("brand", values.brand.trim())
      formData.append("model", values.model.trim())
      formData.append("engine", values.engine.trim())
      formData.append("categoryId", values.categoryId)
      formData.append("file", selectedFile)

      const result = await createProduct(formData as any)

      // Reset form y archivo después de éxito
      resetForm()
      removeFile()

      setTimeout(() => {
        router.push("/home")
      }, 1000)

      if (onSuccess) {
        onSuccess(result.id)
      }
    } catch (err) {
      console.error("❌ Form Clean - Error:", err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* ✅ Card con el mismo estilo que login */}
      <Card className="bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
        {/* ✅ Borde superior rojo igual que login */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />

        {/* ✅ Header igual que login */}
        <CardHeader className="text-center py-8 bg-white">
          {/* ✅ Logo moderno igual que login */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-20" />
              <div className="relative w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black tracking-tight bg-gradient-to-r from-black via-red-600 to-black bg-clip-text text-transparent">
              AutoParts
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600 font-medium text-lg">
            Crear Nuevo Producto
          </CardDescription>
        </CardHeader>

        {/* ✅ Content con el mismo fondo que login */}
        <CardContent className="p-8 bg-gray-50/30">
          {/* ✅ Error con el mismo diseño que login */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700 font-medium text-sm">
                  ¡Producto creado exitosamente! 🎉 Redirigiendo a inicio...
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

          {categoriesError && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <span className="text-yellow-700 font-medium text-sm">
                  Error al cargar categorías: {categoriesError}
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
              isValid,
              dirty,
            }) => (
              <Form className="space-y-6">
                {/* ✅ Upload de imagen con estilo login */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
                    <Upload className="h-4 w-4 text-red-600" />
                    Imagen del Producto *
                  </Label>

                  {!selectedFile ? (
                    <div className="h-32 bg-white border-2 border-dashed border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 hover:border-red-500 transition-all duration-200 flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-600 text-sm mb-1">
                        Selecciona una imagen
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        PNG, JPG, JPEG hasta 5MB
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        disabled={loading}
                      />
                      <Label
                        htmlFor="file-upload"
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
                      >
                        Elegir Archivo
                      </Label>
                    </div>
                  ) : (
                    <div className="h-auto bg-white border-2 border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {preview && (
                        <div>
                          <p className="text-xs text-gray-600 mb-2">
                            Vista previa:
                          </p>
                          <Image
                            src={preview}
                            alt="Preview"
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ✅ Campos del formulario con estilo login */}
                <ProductFormFields
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  setFieldValue={setFieldValue}
                  categories={categories}
                  loadingCategories={loadingCategories}
                />

                {/* ✅ Botón con el mismo estilo que login */}
                <Button
                  type="submit"
                  disabled={loading || !isValid || !dirty || !selectedFile}
                  className="relative w-full h-12 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all duration-300 overflow-hidden group disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  {/* ✅ Efecto hover igual que login */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creando producto...
                      </>
                    ) : (
                      <>
                        <Package className="h-5 w-5" />
                        Crear Producto
                      </>
                    )}
                  </span>
                </Button>

                {/* ✅ Botón cancelar si existe */}
                {onCancel && (
                  <Button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="w-full h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-200"
                  >
                    Cancelar
                  </Button>
                )}

                {/* ✅ Texto info igual que login */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Los campos marcados con * son obligatorios
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

export default ProductForm
