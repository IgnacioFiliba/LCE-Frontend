// components/ProductEditModal.tsx
"use client"

import React from "react"
import { Product } from "../types/products"
import { Loader2 } from "lucide-react"

type Props = {
  isOpen: boolean
  product: Product | null
  onClose: () => void
  onSave: (payload: Partial<Product>) => Promise<boolean>
}

const ProductEditModal: React.FC<Props> = ({ isOpen, product, onClose, onSave }) => {
  const [form, setForm] = React.useState<Partial<Product>>({})
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imgUrl: product.imgUrl,
      })
      setError(null)
    }
  }, [product])

  if (!isOpen) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (k: keyof Product, v: any) => {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  const submit = async () => {
    if (!product) return
    setSaving(true)
    setError(null)
    const ok = await onSave(form)
    if (!ok) setError("No se pudo guardar. Intenta nuevamente.")
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h4 className="text-lg font-semibold">Editar producto</h4>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.name ?? ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Precio</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={form.price ?? 0}
                onChange={(e) => handleChange("price", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Stock</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={form.stock ?? 0}
                onChange={(e) => handleChange("stock", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Imagen (URL)</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.imgUrl ?? ""}
                onChange={(e) => handleChange("imgUrl", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Descripción</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={form.description ?? ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {saving ? (<><Loader2 className="h-4 w-4 inline animate-spin mr-2" /> Guardando...</>) : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductEditModal
