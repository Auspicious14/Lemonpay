import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
  Switch,
} from "react-native";
import {
  Shield,
  Settings,
  ArrowLeft,
  User,
  Phone,
  ChevronRight,
  Verified,
  Fingerprint,
  Lock,
  Key,
  HelpCircle,
  ShieldCheck,
  LogOut,
  Info,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";

export default function ProfileScreen() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  return (
    <Screen
      title="Security & Profile"
      showBackButton
      rightAction={
        <TouchableOpacity className="active:scale-95">
          <Settings size={24} color="#f5e642" />
        </TouchableOpacity>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-32">
        <View className="space-y-10 py-6">
          {/* Profile Header Section */}
          <View className="items-center py-4 space-y-4">
            <View className="relative">
              <View className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary-fixed to-secondary shadow-2xl">
                <View className="w-full h-full rounded-full border-4 border-surface overflow-hidden">
                  <Image
                    source={{
                      uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCX2mSUBfyX4RszzmGlIshliLPKd4l8icYxvzPXP3yVolv6M2Qqim_sOkGZkTjDuQnwhaikecO2d7Hxqhzhd6G3Jz2GDDosrGn_g0BJGUHWvOhPHxXy09QlFX1HCZOCj1jC4LVuUeQdh7no_KG9FdYKbc_kxabziJ53Vj20Es15t-p2pChvpw-NLqwjrk_0TCJ1jD383WD4eIczQmea8AItYLRhBqFTQhi-wBYftBHcQ_X_Okn-cgtLBTSs0ZVCr-_RERzlhLeFFmBF",
                    }}
                    className="w-full h-full"
                  />
                </View>
              </View>
              <View className="absolute bottom-1 right-1 bg-secondary px-3 py-1 rounded-full border-2 border-surface">
                <Typography
                  variant="label-sm"
                  className="text-[8px] text-on-secondary-container font-extrabold tracking-widest"
                >
                  Tier 3 Verified
                </Typography>
              </View>
            </View>
            <View className="items-center">
              <Typography variant="display" className="text-3xl tracking-tight">
                Chinedu Okafor
              </Typography>
              <Typography variant="body" className="text-text-secondary mt-1">
                chinedu.okafor@lemonpay.ng
              </Typography>
            </View>
          </View>

          {/* Personal Info Section */}
          <View className="space-y-4">
            <Typography
              variant="label-sm"
              className="text-outline-variant font-extrabold tracking-[0.2em] ml-2"
            >
              Personal Information
            </Typography>
            <Card variant="low" className="p-6 space-y-8">
              <View className="flex-row justify-between items-center">
                <View>
                  <Typography
                    variant="label-sm"
                    className="text-outline-variant text-[10px]"
                  >
                    Full Name
                  </Typography>
                  <Typography variant="body" className="font-semibold text-lg">
                    Chinedu Okafor
                  </Typography>
                </View>
                <User size={20} color="#4a4734" />
              </View>
              <View className="flex-row justify-between items-center">
                <View>
                  <Typography
                    variant="label-sm"
                    className="text-outline-variant text-[10px]"
                  >
                    Phone Number
                  </Typography>
                  <Typography variant="body" className="font-semibold text-lg">
                    +234 803 123 4567
                  </Typography>
                </View>
                <Phone size={20} color="#4a4734" />
              </View>
            </Card>
          </View>

          {/* Account Limits Section */}
          <View className="space-y-4">
            <Typography
              variant="label-sm"
              className="text-outline-variant font-extrabold tracking-[0.2em] ml-2"
            >
              Account Limits
            </Typography>
            <Card
              variant="default"
              className="p-8 relative overflow-hidden border border-outline-variant/20"
            >
              <View className="z-10">
                <Typography
                  variant="label-sm"
                  className="text-primary-fixed mb-2"
                >
                  Daily Transaction Limit
                </Typography>
                <View className="flex-row items-baseline space-x-2">
                  <Typography variant="display" className="text-4xl">
                    ₦5,000,000
                  </Typography>
                  <Typography variant="body" className="text-text-secondary">
                    / day
                  </Typography>
                </View>
                <View className="mt-6 w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <View className="h-full w-[15%] bg-secondary shadow-[0_0_12px_rgba(67,229,177,0.5)]" />
                </View>
                <Typography
                  variant="label-sm"
                  className="text-outline-variant mt-3 text-[9px] lowercase"
                >
                  Used ₦750,000 today
                </Typography>
              </View>
              <View
                className="absolute top-[-32px] right-[-32px] w-32 h-32 bg-primary-fixed/5 rounded-full"
                style={{ filter: "blur(40px)" }}
              />
            </Card>
          </View>

          {/* Security Sentinel Section */}
          <View className="space-y-4">
            <Typography
              variant="label-sm"
              className="text-outline-variant font-extrabold tracking-[0.2em] ml-2"
            >
              Security Sentinel
            </Typography>
            <Card variant="high" className="p-0 overflow-hidden">
              <View className="flex-row items-center justify-between p-6">
                <View className="flex-row items-center space-x-4">
                  <View className="w-12 h-12 bg-primary-fixed/10 rounded-2xl items-center justify-center">
                    <ShieldCheck size={24} color="#f5e642" />
                  </View>
                  <View>
                    <Typography variant="body" className="font-bold">
                      Two-Factor Auth
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-text-secondary"
                    >
                      Secure your account with OTP
                    </Typography>
                  </View>
                </View>
                <Switch
                  value={is2FAEnabled}
                  onValueChange={setIs2FAEnabled}
                  trackColor={{ false: "#31353c", true: "#f5e642" }}
                  thumbColor={is2FAEnabled ? "#1f1c00" : "#4a4734"}
                />
              </View>

              <View className="h-[1px] bg-outline-variant/10 w-full" />

              <View className="flex-row items-center justify-between p-6">
                <View className="flex-row items-center space-x-4">
                  <View className="w-12 h-12 bg-primary-fixed/10 rounded-2xl items-center justify-center">
                    <Fingerprint size={24} color="#f5e642" />
                  </View>
                  <View>
                    <Typography variant="body" className="font-bold">
                      Biometric Login
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-text-secondary"
                    >
                      FaceID or Fingerprint
                    </Typography>
                  </View>
                </View>
                <Switch
                  value={isBiometricEnabled}
                  onValueChange={setIsBiometricEnabled}
                  trackColor={{ false: "#31353c", true: "#f5e642" }}
                  thumbColor={isBiometricEnabled ? "#1f1c00" : "#4a4734"}
                />
              </View>

              <View className="h-[1px] bg-outline-variant/10 w-full" />

              <Pressable className="flex-row items-center justify-between p-6 active:bg-surface-bright/10">
                <View className="flex-row items-center space-x-4">
                  <View className="w-12 h-12 bg-primary-fixed/10 rounded-2xl items-center justify-center">
                    <Key size={24} color="#f5e642" />
                  </View>
                  <View>
                    <Typography variant="body" className="font-bold">
                      Transaction PIN
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-text-secondary"
                    >
                      Change your security code
                    </Typography>
                  </View>
                </View>
                <ChevronRight size={20} color="#4a4734" />
              </Pressable>
            </Card>
          </View>

          {/* Support & Legal Section */}
          <View className="space-y-4">
            <Typography
              variant="label-sm"
              className="text-outline-variant font-extrabold tracking-[0.2em] ml-2"
            >
              Support & Legal
            </Typography>
            <View className="flex-row space-x-4">
              <TouchableOpacity className="flex-1">
                <Card
                  variant="low"
                  className="p-6 items-center space-y-3 active:scale-95 transition-transform"
                >
                  <HelpCircle size={28} color="#43e5b1" />
                  <Typography variant="body" className="font-bold">
                    Help Center
                  </Typography>
                  <Typography
                    variant="label-sm"
                    className="text-[8px] text-outline-variant lowercase text-center"
                  >
                    24/7 Priority support
                  </Typography>
                </Card>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1">
                <Card
                  variant="low"
                  className="p-6 items-center space-y-3 active:scale-95 transition-transform"
                >
                  <ShieldCheck size={28} color="#43e5b1" />
                  <Typography variant="body" className="font-bold">
                    Privacy Policy
                  </Typography>
                  <Typography
                    variant="label-sm"
                    className="text-[8px] text-outline-variant lowercase text-center"
                  >
                    Your data, your rights
                  </Typography>
                </Card>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Section */}
          <View className="items-center py-12">
            <TouchableOpacity className="flex-row items-center space-x-3 px-10 py-4 bg-surface-container-highest/40 rounded-full active:scale-95 transition-transform">
              <LogOut size={18} color="#ffb4ab" />
              <Typography
                variant="body"
                className="font-bold text-text-secondary"
              >
                Logout Account
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
