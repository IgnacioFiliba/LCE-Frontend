import React, { useEffect, useRef, useState } from "react"
import {
  Car, Phone, Mail, MapPin, Clock,
  Facebook, Instagram, Twitter, Youtube,
  Shield, Truck, CreditCard, Wrench, Settings, Zap, ArrowUp,
} from "lucide-react"

const RepuStoreFooter = () => {
  const [open, setOpen] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const footerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleScroll = () => setAtTop(window.scrollY < 100)
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleArrowClick = () => {
    setOpen((v) => !v)
    if (!open) {
      // al abrir, scrollea al final para que se vea entero
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
    }
  }

  const categories = [
    { name: "Motor", icon: Settings },
    { name: "Frenos", icon: Zap },
    { name: "Suspensión", icon: Wrench },
    { name: "Eléctrico", icon: Zap },
    { name: "Filtros", icon: Settings },
    { name: "Aceites", icon: Wrench },
  ]

  const brands = ["Toyota", "Chevrolet", "Nissan", "Ford", "Hyundai", "Kia", "Mazda", "Volkswagen"]

  const services = [
    { name: "Envío Gratis", description: "En compras > $200.000", icon: Truck },
    { name: "Garantía", description: "Hasta 2 años", icon: Shield },
    { name: "Pago Seguro", description: "SSL Certificado", icon: CreditCard },
  ]

  return (
    <footer
      ref={footerRef}
      className={[
        "fixed inset-x-0 bottom-0 z-40 bg-black text-white",
        "transition-transform duration-300 ease-out",
        // 👉 altura y scroll interno en mobile:
        // max-h 75svh (mobile real), fallback 75vh; scroll-y táctil
        open
          ? "translate-y-0"
          : "translate-y-[calc(100%-3rem)]", // deja 3rem visible cuando está cerrado
      ].join(" ")}
      // padding seguro para notch/bottom
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Handler/Arrow siempre visible */}
      <button
        onClick={handleArrowClick}
        className={[
          "absolute -top-7 left-1/2 -translate-x-1/2",
          "bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg",
          "transition-transform duration-300",
          "focus:outline-none focus:ring-2 focus:ring-red-400",
        ].join(" ")}
        aria-expanded={open}
        aria-label={open ? "Cerrar footer" : "Abrir footer"}
      >
        <ArrowUp className={`w-6 h-6 transition-transform ${!open ? "rotate-180" : ""}`} />
      </button>

      {/* Contenedor con altura limitada y scroll interno */}
      <div
        className={[
          // límite de altura y scroll interno
          "overflow-y-auto overscroll-contain touch-pan-y",
          "max-h-[75svh] md:max-h-none", // en desktop sin límite
          "[-webkit-overflow-scrolling:touch]",
        ].join(" ")}
      >
      {/* Banner de servicios */}
<div className="bg-red-600 py-4 md:py-6">
  <div className="mx-auto max-w-7xl px-4">
    <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6 justify-items-center md:justify-items-start">
      {services.map((service, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 text-center md:text-left"
        >
          {/* Icono siempre visible */}
          <div className="bg-white/20 p-3 rounded-lg">
            <service.icon className="w-6 h-6" />
          </div>

          {/* Texto: oculto en mobile, visible desde md */}
          <div className="hidden md:block">
            <h4 className="font-semibold text-lg">{service.name}</h4>
            <p className="text-red-100 text-sm">{service.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

        {/* Contenido principal */}
        <div className="py-8 md:py-12 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Información */}
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="bg-red-600 p-3 rounded-lg">
                    <Car className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">LaCasaDelEmbrague</h2>
                    <p className="text-gray-400 text-sm">Repuestos para Autos</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed text-sm md:text-base">
                  Tu tienda de confianza para repuestos automotrices. Más de 15 años brindando calidad y servicio
                  excepcional en Argentina.
                </p>

                <div className="space-y-3 text-sm md:text-base">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="w-5 h-5 text-red-500" />
                    <span>+54 9 351 656-9651</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="w-5 h-5 text-red-500" />
                    <span>lcembragues@gmail.com</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-300">
                    <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                    <span>
                      Av. Revolución de Mayo 1594, X5000
                      <br />
                      Córdoba, Córdoba, Argentina
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-5 h-5 text-red-500" />
                    <span>Lun - Sáb: 8:00 - 18:00</span>
                  </div>
                </div>
              </div>

              {/* Categorías */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 md:mb-6 border-b-2 border-red-600 pb-2 inline-block">
                  Categorías Populares
                </h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {categories.map((category, index) => (
                    <a
                      key={index}
                      href="#"
                      className="flex items-center gap-2 text-gray-300 hover:text-red-400 hover:bg-gray-900 p-2 rounded-lg transition"
                    >
                      <category.icon className="w-4 h-4" />
                      <span className="text-sm">{category.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Marcas */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 md:mb-6 border-b-2 border-red-600 pb-2 inline-block">
                  Marcas Disponibles
                </h3>
                <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                  {brands.map((brand, index) => (
                    <a
                      key={index}
                      href="#"
                      className="text-gray-300 hover:text-red-400 text-sm py-1 hover:bg-gray-900 px-2 rounded transition"
                    >
                      {brand}
                    </a>
                  ))}
                </div>
              </div>

              {/* Ubicación & Social */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 md:mb-6 border-b-2 border-red-600 pb-2 inline-block">
                  Nuestra Ubicación
                </h3>

                {/* Contenedor responsive con proporción */}
                <div className="mb-4 md:mb-6">
                  <div className="w-full rounded-lg overflow-hidden border border-gray-700 aspect-video">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13727.225136246135!2d-64.1674014!3d-31.4375425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432a2c48940c927%3A0xf232f3c423de3538!2sLa%20Casa%20del%20Embrague%20SRL!5e0!3m2!1ses!2sar!4v1693689594024!5m2!1ses!2sar"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Ubicación La Casa del Embrague"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <a href="#" className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg" aria-label="Facebook">
                    <Facebook className="w-5 h-5 text-gray-300" />
                  </a>
                  <a href="#" className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg" aria-label="Instagram">
                    <Instagram className="w-5 h-5 text-gray-300" />
                  </a>
                  <a href="#" className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg" aria-label="Twitter">
                    <Twitter className="w-5 h-5 text-gray-300" />
                  </a>
                  <a href="#" className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg" aria-label="YouTube">
                    <Youtube className="w-5 h-5 text-gray-300" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t border-gray-800 py-4 md:py-6 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-xs md:text-sm">
                  © 2025 La Casa del Embrague SRL. Todos los derechos reservados.
                </p>
                <p className="text-gray-500 text-xs mt-1">Desarrollado con ❤️ en Córdoba, Argentina</p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-xs md:text-sm">
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Privacidad</a>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Términos</a>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Garantías</a>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Devoluciones</a>
                <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Ayuda</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* capa “asomada” para cuando está cerrado (tocar para abrir) */}
      <div
        className={[
          "pointer-events-none absolute inset-x-0",
          open ? "hidden" : "block",
        ].join(" ")}
        style={{ bottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto max-w-7xl px-4 pb-2">
          <div className="mx-auto h-1.5 w-16 rounded-full bg-gray-700" />
        </div>
      </div>
    </footer>
  )
}

export default RepuStoreFooter
