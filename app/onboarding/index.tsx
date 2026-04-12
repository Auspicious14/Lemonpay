import React from "react";
import { useRouter } from "expo-router";
import { View, Image, ImageBackground } from "react-native";
import { Lock } from "lucide-react-native";
import { OnboardingSlide } from "../../components/onboarding/OnboardingSlide";
import { Typography } from "../../components/ui/Typography";
import { Card } from "../../components/ui/Card";

export default function WelcomeSlide() {
  const router = useRouter();

  return (
    <OnboardingSlide
      step={1}
      tag="ESCROW INTELLIGENCE 01"
      title="Secure"
      titleAccent="Every Trade"
      description="The guardian of your digital commerce. We hold funds in a lemonpay vault until every promise is kept, ensuring absolute transparency in every transaction."
      onNext={() => router.push("/onboarding/features")}
    >
      <View className="items-center justify-center py-6">
        <View className="w-full aspect-square max-w-[320px] relative">
          {/* Main Vault Image */}
          <View className="absolute inset-0 bg-[#161B22] rounded-[48px] overflow-hidden border border-outline-variant/10">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
              }} // Fallback or use generated
              className="w-full h-full opacity-60"
              resizeMode="cover"
            />
            {/* Overlay a safer vault look if available */}
            <View className="absolute inset-0 items-center justify-center">
              <View className="w-40 h-40 rounded-full border-[10px] border-primary-fixed/20 items-center justify-center">
                <Lock size={64} color="#f5e642" strokeWidth={1.5} />
              </View>
            </View>
          </View>

          {/* Floating Card: Vault Status */}
          <Card
            variant="high"
            className="absolute bottom-6 left-6 right-6 flex-row items-center p-4 bg-surface-container/90 border-outline-variant/20"
          >
            <View className="w-12 h-12 bg-primary-fixed rounded-2xl items-center justify-center mr-4">
              <Lock size={20} color="#1f1c00" fill="#1f1c00" />
            </View>
            <View>
              <Typography variant="label" className="text-white">
                VAULT STATUS
              </Typography>
              <Typography variant="label-sm" className="text-secondary">
                Secured by the LemonPay Sentinel Protocol
              </Typography>
            </View>
          </Card>
        </View>

        {/* Bottom Stats */}
        <View className="flex-row items-center justify-around w-full mt-12 px-4">
          <View className="items-center">
            <Typography
              variant="display"
              className="text-white text-2xl font-inter-bold"
            >
              100%
            </Typography>
            <Typography variant="label-sm" className="text-gray-500 mt-1">
              ENCRYPTED
            </Typography>
          </View>
          <View className="w-[1px] h-10 bg-gray-800" />
          <View className="items-center">
            <Typography
              variant="display"
              className="text-white text-2xl font-inter-bold"
            >
              2.4s
            </Typography>
            <Typography variant="label-sm" className="text-gray-500 mt-1">
              AVG. RELEASE
            </Typography>
          </View>
        </View>
      </View>
    </OnboardingSlide>
  );
}
