import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { useAuth } from "@/context/AuthContext";
import { LoginResponse, RegisterResponse, ApiResponse } from "@/types/api";

export const extractMessage = (error: any) => {
  const data = error.response?.data;
  if (data?.errors) {
    const firstKey = Object.keys(data.errors)[0];
    const firstError = data.errors[firstKey];
    return Array.isArray(firstError) ? firstError[0] : firstError;
  }
  return data?.message || error.message || "Something went wrong";
};

export const useRequestOtp = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      console.log(`[AUTH] Requesting OTP for: ${email}`);
      const response = await apiClient.post(ENDPOINTS.AUTH.REQUEST_OTP, {
        email,
      });
      return response.data.message;
    },
    onError: (error: any) => {
      console.error(
        "[AUTH] OTP Request Hook Error:",
        error.response?.data || error.message,
      );
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: {
      email: string;
      first_name: string;
      last_name: string;
      account_type: "buyer" | "seller";
      phone_no: string;
      dob: string;
      otp: string;
    }) => {
      const response = await apiClient.post<RegisterResponse>(
        ENDPOINTS.AUTH.REGISTER,
        data,
      );
      console.log("[AUTH] Register Success Response:", response.data);
      return response.data.data;
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, data);
      return response.data;
    },
  });
};

export const useLoginOtp = () => {
  const { login } = useAuth();
  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        ENDPOINTS.AUTH.LOGIN_OTP,
        data,
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user, !data.user.email_verified_at);
    },
  });
};

export const useSetPin = () => {
  const { markPinSetup } = useAuth();
  return useMutation({
    mutationFn: async (pin: string) => {
      const response = await apiClient.post(ENDPOINTS.USER.SET_PIN, { pin });
      return response.data;
    },
    onSuccess: () => {
      markPinSetup();
    },
  });
};

export const usePinLogin = () => {
  const { login } = useAuth();
  return useMutation({
    mutationFn: async (data: { email: string; pin: string }) => {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        ENDPOINTS.AUTH.PIN_LOGIN,
        data,
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
    },
  });
};
