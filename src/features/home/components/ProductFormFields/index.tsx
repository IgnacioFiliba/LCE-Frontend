/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ProductFormFields.tsx
import React from "react"
import { ErrorMessage } from "formik"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Package,
  Tag,
  Calendar,
  Settings,
  Gauge,
  ShoppingCart,
} from "lucide-react"

import { Category, ProductFormValues } from "../../types/product-form"

interface ProductFormFieldsProps {
  values: ProductFormValues
  errors: any
  touched: any
  handleChange: (e: React.ChangeEvent<any>) => void
  handleBlur: (e: React.FocusEvent<any>) => void
  setFieldValue: (field: string, value: any) => void
  categories: Category[]
  loadingCategories: boolean
}

const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  categories,
  loadingCategories,
}) => {
  return (
    <div className="space-y-6">
      {/* Información Básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Información Básica
          </h3>
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="flex items-center gap-2"
          >
            <Tag className="h-4 w-4" />
            Nombre del Producto *
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Ej: Filtro de Aceite Bosch"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.name && errors.name ? "border-red-500" : ""}
          />
          <ErrorMessage
            name="name"
            component="p"
            className="text-sm text-red-500"
          />
        </div>

        {/* Precio */}
        <div className="space-y-2">
          <Label
            htmlFor="price"
            className="flex items-center gap-2"
          >
            <Gauge className="h-4 w-4" />
            Precio ($) *
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            placeholder="15.99"
            value={values.price}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.price && errors.price ? "border-red-500" : ""}
          />
          <ErrorMessage
            name="price"
            component="p"
            className="text-sm text-red-500"
          />
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <Label
            htmlFor="stock"
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Stock *
          </Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            placeholder="25"
            value={values.stock}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.stock && errors.stock ? "border-red-500" : ""}
          />
          <ErrorMessage
            name="stock"
            component="p"
            className="text-sm text-red-500"
          />
        </div>

        {/* Categoría */}
        <div className="space-y-2">
          <Label
            htmlFor="categoryId"
            className="flex items-center gap-2"
          >
            <Tag className="h-4 w-4" />
            Categoría *
          </Label>
          <Select
            value={values.categoryId}
            onValueChange={(value) => setFieldValue("categoryId", value)}
            disabled={loadingCategories}
          >
            <SelectTrigger
              className={
                touched.categoryId && errors.categoryId ? "border-red-500" : ""
              }
            >
              <SelectValue
                placeholder={
                  loadingCategories ? "Cargando..." : "Seleccionar categoría"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrorMessage
            name="categoryId"
            component="p"
            className="text-sm text-red-500"
          />
        </div>
      </div>

      {/* Especificaciones Técnicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Especificaciones Técnicas
          </h3>
        </div>

        {/* Marca */}
        <div className="space-y-2">
          <Label htmlFor="brand">Marca *</Label>
          <Input
            id="brand"
            name="brand"
            placeholder="Volkswagen"
            value={values.brand}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.brand && errors.brand ? "border-red-500" : ""}
          />
          <ErrorMessage
            name="brand"
            component="p"
            className="text-sm text-red-500"
          />
        </div>

        {/* Modelo */}
        <div className="space-y-2">
          <Label htmlFor="model">Modelo *</Label>
          <Input
            id="model"
            name="model"
            placeholder="Gol Trend"
            value={values.model}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.model && errors.model ? "border-red-500" : ""}
          />
          <ErrorMessage
            name="model"
            component="p"
            className="text-sm text-red-500"
          />
        </div>

        {/* Año */}
        <div className="space-y-2">
          <Label
            htmlFor="year"
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Año *
          </Label>
          <Input
            id="year"
            name="year"
            placeholder="2021"
            maxLength={4}
            value={values.year}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.year && errors.year ? "border-red-500" : ""}
          />
          <ErrorMessage
            name="year"
            component="p"
            className="text-sm text-red-500"
          />
        </div>

        {/* Motor */}
        <div className="space-y-2">
          <Label htmlFor="engine">Motor *</Label>
          <Input
            id="engine"
            name="engine"
            placeholder="1.6"
            value={values.engine}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.engine && errors.engine ? "border-red-500" : ""}
          />
          <ErrorMessage
            name="engine"
            component="p"
            className="text-sm text-red-500"
          />
        </div>
      </div>

      {/* ✅ ELIMINÉ TODA LA SECCIÓN DE URL DE IMAGEN */}
    </div>
  )
}

export default ProductFormFields
