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
  DEVICE_TOKENS: {
    REGISTER: "/device-tokens",
    UNREGISTER: "/device-tokens",
  },
  WALLET: {
    BALANCE: "/wallet/balance",
    FUND: "/wallet/fund",
    VERIFY: (ref: string) => `/wallet/verify/${ref}`,
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
    DETAIL: (id: string | number) => `/escrow/${id}`,
    CREATE: "/escrow/",
    SELLER_AGREE: (id: string | number) => `/escrow/${id}/seller-agreement`,
    BUYER_COUNTER: (id: string | number) => `/escrow/${id}/buyer-counter`,
    CONFIRM_AGREE: (id: string | number) => `/escrow/${id}/confirm-agreement`,
    SELLER_CONFIRM: (uuid: string) => `/escrow/${uuid}/seller-confirm`,
    FUND: (id: string | number) => `/escrow/${id}/fund`,
    DELIVER: (id: string | number) => `/escrow/${id}/mark-delivered`,
    CONFIRM_DEL: (id: string | number) => `/escrow/${id}/confirm-delivery`,
  },
  DISPUTES: {
    LIST: "/disputes",
    DETAIL: (uuid: string) => `/disputes/${uuid}`,
    CREATE: "/disputes",
    EVIDENCE: (uuid: string) => `/disputes/${uuid}/evidence`,
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: "/notifications/read-all",
    DELETE: (id: string) => `/notifications/${id}`,
  },
} as const;
