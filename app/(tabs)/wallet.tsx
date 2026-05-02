import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  Bell,
  Wallet as WalletIcon,
  ShieldCheck,
  Lock,
  TrendingUp,
  Key,
  CheckCircle2,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useWalletBalance } from "@/lib/hooks/useWallet";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useRefreshOnFocus } from "@/lib/hooks/useRefreshOnFocus";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { Avatar } from "@/components/ui/Avatar";
import { LinearGradient } from "expo-linear-gradient";
import { useToastStore } from "@/store/useToastStore";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  getTxType,
  getTxDisplayTitle,
  getTxSubtitle,
} from "@/lib/utils/transactions";

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { show: showToast } = useToastStore();

  const {
    data: balance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useWalletBalance();

  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useTransactions();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchBalance(), refetchTransactions()]);
    setRefreshing(false);
  }, [refetchBalance, refetchTransactions]);

  // Refetch data when screen comes into focus
  useRefreshOnFocus(refetchBalance);
  useRefreshOnFocus(refetchTransactions);

  const transactions = transactionsData?.data || [];

  return (
    <SafeAreaView className="flex-1 bg-[#0D1117]">
      <StatusBar style="light" />

      {/* HEADER */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-[#0D1117]">
        <View className="flex-row items-center">
          <Avatar
            name={`${user?.first_name} ${user?.last_name}`}
            size="sm"
            className="rounded-full border-0 mr-3"
          />
          <Text className="text-white font-inter-bold text-xl">LymePay</Text>
        </View>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.push("/notifications")}
        >
          <Bell size={24} color="white" />
        </TouchableOpacity>
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
        <View className="mt-2 mb-6">
          <Text className="text-white font-inter-bold text-3xl">Wallet</Text>
          <Text className="text-[#8B949E] font-inter text-sm mt-1 leading-5">
            Secure Nigerian digital escrow. Manage your funds with total peace
            of mind.
          </Text>
        </View>

        {/* BALANCE CARD */}
        <View className="bg-[#161B22] rounded-xl p-6 mb-4">
          <View className="flex-row items-center mb-4">
            <ShieldCheck size={14} color="#F5E642" />
            <Text className="text-[#8B949E] font-inter-bold text-[10px] ml-2 tracking-widest uppercase">
              AVAILABLE BALANCE
            </Text>
          </View>

          <Text className="text-white font-inter-extrabold text-4xl mb-2">
            {isBalanceLoading ? "..." : formatCurrency(balance?.balance || 0)}
          </Text>

          <View className="flex-row items-center mb-8">
            <TrendingUp size={16} color="#00C896" />
            <Text className="text-[#00C896] font-inter-medium text-sm ml-1">
              +12.5% this month
            </Text>
          </View>

          <TouchableOpacity
            className="h-14 rounded-2xl overflow-hidden mb-4"
            onPress={() => router.push("/wallet/fund")}
          >
            <LinearGradient
              colors={["#F5E642", "#D4C200"]}
              className="flex-1 items-center justify-center"
            >
              <Text className="text-[#0D1117] font-inter-bold text-base uppercase tracking-widest">
                Fund Wallet
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/wallet/withdraw")}>
            <Text className="text-white font-inter-bold text-sm text-center">
              Withdraw
            </Text>
          </TouchableOpacity>
        </View>

        {/* SECURITY CARD */}
        <View className="bg-[#161B22] rounded-xl p-5 mb-8 flex-row items-center">
          <View className="w-12 h-12 bg-secondary-container/10 rounded-xl items-center justify-center mr-4">
            <Lock size={24} color="#00C896" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-inter-bold text-lg">
              Secure by LymePay
            </Text>
            <Text className="text-[#8B949E] font-inter text-xs mt-1">
              Your funds are held in a secure CBN-licensed escrow account.
            </Text>
          </View>
          <View className="flex-row gap-x-2">
            <ShieldCheck size={16} color="#8B949E" />
            <Key size={16} color="#8B949E" />
          </View>
        </View>

        {/* RECENT TRANSACTIONS */}
        <SectionHeader
          title="Recent Transactions"
          subtitle="Activity from the last 30 days"
          actionLabel="View All"
          onAction={() => router.push("/wallet/transactions")}
        />

        {isTransactionsLoading ? (
          <View className="bg-[#161B22] rounded-xl p-10 items-center justify-center mb-8">
            <Text className="text-[#8B949E] font-inter">
              Loading transactions...
            </Text>
          </View>
        ) : transactions.length > 0 ? (
          transactions.map((tx, index) => (
            <View key={tx.id}>
              <TransactionRow
                type={getTxType(tx)}
                title={getTxDisplayTitle(tx)}
                subtitle={getTxSubtitle(tx, formatDate)}
                amount={parseFloat(tx.amount)}
                isCredit={tx.type === "credit"}
                status={tx.status}
              />
              {/* Divider — only on home page list style */}
              {index < transactions.length - 1 && (
                <View style={{ height: 1, backgroundColor: "#30363D" }} />
              )}
            </View>
          ))
        ) : (
          <View className="bg-[#161B22] rounded-xl p-10 items-center justify-center mb-8">
            <WalletIcon size={40} color="#30363D" />
            <Text className="text-[#8B949E] font-inter-medium text-center mt-3">
              No recent activity
            </Text>
          </View>
        )}

        {/* VERIFIED MERCHANT CARD */}
        <View className="bg-[#161B22] rounded-xl p-8 items-center mt-6 mb-12">
          <View className="w-16 h-16 bg-accent-primary/10 rounded-full items-center justify-center mb-4">
            <CheckCircle2 size={32} color="#F5E642" />
          </View>
          <Text className="text-white font-inter-bold text-xl mb-2">
            Verified Merchant Wallet
          </Text>
          <Text className="text-[#8B949E] font-inter text-sm text-center mb-8 leading-5">
            You are currently operating a verified secure wallet. High
            transaction limits and priority support are active.
          </Text>

          <View className="flex-row items-center gap-x-4">
            <View className="flex-row items-center">
              <ShieldCheck size={12} color="#8B949E" />
              <Text className="text-[#8B949E] font-inter-bold text-[10px] ml-1 tracking-widest uppercase">
                PCI DSS
              </Text>
            </View>
            <View className="w-1 h-1 rounded-full bg-[#30363D]" />
            <View className="flex-row items-center">
              <Lock size={12} color="#8B949E" />
              <Text className="text-[#8B949E] font-inter-bold text-[10px] ml-1 tracking-widest uppercase">
                SSL 256-BIT
              </Text>
            </View>
            <View className="w-1 h-1 rounded-full bg-[#30363D]" />
            <View className="flex-row items-center">
              <Key size={12} color="#8B949E" />
              <Text className="text-[#8B949E] font-inter-bold text-[10px] ml-1 tracking-widest uppercase">
                BIOMETRIC
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
