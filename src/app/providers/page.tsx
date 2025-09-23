"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileSpreadsheet,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import LayoutWrapper from "@/shared/Wrapper"; // ✅ incluye navbar/footer global

const PROVIDERS_EXCEL_URL = "/downloads/proveedores.xlsx";

export default function ProvidersPage() {
  return (
    <LayoutWrapper>
      <main className="min-h-screen bg-neutral-50">
        {/* Encabezado */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-28">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900">
            Proveedores
          </h1>
          <p className="mt-3 text-neutral-600 max-w-2xl">
            Sumate a nuestra red: calidad, entrega confiable y relación a largo
            plazo.
          </p>
          <div className="mt-6" />
        </section>

        {/* Secciones */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-3 gap-6 pb-16">
          {/* Plantilla Excel */}
          <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                  <FileSpreadsheet className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Plantilla Excel
                </h3>
              </div>
              <p className="text-neutral-600">
                Descargá la plantilla para cargar catálogo, listas de precios y
                datos de contacto.
              </p>
              <a
                href={PROVIDERS_EXCEL_URL}
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold border border-red-600/40"
              >
                <Download className="w-4 h-4" /> Descargar Excel
              </a>
            </CardContent>
            <div className="h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          </Card>

          {/* Alta de proveedor */}
          <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                  <PlusCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">
                  ¿Querés ser proveedor?
                </h3>
              </div>
              <p className="text-neutral-600">
                Completá el formulario y nuestro equipo te contactará para el
                alta comercial.
              </p>
              <Link href="/contact" className="inline-flex">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                  Iniciar contacto
                </Button>
              </Link>
            </CardContent>
            <div className="h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          </Card>

          {/* Especificaciones */}
          <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                  <ExternalLink className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Especificaciones
                </h3>
              </div>
              <p className="text-neutral-600">
                Homologamos por calidad y trazabilidad. Aceptamos XLSX o CSV con
                códigos OEM y stock.
              </p>
              <ul className="text-sm text-neutral-600 list-disc ml-5 space-y-1">
                <li>Mínimos por partida y política de devoluciones</li>
                <li>Garantía y certificaciones</li>
                <li>Lead time y logística</li>
              </ul>
            </CardContent>
            <div className="h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          </Card>
        </section>
      </main>
    </LayoutWrapper>
  );
}
