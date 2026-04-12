import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";

import {
  Shield,
  Wallet as WalletIcon,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Gavel,
  CheckCircle2,
  AlertCircle,
  Lock,
  Smartphone,
  Fingerprint,
  RotateCcw,
  Verified,
  Plus,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function WalletScreen() {
  const router = useRouter();

  return (
    <Screen
      title="Wallet"
      rightAction={
        <TouchableOpacity className="w-10 h-10 rounded-xl bg-surface-container items-center justify-center border border-outline-variant/20 overflow-hidden">
          <Image
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2YSL2kbXsRXsTF8RZ8vIUxhbLx4qgb3hZZ-4aXBoudaZGFlTkhT5M61RW3D1jefZxTCw4CMzbksA_90gLkrtAiVHjVi4-nJhXttliT_1Aq3oRzck4Kd2dOw5mSULdTGKt0_fom7Yt3qt-FYWiQR44_ElWtZkN8iy1qV7j5qI04i_Q9eZTA7KWXe5X5HLH10aK0hEh0Hvkj6RljUh9wWNqYFo0yCJQCqRScLVbOAX_Dynl5Vg9BYSgMr04ImpDx8FhRFgMYTASi0cY",
            }}
            className="w-full h-full"
          />
        </TouchableOpacity>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="space-y-10 py-4">
          <View className="mb-2">
            <Typography
              variant="display-lg"
              weight="800"
              className="text-white mb-2"
            >
              Wallet
            </Typography>
            <Typography
              variant="body"
              className="text-text-secondary leading-relaxed"
            >
              Manage your funds securely with multi-layer escrow protocols and
              bank-grade encryption.
            </Typography>
          </View>

          {/* Balance Card */}
          <View className="space-y-6">
            <Card
              variant="high"
              className="p-8 relative overflow-hidden rounded-[32px] border-0 min-h-[260px] justify-between"
            >
              <View className="z-10">
                <View className="flex-row items-center space-x-2 mb-6">
                  <View className="p-2 bg-on-primary-fixed/10 rounded-lg">
                    <Shield size={16} color="#f5e642" fill="#f5e642" />
                  </View>
                  <Typography
                    variant="label"
                    className="text-text-secondary"
                    weight="700"
                  >
                    AVAILABLE BALANCE
                  </Typography>
                </View>
                <View className="flex-row items-baseline mb-3">
                  <Typography
                    variant="display-lg"
                    weight="800"
                    className="text-white text-5xl"
                  >
                    ₦ 2,450,000
                  </Typography>
                  <Typography
                    variant="display"
                    weight="700"
                    className="text-2xl text-text-secondary ml-1"
                  >
                    .00
                  </Typography>
                </View>
                <View className="flex-row items-center space-x-2 bg-on-primary-fixed/10 self-start px-3 py-1 rounded-full">
                  <TrendingUp size={12} color="#43e5b1" />
                  <Typography
                    variant="caption"
                    className="text-secondary"
                    weight="700"
                  >
                    +12.5% this month
                  </Typography>
                </View>
              </View>

              <View className="flex-row space-x-4 mt-10 z-10">
                <View className="flex-1">
                  <Button
                    label="Add Funds"
                    onPress={() => router.push("/wallet/fund")}
                    className="h-14 rounded-2xl bg-primary-fixed"
                    textClassName="text-on-primary-fixed font-inter-bold"
                    leftIcon={<Plus size={20} color="#1f1c00" />}
                  />
                </View>

                <View className="flex-1">
                  <Button
                    label="Withdraw"
                    variant="ghost"
                    onPress={() => {}}
                    className="h-14 rounded-2xl bg-surface-container-high border border-outline-variant/10"
                    textClassName="text-white font-inter-bold"
                  />
                </View>
              </View>

              <View
                className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-primary-fixed/10 rounded-full"
                style={{ filter: "blur(70px)" }}
              />
            </Card>

            <Card
              variant="low"
              className="p-8 border border-outline-variant/10 rounded-[32px] bg-surface-container"
            >
              <View className="flex-row justify-between items-start mb-6">
                <View className="w-12 h-12 bg-secondary/10 rounded-2xl items-center justify-center">
                  <Lock size={24} color="#43e5b1" fill="#43e5b1" />
                </View>
                <View className="flex-row -space-x-4">
                  <View className="w-10 h-10 rounded-full bg-surface-bright border-2 border-surface-container items-center justify-center">
                    <Smartphone size={16} color="#8b949e" />
                  </View>
                  <View className="w-10 h-10 rounded-full bg-surface-bright border-2 border-surface-container items-center justify-center">
                    <Fingerprint size={16} color="#8b949e" />
                  </View>
                </View>
              </View>
              <Typography
                variant="subheading"
                weight="700"
                className="text-white mb-2"
              >
                Secure by LemonPay Guard
              </Typography>
              <Typography
                variant="body"
                className="text-text-secondary leading-relaxed"
              >
                Your funds are protected by multi-signature escrow protocols and
                military-grade biometric verification.
              </Typography>
            </Card>
          </View>

          {/* Transaction History Section */}
          <View>
            <View className="flex-row justify-between items-center mb-8 px-1">
              <View>
                <Typography variant="heading" weight="700">
                  Recent Transactions
                </Typography>
                <Typography
                  variant="caption"
                  className="text-text-secondary mt-1"
                >
                  Activity from the last 30 days
                </Typography>
              </View>
              <TouchableOpacity onPress={() => router.push("/transactions")}>
                <Typography
                  variant="label"
                  className="text-primary-fixed"
                  weight="700"
                >
                  See All
                </Typography>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              {[
                {
                  title: "Wallet Fund",
                  sub: "Bank Transfer • Oct 24",
                  amount: "+ ₦ 500,000",
                  status: "Success",
                  icon: <WalletIcon size={22} color="#f5e642" />,
                  color: "text-secondary",
                },
                {
                  title: "Escrow Funded",
                  sub: "iPhone 15 Pro Max • Oct 22",
                  amount: "- ₦ 1,200,000",
                  status: "Pending",
                  icon: <Gavel size={22} color="#8b949e" />,
                  color: "text-white",
                },
                {
                  title: "Escrow Released",
                  sub: "Web Design Gig • Oct 18",
                  amount: "+ ₦ 150,000",
                  status: "Success",
                  icon: <CheckCircle2 size={22} color="#43e5b1" />,
                  color: "text-secondary",
                },
                {
                  title: "Disputed Escrow",
                  sub: "Logo Design • Oct 15",
                  amount: "₦ 75,000",
                  status: "Disputed",
                  icon: <AlertCircle size={22} color="#ffb4ab" />,
                  color: "text-text-secondary",
                },
              ].map((item, i) => (
                <Pressable
                  key={i}
                  onPress={() => router.push(`/transactions/LP-${i + 8000}`)}
                  className="bg-surface-container border border-outline-variant/10 rounded-[28px] p-5 flex-row items-center justify-between active:bg-surface-bright transition-colors"
                >
                  <View className="flex-row items-center space-x-5">
                    <View className="w-14 h-14 bg-surface-bright rounded-2xl items-center justify-center">
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
                      <Typography
                        variant="caption"
                        className="text-text-secondary"
                      >
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
                    <View
                      className={`flex-row items-center space-x-1.5 px-3 py-1 rounded-full mt-2 ${item.status === "Success" ? "bg-secondary/10" : item.status === "Pending" ? "bg-primary-fixed/10" : "bg-accent-danger/10"}`}
                    >
                      <View
                        className={`w-1.5 h-1.5 rounded-full ${item.status === "Success" ? "bg-secondary" : item.status === "Pending" ? "bg-primary-fixed" : "bg-accent-danger"}`}
                      />
                      <Typography
                        variant="label-sm"
                        weight="800"
                        className={`text-[8px] tracking-wider uppercase ${item.status === "Success" ? "text-secondary" : item.status === "Pending" ? "text-primary-fixed" : "text-accent-danger"}`}
                      >
                        {item.status}
                      </Typography>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Trust Signals Section */}
          <Card
            variant="low"
            className="mt-6 p-8 rounded-[40px] border border-outline-variant/5 items-center bg-surface-container/50"
          >
            <View className="w-16 h-16 rounded-full bg-primary-fixed items-center justify-center mb-6">
              <Verified size={32} color="#1f1c00" fill="#1f1c00" />
            </View>
            <Typography
              variant="heading"
              weight="700"
              className="text-white mb-2 text-center"
            >
              Verified Merchant Wallet
            </Typography>
            <Typography
              variant="body"
              className="text-text-secondary text-center max-w-sm leading-relaxed"
            >
              You have a Tier 3 account. All transactions are insured up to ₦
              5,000,000 via SecureTrust Insurance.
            </Typography>

            <View className="flex-row justify-center space-x-10 mt-10 opacity-30">
              <View className="items-center space-y-2">
                <Shield size={20} color="#ffffff" />
                <Typography
                  variant="label-sm"
                  weight="700"
                  className="text-[8px]"
                >
                  PCI DSS
                </Typography>
              </View>
              <View className="items-center space-y-2">
                <Lock size={20} color="#ffffff" />
                <Typography
                  variant="label-sm"
                  weight="700"
                  className="text-[8px]"
                >
                  SSL-256
                </Typography>
              </View>
              <View className="items-center space-y-2">
                <Fingerprint size={20} color="#ffffff" />
                <Typography
                  variant="label-sm"
                  weight="700"
                  className="text-[8px]"
                >
                  BIO-AUTH
                </Typography>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
