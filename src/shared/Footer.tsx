import React, { useEffect, useState, useRef } from "react"
import {
  Car,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Shield,
  Truck,
  CreditCard,
  Wrench,
  Settings,
  Zap,
  ArrowUp,
} from "lucide-react"

const RepuStoreFooter = () => {
  const [open, setOpen] = useState(false)     // ← controla abrir/cerrar solo con la flecha
  const [atTop, setAtTop] = useState(true)    // ← solo para rotación de flecha/label
  const footerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setAtTop(window.scrollY < 100)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleArrowClick = () => {
    if (!open) {
      // Abrir footer y bajar al final
      setOpen(true)
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      })
    } else {
      // Cerrar footer y subir arriba
      setOpen(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
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

  const brands = [
    "Toyota",
    "Chevrolet",
    "Nissan",
    "Ford",
    "Hyundai",
    "Kia",
    "Mazda",
    "Volkswagen",
  ]

  const services = [
    { name: "Envío Gratis", description: "En compras > $200.000", icon: Truck },
    { name: "Garantía", description: "Hasta 2 años", icon: Shield },
    { name: "Pago Seguro", description: "SSL Certificado", icon: CreditCard },
  ]

  return (
    <footer
      ref={footerRef}
      className={`
        fixed left-0 right-0 bottom-0 z-40 bg-black text-white
        transition-transform duration-300 ease-out
        ${open ? "translate-y-0" : "translate-y-[calc(100%-28px)]"}
      `}
    >
      {/* Flecha visible siempre (asomando por arriba del footer) */}
      <button
        onClick={handleArrowClick}
        className="
          absolute -top-6 left-1/2 -translate-x-1/2
          bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg
          transition-all duration-300 hover:scale-110
        "
        aria-label={open ? "Ir arriba" : "Ir al footer"}
      >
        <ArrowUp
          className={`w-6 h-6 transition-transform duration-300 ${
            !open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Banner de servicios */}
      <div className="bg-red-600 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-center md:justify-start gap-3 text-center md:text-left"
              >
                <div className="bg-white/20 p-3 rounded-lg">
                  <service.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{service.name}</h4>
                  <p className="text-red-100 text-sm">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido principal del footer */}
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Información de la empresa */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-600 p-3 rounded-lg">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">RepuStore</h2>
                  <p className="text-gray-400 text-sm">Repuestos para Autos</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Tu tienda de confianza para repuestos automotrices. Más de 15 años brindando calidad y servicio excepcional en Colombia.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-red-500" />
                  <span>+57 (6) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-red-500" />
                  <span>info@repustore.com</span>
                </div>
                <div className="flex items-start gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-red-500 mt-1" />
                  <span>
                    Carrera 23 #45-67
                    <br />
                    Manizales, Caldas
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-5 h-5 text-red-500" />
                  <span>Lun - Sáb: 8:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 border-b-2 border-red-600 pb-2 inline-block">
                Categorías Populares
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex items-center gap-2 text-gray-300 hover:text-red-400 hover:bg-gray-900 p-2 rounded-lg transition-all duration-200"
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="text-sm">{category.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Marcas */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 border-b-2 border-red-600 pb-2 inline-block">
                Marcas Disponibles
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {brands.map((brand, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-gray-300 hover:text-red-400 text-sm py-1 hover:bg-gray-900 px-2 rounded transition-all duration-200"
                  >
                    {brand}
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter & Social */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 border-b-2 border-red-600 pb-2 inline-block">
                Nuestra Ubicación
              </h3>

              <div className="mb-6">
                
                <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-700">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13727.225136246135!2d-64.1674014!3d-31.4375425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432a2c48940c927%3A0xf232f3c423de3538!2sLa%20Casa%20del%20Embrague%20SRL!5e0!3m2!1ses!2sar!4v1693689594024!5m2!1ses!2sar"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
              <div className="flex gap-3">
                <a href="#" className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg">
                  <Facebook className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
                <a href="#" className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg">
                  <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
                <a href="#" className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg">
                  <Twitter className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
                <a href="#" className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg">
                  <Youtube className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-gray-800 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">© 2025 RepuStore. Todos los derechos reservados.</p>
              <p className="text-gray-500 text-xs mt-1">Desarrollado con ❤️ en Manizales, Colombia</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Política de Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Términos de Servicio</a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Garantías</a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Devoluciones</a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">Ayuda</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default RepuStoreFooter
