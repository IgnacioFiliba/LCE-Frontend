// hooks/useLoginGoogle.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // 🔥 Para Next.js App Router (v13+)
import { AuthState } from '../types/login-google';
import { googleAuthService } from '../services/service-google';
// import { useRouter } from 'next/router'; // Para Next.js Pages Router
// import { useNavigate } from 'react-router-dom'; // Para React Router


export const useGoogleAuth = () => {
  const router = useRouter(); // Para Next.js App Router
  // const router = useRouter(); // Para Next.js Pages Router
  // const navigate = useNavigate(); // Para React Router
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Inicializar estado desde localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = googleAuthService.getStoredToken();
        
        if (storedToken) {
          // Verificar si el token es válido obteniendo el perfil
          const userProfile = await googleAuthService.getUserProfile();
          
          setAuthState({
            user: userProfile,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error inicializando auth:', error);
        // Token inválido, limpiar localStorage
        googleAuthService.logout();
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Sesión expirada',
        });
      }
    };

    initializeAuth();
  }, []);

  // Manejar callback de Google (cuando regresa de Google OAuth)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setAuthState(prev => ({
        ...prev,
        error: 'Error en autenticación con Google',
        isLoading: false,
      }));
      return;
    }

    if (code && !authState.isAuthenticated) {
      handleGoogleCallback(code);
    }
  }, []);

  const handleGoogleCallback = useCallback(async (code: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await googleAuthService.handleGoogleCallback(code);
      
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Limpiar URL de parámetros de OAuth
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // 🚀 Redirigir a home después del login exitoso
      router.push('/home'); // Para Next.js App Router
      // router.push('/home'); // Para Next.js Pages Router
      // navigate('/home'); // Para React Router
      
    } catch (error) {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error en autenticación',
      });
    }
  }, [authState.isAuthenticated, router]);

  const login = useCallback(() => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    googleAuthService.initiateGoogleAuth();
  }, []);

  const logout = useCallback(() => {
    googleAuthService.logout();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    
    // 🏠 Opcional: Redirigir al login o página principal después del logout
    // router.push('/'); // Descomenta si quieres redirigir después del logout
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const newToken = await googleAuthService.refreshAccessToken();
      setAuthState(prev => ({
        ...prev,
        token: newToken,
        error: null,
      }));
      return newToken;
    } catch (error) {
      logout(); // Si no se puede refrescar, cerrar sesión
      throw error;
    }
  }, [logout]);

  return {
    ...authState,
    login,
    logout,
    refreshToken,
  };
};