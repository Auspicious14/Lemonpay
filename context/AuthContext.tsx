import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useRouter, useSegments, usePathname } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  logout: () => Promise<void>;
  markAsLaunched: () => Promise<void>;
  markPinSetup: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  // 1. Fetch initial tri-states
  useEffect(() => {
    const init = async () => {
      const [launched, pinSetup] = await Promise.all([
        TokenStorage.getHasLaunched(),
        TokenStorage.getPinSetup(),
      ]);
      setHasLaunched(launched ?? false);
      setHasPinSetup(!!pinSetup);
    };
    init();
  }, []);

  // 2. Main session query
  const {
    data: user,
    isLoading: isQueryLoading,
    refetch: checkSession,
  } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const token = await TokenStorage.getToken();
      if (!token) return null;

      try {
        console.log("[PERF] Validating session...");
        const response = await apiClient.post("/auth/me");
        return response.data.data as User;
      } catch (err: any) {
        throw err;
      }
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
      await logout();
    });
    return () => unsubscribe();
  }, [user]);

  const login = async (token: string, userData: User, needsPin?: boolean) => {
    console.log("[AUTH] Login called", { needsPin });
    await TokenStorage.setToken(token);
    if (!needsPin) {
      await markPinSetup();
    }
    queryClient.setQueryData(["session"], { ...userData, needsPin });
  };

  const logout = async () => {
    if (logoutInProgress.current) return;
    logoutInProgress.current = true;
    console.log("[AUTH] Logout initiated (Clearing local state)");

    try {
      // 1. Clear local session first (prioritize UX speed)
      await TokenStorage.clearToken();
      await TokenStorage.clearRefreshToken();
      queryClient.setQueryData(["session"], null);
      queryClient.clear();

      // 2. Clear route (use '/login' instead of '/(auth)/login' for better path matching)
      router.replace("/login");

      // 3. Optional: Notify backend (background)
      apiClient.post("/auth/logout").catch(() => {});
    } finally {
      logoutInProgress.current = false;
    }
  };

  const markAsLaunched = async () => {
    await TokenStorage.setHasLaunched(true);
    setHasLaunched(true);
  };

  const markPinSetup = async () => {
    await TokenStorage.setPinSetup();
    setHasPinSetup(true);
  };

  const updateUser = (updates: Partial<User>) => {
    queryClient.setQueryData(["session"], (old: User | null) => {
      if (!old) return null;
      return { ...old, ...updates };
    });
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
      await checkSession();
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
