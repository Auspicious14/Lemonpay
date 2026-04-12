import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  Wallet as WalletIcon,
  ShieldCheck,
  Lock,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Key,
  CheckCircle2,
} from "lucide-react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { useAuth } from "@/context/AuthContext";
import { useWalletBalance, useFundWallet } from "@/lib/hooks/useWallet";
import { useEscrowList } from "@/lib/hooks/useEscrow";
import { useRefreshOnFocus } from "@/lib/hooks/useRefreshOnFocus";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { Avatar } from "@/components/ui/Avatar";
import { LinearGradient } from "expo-linear-gradient";
import { CustomBottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/store/useToastStore";

const QUICK_AMOUNTS = [5000, 10000, 50000, 100000];

export default function WalletScreen() {
  const { user } = useAuth();
  const { show: showToast } = useToastStore();
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

  const fundWalletMutation = useFundWallet();

  const [refreshing, setRefreshing] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const bottomSheetRef = useRef<BottomSheet>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchBalance(), refetchEscrows()]);
    setRefreshing(false);
  }, [refetchBalance, refetchEscrows]);

  useRefreshOnFocus(refetchBalance);
  useRefreshOnFocus(refetchEscrows);

  const handleFundWallet = async () => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    try {
      await fundWalletMutation.mutateAsync({
        amount,
        email: user?.email || "",
      });
      bottomSheetRef.current?.close();
      setFundAmount("");
    } catch (error: any) {
      showToast(error.message || "Failed to initiate funding", "error");
    }
  };

  const recentTransactions = (escrows || []).slice(0, 10);

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
          <Text className="text-white font-inter-bold text-xl">LemonPay</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
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
            ₦
            {balance?.balance.toLocaleString("en-NG", {
              minimumFractionDigits: 1,
            }) || "0.0"}
          </Text>

          <View className="flex-row items-center mb-8">
            <TrendingUp size={16} color="#00C896" />
            <Text className="text-[#00C896] font-inter-medium text-sm ml-1">
              +12.5% this month
            </Text>
          </View>

          <TouchableOpacity
            className="h-14 rounded-2xl overflow-hidden mb-4"
            onPress={() => bottomSheetRef.current?.expand()}
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

          <TouchableOpacity
            onPress={() => showToast("Withdrawal coming soon", "info")}
          >
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
              Secure by LemonPay
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
          onAction={() => {}}
        />

        {recentTransactions.length > 0 ? (
          recentTransactions.map((escrow) => {
            const isReleased = escrow.status === "released";
            const isFunded = escrow.status === "funded";
            const isDisputed = escrow.status === "disputed";

            let title = escrow.title;
            let type: any = "funded";
            let status = "PENDING";
            let color: "success" | "pending" | "danger" = "pending";

            if (isReleased) {
              title = "Escrow Released";
              type = "released";
              status = "SUCCESS";
              color = "success";
            } else if (isDisputed) {
              title = "Disputed Escrow";
              type = "disputed";
              status = "DISPUTED";
              color = "danger";
            } else if (isFunded) {
              title = "Escrow Funded";
              type = "funded";
              status = "PENDING";
              color = "pending";
            }

            return (
              <View
                key={escrow.id}
                className="bg-[#161B22] rounded-lg p-4 mb-2"
              >
                <TransactionRow
                  type={type}
                  title={title}
                  subtitle={`${escrow.status.replace("_", " ")} • ${
                    escrow.title
                  } • Today`}
                  amount={parseFloat(escrow.amount)}
                  isCredit={isReleased}
                  status={status}
                  statusColor={color}
                />
              </View>
            );
          })
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

      {/* FUND WALLET BOTTOM SHEET */}
      <CustomBottomSheet
        ref={bottomSheetRef}
        title="Fund Wallet"
        snapPoints={["60%"]}
      >
        <View className="flex-1">
          <Text className="text-[#8B949E] font-inter-medium text-sm mb-4">
            Enter the amount you wish to add to your LemonPay wallet.
          </Text>

          <View className="flex-row items-center bg-[#0D1117] border border-[#30363D] rounded-2xl h-16 px-5 mb-6">
            <Text className="text-white font-inter-bold text-2xl mr-2">₦</Text>
            <TextInput
              className="flex-1 text-white font-inter-bold text-2xl"
              placeholder="0.00"
              placeholderTextColor="#30363D"
              keyboardType="numeric"
              value={fundAmount}
              onChangeText={setFundAmount}
            />
          </View>

          <View className="flex-row flex-wrap gap-2 mb-8">
            {QUICK_AMOUNTS.map((amt) => (
              <TouchableOpacity
                key={amt}
                onPress={() => setFundAmount(amt.toString())}
                className={`px-4 py-2 rounded-full border ${
                  fundAmount === amt.toString()
                    ? "bg-accent-primary/20 border-accent-primary"
                    : "bg-transparent border-[#30363D]"
                }`}
              >
                <Text
                  className={`font-inter-semibold text-xs ${
                    fundAmount === amt.toString()
                      ? "text-accent-primary"
                      : "text-[#8B949E]"
                  }`}
                >
                  ₦{amt.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            label={
              fundWalletMutation.isPending
                ? "Processing..."
                : "Proceed to Payment"
            }
            onPress={handleFundWallet}
            loading={fundWalletMutation.isPending}
            className="mt-auto"
          />
        </View>
      </CustomBottomSheet>
    </SafeAreaView>
  );
}
