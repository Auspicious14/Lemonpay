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
  TRANSACTIONS: {
    LIST: "/transactions",
    LEDGER: "/transactions/ledger-balance",
  },
  BANKS: {
    LIST: "/banks",
    ACCOUNTS: "/bank-accounts",
    VERIFY: "/bank-accounts/verify",
  },
  WITHDRAW: "/withdraw",
  ESCROW: {
    MY_ESCROWS: "/escrow/my-escrows",
    DETAIL: (id: number) => `/escrow/${id}`,
    CREATE: "/escrow/",
    SELLER_AGREE: (id: number) => `/escrow/${id}/seller-agreement`,
    CONFIRM_AGREE: (id: number) => `/escrow/${id}/confirm-agreement`,
    FUND: (id: number) => `/escrow/${id}/fund`,
    DELIVER: (id: number) => `/escrow/${id}/mark-delivered`,
    CONFIRM_DEL: (id: number) => `/escrow/${id}/confirm-delivery`,
  },
  DISPUTES: {
    LIST: "/disputes",
    DETAIL: (uuid: string) => `/disputes/${uuid}`,
    CREATE: "/disputes",
  },
  NOTIFICATIONS: {
    LIST: "/notifications/",
    READ: (id: string) => `/notifications/${id}/read`,
  },
} as const;
