import React from "react";
import { View } from "react-native";
import { Typography } from "./Typography";
import { EscrowStatus } from "@/store/useEscrowStore";

interface BadgeProps {
  status: EscrowStatus | "info";
  label?: string;
  className?: string;
}

const statusConfig: Record<
  EscrowStatus | "info",
  { bg: string; text: string; label: string }
> = {
  pending: {
    bg: "bg-accent-warning/20",
    text: "text-accent-warning",
    label: "Pending",
  },
  funded: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Funded" },
  delivered: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    label: "Delivered",
  },
  confirmed: {
    bg: "bg-accent-success/20",
    text: "text-accent-success",
    label: "Confirmed",
  },
  disputed: {
    bg: "bg-accent-danger/20",
    text: "text-accent-danger",
    label: "Disputed",
  },
  released: {
    bg: "bg-accent-success/20",
    text: "text-accent-success",
    label: "Released",
  },
  info: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Info" },
};

export const Badge: React.FC<BadgeProps> = ({
  status,
  label,
  className = "",
}) => {
  const config = statusConfig[status];

  return (
    <View
      className={`
        px-3 py-1 rounded-full self-start
        ${config.bg}
        ${className}
      `}
    >
      <Typography variant="label" className={`${config.text} text-[10px]`}>
        {label || config.label}
      </Typography>
    </View>
  );
};
