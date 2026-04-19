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
import { useMyEscrows } from "@/lib/hooks/useEscrow";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useRefreshOnFocus } from "@/lib/hooks/useRefreshOnFocus";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  TransactionRow,
  TransactionType,
} from "@/components/ui/TransactionRow";
import { EscrowProgressBar } from "@/components/ui/EscrowProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { LinearGradient } from "expo-linear-gradient";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getStatusBadgeInfo } from "@/lib/utils/escrow";
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
    data: escrowsData,
    isLoading: isEscrowsLoading,
    refetch: refetchEscrows,
  } = useMyEscrows();
  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useTransactions();

  const [refreshing, setRefreshing] = useState(false);

  const isSeller = user?.account_type === "seller";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchBalance(), refetchEscrows(), refetchTransactions()]);
    setRefreshing(false);
  }, [refetchBalance, refetchEscrows, refetchTransactions]);

  useRefreshOnFocus(refetchBalance);
  useRefreshOnFocus(refetchEscrows);
  useRefreshOnFocus(refetchTransactions);

  const activeEscrows = (escrowsData?.data || []).filter(e => 
    ['pending_seller_agreement', 'pending_buyer_confirmation', 
     'locked', 'funded', 'awaiting_buyer_release'].includes(e.status)
  );
  
  const recentTransactions = (transactionsData?.data || []).slice(0, 5);

  const getStatusInfo = (status: any) => {
    const info = getStatusBadgeInfo(status);
    let colorClass = "bg-[#30363D]";
    
    switch (info.color) {
      case "amber": colorClass = "bg-[#F5E642]"; break;
      case "blue": colorClass = "bg-blue-500"; break;
      case "purple": colorClass = "bg-purple-500"; break;
      case "yellow": colorClass = "bg-yellow-500"; break;
      case "teal": colorClass = "bg-[#00C896]"; break;
      case "red": colorClass = "bg-[#FF4D4F]"; break;
    }

    return { label: info.label, color: colorClass };
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0D1117]">
      <StatusBar style="light" />

      {/* HEADER */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-[#0D1117]">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-accent-primary items-center justify-center mr-2">
            <Text 
              style={{ fontFamily: 'Inter-Bold' }}
              className="text-[#0D1117] text-lg"
            >
              {user?.first_name?.charAt(0) || "L"}
            </Text>
          </View>
          <Text 
            style={{ fontFamily: 'Inter-Bold' }}
            className="text-white text-xl"
          >
            LemonPay
          </Text>
        </View>
        <View className="flex-row items-center gap-x-4">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.push("/notifications")}
          >
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
            <Text 
              style={{ fontFamily: 'Inter-Bold' }}
              className="text-[#8B949E] text-[10px] ml-2 tracking-widest uppercase"
            >
              TOTAL WALLET BALANCE
            </Text>
          </View>

          {isBalanceLoading ? (
            <BalanceSkeleton />
          ) : (
            <Text 
              style={{ fontFamily: 'Inter-ExtraBold' }}
              className="text-white text-4xl mb-1"
            >
              {formatCurrency(balance?.balance || 0)}
            </Text>
          )}

          <View className="flex-row items-center mb-6">
            <TrendingUp size={14} color="#00C896" />
            <Text 
              style={{ fontFamily: 'Inter-Medium' }}
              className="text-[#00C896] text-xs ml-1"
            >
              +2.4% this month
            </Text>
          </View>

          <View className="flex-row gap-x-3">
            <TouchableOpacity
              className="flex-1 h-12 rounded-full overflow-hidden"
              onPress={() => router.push("/wallet/fund")}
            >
              <LinearGradient
                colors={["#F5E642", "#D4C200"]}
                className="flex-1 flex-row items-center justify-center"
              >
                <Plus size={18} color="#0D1117" />
                <Text 
                  style={{ fontFamily: 'Inter-Bold' }}
                  className="text-[#0D1117] text-sm ml-2"
                >
                  Fund Wallet
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 h-12 rounded-full bg-[#21262D] border border-[#30363D] flex-row items-center justify-center"
              onPress={() => router.push("/wallet/withdraw")}
            >
              <Upload size={18} color="white" />
              <Text 
                style={{ fontFamily: 'Inter-Bold' }}
                className="text-white text-sm ml-2"
              >
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
              <Text 
                style={{ fontFamily: 'Inter-Medium' }}
                className="text-[#8B949E] text-xs ml-2"
              >
                Escrow Success Rate
              </Text>
            </View>
            <Text 
              style={{ fontFamily: 'Inter-Bold' }}
              className="text-white text-2xl"
            >
              99.8%
            </Text>
            <View className="flex-row items-center mt-2">
              <Lock size={12} color="#8B949E" />
              <Text 
                style={{ fontFamily: 'Inter' }}
                className="text-[#8B949E] text-[10px] ml-1 uppercase"
              >
                Secure by LemonPay Guard
              </Text>
            </View>
          </View>
          <View className="bg-[#00C896]/20 px-3 py-1 rounded-full">
            <Text 
              style={{ fontFamily: 'Inter-Bold' }}
              className="text-[#00C896] text-[10px] tracking-widest uppercase"
            >
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
            snapToInterval={width - 48}
            decelerationRate="fast"
          >
            {isEscrowsLoading ? (
              <View className="flex-row gap-x-3">
                {[1, 2].map((i) => (
                  <View 
                    key={i} 
                    className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 mr-3"
                    style={{ width: width - 48, height: 180 }}
                  />
                ))}
              </View>
            ) : activeEscrows.length > 0 ? (
              activeEscrows.map((escrow) => {
                const statusInfo = getStatusInfo(escrow.status);
                return (
                  <TouchableOpacity
                    key={escrow.id}
                    className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 mr-3"
                    style={{ width: width - 48 }}
                    onPress={() => router.push(`/escrow/${escrow.uuid}`)}
                  >
                    <View className="flex-row justify-between items-start mb-4">
                      <View className="w-10 h-10 bg-[#0D1117] rounded-lg items-center justify-center">
                        <ShoppingBag size={20} color="white" />
                      </View>
                      <View className={`${statusInfo.color} px-2 py-1 rounded`}>
                        <Text 
                          style={{ fontFamily: 'Inter-Bold' }}
                          className="text-[#0D1117] text-[8px] tracking-widest uppercase"
                        >
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={{ fontFamily: 'Inter-Bold' }}
                      className="text-white text-lg"
                      numberOfLines={1}
                    >
                      {escrow.title}
                    </Text>
                    <Text 
                      style={{ fontFamily: 'Inter' }}
                      className="text-[#8B949E] text-sm mb-4"
                    >
                      @{escrow.seller?.first_name || escrow.seller_identifier || "Merchant"}
                    </Text>

                    <EscrowProgressBar status={escrow.status} />

                    <View className="flex-row justify-between items-center mt-6">
                      <Text 
                        style={{ fontFamily: 'Inter-Bold' }}
                        className="text-white text-xl"
                      >
                        {formatCurrency(escrow.amount)}
                      </Text>
                      <ArrowRight size={16} color="#8B949E" />
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <TouchableOpacity
                onPress={() => router.push("/escrow/create")}
                className="bg-[#161B22] rounded-xl border border-[#30363D] border-dashed p-8 items-center justify-center mr-3"
                style={{ width: width - 80, height: 180 }}
              >
                <Plus size={32} color="#30363D" />
                <Text 
                  style={{ fontFamily: 'Inter-Bold', color: 'white', marginTop: 12 }}
                >
                  Create New Escrow
                </Text>
                <Text 
                  style={{ fontFamily: 'Inter', color: '#8B949E', fontSize: 12, marginTop: 4 }}
                >
                  No active escrows found
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* RECENT TRANSACTIONS SECTION */}
        <View className="mt-8 mb-24">
          <SectionHeader title="Recent Transactions" />
          <View className="bg-[#161B22] rounded-xl px-5">
            {isTransactionsLoading ? (
              <View className="py-10 items-center">
                <Text 
                  style={{ fontFamily: 'Inter' }}
                  className="text-[#8B949E]"
                >
                  Loading...
                </Text>
              </View>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((tx, index) => {
                const isCredit = tx.type === "credit";
                
                let type: TransactionType = "funded";
                if (tx.description.includes("Escrow released")) type = "released";
                if (tx.description.includes("Withdrawal")) type = "disputed"; // Red color
                if (tx.description.includes("Wallet fund")) type = "funded"; // Yellow color

                return (
                  <View key={tx.id}>
                    <TransactionRow
                      type={type}
                      title={tx.description}
                      subtitle={`${tx.reference.substring(0, 8)} • ${formatDate(tx.created_at)}`}
                      amount={parseFloat(tx.amount)}
                      isCredit={isCredit}
                      status={tx.status.toUpperCase()}
                      statusColor={tx.status === "completed" ? "success" : tx.status === "pending" ? "pending" : "danger"}
                    />
                    {index < recentTransactions.length - 1 && (
                      <View className="h-[1px] bg-[#30363D]" />
                    )}
                  </View>
                );
              })
            ) : (
              <View className="py-10 items-center">
                <Text 
                  style={{ fontFamily: 'Inter' }}
                  className="text-[#8B949E]"
                >
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
          <Text 
            style={{ fontFamily: 'Inter-Bold' }}
            className="text-[#8B949E] text-[8px] ml-1 tracking-widest uppercase"
          >
            SECURE BY LEMONPAY GUARD V2.4
          </Text>
        </View>
      </View>

      {/* FLOATING ACTION BUTTON */}
      {!isSeller && (
        <TouchableOpacity
          className="absolute bottom-20 right-6 w-14 h-14 rounded-full bg-accent-primary items-center justify-center shadow-lg"
          style={{ elevation: 5 }}
          onPress={() => router.push("/escrow/create")}
        >
          <Plus size={32} color="#0D1117" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
