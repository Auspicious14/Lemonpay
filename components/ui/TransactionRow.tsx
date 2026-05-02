import React from "react"
import { View, Text } from "react-native"
import {
  ArrowDownLeft,   // wallet top-up (money in)
  ArrowUpRight,    // withdrawal (money out)
  ShieldCheck,     // escrow released (money in from escrow)
  ShieldOff,       // escrow funded (money locked)
  Wallet,          // generic debit
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react-native"
import { TransactionType } from "@/types/api"

interface TransactionRowProps {
  type: TransactionType
  title: string
  subtitle: string
  amount: number
  isCredit: boolean
  status: string // "completed" | "pending" | "failed"
}

// ─── Icon + background config per type ───────────────────────────────────────
const TYPE_CONFIG: Record<TransactionType, { bg: string; iconColor: string; Icon: any }> = {
  wallet_fund: {
    bg: "rgba(0,200,150,0.12)",
    iconColor: "#00C896",
    Icon: ArrowDownLeft,
  },
  withdrawal: {
    bg: "rgba(255,77,79,0.12)",
    iconColor: "#FF4D4F",
    Icon: ArrowUpRight,
  },
  escrow_debit: {
    bg: "rgba(245,230,66,0.10)",
    iconColor: "#F5E642",
    Icon: ShieldOff,
  },
  escrow_credit: {
    bg: "rgba(0,200,150,0.12)",
    iconColor: "#00C896",
    Icon: ShieldCheck,
  },
  debit: {
    bg: "rgba(139,148,158,0.10)",
    iconColor: "#8B949E",
    Icon: Wallet,
  },
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  completed: { color: "#00C896", label: "COMPLETED", Icon: CheckCircle },
  pending:   { color: "#F5E642", label: "PENDING",   Icon: Clock },
  failed:    { color: "#FF4D4F", label: "FAILED",    Icon: XCircle },
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  type,
  title,
  subtitle,
  amount,
  isCredit,
  status,
}) => {
  const typeConfig   = TYPE_CONFIG[type] ?? TYPE_CONFIG.debit
  const statusKey    = (status?.toLowerCase() ?? "completed") as keyof typeof STATUS_CONFIG
  const statusConfig = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.completed
  const { Icon: TypeIcon } = typeConfig
  const { Icon: StatusIcon } = statusConfig

  // Amount display rules:
  // failed   → red, no prefix
  // pending  → muted yellow, show prefix
  // credit   → teal, + prefix
  // debit    → white, - prefix
  const getAmountStyle = (): { color: string; prefix: string } => {
    if (statusKey === "failed")  return { color: "#FF4D4F", prefix: "" }
    if (statusKey === "pending") return { color: "#F5E642", prefix: isCredit ? "+" : "-" }
    return {
      color:  isCredit ? "#00C896" : "white",
      prefix: isCredit ? "+" : "-",
    }
  }

  const { color: amountColor, prefix } = getAmountStyle()

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
      }}
    >
      {/* ── Icon ──────────────────────────────────────────────────────── */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: typeConfig.bg,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <TypeIcon size={20} color={typeConfig.iconColor} />
      </View>

      {/* ── Title + subtitle ──────────────────────────────────────────── */}
      <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
        <Text
          style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 14 }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: "Inter",
            color: "#8B949E",
            fontSize: 11,
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>

      {/* ── Amount + status ───────────────────────────────────────────── */}
      <View style={{ alignItems: "flex-end", flexShrink: 0 }}>
        <Text
          style={{
            fontFamily: "Inter-Bold",
            fontSize: 14,
            color: amountColor,
          }}
        >
          {prefix}₦{amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
            marginTop: 3,
          }}
        >
          <StatusIcon size={9} color={statusConfig.color} />
          <Text
            style={{
              fontFamily: "Inter-Bold",
              fontSize: 9,
              color: statusConfig.color,
              letterSpacing: 0.6,
            }}
          >
            {statusConfig.label}
          </Text>
        </View>
      </View>
    </View>
  )
}