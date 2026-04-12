import React from "react";
import { View, Text } from "react-native";
import { Check, Hourglass, Ban, ArrowUpRight } from "lucide-react-native";

export type TransactionType =
  | "released"
  | "funded"
  | "disputed"
  | "wallet_fund";

interface TransactionRowProps {
  type: TransactionType;
  title: string;
  subtitle: string;
  amount: number;
  isCredit: boolean;
  status: string;
  statusColor: "success" | "pending" | "danger";
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  type,
  title,
  subtitle,
  amount,
  isCredit,
  status,
  statusColor,
}) => {
  const getIcon = () => {
    switch (type) {
      case "released":
        return {
          bg: "bg-secondary-container/20",
          color: "#00C896",
          icon: <Check size={18} color="#00C896" />,
        };
      case "funded":
        return {
          bg: "bg-accent-primary/20",
          color: "#F5E642",
          icon: <Hourglass size={18} color="#F5E642" />,
        };
      case "disputed":
        return {
          bg: "bg-accent-danger/20",
          color: "#FF4D4F",
          icon: <Ban size={18} color="#FF4D4F" />,
        };
      case "wallet_fund":
        return {
          bg: "bg-accent-primary/20",
          color: "#F5E642",
          icon: <ArrowUpRight size={18} color="#F5E642" />,
        };
      default:
        return {
          bg: "bg-surface-container-high",
          color: "#8B949E",
          icon: <Check size={18} color="#8B949E" />,
        };
    }
  };

  const iconData = getIcon();

  const getStatusColorClass = () => {
    switch (statusColor) {
      case "success":
        return "text-secondary-container";
      case "pending":
        return "text-accent-primary";
      case "danger":
        return "text-accent-danger";
      default:
        return "text-[#8B949E]";
    }
  };

  return (
    <View className="flex-row items-center py-4">
      <View
        className={`w-12 h-12 rounded-full items-center justify-center ${iconData.bg}`}
      >
        {iconData.icon}
      </View>

      <View className="flex-1 ml-3">
        <Text
          className="text-white font-inter-bold text-base"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="text-[#8B949E] font-inter text-xs" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View className="items-end">
        <Text
          className={`font-inter-bold text-base ${
            isCredit ? "text-secondary-container" : "text-accent-danger"
          }`}
        >
          {isCredit ? "+" : "-"}₦
          {amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </Text>
        <Text
          className={`font-inter-medium text-[10px] uppercase tracking-wider ${getStatusColorClass()}`}
        >
          {status}
        </Text>
      </View>
    </View>
  );
};
