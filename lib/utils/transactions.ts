import { TransactionType } from "@/types/api"

export interface Transaction {
  id: number
  type: "credit" | "debit"
  amount: string
  description: string
  status: string
  reference: string
  paystack_transfer_code: string | null
  paystack_reference: string | null
  escrow_id: string | null
  context: string | null
  created_at: string
  updated_at: string
}

export const getTxType = (tx: Transaction): TransactionType => {
  // Context field is the most reliable signal (backend-set)
  if (tx.context === "escrow_fund_debit")    return "escrow_debit"
  if (tx.context === "escrow_fund_credit")   return "escrow_credit"
  if (tx.context === "escrow_release")       return "escrow_credit"
  if (tx.context?.startsWith("escrow"))      return tx.type === "credit" ? "escrow_credit" : "escrow_debit"

  // escrow_id present = escrow transaction
  if (tx.escrow_id) {
    return tx.type === "credit" ? "escrow_credit" : "escrow_debit"
  }

  // Debit with transfer code = bank withdrawal
  if (tx.type === "debit" && tx.paystack_transfer_code) return "withdrawal"

  // Credit with "Payment initiation" description = wallet top-up
  if (tx.type === "credit") return "wallet_fund"

  // Generic debit fallback
  return "debit"
}

export const getTxDisplayTitle = (tx: Transaction): string => {
  if (tx.context === "escrow_fund_debit")  return "Escrow Funded"
  if (tx.context === "escrow_fund_credit") return "Escrow Released"
  if (tx.context === "escrow_release")     return "Funds Released"
  if (tx.context?.startsWith("escrow"))    return "Escrow Transaction"
  if (tx.paystack_transfer_code)           return "Bank Withdrawal"
  if (tx.type === "credit")                return "Wallet Top-up"
  return tx.description || "Transaction"
}

export const getTxSubtitle = (tx: Transaction, formatDate: (d: string) => string): string => {
  const ref = tx.reference.substring(0, 8).toUpperCase()
  const date = formatDate(tx.created_at)
  
  if (tx.escrow_id) {
    return `Escrow • ${ref} • ${date}`
  }
  if (tx.paystack_transfer_code) {
    return `Bank Transfer • ${ref} • ${date}`
  }
  return `Wallet • ${ref} • ${date}`
}