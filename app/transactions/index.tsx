import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ShoppingBag,
  Landmark,
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Target,
  Search,
  ArrowUpRight,
  Download,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";

type TranxGroup = {
  date: string;
  items: TranxItem[];
};

type TranxItem = {
  id: string;
  title: string;
  type: "escrow" | "wallet" | "payout";
  amount: string;
  status: "success" | "pending" | "failed" | "disputed";
  time: string;
  icon: React.ReactNode;
  color?: string;
};

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");

  const groups: TranxGroup[] = [
    {
      date: "Today",
      items: [
        {
          id: "LP-1",
          title: "Escrow Funded: MacBook Pro",
          type: "escrow",
          amount: "₦1,250,000",
          status: "success",
          time: "14:22",
          icon: <ShoppingBag size={20} color="#f5e642" />,
        },
        {
          id: "LP-2",
          title: "Wallet Funded: Bank Transfer",
          type: "wallet",
          amount: "+₦450,000",
          status: "success",
          time: "09:15",
          icon: <Landmark size={20} color="#43e5b1" />,
          color: "text-secondary",
        },
      ],
    },
    {
      date: "Oct 24, 2023",
      items: [
        {
          id: "LP-3",
          title: "Service Payment: UI Design",
          type: "escrow",
          amount: "₦85,000",
          status: "disputed",
          time: "18:45",
          icon: <AlertCircle size={20} color="#f5e642" fill="#f5e642" />,
        },
        {
          id: "LP-4",
          title: "Withdrawal: Bank Account",
          type: "payout",
          amount: "-₦200,000",
          status: "pending",
          time: "11:20",
          icon: <Clock size={20} color="#95917a" />,
        },
        {
          id: "LP-5",
          title: "Funding: Card Purchase",
          type: "wallet",
          amount: "₦50,000",
          status: "failed",
          time: "08:05",
          icon: <CreditCard size={20} color="#ffb4ab" />,
          color: "text-error",
        },
      ],
    },
  ];

  return (
    <Screen
      showBackButton
      title="Transaction History"
      rightAction={
        <Typography variant="heading" className="text-primary-fixed font-black">
          LemonPay
        </Typography>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-32">
        <View className="space-y-10 py-6">
          {/* Filter Controls */}
          <View className="space-y-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row space-x-3"
            >
              {["All", "Escrow", "Withdrawals", "Funding"].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-xl border ${activeFilter === filter ? "bg-primary-fixed border-primary-fixed" : "bg-surface-container-high border-outline-variant/10"}`}
                >
                  <Typography
                    variant="label-sm"
                    className={
                      activeFilter === filter
                        ? "text-on-primary-fixed font-bold"
                        : "text-on-surface"
                    }
                  >
                    {filter}
                  </Typography>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="bg-surface-container-low p-1 rounded-2xl flex-row w-full border border-outline-variant/10">
              <TouchableOpacity className="flex-1 py-3 items-center bg-surface-container-highest text-white rounded-xl shadow-sm">
                <Typography variant="label-sm" className="font-bold">
                  This Month
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3 items-center">
                <Typography variant="label-sm" className="text-text-secondary">
                  Custom Range
                </Typography>
              </TouchableOpacity>
            </View>
          </View>

          {/* Transaction Groups */}
          <View className="space-y-10">
            {groups.map((group) => (
              <View key={group.date} className="space-y-4">
                <View className="flex-row items-center space-x-4 px-2">
                  <Typography
                    variant="label-sm"
                    className="uppercase tracking-[0.1em] text-outline font-bold text-[10px]"
                  >
                    {group.date}
                  </Typography>
                  <View className="h-[1px] flex-1 bg-outline-variant/20" />
                </View>

                <View className="space-y-3">
                  {group.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => router.push(`/transactions/${item.id}`)}
                      className="active:scale-[0.98] transition-all"
                    >
                      <Card
                        variant="low"
                        className="p-4 flex-row items-center space-x-4 bg-surface-container-low active:bg-surface-container border border-outline-variant/5"
                      >
                        <View className="w-12 h-12 rounded-xl bg-surface-container-highest items-center justify-center">
                          {item.icon}
                        </View>
                        <View className="flex-1">
                          <Typography
                            variant="body"
                            className="font-bold text-on-surface"
                            numberOfLines={1}
                          >
                            {item.title}
                          </Typography>
                          <View className="flex-row items-center space-x-2 mt-1">
                            <View
                              className={`px-2 py-0.5 rounded-full ${
                                item.status === "success"
                                  ? "bg-secondary/10"
                                  : item.status === "disputed"
                                    ? "bg-primary-fixed/10"
                                    : item.status === "failed"
                                      ? "bg-error/10"
                                      : "bg-surface-container-highest"
                              }`}
                            >
                              <Typography
                                variant="label-sm"
                                className={`text-[8px] uppercase font-bold tracking-wider ${
                                  item.status === "success"
                                    ? "text-secondary"
                                    : item.status === "disputed"
                                      ? "text-primary-fixed"
                                      : item.status === "failed"
                                        ? "text-error"
                                        : "text-text-secondary"
                                }`}
                              >
                                {item.status}
                              </Typography>
                            </View>
                            <Typography
                              variant="caption"
                              className="text-outline text-[10px]"
                            >
                              {item.time} • {item.type.toUpperCase()}
                            </Typography>
                          </View>
                        </View>
                        <View className="items-end">
                          <Typography
                            variant="body"
                            className={`font-extrabold ${item.color || "text-white"}`}
                          >
                            {item.amount}
                          </Typography>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Spending Insight Bento */}
          <Card
            variant="default"
            className="p-8 relative overflow-hidden group border border-outline-variant/10 bg-surface-container"
          >
            <View
              className="absolute top-[-32px] right-[-32px] w-48 h-48 bg-primary-fixed/5 rounded-full"
              style={{ filter: "blur(40px)" }}
            />
            <View className="relative z-10 space-y-6">
              <View>
                <Typography
                  variant="label-sm"
                  className="text-primary-fixed font-bold tracking-widest uppercase mb-2 text-[10px]"
                >
                  Spending Insight
                </Typography>
                <Typography
                  variant="heading"
                  className="text-2xl font-extrabold max-w-[220px] leading-tight"
                >
                  You saved{" "}
                  <Typography variant="heading" className="text-primary-fixed">
                    ₦12,400
                  </Typography>{" "}
                  in escrow fees this month.
                </Typography>
              </View>
              <TouchableOpacity className="flex-row items-center space-x-2">
                <Typography
                  variant="label-sm"
                  className="text-on-surface font-bold text-[10px]"
                >
                  VIEW DETAILED REPORT
                </Typography>
                <ArrowUpRight size={14} color="#f5e642" />
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
