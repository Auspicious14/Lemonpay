import AsyncStorage from '@react-native-async-storage/async-storage'

const KEYS = {
  ACCESS_TOKEN: 'lemonpay_access_token',
  HAS_LAUNCHED: 'lemonpay_has_launched',
  PIN_SETUP:    'lemonpay_pin_setup',
  SAVED_EMAIL:  'lemonpay_saved_email',
  USER_DATA:    'lemonpay_user_data',
} as const

export const TokenStorage = {
  // TOKEN
  saveToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token)
    console.log('[STORAGE] saveToken: saved')
  },

  getToken: async (): Promise<string | null> => {
    const token = await AsyncStorage.getItem(KEYS.ACCESS_TOKEN)
    console.log('[STORAGE] getToken:', token ? 'EXISTS' : 'NULL')
    return token
  },

  // USER
  saveUser: async (user: object): Promise<void> => {
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(user))
    console.log('[STORAGE] saveUser:', (user as any).email)
  },

  getUser: async (): Promise<object | null> => {
    const raw = await AsyncStorage.getItem(KEYS.USER_DATA)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  clearUser: async (): Promise<void> => {
    await AsyncStorage.removeItem(KEYS.USER_DATA)
  },

  // LAUNCHED
  getHasLaunched: async (): Promise<string | null> => {
    return AsyncStorage.getItem(KEYS.HAS_LAUNCHED)
  },

  setHasLaunched: async (): Promise<void> => {
    await AsyncStorage.setItem(KEYS.HAS_LAUNCHED, 'true')
  },

  // PIN
  getPinSetup: async (): Promise<string | null> => {
    return AsyncStorage.getItem(KEYS.PIN_SETUP)
  },

  setPinSetup: async (): Promise<void> => {
    await AsyncStorage.setItem(KEYS.PIN_SETUP, 'true')
  },

  // EMAIL
  getSavedEmail: async (): Promise<string | null> => {
    return AsyncStorage.getItem(KEYS.SAVED_EMAIL)
  },

  setSavedEmail: async (email: string): Promise<void> => {
    await AsyncStorage.setItem(KEYS.SAVED_EMAIL, email)
  },

  // CLEAR — clears token + user only, not hasLaunched or email
  clearTokens: async (): Promise<void> => {
    await AsyncStorage.multiRemove([
      KEYS.ACCESS_TOKEN,
      KEYS.USER_DATA,
    ])
    console.log('[STORAGE] clearTokens: done')
  },
}
