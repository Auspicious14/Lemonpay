import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Wallet,
  Bell,
  ShieldCheck,
  Lock,
  Plus,
  Upload,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useWalletBalance } from "@/lib/hooks/useWallet";
import { useEscrowList } from "@/lib/hooks/useEscrow";
import { useRefreshOnFocus } from "@/lib/hooks/useRefreshOnFocus";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  TransactionRow,
  TransactionType,
} from "@/components/ui/TransactionRow";
import { EscrowProgressBar } from "@/components/ui/EscrowProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const BalanceSkeleton = () => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="h-12 w-48 bg-[#30363D] rounded-lg mb-2"
    />
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    data: balance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useWalletBalance();
  const {
    data: escrows,
    isLoading: isEscrowsLoading,
    refetch: refetchEscrows,
  } = useEscrowList();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchBalance(), refetchEscrows()]);
    setRefreshing(false);
  }, [refetchBalance, refetchEscrows]);

  useRefreshOnFocus(refetchBalance);
  useRefreshOnFocus(refetchEscrows);

  const activeEscrows = escrows?.filter((e) => e.status !== "released") || [];
  const recentEscrows = (escrows || []).slice(0, 5);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "delivery_marked":
        return { label: "AWAITING DELIVERY", color: "bg-[#F5E642]" };
      case "funded":
        return { label: "FUNDED", color: "bg-blue-500" };
      case "disputed":
        return { label: "DISPUTED", color: "bg-[#FF4D4F]" };
      case "released":
        return { label: "RELEASED", color: "bg-[#00C896]" };
      default:
        return { label: status.toUpperCase(), color: "bg-[#30363D]" };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0D1117]">
      <StatusBar style="light" />

      {/* HEADER */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-[#0D1117]">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-accent-primary items-center justify-center mr-2">
            <Text className="text-[#0D1117] font-inter-bold text-lg">C</Text>
          </View>
          <Text className="text-white font-inter-bold text-xl">LemonPay</Text>
        </View>
        <View className="flex-row items-center gap-x-4">
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Bell size={24} color="white" />
          </TouchableOpacity>
          <Avatar
            name={`${user?.first_name} ${user?.last_name}`}
            size="sm"
            className="rounded-lg border-0"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F5E642"
          />
        }
      >
        {/* WALLET BALANCE CARD */}
        <View className="bg-[#161B22] rounded-xl p-5 mt-4">
          <View className="flex-row items-center mb-2">
            <Wallet size={12} color="#8B949E" />
            <Text className="text-[#8B949E] font-inter-bold text-[10px] ml-2 tracking-widest uppercase">
              TOTAL WALLET BALANCE
            </Text>
          </View>

          {isBalanceLoading ? (
            <BalanceSkeleton />
          ) : (
            <Text className="text-white font-inter-extrabold text-4xl mb-1">
              ₦
              {balance?.balance.toLocaleString("en-NG", {
                minimumFractionDigits: 1,
              })}
            </Text>
          )}

          <View className="flex-row items-center mb-6">
            <TrendingUp size={14} color="#00C896" />
            <Text className="text-[#00C896] font-inter-medium text-xs ml-1">
              +2.4% this month
            </Text>
          </View>

          <View className="flex-row gap-x-3">
            <TouchableOpacity
              className="flex-1 h-12 rounded-full overflow-hidden"
              onPress={() => router.push("/wallet")}
            >
              <LinearGradient
                colors={["#F5E642", "#D4C200"]}
                className="flex-1 flex-row items-center justify-center"
              >
                <Plus size={18} color="#0D1117" />
                <Text className="text-[#0D1117] font-inter-bold text-sm ml-2">
                  Fund Wallet
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 h-12 rounded-full bg-[#21262D] border border-[#30363D] flex-row items-center justify-center">
              <Upload size={18} color="white" />
              <Text className="text-white font-inter-bold text-sm ml-2">
                Withdraw
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ESCROW STATS CARD */}
        <View className="bg-[#161B22] rounded-xl p-5 mt-4 flex-row items-center">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <ShieldCheck size={20} color="#00C896" />
              <Text className="text-[#8B949E] font-inter-medium text-xs ml-2">
                Escrow Success Rate
              </Text>
            </View>
            <Text className="text-white font-inter-bold text-2xl">99.8%</Text>
            <View className="flex-row items-center mt-2">
              <Lock size={12} color="#8B949E" />
              <Text className="text-[#8B949E] font-inter text-[10px] ml-1 uppercase">
                Secure by LemonPay Guard
              </Text>
            </View>
          </View>
          <View className="bg-[#00C896]/20 px-3 py-1 rounded-full">
            <Text className="text-[#00C896] font-inter-bold text-[10px] tracking-widest uppercase">
              GOLD TIER
            </Text>
          </View>
        </View>

        {/* ACTIVE ESCROWS SECTION */}
        <View className="mt-8">
          <SectionHeader
            title="Active Escrows"
            subtitle={`You have ${activeEscrows.length} ongoing contracts`}
            actionLabel="View All →"
            onAction={() => router.push("/(tabs)/escrows")}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-6 px-6"
            snapToInterval={width - 48 + 12}
            decelerationRate="fast"
          >
            {activeEscrows.length > 0 ? (
              activeEscrows.slice(0, 2).map((escrow) => {
                const statusInfo = getStatusInfo(escrow.status);
                return (
                  <TouchableOpacity
                    key={escrow.id}
                    className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 mr-3"
                    style={{ width: width - 80 }}
                  >
                    <View className="flex-row justify-between items-start mb-4">
                      <View className="w-10 h-10 bg-[#0D1117] rounded-lg items-center justify-center">
                        <ShoppingBag size={20} color="white" />
                      </View>
                      <View className={`${statusInfo.color} px-2 py-1 rounded`}>
                        <Text className="text-[#0D1117] font-inter-bold text-[8px] tracking-widest uppercase">
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    <Text
                      className="text-white font-inter-bold text-lg"
                      numberOfLines={1}
                    >
                      {escrow.title}
                    </Text>
                    <Text className="text-[#8B949E] font-inter text-sm mb-4">
                      @{escrow.seller?.first_name || "Merchant"}
                    </Text>

                    <EscrowProgressBar status={escrow.status} />

                    <View className="flex-row justify-between items-center mt-6">
                      <Text className="text-white font-inter-bold text-xl">
                        ₦{parseFloat(escrow.amount).toLocaleString("en-NG")}
                      </Text>
                      <Text className="text-[#8B949E] font-inter text-xs">
                        Ends in 3 days
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View
                className="bg-[#161B22] rounded-xl border border-[#30363D] p-10 items-center justify-center mr-3"
                style={{ width: width - 80 }}
              >
                <ShoppingBag size={32} color="#30363D" />
                <Text className="text-[#8B949E] font-inter-medium text-center mt-2">
                  No active escrows
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* RECENT TRANSACTIONS SECTION */}
        <View className="mt-8 mb-24">
          <SectionHeader title="Recent Transactions" />
          <View className="bg-[#161B22] rounded-xl px-5">
            {recentEscrows.length > 0 ? (
              recentEscrows.map((escrow, index) => {
                const isReleased = escrow.status === "released";
                const isDisputed = escrow.status === "disputed";
                const isFunded = escrow.status === "funded";

                let type: TransactionType = "funded";
                let statusLabel = "PENDING INSPECTION";
                let statusColor: "success" | "pending" | "danger" = "pending";

                if (isReleased) {
                  type = "released";
                  statusLabel = "COMPLETED";
                  statusColor = "success";
                } else if (isDisputed) {
                  type = "disputed";
                  statusLabel = "IN RESOLUTION";
                  statusColor = "danger";
                }

                return (
                  <View key={escrow.id}>
                    <TransactionRow
                      type={type}
                      title={isReleased ? "Escrow Released" : escrow.title}
                      subtitle={`Contract #LP-${escrow.uuid.substring(
                        0,
                        4,
                      )} • 2 hours ago`}
                      amount={parseFloat(escrow.amount)}
                      isCredit={isReleased}
                      status={statusLabel}
                      statusColor={statusColor}
                    />
                    {index < recentEscrows.length - 1 && (
                      <View className="h-[1px] bg-[#30363D]" />
                    )}
                  </View>
                );
              })
            ) : (
              <View className="py-10 items-center">
                <Text className="text-[#8B949E] font-inter">
                  No transactions yet
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* SECURITY FOOTER BAR */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-[#0D1117] py-3 items-center"
        style={{ bottom: 0 }}
      >
        <View className="flex-row items-center border-t border-[#30363D] w-full justify-center pt-3">
          <ShieldCheck size={12} color="#8B949E" />
          <Text className="text-[#8B949E] font-inter-bold text-[8px] ml-1 tracking-widest uppercase">
            SECURE BY LEMONPAY GUARD V2.4
          </Text>
        </View>
      </View>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity
        className="absolute bottom-20 right-6 w-14 h-14 rounded-full bg-accent-primary items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
        onPress={() => router.push("/escrow/create")}
      >
        <Plus size={32} color="#0D1117" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
