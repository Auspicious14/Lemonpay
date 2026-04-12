import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <Screen
      rightAction={
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity
            style={{ width: 42, height: 42 }}
            className="active:scale-95 transition-transform items-center justify-center bg-[#1C2026] rounded-xl border border-[#30363D]"
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={20}
              color="#F5E642"
            />
          </TouchableOpacity>
          <View
            style={{ width: 42, height: 42 }}
            className="rounded-xl overflow-hidden border border-[#30363D]"
          >
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBis5kg049aet7S4bj7DM7u_Lnud1Y1gjDZQgiZevnzB7ODvpcMb5J3dzwf_A5hGP903iI3UkfJEtniLmglaYs6xwSmHRoAnobl6mtYU4Gc2MZIab7Xms-zr7HvwMPAtiNfnx2SODUWkS5IfBde7dbW5wOFSsTfouPW-qB9rCZodKJwxMgoyEl3ipEIdXi-8v1B3jp5T7ZzicYjtAQZxyNvvU1H879aJwyq8T4u9NbvvkCJVeBTNygHkutoX1G8QcQ--A12GGFHYRif",
              }}
              className="w-full h-full"
            />
          </View>
        </View>
      }
    >
      <View className="flex-row items-center py-4 mb-2" style={{ gap: 12 }}>
        <View
          className="items-center justify-center bg-[#F5E642] rounded-xl"
          style={{
            width: 40,
            height: 40,
            shadowColor: "#F5E642",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <MaterialCommunityIcons
            name="shield-check"
            size={20}
            color="#1f1c00"
          />
        </View>
        <View>
          <Typography
            variant="heading"
            className="text-white leading-tight"
            weight="700"
          >
            LemonPay
          </Typography>
          <Typography variant="caption" className="text-[#8B949E]" weight="500">
            Escrow Secured
          </Typography>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="py-4" style={{ gap: 32 }}>
          {/* Hero Balance Card */}
          <View style={{ gap: 16 }}>
            <Card
              variant="high"
              radius="xl"
              className="p-8 relative overflow-hidden"
              style={{ padding: 32 }}
            >
              <View
                className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-[#F5E642] opacity-10 rounded-full"
                style={{
                  backgroundColor: "#F5E642",
                  transform: [{ scale: 1.5 }],
                  // Note: Blur is tricky on native View, normally used with BlurView but here we use opacity
                }}
              />

              <View className="z-10" style={{ gap: 32 }}>
                <View>
                  <View
                    className="flex-row items-center mb-3"
                    style={{ gap: 8 }}
                  >
                    <View className="p-2 bg-[#F5E642] opacity-10 rounded-lg">
                      <MaterialCommunityIcons
                        name="wallet"
                        size={14}
                        color="#F5E642"
                      />
                    </View>
                    <Typography
                      variant="label"
                      className="text-[#8B949E]"
                      weight="600"
                    >
                      Total Wallet Balance
                    </Typography>
                  </View>
                  <Typography
                    variant="display-lg"
                    className="text-white mb-2"
                    weight="800"
                    style={{ fontSize: 48 }}
                  >
                    ₦ 12,450,000
                  </Typography>
                  <View
                    className="flex-row items-center self-start px-3 py-1 rounded-full bg-[#43e5b1] bg-opacity-10"
                    style={{ gap: 8 }}
                  >
                    <MaterialCommunityIcons
                      name="trending-up"
                      size={12}
                      color="#43e5b1"
                    />
                    <Typography
                      variant="caption"
                      className="text-[#43e5b1]"
                      weight="700"
                    >
                      +2.4% this month
                    </Typography>
                  </View>
                </View>

                <View className="flex-row" style={{ gap: 12 }}>
                  <View className="flex-1">
                    <Button
                      label="Fund"
                      onPress={() => router.push("/wallet/fund")}
                      leftIcon={
                        <MaterialCommunityIcons
                          name="plus-circle"
                          size={20}
                          color="#1F1C00"
                        />
                      }
                    />
                  </View>

                  <View className="flex-1">
                    <Button
                      label="Withdraw"
                      variant="secondary"
                      onPress={() => {}}
                      leftIcon={
                        <MaterialCommunityIcons
                          name="upload"
                          size={20}
                          color="#ffffff"
                        />
                      }
                      className="bg-[#1C2026]"
                    />
                  </View>
                </View>
              </View>
            </Card>

            <View className="flex-row" style={{ gap: 16 }}>
              <Card variant="low" className="flex-1 p-6" radius="lg">
                <View
                  className="w-10 h-10 rounded-xl bg-[#43e5b1] opacity-10 items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(67, 229, 177, 0.1)" }}
                >
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={20}
                    color="#43e5b1"
                  />
                </View>
                <Typography variant="caption" className="text-[#8B949E] mb-1">
                  Success Rate
                </Typography>
                <Typography
                  variant="heading"
                  className="text-2xl text-white"
                  weight="700"
                >
                  99.8%
                </Typography>
              </Card>

              <Card variant="low" className="flex-1 p-6" radius="lg">
                <View
                  className="w-10 h-10 rounded-xl bg-[#F5E642] opacity-10 items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(245, 230, 66, 0.1)" }}
                >
                  <MaterialCommunityIcons
                    name="lock"
                    size={20}
                    color="#F5E642"
                  />
                </View>
                <Typography variant="caption" className="text-[#8B949E] mb-1">
                  Security Status
                </Typography>
                <Typography
                  variant="heading"
                  className="text-2xl text-white"
                  weight="700"
                >
                  Active
                </Typography>
              </Card>
            </View>
          </View>

          {/* Active Escrows Section */}
          <View>
            <View className="flex-row justify-between items-center mb-6 px-1">
              <View>
                <Typography variant="heading" weight="700">
                  Active Escrows
                </Typography>
                <Typography variant="caption" className="text-[#8B949E]">
                  3 ongoing contracts
                </Typography>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/transactions")}
                className="bg-[#1C2026] px-4 py-2 rounded-xl flex-row items-center border border-[#30363D]"
                style={{ gap: 4 }}
              >
                <Typography
                  variant="label"
                  className="text-[#F5E642]"
                  weight="700"
                >
                  Details
                </Typography>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={14}
                  color="#F5E642"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 24, gap: 16 }}
            >
              {[
                {
                  title: "MacBook Pro M2 Max",
                  vendor: "@tech_hub_ng",
                  amount: "₦ 2,850,000",
                  status: "Awaiting Delivery",
                  progress: 65,
                  timeLeft: "2 days left",
                  icon: (
                    <MaterialCommunityIcons
                      name="shopping"
                      size={20}
                      color="#F5E642"
                    />
                  ),
                },
                {
                  title: "Design Project",
                  vendor: "@global_fintech",
                  amount: "₦ 450,000",
                  status: "Milestone 1/3",
                  progress: 33,
                  timeLeft: "Ongoing",
                  icon: (
                    <MaterialCommunityIcons
                      name="home"
                      size={20}
                      color="#F5E642"
                    />
                  ),
                },
              ].map((escrow, idx) => (
                <Card
                  key={idx}
                  variant="default"
                  radius="xl"
                  className="w-[300px] p-6"
                  style={{ backgroundColor: "#161B22" }}
                >
                  <View className="flex-row justify-between items-start mb-6">
                    <View className="p-3 bg-[#1C2026] rounded-2xl border border-[#30363D]">
                      {escrow.icon}
                    </View>
                    <View className="bg-[#F5E642] bg-opacity-10 px-3 py-1 rounded-full border border-[#F5E642] border-opacity-20">
                      <Typography
                        variant="label-sm"
                        className="text-[#F5E642]"
                        weight="800"
                      >
                        {escrow.status}
                      </Typography>
                    </View>
                  </View>
                  <Typography
                    variant="subheading"
                    weight="700"
                    className="mb-1 text-white"
                  >
                    {escrow.title}
                  </Typography>
                  <Typography variant="caption" className="text-[#8B949E] mb-6">
                    Vendor: {escrow.vendor}
                  </Typography>

                  <View className="mb-6" style={{ gap: 12 }}>
                    <View className="w-full bg-[#1C2026] rounded-full h-1.5 overflow-hidden">
                      <View
                        className="bg-[#43e5b1] h-full rounded-full"
                        style={{ width: `${escrow.progress}%` }}
                      />
                    </View>
                    <View className="flex-row justify-between">
                      <Typography variant="label-sm" className="text-[#8B949E]">
                        Progress
                      </Typography>
                      <Typography variant="label-sm" className="text-white">
                        {escrow.progress}%
                      </Typography>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center bg-[#1C2026] p-4 rounded-2xl border border-[#30363D]">
                    <Typography
                      variant="subheading"
                      weight="700"
                      className="text-white"
                    >
                      {escrow.amount}
                    </Typography>
                    <Typography variant="caption" className="text-[#8B949E]">
                      {escrow.timeLeft}
                    </Typography>
                  </View>
                </Card>
              ))}

              <TouchableOpacity>
                <Card
                  variant="low"
                  radius="xl"
                  className="w-[200px] items-center justify-center bg-transparent"
                  style={{
                    borderStyle: "dashed",
                    borderWidth: 2,
                    borderColor: "#30363D",
                  }}
                >
                  <View className="w-12 h-12 rounded-full bg-[#1C2026] items-center justify-center mb-4 border border-[#30363D]">
                    <MaterialCommunityIcons
                      name="plus"
                      size={24}
                      color="#F5E642"
                    />
                  </View>
                  <Typography
                    variant="label"
                    weight="700"
                    className="text-center text-white"
                  >
                    New Escrow
                  </Typography>
                </Card>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Recent Transactions Section */}
          <View style={{ gap: 16 }}>
            <View className="flex-row justify-between items-center px-1">
              <Typography variant="heading" weight="700">
                Recent Transactions
              </Typography>
              <TouchableOpacity>
                <Typography
                  variant="label"
                  className="text-[#8B949E]"
                  weight="600"
                >
                  See All
                </Typography>
              </TouchableOpacity>
            </View>

            <Card variant="low" radius="xl" className="p-0 overflow-hidden">
              {[
                {
                  title: "Escrow Released",
                  sub: "Contract #LP-9021 • 2h ago",
                  amount: "+ ₦ 120,000.00",
                  status: "Completed",
                  icon: (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color="#43e5b1"
                    />
                  ),
                  color: "text-[#43e5b1]",
                },
                {
                  title: "Escrow Funded",
                  sub: "Contract #LP-9025 • Oct 12",
                  amount: "- ₦ 2,850,000.00",
                  status: "In Progress",
                  icon: (
                    <MaterialCommunityIcons
                      name="timer-sand"
                      size={24}
                      color="#F5E642"
                    />
                  ),
                  color: "text-white",
                },
                {
                  title: "Escrow Disputed",
                  sub: "Contract #LP-8842 • Oct 10",
                  amount: "₦ 15,000.00",
                  status: "Resolution",
                  icon: (
                    <MaterialCommunityIcons
                      name="gavel"
                      size={24}
                      color="#FFB4AB"
                    />
                  ),
                  color: "text-[#FFB4AB]",
                },
              ].map((item, i) => (
                <Pressable
                  key={i}
                  onPress={() => router.push(`/transactions/LP-${i + 7000}`)}
                  className={`flex-row items-center justify-between p-6 active:bg-[#1C2026] ${i > 0 ? "border-t border-[#30363D]" : ""}`}
                >
                  <View className="flex-row items-center" style={{ gap: 16 }}>
                    <View className="w-12 h-12 rounded-2xl bg-[#1C2026] items-center justify-center border border-[#30363D]">
                      {item.icon}
                    </View>
                    <View>
                      <Typography
                        variant="body"
                        weight="700"
                        className="text-white"
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="caption" className="text-[#8B949E]">
                        {item.sub}
                      </Typography>
                    </View>
                  </View>
                  <View className="items-end">
                    <Typography
                      variant="body"
                      weight="800"
                      className={`${item.color}`}
                    >
                      {item.amount}
                    </Typography>
                    <Typography
                      variant="label-sm"
                      className={`text-[8px] ${item.color} uppercase opacity-80`}
                      weight="800"
                    >
                      {item.status}
                    </Typography>
                  </View>
                </Pressable>
              ))}
            </Card>
          </View>

          {/* Trust Signal */}
          <View className="items-center py-4">
            <View
              className="flex-row items-center px-6 py-3 rounded-full bg-[#1C2026] border border-[#30363D]"
              style={{ gap: 8 }}
            >
              <MaterialCommunityIcons
                name="check-decagram"
                size={14}
                color="#F5E642"
              />
              <Typography
                variant="label-sm"
                className="text-[#8B949E] tracking-[0.1em]"
                weight="600"
              >
                SECURE BY LEMONPAY GUARD
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/wallet/fund")}
        style={{
          bottom: 30,
          right: 24,
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: "#F5E642",
          shadowColor: "#F5E642",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 15,
          elevation: 10,
          position: "absolute",
          zIndex: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
        className="active:scale-95 transition-transform"
      >
        <MaterialCommunityIcons name="plus" size={32} color="#1f1c00" />
      </TouchableOpacity>
    </Screen>
  );
}
