import React from "react";
import { useRouter } from "expo-router";
import { View, ImageBackground } from "react-native";
import { Zap, BarChart3 } from "lucide-react-native";
import { OnboardingSlide } from "../../components/onboarding/OnboardingSlide";
import { Typography } from "../../components/ui/Typography";
import { Card } from "../../components/ui/Card";

export default function FeaturesSlide() {
  const router = useRouter();

  return (
    <OnboardingSlide
      step={2}
      tag="ONBOARDING JOURNEY"
      title="Instant"
      titleAccent="Settlement"
      description="Experience the speed of a sentinel. Funds are released the moment verification is confirmed. No delays, just liquidity."
      onNext={() => router.push("/onboarding/trust")}
    >
      <View className="gap-4 py-4">
        {/* Zero Latency Card */}
        <Card
          variant="default"
          className="p-6 bg-[#161B22] border-outline-variant/10"
        >
          <View className="w-12 h-12 bg-primary-fixed/10 rounded-xl items-center justify-center mb-6">
            <Zap size={24} color="#f5e642" fill="#f5e642" />
          </View>
          <Typography variant="subheading" className="text-white mb-2">
            Zero Latency
          </Typography>
          <Typography variant="body" className="!text-gray-400 mb-8">
            Verified transactions are settled in{" "}
            <Typography className="!text-secondary">ms.</Typography>
          </Typography>

          <View>
            <Typography variant="display" className="text-white text-4xl">
              99.9%
            </Typography>
            <Typography
              variant="label-sm"
              className="!text-gray-500 uppercase tracking-widest mt-1"
            >
              UPTIME EFFICIENCY
            </Typography>
          </View>
        </Card>

        {/* Processing Speed Card */}
        <Card
          variant="low"
          className="p-0 overflow-hidden border-outline-variant/5"
        >
          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
            }}
            className="w-full h-40 items-center justify-center"
            imageStyle={{ opacity: 0.2 }}
          >
            <View className="bg-surface-container/60 p-6 rounded-3xl border border-white/5 items-center">
              <View className="flex-row gap-1 mb-4">
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    className={`w-1.5 h-6 rounded-full ${i === 2 ? "bg-primary-fixed" : "bg-secondary"}`}
                  />
                ))}
              </View>
              <Typography variant="label" className="text-white tracking-[2px]">
                PROCESSING SPEED
              </Typography>
            </View>
          </ImageBackground>
        </Card>

        {/* Progress Tracker */}
        <View className="mt-8">
          <View className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex-row">
            <View className="h-full w-[45%] bg-secondary" />
            <View className="h-full w-[5%] bg-primary-fixed" />
          </View>
          <View className="flex-row justify-between mt-4">
            <Typography
              variant="label-sm"
              className="!text-secondary font-inter-bold"
            >
              VERIFIED
            </Typography>
            <Typography
              variant="label-sm"
              className="!text-primary-fixed font-inter-bold"
            >
              SETTLING NOW
            </Typography>
            <Typography
              variant="label-sm"
              className="!text-gray-600 font-inter-bold"
            >
              COMPLETED
            </Typography>
          </View>
        </View>
      </View>
    </OnboardingSlide>
  );
}
