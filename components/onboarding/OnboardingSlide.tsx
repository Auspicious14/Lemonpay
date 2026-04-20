import React from "react";
import { View, TouchableOpacity, ScrollView, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Shield,
  ChevronRight,
  HelpCircle,
  ArrowLeft,
} from "lucide-react-native";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";

interface OnboardingSlideProps {
  step: number;
  totalSteps?: number;
  title: string;
  titleAccent?: string;
  description: string;
  tag?: string;
  children: React.ReactNode;
  onNext: () => void;
  isLast?: boolean;
  showSkip?: boolean;
  contentContainerStyle?: ViewStyle;
}

export const OnboardingSlide = ({
  step,
  totalSteps = 4,
  title,
  titleAccent,
  description,
  tag,
  children,
  onNext,
  isLast,
  showSkip = true,
  contentContainerStyle,
}: OnboardingSlideProps) => {
  const router = useRouter();
  const { markAsLaunched } = useAuth();

  const handleSkip = async () => {
    await markAsLaunched();
    router.replace("/(auth)/login");
  };

  const handleNext = async () => {
    if (isLast) {
      await markAsLaunched();
      router.replace("/(auth)/register");
    } else {
      onNext();
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#0D1117] px-6"
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between py-2">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 items-center justify-center bg-primary-fixed rounded-lg">
            <Shield size={20} color="#1f1c00" fill="#1f1c00" />
          </View>
          <Typography
            variant="subheading"
            className="!text-primary-fixed tracking-tight font-inter-bold"
          >
            LymePay{" "}
          </Typography>
        </View>
        <Typography variant="label-sm" className="!text-gray-500">
          STEP {step.toString().padStart(2, "0")} /{" "}
          {totalSteps.toString().padStart(2, "0")}
        </Typography>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={[{ paddingBottom: 40 }, contentContainerStyle]}
      >
        <View className="mt-8 mb-6">
          {tag && (
            <View className="bg-surface-container-high self-start px-3 py-1 rounded-full mb-4">
              <Typography variant="label-sm" className="!text-gray-400">
                {tag}
              </Typography>
            </View>
          )}

          <View>
            <Typography variant="display-lg" className="!text-white">
              {title}
            </Typography>
            {titleAccent && (
              <Typography variant="display-lg" className="!text-primary-fixed">
                {titleAccent}
              </Typography>
            )}
          </View>

          <Typography className="!text-gray-400 text-lg mt-4 leading-7">
            {description}
          </Typography>
        </View>

        {children}
      </ScrollView>

      {/* Footer Actions */}
      <View className="pb-8 gap-4">
        <Button
          label={isLast ? "Get Started" : "Next"}
          onPress={handleNext}
          rightIcon={<ChevronRight size={20} color="#1f1c00" className="!font-bold" />}
          className="shadow-2xl shadow-primary-fixed/20 !text-black !rounded-md"
          textClassName="!text-black !font-inter-bold"
        />

        {showSkip && !isLast && (
          <TouchableOpacity onPress={handleSkip} className="items-center py-2">
            <Typography
              variant="label"
              className="text-gray-500 font-inter-semibold"
            >
              SKIP FOR NOW
            </Typography>
          </TouchableOpacity>
        )}

        <View className="flex-row items-center justify-between mt-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={20} color="#31353c" />
          </TouchableOpacity>

          {/* Custom page indicator bars */}
          <View className="flex-row gap-1.5 flex-1 justify-center px-10">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                className={`h-1 rounded-full flex-1 ${i + 1 === step ? "bg-primary-fixed" : "bg-surface-container-highest"}`}
              />
            ))}
          </View>

          <TouchableOpacity className="p-2">
            <HelpCircle size={20} color="#31353c" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
