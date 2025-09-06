/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
  Heart,
  User,
  Calendar,
  DollarSign,
  Trash2,
  Eye,
  ShoppingCart,
  SortAsc,
  Search,
  RefreshCcw,
} from "lucide-react";
import { useFavorites } from "@/features/cart/hooks/useFavorites";
import { useCartContext } from "@/features/cart/context";
import OrderDetailModal from "@/features/profile/components/Profile/OrderDetailModal";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(
  /\/$/,
  ""
);

/* ----------------- Helpers para URL absoluta y avatar ----------------- */
const isAbsoluteUrl = (u?: string) => !!u && /^https?:\/\//i.test(u || "");
const toAbsolute = (u?: string) => {
  if (!u) return "";
  if (isAbsoluteUrl(u)) return u;
  const path = String(u).replace(/^\//, "");
  return `${API_BASE}/${path}`;
};

const resolveAvatarFromUser = (user: any): string => {
  if (!user) return "";

  // candidatos más comunes
  const candidates: any[] = [
    user.avatarResolved,
    user.avatarUrl,
    user.picture,
    user.avatar, // puede ser string u objeto
    user.photoURL,
    user.photoUrl,
    user.image,
    user.imgUrl,
    user.profile?.avatarUrl,
    user.profilePicture,
    user.pictureUrl,
  ].filter(Boolean);

  // si avatar vino como objeto (Cloudinary u otro)
  if (user.avatar && typeof user.avatar === "object") {
    candidates.unshift(user.avatar.secure_url, user.avatar.url);
  }

  const raw = candidates.find(Boolean);
  return raw ? toAbsolute(String(raw)) : "";
};
/* --------------------------------------------------------------------- */

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "favorites">("orders");
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Modal de orden
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Favorites
  const {
    favoriteProducts,
    removeFromFavorites,
    isLoading: favoritesLoading,
    error: favoritesError,
    refreshFavorites,
  } = useFavorites();

  // UI favoritos
  const [favQuery, setFavQuery] = useState("");
  const [favSortBy, setFavSortBy] = useState<"recent" | "price" | "name" | "year">(
    "recent"
  );
  const [favSortOrder, setFavSortOrder] = useState<"asc" | "desc">("desc");

  const { addItem: addToCart, isLoading: cartLoading } = useCartContext();

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // UI órdenes
  const [ordQuery, setOrdQuery] = useState("");
  const [ordStatus, setOrdStatus] = useState<
    | "all"
    | "approved"
    | "pending"
    | "processing"
    | "onPreparation"
    | "shipped"
    | "inTransit"
    | "delivered"
    | "cancelled"
    | "returned"
  >("all");
  const [ordSortOrder, setOrdSortOrder] = useState<"asc" | "desc">("desc");

  // Init user
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      // Derivar avatar desde lo que haya en LS
      const avatarResolved = resolveAvatarFromUser(userData);
      const withAvatar = avatarResolved ? { ...userData, avatarResolved } : userData;

      setUser(withAvatar);
      setUserId(userData.id || "");
      setIsInitialized(true);

      // Guardar en LS si logramos resolver avatar
      if (avatarResolved) {
        localStorage.setItem("user", JSON.stringify(withAvatar));
      }
    }
  }, []);

  // Cargar órdenes (y de paso sincronizar usuario desde API)
  const fetchOrders = async () => {
    if (!userId) return;
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("token") || localStorage.getItem("authToken")
          }`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Error al cargar órdenes");

      const userData = await response.json();

      // 1) setear órdenes
      setOrders(userData.orders || []);

      // 2) mezclar usuario de la API con el de estado/LS, resolviendo avatar absoluto
      const nextUser = { ...(user || {}), ...userData };
      const avatarResolved = resolveAvatarFromUser(nextUser);
      if (avatarResolved) nextUser.avatarResolved = avatarResolved;

      setUser(nextUser);

      // 3) actualizar localStorage para que otras vistas (navbar) lo tengan
      const currentLS = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...currentLS, ...nextUser }));
    } catch (error: any) {
      setOrdersError(error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (userId && isInitialized) fetchOrders();
  }, [userId, isInitialized]);

  // Cart
  const handleAddToCart = async (product: any) => {
    if (!product.id || cartLoading) return;
    try {
      await addToCart({ productId: product.id, quantity: 1 });
    } catch (error) {
      console.error("Error agregando al carrito:", error);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    await removeFromFavorites(productId);
  };

  const clearAllFavorites = async () => {
    for (const p of favoriteProducts) {
      // eslint-disable-next-line no-await-in-loop
      await removeFromFavorites(p.id).catch(() => {});
    }
    await refreshFavorites();
  };

  // Helpers
  const getTotalSpent = () =>
    orders.reduce((total, order) => {
      const items = order?.orderDetails?.items ?? order?.orderDetails?.products ?? [];
      const subtotal = items.reduce(
        (sum: number, it: any) =>
          sum + Number(it.quantity || 0) * Number(it.unitPrice ?? it.price ?? 0),
        0
      );
      return total + subtotal;
    }, 0);

  const getOrdersByStatus = (status: string) => orders.filter((o) => o.status === status);
  const totalOrders = orders.length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Package className="w-4 h-4 text-yellow-500" />;
      case "processing":
      case "onPreparation":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "shipped":
      case "inTransit":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "cancelled":
      case "returned":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (s: string) =>
    ({
      approved: "Aprobado",
      pending: "Pendiente",
      processing: "En preparación",
      onPreparation: "En preparación",
      shipped: "En tránsito",
      inTransit: "En tránsito",
      delivered: "Entregado",
      cancelled: "Cancelado",
      returned: "Devuelto",
    }[s] || s);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
      case "onPreparation":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
      case "inTransit":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
      case "returned":
        return "bg-red-100 text-red-800 border-red-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Avatar final (absoluto y con fallback)
  const avatarSrc = resolveAvatarFromUser(user);

  // 🔎 favoritos: filtro + ordenamiento
  const filteredFavorites = useMemo(() => {
    let list = [...favoriteProducts];

    if (favQuery.trim()) {
      const q = favQuery.toLowerCase();
      list = list.filter((p: any) =>
        [p.name, p.brand, p.model].filter(Boolean).some((t) => String(t).toLowerCase().includes(q))
      );
    }

    const cmpStr = (a: string, b: string) => a.localeCompare(b, "es", { sensitivity: "base" });

    list.sort((a: any, b: any) => {
      let diff = 0;
      if (favSortBy === "price") {
        diff = Number(a.price || 0) - Number(b.price || 0);
      } else if (favSortBy === "name") {
        diff = cmpStr(String(a.name || ""), String(b.name || ""));
      } else if (favSortBy === "year") {
        diff = Number(a.year || 0) - Number(b.year || 0);
      } else {
        // recent
        const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
        diff = ta - tb;
      }
      return favSortOrder === "asc" ? diff : -diff;
    });

    return list;
  }, [favoriteProducts, favQuery, favSortBy, favSortOrder]);

  // 📦 Órdenes: filtro + ordenamiento
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      counts[o.status] = (counts[o.status] || 0) + 1;
    }
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (ordStatus !== "all") {
      list = list.filter((o) => o.status === ordStatus);
    }

    if (ordQuery.trim()) {
      const q = ordQuery.toLowerCase();
      list = list.filter((o) => String(o.id || "").toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      const ta = new Date(a.date || a.createdAt || 0).getTime();
      const tb = new Date(b.date || b.createdAt || 0).getTime();
      return ordSortOrder === "asc" ? ta - tb : tb - ta;
    });

    return list;
  }, [orders, ordStatus, ordQuery, ordSortOrder]);

  // Loading inicial
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user || !userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">
            No se encontró información del usuario
          </h3>
          <p className="text-gray-600">Por favor, inicia sesión nuevamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-24 md:pt-28">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white shadow">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={user?.name || user?.email || "Usuario"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/no-avatar.png";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-red-600 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">
                ¡Hola, {user.name || user.email || "Usuario"}!
              </h1>
              <p className="text-gray-600">Bienvenido a tu perfil personal</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center">
              <ShoppingBag className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold text-black">{totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Gastado</p>
                <p className="text-2xl font-bold text-black">
                  ${getTotalSpent().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-pink-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Favoritos</p>
                <p className="text-2xl font-bold text-black">
                  {favoriteProducts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-black">
                  {getOrdersByStatus("approved").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "orders"
                    ? "border-red-600 text-red-600 bg-red-50"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Mis Órdenes
                </div>
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "favorites"
                    ? "border-red-600 text-red-600 bg-red-50"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Favoritos ({favoriteProducts.length})
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* 📦 Órdenes mejoradas */}
            {activeTab === "orders" && (
              <div>
                {/* Toolbar órdenes */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      value={ordQuery}
                      onChange={(e) => setOrdQuery(e.target.value)}
                      placeholder="Buscar por ID de orden"
                      className="w-full pl-9 pr-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={ordStatus}
                      onChange={(e) => setOrdStatus(e.target.value as any)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="approved">Aprobado</option>
                      <option value="pending">Pendiente</option>
                      <option value="processing">En preparación</option>
                      
                    </select>

                    <button
                      onClick={() =>
                        setOrdSortOrder((p) => (p === "asc" ? "desc" : "asc"))
                      }
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white flex items-center gap-1"
                      title={ordSortOrder === "asc" ? "Más antiguas primero" : "Más recientes primero"}
                    >
                      <SortAsc
                        className={`w-4 h-4 ${ordSortOrder === "desc" ? "rotate-180" : ""}`}
                      />
                      {ordSortOrder === "asc" ? "Fecha ↑" : "Fecha ↓"}
                    </button>

                    <button
                      onClick={fetchOrders}
                      className="px-3 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-lg text-sm flex items-center gap-1"
                      title="Actualizar"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Actualizar
                    </button>
                  </div>
                </div>

                {/* Badges de conteo por estado 
                {orders.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      "approved",
                     \
                      "shipped",
                      "inTransit",
                      "delivered",
                      "cancelled",
                      "returned",
                    ].map((s) => {
                      const count = statusCounts[s] || 0;
                      if (count === 0) return null;
                      return (
                        <span
                          key={s}
                          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            s
                          )}`}
                        >
                          {getStatusIcon(s)}
                          {getStatusText(s)}: {count}
                        </span>
                      );
                    })}
                  </div>
                )} */}

                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                    <span className="ml-2 text-gray-600">Cargando órdenes...</span>
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">Error: {ordersError}</p>
                    <button
                      onClick={fetchOrders}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">
                      No se encontraron órdenes
                    </h3>
                    <p className="text-gray-600">
                      Probá cambiando los filtros o realizando tu primera compra.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-black">
                                Orden #{order.id}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusIcon(order.status)}
                                {getStatusText(order.status)}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.date || order.createdAt).toLocaleDateString(
                                  "es-ES",
                                  { year: "numeric", month: "long", day: "numeric" }
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                ID: {String(order.id).substring(0, 8)}...
                              </div>
                              {order?.orderDetails?.items?.length > 0 && (
                                <div className="text-gray-600">
                                  • {order.orderDetails.items.length} ítem
                                  {order.orderDetails.items.length > 1 ? "es" : ""}
                                </div>
                              )}
                            </div>

                            {/* Preview de ítems */}
                            {Array.isArray(order?.orderDetails?.items) &&
                              order.orderDetails.items.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {order.orderDetails.items.slice(0, 3).map((it: any, i: number) => (
                                    <span
                                      key={`${order.id}-${i}`}
                                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                    >
                                      {it.name || it.productName || "Producto"} × {it.quantity}
                                    </span>
                                  ))}
                                  {order.orderDetails.items.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{order.orderDetails.items.length - 3} más
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>

                          <div className="text-right">
                            <button
                              className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                              onClick={() => {
                                setSelectedOrder(order);
                                setOrderModalOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              Ver detalles
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ⭐ Favoritos mejorados */}
            {activeTab === "favorites" && (
              <div>
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      value={favQuery}
                      onChange={(e) => setFavQuery(e.target.value)}
                      placeholder="Buscar en favoritos (nombre, marca, modelo)"
                      className="w-full pl-9 pr-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={favSortBy}
                      onChange={(e) => setFavSortBy(e.target.value as any)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    >
                      <option value="recent">Más recientes</option>
                      <option value="price">Precio</option>
                      <option value="name">Nombre</option>
                      <option value="year">Año</option>
                    </select>
                    <button
                      onClick={() => setFavSortOrder((p) => (p === "asc" ? "desc" : "asc"))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white flex items-center gap-1"
                      title={favSortOrder === "asc" ? "Ascendente" : "Descendente"}
                    >
                      <SortAsc className={`w-4 h-4 ${favSortOrder === "desc" ? "rotate-180" : ""}`} />
                      {favSortOrder === "asc" ? "Asc" : "Desc"}
                    </button>

                    {favoriteProducts.length > 0 && (
                      <button
                        onClick={clearAllFavorites}
                        className="px-3 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-lg text-sm flex items-center gap-1"
                        title="Eliminar todos"
                      >
                        <Trash2 className="w-4 h-4" />
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>

                {favoritesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                    <span className="ml-2 text-gray-600">Cargando favoritos...</span>
                  </div>
                ) : favoritesError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">Error: {favoritesError}</p>
                    <button
                      onClick={refreshFavorites}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : filteredFavorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">
                      No tienes favoritos aún
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Agrega productos a favoritos para verlos aquí.
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                      Explorar Productos
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFavorites.map((product: any) => (
                      <div
                        key={product.id}
                        className="group border border-red-100 rounded-xl p-4 bg-white hover:shadow-md transition-all"
                      >
                        <div className="relative mb-4">
                          <img
                            src={product.imgUrl || "/images/no-image-placeholder.png"}
                            alt={product.name || "Producto"}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveFavorite(product.id)}
                            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full shadow hover:bg-red-50 transition-colors"
                            title="Quitar de favoritos"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>

                          {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold">Sin Stock</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">
                              {product.brand || "—"}
                            </span>
                            {product.model && (
                              <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                {product.model}
                              </span>
                            )}
                          </div>

                          <h3 className="font-semibold text-black line-clamp-2">
                            {product.name || "Producto sin nombre"}
                          </h3>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{product.year || "—"}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold text-red-600">
                              ${Number(product.price || 0).toLocaleString()}
                            </p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${
                                product.stock > 0
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                              }`}
                            >
                              {product.stock > 0 ? `Stock: ${product.stock}` : "Sin stock"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0 || cartLoading}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {cartLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ShoppingCart className="w-4 h-4" />
                          )}
                          {cartLoading
                            ? "Agregando..."
                            : product.stock <= 0
                            ? "Sin Stock"
                            : "Agregar al carrito"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalle de orden */}
      <OrderDetailModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default UserProfile;
