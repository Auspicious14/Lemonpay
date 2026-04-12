import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdate = () => {
    // TODO: Update password API
    router.replace("/(auth)/login");
  };

  return (
    <Screen showBackButton title="SECURITY GATE" className="bg-surface">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="items-center justify-center pt-8 mb-12">
          {/* Hero Section */}
          <View className="p-4 rounded-full bg-surface-container-high mb-6 shadow-2xl shadow-primary-fixed/10">
            <Lock size={40} color="#f5e642" fill="#f5e642" />
          </View>
          <Typography variant="display" className="text-center mb-4 px-4">
            Create Secure Password
          </Typography>
          <Typography
            variant="body"
            className="text-text-secondary text-center max-w-sm px-6"
          >
            Your new password must be different from previously used passwords.
          </Typography>
        </View>

        <View className="space-y-8">
          {/* Form */}
          <View className="space-y-6">
            <View>
              <Input
                label="New Password"
                placeholder="••••••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              {/* Strength Indicator */}
              <View className="px-1 space-y-3 mt-2">
                <View className="flex-row justify-between items-center">
                  <Typography
                    variant="label-sm"
                    className="text-text-secondary"
                  >
                    Strength
                  </Typography>
                  <Typography variant="label-sm" className="text-secondary">
                    Strong
                  </Typography>
                </View>
                <View className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden flex-row space-x-1">
                  <View className="h-full flex-1 bg-secondary rounded-full" />
                  <View className="h-full flex-1 bg-secondary rounded-full" />
                  <View className="h-full flex-1 bg-secondary rounded-full" />
                </View>
              </View>
            </View>

            <Input
              label="Confirm New Password"
              placeholder="••••••••••••"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {/* Guidelines Bento Grid */}
          <View className="flex-row flex-wrap -mx-2">
            {[
              {
                label: "8+ Characters",
                icon: <CheckCircle2 size={16} color="#43e5b1" fill="#003828" />,
              },
              {
                label: "One Symbol",
                icon: <CheckCircle2 size={16} color="#43e5b1" fill="#003828" />,
              },
              {
                label: "One Number",
                icon: <CheckCircle2 size={16} color="#43e5b1" fill="#003828" />,
              },
              {
                label: "Upper Case",
                icon: (
                  <View className="w-4 h-4 rounded-full border border-text-secondary" />
                ),
                disabled: true,
              },
            ].map((item, i) => (
              <View key={i} className="w-1/2 p-2">
                <Card
                  variant="default"
                  className={`p-4 items-center flex-row space-x-3 ${item.disabled ? "opacity-50" : ""}`}
                >
                  {item.icon}
                  <Typography
                    variant="label-sm"
                    className="text-[10px] font-inter-bold"
                  >
                    {item.label}
                  </Typography>
                </Card>
              </View>
            ))}
          </View>

          <Button
            label="Update Password"
            onPress={handleUpdate}
            rightIcon={<ShieldCheck size={20} color="#1f1c00" />}
            className="mt-6"
          />
        </View>

        {/* Trust Signal Section */}
        <View className="mt-16 items-center">
          <View className="w-12 h-0.5 bg-outline-variant/20 mb-8" />
          <View className="flex-row items-center space-x-2 mb-8">
            <ShieldCheck size={14} color="#ccc7ad" />
            <Typography variant="label-sm" className="text-text-secondary">
              End-to-End Encryption Enabled
            </Typography>
          </View>

          <View className="w-full h-40 rounded-[32px] overflow-hidden opacity-30">
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRH4jK96USGI7lphOp65IGuo0zx--VXq68-RHzBtl62BLix4k0sIjYmCuyp-idSMcl8aXhNx88jKj9EIdvycSHRxZU2MrkhOry0u0wWXYKvUpd4HyAjgLWIOqgzrv7phUngDXlr3nT2UEe74igD-fv0PknFFObfRad6adj4-7oPQWvMIE4csaP4QbipSFcI4R6_VwnshSXF18Jbb0fBVLBl80gskZi96Hf0Tznc1jNWhKC8QpwPXnx5YUUe6s3Xd__O5ygJa-n9I1G",
              }}
              className="w-full h-full"
            />
            <View className="absolute inset-0 bg-gradient-to-t from-background-primary to-transparent" />
          </View>
        </View>
      </ScrollView>

      {/* Decorative Elements */}
      <View
        className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-fixed/5 rounded-full"
        pointerEvents="none"
        style={{ filter: "blur(120px)" }}
      />
      <View
        className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-secondary/5 rounded-full"
        pointerEvents="none"
        style={{ filter: "blur(100px)" }}
      />
    </Screen>
  );
}
