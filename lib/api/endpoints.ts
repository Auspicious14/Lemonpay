export const ENDPOINTS = {
  AUTH: {
    REQUEST_OTP: "/auth/request-otp",
    REGISTER: "/auth/register",
    VERIFY_OTP: "/auth/verify-otp",
    LOGIN_OTP: "/auth/login-otp",
    PIN_LOGIN: "/auth/pin-login",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },
  USER: {
    SET_PIN: "/user/pin",
  },
  WALLET: {
    BALANCE: "/wallet/balance",
    FUND: "/wallet/fund",
  },
  ESCROW: {
    DETAIL: "/escrow/:id",
    LIST: "/escrow",
  },
} as const;
