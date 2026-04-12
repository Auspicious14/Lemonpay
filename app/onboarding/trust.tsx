import React from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { ShieldCheck, Lock, Globe, CheckCircle2 } from "lucide-react-native";
import { OnboardingSlide } from "../../components/onboarding/OnboardingSlide";
import { Typography } from "../../components/ui/Typography";
import { Card } from "../../components/ui/Card";

export default function TrustSlide() {
  const router = useRouter();

  return (
    <OnboardingSlide
      step={3}
      totalSteps={4}
      tag="GOVERNANCE & TRUST"
      title="Absolute"
      titleAccent="Transparency"
      description="LemonPay uses bank-grade security and industry standard encryption to protect your funds and ensure every transaction is traceable."
      onNext={() => router.push("/onboarding/final")}
    >
      <View className="gap-6 py-4">
        <View className="flex-row gap-4">
          <Card
            variant="high"
            className="flex-1 p-6 items-center bg-[#161B22] border-outline-variant/10"
          >
            <Lock size={32} color="#f5e642" className="mb-4" />
            <Typography variant="label" className="text-white">
              Bank-Grade
            </Typography>
            <Typography variant="label-sm" className="text-gray-500 mt-1">
              SECURITY
            </Typography>
          </Card>
          <Card
            variant="high"
            className="flex-1 p-6 items-center bg-[#161B22] border-outline-variant/10"
          >
            <Globe size={32} color="#f5e642" className="mb-4" />
            <Typography variant="label" className="text-white">
              Global
            </Typography>
            <Typography variant="label-sm" className="text-gray-500 mt-1">
              STANDARD
            </Typography>
          </Card>
        </View>

        <Card
          variant="default"
          className="p-6 flex-row items-center bg-surface-container/40 border-secondary/20"
        >
          <View className="w-12 h-12 rounded-full bg-secondary/10 items-center justify-center mr-4">
            <CheckCircle2 size={24} color="#01c896" />
          </View>
          <View className="flex-1">
            <Typography
              variant="body"
              className="text-white font-inter-semibold"
            >
              Verified by Paystack
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              Official Infrastructure Partner
            </Typography>
          </View>
        </Card>

        <View className="mt-4 p-6 rounded-[32px] bg-[#161B22] border border-outline-variant/10">
          <View className="flex-row items-center mb-4">
            <ShieldCheck size={20} color="#f5e642" />
            <Typography
              variant="label"
              className="text-white ml-2 uppercase tracking-widest"
            >
              Security Protocol
            </Typography>
          </View>
          {[
            "256-bit AES Encryption",
            "Multi-factor Authentication",
            "Real-time Fraud Monitoring",
          ].map((item, i) => (
            <View key={i} className="flex-row items-center mt-2">
              <View className="w-1 h-1 rounded-full bg-secondary mr-2" />
              <Typography variant="caption" className="text-gray-400">
                {item}
              </Typography>
            </View>
          ))}
        </View>
      </View>
    </OnboardingSlide>
  );
}
