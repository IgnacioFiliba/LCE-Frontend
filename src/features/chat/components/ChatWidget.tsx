/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from "lucide-react"

type Msg = {
  role: "user" | "bot" | "system"
  text: string
  ts: number
}

type ChatWidgetProps = {
  apiUrl?: string
  title?: string
  welcome?: string
}

const LS_KEY = "chat-history-v1"

export default function ChatWidget({
  apiUrl,
  title = "Asistente",
  welcome = "¡Hola! Puedo buscar productos por nombre/marca, revisar el estado de una orden y más. ¿En qué te ayudo?",
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const viewportRef = useRef<HTMLDivElement>(null)

  // Detectar URL del backend
  const baseUrl = useMemo(() => {
    const vite = (import.meta as any)?.env?.VITE_API_URL
    const next = process?.env?.NEXT_PUBLIC_API_URL
    return apiUrl || vite || next || ""
  }, [apiUrl])

  // Cargar historial
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setMessages(JSON.parse(raw))
      else
        setMessages([
          { role: "bot", text: welcome, ts: Date.now() },
          { role: "system", text: "tips", ts: Date.now() },
        ])
    } catch {
      /* noop */
    }
  }, [welcome])

  // Guardar historial
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(messages))
    } catch {
      /* noop */
    }
  }, [messages])

  // Autoscroll
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, sending, open])

  // Sugerencias rápidas (chips)
  const suggestions = React.useMemo(
    () => [
      "¿Tenés aceite 5W40 en stock?",
      "Mostrar mis últimas compras",
      "Estado de la orden 6c8eed78-a640-48fc-a6d7-8002f8bd2720",
      "Precio de filtros Mann",
    ],
    []
  )

  const doSend = async (text: string) => {
    const content = text.trim()
    if (!content || sending) return

    setError(null)
    setSending(true)
    setMessages((m) => [...m, { role: "user", text: content, ts: Date.now() }])

    const token = (() => {
      try {
        return localStorage.getItem("token") || ""
      } catch {
        return ""
      }
    })()

    try {
      const res = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ message: content }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const reply = data?.reply ?? "No obtuve respuesta."
      setMessages((m) => [...m, { role: "bot", text: reply, ts: Date.now() }])
    } catch (e: any) {
      setError("Ups, hubo un error al enviar tu mensaje.")
      setMessages((m) => [
        ...m,
        { role: "bot", text: "No pude procesar eso. ¿Probamos de nuevo?", ts: Date.now() },
      ])
    } finally {
      setSending(false)
      setInput("")
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
        onClick={() => setOpen((v) => !v)}
        className={[
          "fixed bottom-6 right-6 z-50 rounded-full p-4 text-white",
          "bg-red-600 shadow-lg shadow-red-300/40",
          "transition-all duration-200 ease-out",
          "hover:bg-red-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-200",
        ].join(" ")}
      >
        {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className={[
            "fixed bottom-24 right-6 z-50 w-[92vw] max-w-sm rounded-2xl border overflow-hidden",
            "bg-white border-black/10",
            "shadow-2xl shadow-black/20",
            // animación de entrada
            "transition-all duration-200 ease-out translate-y-2 opacity-0",
          ].join(" ")}
          // montar con pequeña animación
          style={{
            animation: "chatEnter 180ms ease-out forwards",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 bg-white/70 backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-600 text-white shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold leading-tight text-black">{title}</h3>
                <p className="text-xs text-black/60">Respuestas basadas en tu base de datos</p>
              </div>
            </div>
            <button
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4 text-black" />
            </button>
          </div>

          {/* Mensajes */}
          <div
            ref={viewportRef}
            className="h-80 overflow-y-auto px-3 py-3 space-y-2 bg-white"
          >
            {messages.map((m, i) =>
              m.role === "system" ? (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-black/60 justify-center my-2"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Tip: probá “¿Tenés aceite Helix?” o “Mis últimas compras”.</span>
                </div>
              ) : (
                <div key={i} className={m.role === "user" ? "text-right" : ""}>
                  <span
                    className={[
                      "inline-flex items-start gap-2 max-w-[85%] px-3 py-2 rounded-2xl text-sm",
                      "transition-transform duration-150 will-change-transform",
                      m.role === "user"
                        ? "bg-black text-white shadow-sm"
                        : "bg-white border border-black/10 text-black",
                      "hover:-translate-y-0.5",
                    ].join(" ")}
                  >
                    {m.role === "user" ? (
                      <User className="w-4 h-4 mt-0.5 opacity-80" />
                    ) : (
                      <Bot className="w-4 h-4 mt-0.5 opacity-80 text-red-600" />
                    )}
                    <span className="whitespace-pre-wrap break-words">{m.text}</span>
                  </span>
                </div>
              )
            )}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-black/60">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Escribiendo…</span>
              </div>
            )}
          </div>

          {/* Sugerencias */}
          <div className="px-3 pt-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => doSend(s)}
                className={[
                  "text-xs px-2 py-1 rounded-full border",
                  "border-red-200 bg-white text-black",
                  "transition-all duration-150",
                  "hover:bg-red-50 hover:border-red-300 hover:-translate-y-0.5",
                  "focus:outline-none focus:ring-2 focus:ring-red-200",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 border-t border-black/10 bg-white flex gap-2">
            <input
              className={[
                "flex-1 border rounded-xl px-3 py-2 text-sm",
                "border-black/15 text-black placeholder:text-black/40",
                "focus:outline-none focus:ring-2 focus:ring-red-400",
                "transition-colors",
              ].join(" ")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu pregunta…"
              onKeyDown={(e) => e.key === "Enter" && doSend(input)}
              disabled={sending}
              aria-label="Mensaje"
            />
            <button
              onClick={() => doSend(input)}
              disabled={sending || !input.trim()}
              className={[
                "px-3 py-2 rounded-xl text-white",
                "bg-red-600 hover:bg-red-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-150",
                "hover:scale-[1.03] active:scale-95",
                "shadow-md shadow-red-300/30",
                "focus:outline-none focus:ring-4 focus:ring-red-200",
              ].join(" ")}
              aria-label="Enviar"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-2 text-xs text-red-700 bg-red-50 border-t border-red-200">
              {error}
            </div>
          )}
        </div>
      )}

      {/* pequeña keyframe para entrada */}
      <style jsx global>{`
        @keyframes chatEnter {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}
