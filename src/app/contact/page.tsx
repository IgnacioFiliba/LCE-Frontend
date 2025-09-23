"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin } from "lucide-react";
import LayoutWrapper from "@/shared/Wrapper"; // ✅ navbar/footer global

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LayoutWrapper>
      <main className="min-h-screen bg-neutral-50">
        {/* Encabezado */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-28">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900">
            Contacto
          </h1>
          <p className="mt-3 text-neutral-600 max-w-2xl">
            ¿Consultas sobre stock, compatibilidad o envíos? Escribinos y te
            respondemos a la brevedad.
          </p>
          <div className="mt-6" />
        </section>

        {/* Info y Formulario */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-6 pb-16">
          {/* Info de contacto */}
          <Card className="border-neutral-200 shadow-sm rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-neutral-700">
                <Phone className="w-5 h-5 text-red-600" />
                <span>+54 351 000 0000</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-700">
                <Mail className="w-5 h-5 text-red-600" />
                <span>ventas@lce.com.ar</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-700">
                <MapPin className="w-5 h-5 text-red-600" />
                <span>Córdoba, Argentina</span>
              </div>
              <div className="pt-2 text-sm text-neutral-500">
                Horario: Lun a Vie 9:00–18:00 • Sáb 9:00–13:00
              </div>
            </CardContent>
            <div className="h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          </Card>

          {/* Formulario */}
          <Card className="border-neutral-200 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              {sent ? (
                <div className="p-6 bg-green-50 border border-green-200 text-green-800 rounded-xl">
                  ¡Mensaje enviado! Nos pondremos en contacto pronto.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      required
                      placeholder="Nombre"
                      className="bg-white border-neutral-300"
                    />
                    <Input
                      required
                      type="email"
                      placeholder="Email"
                      className="bg-white border-neutral-300"
                    />
                  </div>
                  <Input
                    placeholder="Teléfono (opcional)"
                    className="bg-white border-neutral-300"
                  />
                  <Textarea
                    required
                    placeholder="Tu consulta"
                    className="bg-white border-neutral-300 min-h-[140px]"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                  >
                    {loading ? "Enviando…" : "Enviar"}
                  </Button>
                </form>
              )}
            </CardContent>
            <div className="h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          </Card>
        </section>
      </main>
    </LayoutWrapper>
  );
}
