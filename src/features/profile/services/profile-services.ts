/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  UpdateProfileRequest,
  UserProfile,
  UserStats,
} from "../types/profile-types";
import { getApiUrl } from "@/config/urls";

class UserService {
  constructor() {
    if (typeof window !== "undefined") {
      console.log("👤 UserService initialized with baseURL:", getApiUrl());
    }
  }

  /* ---------------------- Helpers de URL / Avatar ---------------------- */
  private isAbsoluteUrl(u?: string) {
    return !!u && /^https?:\/\//i.test(u);
  }

  private toAbsolute(u?: string): string {
    if (!u) return "";
    if (this.isAbsoluteUrl(u)) return u; // http/s ya está OK
    const base = getApiUrl().replace(/\/$/, "");
    const path = String(u).replace(/^\//, "");
    return `${base}/${path}`;
  }

  /** Devuelve la mejor URL de avatar posible (absoluta) */
  private resolveAvatar(user: any): string {
    if (!user) return "";

    // Puede venir en muchos campos. Incluimos `avatar` como string y como objeto.
    const candidates: any[] = [
      user.avatarResolved,
      user.avatarUrl,
      user.avatar,           // 👈 string u objeto
      user.imageUrl,
      user.imgUrl,
      user.pictureUrl,
      user.picture,
      user.photoURL,
      user.photoUrl,
      user.profilePicture,
      user.profile?.avatarUrl,
      user.profile?.photo,
    ];

    // Si avatar es objeto (ej. Cloudinary)
    if (user.avatar && typeof user.avatar === "object") {
      candidates.unshift(user.avatar.secure_url, user.avatar.url);
    }

    // Si avatar es string, ya está incluido en candidates (arriba)
    const raw = candidates.find((v) => !!v);
    return raw ? this.toAbsolute(raw) : "";
  }
  /* -------------------------------------------------------------------- */

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };

    if (includeAuth && typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken");
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = getApiUrl(endpoint);
      const config: RequestInit = {
        headers: { ...this.getHeaders(), ...options.headers },
        credentials: "include",
        ...options,
      };

      const res = await fetch(url, config);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401)
          throw new Error("No estás autenticado. Por favor inicia sesión.");
        if (res.status === 403)
          throw new Error("No tienes permisos para realizar esta acción.");
        if (res.status === 404) throw new Error("Usuario no encontrado.");
        if (res.status === 400) {
          const msg = Array.isArray(errorData.message)
            ? errorData.message.join(", ")
            : errorData.message || "Parámetros inválidos.";
          throw new Error(msg);
        }
        if (res.status >= 500)
          throw new Error("Error del servidor. Intenta de nuevo más tarde.");
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      return (await res.json()) as T;
    } catch (e) {
      console.error(`❌ [USER SERVICE] Error en ${endpoint}:`, e);
      throw e;
    }
  }

  private getUserId(): string {
    if (typeof window === "undefined") throw new Error("No disponible en servidor");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData.id) throw new Error("No se encontró ID de usuario. Por favor inicia sesión.");
    return userData.id;
  }

  /* ---------------------------- API PÚBLICA ---------------------------- */

  async getCurrentUserProfile(): Promise<UserProfile> {
    const userId = this.getUserId();
    const resp = await this.makeRequest<any>(`/users/${userId}`);

    const user: any = resp?.data ?? resp?.user ?? resp ?? {};
    user.avatarResolved = this.resolveAvatar(user);

    // Sincroniza al LS para que el header lo tenga también
    if (typeof window !== "undefined") {
      const current = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...current, ...user }));
    }

    return user as UserProfile;
  }

  async updateUserProfile(updateData: UpdateProfileRequest): Promise<UserProfile> {
    const userId = this.getUserId();
    const resp = await this.makeRequest<any>(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });

    const updated: any = resp?.data ?? resp?.user ?? resp ?? {};
    updated.avatarResolved = this.resolveAvatar(updated);

    if (typeof window !== "undefined") {
      const current = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...current, ...updated }));
    }
    return updated as UserProfile;
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const userId = this.getUserId();
      const resp = await this.makeRequest<any>(`/users/${userId}/stats`);
      return (resp.data ?? resp) as UserStats;
    } catch (e) {
      const fallback: UserStats = { orderCount: 24, favoriteCount: 18, points: 2450 };
      try {
        const orders = await this.getUserOrders(1, 100).catch(() => ({ orders: [], total: 0 }));
        if (orders.orders?.length) fallback.orderCount = orders.total || orders.orders.length;
      } catch { /* noop */ }
      return fallback;
    }
  }

  async getAllUsers(page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(Math.min(limit, 100)),
    });
    const resp = await this.makeRequest<any>(`/users?${params.toString()}`);
    let result = { users: [] as UserProfile[], total: 0, page, totalPages: 1 };
    if (Array.isArray(resp)) {
      result.users = resp; result.total = resp.length;
    } else if (resp?.data) {
      result = { ...result, ...resp.data };
    } else {
      result = { ...result, ...resp };
    }
    return result;
  }

  async deleteUser(userId: string): Promise<{ success: boolean }> {
    if (!userId?.trim()) throw new Error("ID de usuario requerido.");
    const resp = await this.makeRequest<{ success: boolean }>(`/users/${userId.trim()}`, {
      method: "DELETE",
    });
    return resp.success !== undefined ? resp : { success: true };
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    if (!data.currentPassword || !data.newPassword)
      throw new Error("Contraseña actual y nueva son requeridas.");
    if (data.newPassword.length < 6)
      throw new Error("La nueva contraseña debe tener al menos 6 caracteres.");

    const userId = this.getUserId();
    const resp = await this.makeRequest<{ success: boolean }>(`/users/${userId}/password`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return resp.success !== undefined ? resp : { success: true };
  }

  async getUserOrders(page = 1, limit = 10) {
    const userId = this.getUserId();
    const params = new URLSearchParams({
      page: String(page),
      limit: String(Math.min(limit, 100)),
    });
    const resp = await this.makeRequest<any>(`/users/${userId}/orders?${params.toString()}`);
    let result = { orders: [] as any[], total: 0, page, totalPages: 1 };
    if (Array.isArray(resp)) {
      result.orders = resp; result.total = resp.length;
    } else if (resp?.data) {
      result = { ...result, ...resp.data };
    } else if (resp?.orders) {
      result = { ...result, ...resp };
    } else {
      result = { ...result, ...resp };
    }
    return result;
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<UserProfile> {
    if (!userId?.trim()) throw new Error("ID de usuario requerido.");
    const resp = await this.makeRequest<any>(`/users/${userId.trim()}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
    return (resp.data ?? resp.user ?? resp) as UserProfile;
  }

  isAdmin(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u.isAdmin === true || u.isSuperAdmin === true;
    } catch { return false; }
  }

  getCurrentUserData(): any {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch (e) { console.error("❌ [USER SERVICE] LS read error:", e); return {}; }
  }

  clearUserData(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    console.log("🧹 [USER SERVICE] Datos de usuario limpiados");
  }
}

const userService = new UserService();
export { userService };
