import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useRouter, useSegments, usePathname } from "expo-router";
import { useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import { TokenStorage } from "../lib/storage";
import { apiClient } from "../lib/api/client";
import { appEvents } from "../lib/api/event-emitter";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  account_type: "buyer" | "seller";
  phone_no: string;
  dob: string;
  email_verified_at: string | null;
  referral_code: string | null;
  pin_locked_until: string | null;
  created_at: string;
  updated_at: string;
  needsPin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasLaunched: boolean | null;
  hasPinSetup: boolean | null;
  login: (token: string, user: User, needsPin?: boolean) => Promise<void>;
  logout: (reason?: string) => Promise<void>;
  markAsLaunched: () => Promise<void>;
  markPinSetup: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// At the top of the file, outside the component:
let queryClientRef: QueryClient | null = null;
let backgroundValidationTimer: ReturnType<typeof setTimeout> | null = null;

const validateSessionInBackground = (
  token: string,
  currentUser: object | null,
) => {
  // Debounce — don't fire multiple times in quick succession
  if (backgroundValidationTimer) {
    clearTimeout(backgroundValidationTimer);
  }
  backgroundValidationTimer = setTimeout(async () => {
  try {
    console.log('[SESSION-BG] Attempting /auth/me...')
    const response = await apiClient.get('/auth/me')
    
    const freshUser =
      response.data?.data?.user ??
      response.data?.data ??
      response.data

    if (!freshUser?.id) {
      console.log('[SESSION-BG] /auth/me returned no valid user object, skipping')
      return
    }

    console.log('[SESSION-BG] /auth/me success:', freshUser.email)
    await TokenStorage.saveUser(freshUser)
    queryClientRef?.setQueryData(['user-session'], freshUser)
    console.log('[SESSION-BG] User data refreshed from server')

  } catch (error: any) {
    const status = error.response?.status

    if (status === 404) {
      console.log('[SESSION-BG] /auth/me 404 — endpoint not ready, keeping stored user')
      return  // graceful, no crash, no logout
    }
    if (status === 401) {
      console.log('[SESSION-BG] /auth/me 401 — token expired, logging out')
      await TokenStorage.clearTokens()
      queryClientRef?.setQueryData(['user-session'], null)
      queryClientRef?.clear()
      appEvents.emit('session-expired')
      return
    }
    if (status === 403) {
      console.log('[SESSION-BG] /auth/me 403 — forbidden, logging out')
      await TokenStorage.clearTokens()
      queryClientRef?.setQueryData(['user-session'], null)
      appEvents.emit('session-expired')
      return
    }
    // Network error, 500, timeout — keep session, don't crash
    console.log('[SESSION-BG] /auth/me non-auth error, keeping session:', error.message)
  }
}, 2000)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hasLaunched, setHasLaunched] = useState<boolean | null>(null);
  const [hasPinSetup, setHasPinSetup] = useState<boolean | null>(null);
  const [intendedDestination, setIntendedDestination] = useState<string | null>(
    null,
  );
  const logoutInProgress = useRef(false);

  const queryClient = useQueryClient();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    queryClientRef = queryClient;
    return () => {
      queryClientRef = null;
    };
  }, [queryClient]);

  // 1. Fetch initial tri-states
  useEffect(() => {
    const init = async () => {
      const [launched, pinSetup] = await Promise.all([
        TokenStorage.getHasLaunched(),
        TokenStorage.getPinSetup(),
      ]);
      setHasLaunched(launched === "true");
      setHasPinSetup(pinSetup === "true");
    };
    init();
  }, []);

  // 2. Main session query
  const {
    data: user,
    isLoading: isQueryLoading,
    refetch: checkSession,
  } = useQuery({
    queryKey: ["user-session"],
    queryFn: async () => {
      console.log("[SESSION] Starting...");
      const start = Date.now();

      // Step 1: Check token exists
      const token = await TokenStorage.getToken();
      if (!token) {
        console.log("[SESSION] No token — guest");
        return null;
      }

      // Step 2: Restore user from AsyncStorage immediately
      // This ensures the app loads instantly on restart
      const storedUser = (await TokenStorage.getUser()) as User | null;
      console.log(
        "[SESSION] Stored user:",
        storedUser ? storedUser.email : "none",
      );

      // Step 3: Attempt /auth/me silently in background
      // This automatically activates when backend adds the endpoint
      validateSessionInBackground(token, storedUser);

      // Step 4: Return stored user immediately
      // App shows tabs without waiting for /auth/me
      if (storedUser) {
        console.log(`[SESSION] Restored in ${Date.now() - start}ms`);
        return storedUser;
      }

      // Step 5: Has token but no stored user
      // This only happens if storage was partially cleared
      // Wait for background validation to complete
      console.log(
        "[SESSION] Token exists but no stored user — waiting for validation",
      );
      return null;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isLoading =
    isQueryLoading || hasLaunched === null || hasPinSetup === null;
  const isAuthenticated = !!user;

  // 3. Auth Guard Logic
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";
    const rootSegment = segments[0];
    const isIndex = pathname === "/" || pathname === "";

    const publicRoutes = ["login", "register", "verify-otp", "pin-login"];
    const currentRoute = segments[segments.length - 1];
    const isPublic = publicRoutes.includes(currentRoute) || inOnboarding;

    console.log(
      `[AUTH-GUARD] Path: ${pathname}, Auth: ${isAuthenticated}, Launched: ${hasLaunched}, PinSetup: ${hasPinSetup}`,
    );

    // CASE A — Not logged in, accessing private route
    if (
      !isAuthenticated &&
      !isPublic &&
      !inAuthGroup &&
      !inOnboarding &&
      !isIndex
    ) {
      console.log("[AUTH-GUARD] CASE A: Redirecting to login");
      setIntendedDestination(pathname);
      router.replace("/(auth)/login");
      return;
    }

    // CASE B — Not logged in, check onboarding/login
    if (!isAuthenticated) {
      if (hasLaunched === false && !inOnboarding) {
        console.log("[AUTH-GUARD] CASE B1: New user, showing onboarding");
        router.replace("/onboarding");
      } else if (hasLaunched === true && inOnboarding) {
        console.log("[AUTH-GUARD] CASE B2: Already launched, going to login");
        router.replace("/(auth)/login");
      }
      return;
    }

    // CASE C — Authenticated
    if (isAuthenticated) {
      // Priority 1: PIN Setup check (new logic)
      if (user.needsPin && rootSegment !== "pin-setup") {
        console.log("[AUTH-GUARD] CASE C1: PIN setup required");
        router.replace("/pin-setup");
        return;
      }

      // Priority 2: Redirect completed user away from public screens
      if (!user.needsPin) {
        if (isPublic || inAuthGroup || inOnboarding || isIndex) {
          console.log("[AUTH-GUARD] CASE C2: Redirecting to home/intended");
          if (intendedDestination) {
            const dest = intendedDestination;
            setIntendedDestination(null);
            router.replace(dest as any);
          } else {
            router.replace("/home");
          }
        }
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    segments,
    pathname,
    user,
    hasLaunched,
    hasPinSetup,
  ]);

  // 4. Session Expired Listener
  useEffect(() => {
    const unsubscribe = appEvents.on("session-expired", async () => {
      if (logoutInProgress.current) return;
      console.log("[AUTH] Session expired, logging out...");
      await logout("expired");
    });
    return () => unsubscribe();
  }, [user]);

  const login = async (token: string, user: User, needsPin?: boolean) => {
    const start = Date.now();
    console.log("[AUTH] login() — saving session");

    const userData = { ...user, needsPin: needsPin ?? false };

    // Save to AsyncStorage first — critical for persistence
    await TokenStorage.saveToken(token);
    await TokenStorage.saveUser(userData);

    console.log("[AUTH] session saved to AsyncStorage");

    // Update React Query cache
    queryClient.setQueryData(["user-session"], userData);

    // Invalidate after short delay to avoid race condition
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
    }, 300);

    console.log(`[AUTH] login() done in ${Date.now() - start}ms`);
  };

  const logout = async (reason?: string) => {
    if (logoutInProgress.current) return;
    logoutInProgress.current = true;
    console.log("[AUTH] logout — reason:", reason || "none");

    // Cancel any pending background validation
    if (backgroundValidationTimer) {
      clearTimeout(backgroundValidationTimer);
      backgroundValidationTimer = null;
    }

    try {
      const token = await TokenStorage.getToken();
      if (token) {
        await apiClient.post("/auth/logout");
      }
    } catch (error) {
      // Always clear locally even if API fails
      console.error("[AUTH] logout API error (ignored):", error);
    } finally {
      await TokenStorage.clearTokens();
      queryClient.setQueryData(["user-session"], null);
      queryClient.clear();

      if (reason === "expired") {
        router.replace("/(auth)/login?message=session_expired");
      } else {
        router.replace("/(auth)/login");
      }

      logoutInProgress.current = false;
    }
  };

  const markAsLaunched = async () => {
    await TokenStorage.setHasLaunched();
    setHasLaunched(true);
  };

  const markPinSetup = async () => {
    await TokenStorage.setPinSetup();
    setHasPinSetup(true);
  };

  const updateUser = async (updates: Partial<User>) => {
    const current = queryClient.getQueryData<User>(["user-session"]);
    if (!current) return;
    const updated = { ...current, ...updates };
    queryClient.setQueryData(["user-session"], updated);
    await TokenStorage.saveUser(updated);
    console.log("[AUTH] updateUser saved");
  };

  const value = {
    user: user || null,
    isLoading,
    isAuthenticated,
    hasLaunched,
    hasPinSetup,
    login,
    logout,
    markAsLaunched,
    markPinSetup,
    updateUser,
    checkSession: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-session"] });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
