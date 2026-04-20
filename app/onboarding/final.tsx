import React from "react";
import { View, Image } from "react-native";
import { Rocket, Zap, Users, ArrowRight } from "lucide-react-native";
import { OnboardingSlide } from "../../components/onboarding/OnboardingSlide";
import { Typography } from "../../components/ui/Typography";
import { Card } from "../../components/ui/Card";

export default function FinalSlide() {
  return (
    <OnboardingSlide
      step={4}
      totalSteps={4}
      tag="READY TO START"
      title="Join the"
      titleAccent="Network"
      description="Join thousands of secure traders on the LymePay protocol. Your first transaction is minutes away."
      isLast
      onNext={() => {}}
    >
      <View className="gap-6 py-4">
        <View className="items-center justify-center py-6">
          <View className="w-32 h-32 bg-primary-fixed rounded-full items-center justify-center shadow-2xl shadow-primary-fixed/40">
            <Rocket size={64} color="#1f1c00" fill="#1f1c00" />
          </View>
        </View>

        <View className="gap-3">
          <BenefitItem
            icon={<Zap size={18} color="#f5e642" />}
            title="Fast Setup"
            desc="Verify your account in less than 2 minutes."
          />
          <BenefitItem
            icon={<Users size={18} color="#f5e642" />}
            title="Community Trusted"
            desc="Rated 4.9/5 by global commerce specialists."
          />
        </View>

        <Card
          variant="high"
          className="mt-4 p-6 bg-primary-fixed/5 border border-primary-fixed/20 items-center"
        >
          <Typography
            variant="body"
            className="text-primary-fixed font-inter-bold italic"
          >
            "The gold standard for escrow commerce."
          </Typography>
          <Typography
            variant="label-sm"
            className="text-gray-500 mt-2 uppercase"
          >
            SENTINEL TIMES
          </Typography>
        </Card>
      </View>
    </OnboardingSlide>
  );
}

const BenefitItem = ({
  icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) => (
  <View className="flex-row items-center gap-4 bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/10">
    <View className="w-10 h-10 bg-[#161B22] rounded-xl items-center justify-center">
      {icon}
    </View>
    <View className="flex-1">
      <Typography variant="body" className="text-white font-inter-semibold">
        {title}
      </Typography>
      <Typography variant="caption" className="text-gray-500">
        {desc}
      </Typography>
    </View>
  </View>
);
