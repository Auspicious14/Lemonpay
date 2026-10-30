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
    DETAIL: (uuid: string) => `/escrow/${uuid}`,
    CREATE: "/escrow",
    CLAIM: (uuid: string) => `/escrow/${uuid}/claim`,
    SELLER_AGREE: (uuid: string) => `/escrow/${uuid}/seller-agreement`,
    BUYER_COUNTER: (uuid: string) => `/escrow/${uuid}/buyer-counter`,
    CONFIRM_AGREE: (uuid: string) => `/escrow/${uuid}/confirm-agreement`,
    ACCEPT_AND_PAY: (uuid: string) => `/escrow/${uuid}/accept-and-pay`,
    FUND: (uuid: string) => `/escrow/${uuid}/fund`,
    HANDOVER: (uuid: string) => `/escrow/${uuid}/handover`,
    RESET_HANDOVER_CODE: (uuid: string) => `/escrow/${uuid}/handover-code/reset`,
    DELIVER: (uuid: string) => `/escrow/${uuid}/mark-delivered`,
    CONFIRM_DEL: (uuid: string) => `/escrow/${uuid}/confirm-delivery`,
    REFUND: (uuid: string) => `/escrow/${uuid}/refund`,
  },
  VERIFY_CODE: (code: string) => `/verify/${encodeURIComponent(code)}`,
  DISPUTES: {
    LIST: "/disputes",
    DETAIL: (uuid: string) => `/disputes/${uuid}`,
    CREATE: "/disputes",
    MESSAGES: (uuid: string) => `/disputes/${uuid}/messages`,
    PROPOSALS: (uuid: string) => `/disputes/${uuid}/proposals`,
    ACCEPT_PROPOSAL: (uuid: string, proposalUuid: string) =>
      `/disputes/${uuid}/proposals/${proposalUuid}/accept`,
    REJECT_PROPOSAL: (uuid: string, proposalUuid: string) =>
      `/disputes/${uuid}/proposals/${proposalUuid}/reject`,
    ESCALATE: (uuid: string) => `/disputes/${uuid}/escalate`,
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: "/notifications/read-all",
    DELETE: (id: string) => `/notifications/${id}`,
  },
} as const;
