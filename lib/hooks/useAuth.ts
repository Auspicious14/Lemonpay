import { useMutation } from "@tanstack/react-query";
import api from "../api";
import { useAuthStore } from "../../store/useAuthStore";
import { useToastStore } from "../../store/useToastStore";

export const useAuth = () => {
  const { login: setLogin, logout: setLogout } = useAuthStore();
  const { show: showToast } = useToastStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setLogin(data.user, data.token);
      showToast("Login successful", "success");
    },
    onError: (error: any) => {
      showToast(error.message || "Login failed", "error");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await api.post("/auth/register", userData);
      return response.data;
    },
    onSuccess: () => {
      showToast("Registration successful", "success");
    },
    onError: (error: any) => {
      showToast(error.message || "Registration failed", "error");
    },
  });

  return {
    login: loginMutation,
    register: registerMutation,
    logout: setLogout,
  };
};
