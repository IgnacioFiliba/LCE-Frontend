/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { UpdateProfileRequest, UserProfile, UserStats } from "../types/profile-types";
import { userService } from "../services/profile-services";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: any, fallback: string) => {
    const message = err?.message || fallback;
    setError(message);
    toast.error(message);
    console.error("❌ [useProfile] Error:", err);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getCurrentUserProfile();
      setProfile(data);
      // Debug útil
      console.log("🖼 avatarResolved:", data?.avatarResolved);
    } catch (e) {
      handleError(e, "Error al cargar el perfil");
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const updateProfile = useCallback(async (updateData: UpdateProfileRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const updated = await userService.updateUserProfile(updateData);
      setProfile(updated);
      toast.success("Perfil actualizado correctamente");
      return updated;
    } catch (e) {
      handleError(e, "Error al actualizar el perfil");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await userService.getUserStats();
      setStats(s);
    } catch (e) {
      console.warn("⚠️ [useProfile] No se pudieron cargar estadísticas:", e);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [fetchProfile, fetchStats]);

  return {
    profile,
    stats,
    isLoading,
    error,
    updateProfile,
    refetchProfile: fetchProfile,
    refetchStats: fetchStats,
  };
};
