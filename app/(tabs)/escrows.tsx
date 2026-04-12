import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { useRouter } from "expo-router";

import {
  Gavel,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

type EscrowStatus = "all" | "active" | "completed" | "disputed";

export default function EscrowListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<EscrowStatus>("all");

  const escrows = [
    {
      title: "MacBook Pro M2 Max",
      vendor: "@tech_hub_ng",
      amount: "₦ 2,850,000",
      status: "In Inspection",
      progress: 0.65,
      icon: <ShoppingBag size={20} color="#f5e642" />,
      badge: "active",
    },
    {
      title: "Freelance Design",
      vendor: "@joe_graphics",
      amount: "₦ 150,000",
      status: "Completed",
      progress: 1,
      icon: <Gavel size={20} color="#43e5b1" />,
      badge: "completed",
    },
    {
      title: "iPhone 15 Case",
      vendor: "@gadgets_den",
      amount: "₦ 25,000",
      status: "Disputed",
      progress: 0.4,
      icon: <AlertTriangle size={20} color="#ffb4ab" />,
      badge: "disputed",
    },
    {
      title: "Nike Air Jordan",
      vendor: "@sneaker_plug",
      amount: "₦ 180,000",
      status: "Awaiting Funding",
      progress: 0.1,
      icon: <ShoppingBag size={20} color="#f5e642" />,
      badge: "pending",
    },
  ];

  const filteredEscrows =
    filter === "all"
      ? escrows
      : escrows.filter(
          (e) =>
            e.badge === filter ||
            (filter === "active" && e.badge === "pending"),
        );

  return (
    <Screen
      title="Escrows"
      rightAction={
        <TouchableOpacity className="w-10 h-10 bg-primary-fixed rounded-xl items-center justify-center active:scale-95 transition-transform">
          <Plus size={24} color="#1f1c00" strokeWidth={3} />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 pb-32">
        <View className="space-y-6 pt-6">
          <View>
            <Typography variant="display-lg" className="tracking-tight mb-2">
              My Contracts
            </Typography>
            <Typography variant="body" className="text-text-secondary">
              Managing 4 active and past escrow agreements.
            </Typography>
          </View>

          {/* Search & Filter */}
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Input
                placeholder="Search contracts..."
                leftIcon={<Search size={20} color="#4a4734" />}
                className="mb-0"
              />
            </View>
            <TouchableOpacity className="w-[60px] h-[60px] bg-surface-container-high rounded-xl items-center justify-center border border-outline-variant/10">
              <Filter size={24} color="#f5e642" />
            </TouchableOpacity>
          </View>

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row space-x-3"
          >
            {(["all", "active", "completed", "disputed"] as EscrowStatus[]).map(
              (s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setFilter(s)}
                  className={`px-6 py-3 rounded-full border ${filter === s ? "bg-primary-fixed border-primary-fixed" : "bg-surface-container-low border-outline-variant/10"}`}
                >
                  <Typography
                    variant="label-sm"
                    className={
                      filter === s
                        ? "text-on-primary-fixed font-inter-extrabold"
                        : "text-text-secondary"
                    }
                  >
                    {s}
                  </Typography>
                </TouchableOpacity>
              ),
            )}
          </ScrollView>

          {/* Escrow List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="space-y-4"
          >
            {filteredEscrows.map((item, i) => (
              <Pressable
                key={i}
                onPress={() => router.push(`/escrow/${i + 8800}`)}
                className="active:scale-[0.98] transition-all"
              >
                <Card
                  variant="default"
                  className="p-6 border border-outline-variant/5"
                >
                  <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-row items-center space-x-4">
                      <View className="p-3 bg-surface-container-high rounded-2xl">
                        {item.icon}
                      </View>
                      <View>
                        <Typography variant="subheading" className="font-bold">
                          {item.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-text-secondary"
                        >
                          {item.vendor}
                        </Typography>
                      </View>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full ${item.badge === "completed" ? "bg-secondary/10" : item.badge === "disputed" ? "bg-accent-danger/10" : "bg-primary-fixed/10"}`}
                    >
                      <Typography
                        variant="label-sm"
                        className={`text-[8px] uppercase tracking-widest ${item.badge === "completed" ? "text-secondary" : item.badge === "disputed" ? "text-accent-danger" : "text-primary-fixed"}`}
                      >
                        {item.status}
                      </Typography>
                    </View>
                  </View>

                  <View className="space-y-3">
                    <View className="w-full bg-surface-container-highest rounded-full h-2">
                      <View
                        className={`h-2 rounded-full ${item.badge === "completed" ? "bg-secondary" : item.badge === "disputed" ? "bg-accent-danger" : "bg-primary-fixed"}`}
                        style={{ width: `${item.progress * 100}%` }}
                      />
                    </View>
                    <View className="flex-row justify-between">
                      <Typography
                        variant="heading"
                        className="text-xl font-black"
                      >
                        {item.amount}
                      </Typography>
                      <TouchableOpacity className="flex-row items-center space-x-2">
                        <Typography
                          variant="label-sm"
                          className="text-secondary font-bold"
                        >
                          Details
                        </Typography>
                        <ArrowRight size={14} color="#43e5b1" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))}

            <View className="h-20" />
          </ScrollView>
        </View>
      </View>
    </Screen>
  );
}
