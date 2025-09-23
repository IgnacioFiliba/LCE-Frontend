"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Award, Rocket, Wrench } from "lucide-react";
import LayoutWrapper from "@/shared/Wrapper"; // ✅ usa el mismo wrapper que Home

export default function AboutPage() {
  return (
    <LayoutWrapper>
      <main className="min-h-screen bg-neutral-50">
        {/* Encabezado de página */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-28">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900">
            Sobre <span className="text-red-600">nosotros</span>
          </h1>
          <p className="mt-3 text-neutral-600 max-w-2xl">
            Especialistas en embragues y transmisión: calidad, asesoramiento y
            entregas confiables.
          </p>
          <div className="mt-6" />
        </section>

        {/* Tarjetas de valor */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 grid gap-4 md:gap-6 md:grid-cols-3">
          {[
            {
              title: "Misión",
              desc: "Soluciones confiables con foco en performance y servicio técnico.",
              icon: Wrench,
            },
            {
              title: "Visión",
              desc: "Ser la referencia regional en repuestos de transmisión.",
              icon: Rocket,
            },
            {
              title: "Valores",
              desc: "Compromiso, transparencia y mejora continua.",
              icon: Award,
            },
          ].map(({ title, desc, icon: Icon }) => (
            <Card
              key={title}
              className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                    <Icon className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
                </div>
                <p className="mt-3 text-neutral-600">{desc}</p>
              </CardContent>
              <div className="h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            </Card>
          ))}
        </section>

        {/* Métricas estilo chips */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pb-8">
          {[
            { k: "+10k", v: "Clientes", Icon: Users },
            { k: "+2k", v: "Modelos", Icon: Wrench },
            { k: "24h", v: "Despachos", Icon: Rocket },
            { k: "Top", v: "Marcas", Icon: Award },
          ].map(({ k, v, Icon }) => (
            <Card
              key={v}
              className="border-neutral-200 shadow-sm rounded-2xl"
            >
              <CardContent className="p-5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                  <Icon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-neutral-900">
                    {k}
                  </div>
                  <div className="text-sm text-neutral-600">{v}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Historia */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
          <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8 grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                  Nuestra historia
                </h2>
                <p className="mt-3 text-neutral-600">
                  De taller especializado a tienda integral con logística
                  optimizada y alianzas con fabricantes líderes.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-neutral-100 text-neutral-800 border border-neutral-200"
                  >
                    2008 • primeros pasos
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-neutral-100 text-neutral-800 border border-neutral-200"
                  >
                    2015 • expansión
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-neutral-100 text-neutral-800 border border-neutral-200"
                  >
                    2024 • catálogo online
                  </Badge>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white aspect-[16/10]" />
            </CardContent>
            <div className="h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          </Card>
        </section>
      </main>
    </LayoutWrapper>
  );
}
