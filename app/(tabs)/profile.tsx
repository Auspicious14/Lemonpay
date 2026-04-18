import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Settings,
  User as UserIcon,
  Phone,
  Shield,
  Fingerprint,
  ChevronRight,
  HelpCircle,
  FileText,
  LogOut,
  Hash,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { useToastStore } from "@/store/useToastStore";
import { formatCurrency } from "@/lib/utils/format";
import { useWalletBalance } from "@/lib/hooks/useWallet";

const SectionLabel = ({ label }: { label: string }) => (
  <Text className="text-[#8B949E] font-inter-bold text-[10px] tracking-[2px] mb-3 uppercase">
    {label}
  </Text>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { show: showToast } = useToastStore();
  const { data: balance } = useWalletBalance();

  const [tfaEnabled, setTfaEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout Account", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleComingSoon = () => {
    showToast("Coming soon", "info");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0D1117]">
      <StatusBar style="light" />

      {/* HEADER */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-[#0D1117]">
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home")}
          className="flex-row items-center"
        >
          <ArrowLeft size={24} color="white" />
          <Text className="text-white font-inter-bold text-xl ml-4">
            Security & Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleComingSoon}>
          <Settings size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* USER HERO */}
        <View className="items-center mt-6 mb-8">
          <View className="relative">
            <Avatar
              name={`${user?.first_name} ${user?.last_name}`}
              size="lg"
              className="border-[3px] border-secondary-container"
            />
            <View className="absolute -bottom-2 self-center">
              <Badge
                status="released"
                label={user?.account_type === "seller" ? "VERIFIED SELLER" : "VERIFIED BUYER"}
                className="bg-secondary-container rounded-full"
              />
            </View>
          </View>
          <Text className="text-white font-inter-bold text-2xl mt-6">
            {user?.first_name} {user?.last_name}
          </Text>
          <Text className="text-[#8B949E] font-inter text-sm mt-1">
            {user?.email}
          </Text>
        </View>

        {/* PERSONAL INFORMATION */}
        <View className="mb-8">
          <SectionLabel label="PERSONAL INFORMATION" />
          <View className="bg-[#161B22] rounded-xl overflow-hidden">
            <View className="flex-row items-center p-5">
              <View className="flex-1">
                <Text className="text-[#8B949E] font-inter-bold text-[10px] uppercase mb-1">
                  FULL NAME
                </Text>
                <Text className="text-white font-inter-medium text-base">
                  {user?.first_name} {user?.last_name}
                </Text>
              </View>
              <UserIcon size={20} color="#8B949E" />
            </View>
            <Divider className="mx-5 bg-[#30363D]" />
            <View className="flex-row items-center p-5">
              <View className="flex-1">
                <Text className="text-[#8B949E] font-inter-bold text-[10px] uppercase mb-1">
                  PHONE NUMBER
                </Text>
                <Text className="text-white font-inter-medium text-base">
                  {user?.phone_no || "Not provided"}
                </Text>
              </View>
              <Phone size={20} color="#8B949E" />
            </View>
          </View>
        </View>

        {/* ACCOUNT LIMITS */}
        <View className="mb-8">
          <SectionLabel label="ACCOUNT LIMITS" />
          <View className="bg-[#161B22] rounded-xl p-5">
            <Text className="text-accent-primary font-inter-bold text-[10px] uppercase mb-2">
              WALLET BALANCE
            </Text>
            <View className="flex-row items-baseline mb-4">
              <Text className="text-white font-inter-extrabold text-3xl">
                {formatCurrency(balance?.balance || 0)}
              </Text>
            </View>
            <Text className="text-accent-primary font-inter-bold text-[10px] uppercase mb-2">
              DAILY TRANSACTION LIMIT
            </Text>
            <View className="flex-row items-baseline mb-4">
              <Text className="text-white font-inter-extrabold text-3xl">
                ₦5,000,000
              </Text>
              <Text className="text-[#8B949E] font-inter-medium text-sm ml-2">
                /day
              </Text>
            </View>
            <View className="h-2 bg-[#0D1117] rounded-full overflow-hidden mb-2">
              <View className="h-full bg-secondary-container w-[1%]" />
            </View>
            <Text className="text-[#8B949E] font-inter text-xs">
              Securely held in escrow
            </Text>
          </View>
        </View>

        {/* SECURITY SENTINEL */}
        <View className="mb-8">
          <SectionLabel label="SECURITY SENTINEL" />
          <View className="bg-[#161B22] rounded-xl">
            {/* Row 1: 2FA */}
            <View className="flex-row items-center p-5">
              <View className="w-10 h-10 bg-[#0D1117] rounded-lg items-center justify-center mr-4">
                <Shield size={20} color="#F5E642" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-inter-bold text-base">
                  Two-Factor Authentication
                </Text>
                <Text className="text-[#8B949E] font-inter text-xs mt-0.5">
                  Secure your account with 2FA
                </Text>
              </View>
              <Switch
                value={tfaEnabled}
                onValueChange={(val) => {
                  setTfaEnabled(val);
                  handleComingSoon();
                }}
                trackColor={{ false: "#30363D", true: "#F5E642" }}
                thumbColor={tfaEnabled ? "#161B22" : "#8B949E"}
              />
            </View>
            <Divider className="mx-5 bg-[#30363D]" />

            {/* Row 2: Biometric */}
            <View className="flex-row items-center p-5">
              <View className="w-10 h-10 bg-[#0D1117] rounded-lg items-center justify-center mr-4">
                <Fingerprint size={20} color="#8B949E" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-inter-bold text-base">
                  Biometric Login
                </Text>
                <Text className="text-[#8B949E] font-inter text-xs mt-0.5">
                  FaceID or Fingerprint
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={(val) => {
                  setBiometricEnabled(val);
                  handleComingSoon();
                }}
                trackColor={{ false: "#30363D", true: "#F5E642" }}
                thumbColor={biometricEnabled ? "#161B22" : "#8B949E"}
              />
            </View>
            <Divider className="mx-5 bg-[#30363D]" />

            {/* Row 3: PIN */}
            <TouchableOpacity
              className="flex-row items-center p-5"
              onPress={() => router.push("/pin-setup")}
            >
              <View className="w-10 h-10 bg-accent-primary rounded-lg items-center justify-center mr-4">
                <Hash size={20} color="#0D1117" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-inter-bold text-base">
                  Transaction PIN
                </Text>
                <Text className="text-[#8B949E] font-inter text-xs mt-0.5">
                  Change your 4-digit security code
                </Text>
              </View>
              <ChevronRight size={20} color="#8B949E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SUPPORT & LEGAL */}
        <View className="mb-8">
          <SectionLabel label="SUPPORT & LEGAL" />
          <View className="flex-row gap-x-3">
            <TouchableOpacity
              className="flex-1 bg-[#161B22] rounded-xl p-5"
              onPress={handleComingSoon}
            >
              <View className="w-8 h-8 bg-secondary-container/20 rounded-lg items-center justify-center mb-3">
                <HelpCircle size={18} color="#00C896" />
              </View>
              <Text className="text-white font-inter-bold text-sm">
                Help Center
              </Text>
              <Text className="text-[#8B949E] font-inter text-[10px] mt-1">
                Get 24/7 priority support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-[#161B22] rounded-xl p-5"
              onPress={handleComingSoon}
            >
              <View className="w-8 h-8 bg-blue-500/10 rounded-lg items-center justify-center mb-3">
                <FileText size={18} color="#b1c5ff" />
              </View>
              <Text className="text-white font-inter-bold text-sm">
                Privacy Policy
              </Text>
              <Text className="text-[#8B949E] font-inter text-[10px] mt-1">
                Your data, your rights
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          className="bg-[#21262D] border border-[#30363D] h-14 rounded-full items-center justify-center flex-row mb-12"
          onPress={handleLogout}
        >
          <LogOut size={20} color="white" />
          <Text className="text-white font-inter-bold text-base ml-3">
            Logout Account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
