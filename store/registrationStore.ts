import { create } from "zustand";

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
}

interface RegistrationState {
  // Step 1 — Personal Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;

  // Step 2 — Account Selection
  accountType: "buyer" | "seller" | null;

  // Step 3 — OTP
  otp: string;

  // Actions
  setPersonalDetails: (data: RegistrationData) => void;
  setAccountType: (type: "buyer" | "seller") => void;
  setOtp: (otp: string) => void;
  reset: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dob: "",
  accountType: null,
  otp: "",

  setPersonalDetails: (data) => set((state) => ({ ...state, ...data })),
  setAccountType: (type) => set({ accountType: type }),
  setOtp: (otp) => set({ otp }),
  reset: () =>
    set({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dob: "",
      accountType: null,
      otp: "",
    }),
}));
