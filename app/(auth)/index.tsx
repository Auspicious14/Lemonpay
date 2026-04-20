import React, { useState, useRef } from "react";
import {
  View,
  FlatList,
  Dimensions,
  Animated,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const { width, height } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  tag: string;
  title: string;
  highlight: string;
  description: string;
  content: (currentIndex: number) => React.ReactNode;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Navigate to the next part of the flow (Role Selection)
      router.push("/(auth)/role-selection");
    }
  };

  const handleSkip = () => {
    router.push("/(auth)/login");
  };

  const ONBOARDING_DATA: OnboardingSlide[] = [
    {
      id: "1",
      tag: "ESCROW INTELLIGENCE 01",
      title: "Secure",
      highlight: "Every Trade",
      description:
        "The guardian of your digital commerce. We hold funds in a lymepay vault until every promise is kept, ensuring absolute transparency in every transaction.",
      content: () => (
        <View className="items-center justify-center w-full aspect-square relative">
          {/* Main Vault Image Area */}
          <View className="w-full h-full bg-[#161B22] rounded-[48px] overflow-hidden border border-[#30363D] items-center justify-center relative">
            <LinearGradient
              colors={["rgba(67, 229, 177, 0.1)", "transparent"]}
              className="absolute inset-0"
            />

            {/* Safe/Vault Mockup */}
            <View className="w-32 h-32 bg-[#21262d] rounded-2xl border-2 border-[#30363D] items-center justify-center shadow-2xl">
              <MaterialCommunityIcons name="safe" size={64} color="#8B949E" />
              <View className="absolute w-full h-[2px] bg-[#30363D] top-1/2" />
              <View className="absolute h-full w-[2px] bg-[#30363D] left-1/2" />
            </View>

            {/* Status Overlay */}
            <View className="absolute bottom-8 left-6 right-6 bg-[#0D1117] p-5 rounded-3xl border border-[#30363D] flex-row items-center border-l-4 border-l-[#F5E642]">
              <View className="w-12 h-12 rounded-full bg-[#F5E642] items-center justify-center mr-4">
                <Ionicons name="lock-closed" size={24} color="#0D1117" />
              </View>
              <View>
                <Typography
                  variant="label"
                  className="text-white text-[12px] font-inter-bold mb-0.5"
                >
                  VAULT STATUS
                </Typography>
                <Typography
                  variant="caption"
                  className="text-[#43E5B1] font-inter-medium"
                >
                  Secured by LymePay Protocol
                </Typography>
              </View>
            </View>
          </View>

          {/* Stats below image */}
          <View className="flex-row items-center justify-center space-x-12 mt-10">
            <View className="items-center">
              <Typography variant="display" className="text-white text-[28px]">
                100%
              </Typography>
              <Typography variant="label-sm" className="text-[#8B949E]">
                ENCRYPTED
              </Typography>
            </View>
            <View className="h-10 w-[1px] bg-[#30363D]" />
            <View className="items-center">
              <Typography variant="display" className="text-white text-[28px]">
                2.4s
              </Typography>
              <Typography variant="label-sm" className="text-[#8B949E]">
                AVG. RELEASE
              </Typography>
            </View>
          </View>
        </View>
      ),
    },
    {
      id: "2",
      tag: "ONBOARDING JOURNEY",
      title: "Instant",
      highlight: "Settlement",
      description:
        "Experience the speed of a sentinel. Funds are released the moment verification is confirmed. No delays, just liquidity.",
      content: () => (
        <View className="w-full space-y-6">
          {/* Zero Latency Card */}
          <Card
            variant="low"
            className="bg-[#161B22] border-[#30363D] p-8"
            radius="xl"
          >
            <Ionicons name="flash" size={40} color="#F5E642" className="mb-6" />
            <Typography variant="heading" className="text-white mb-2">
              Zero Latency
            </Typography>
            <Typography variant="body" className="text-[#8B949E]">
              Verified transactions are settled in{" "}
              <Typography
                variant="body"
                className="text-[#43E5B1] font-inter-bold"
              >
                ms
              </Typography>
              .
            </Typography>

            <View className="mt-10">
              <Typography
                variant="display"
                className="text-white text-[48px] leading-[48px]"
              >
                99.9%
              </Typography>
              <Typography
                variant="label-sm"
                className="text-[#8B949E] tracking-widest mt-2"
              >
                UPTIME EFFICIENCY
              </Typography>
            </View>
          </Card>

          {/* Processing Speed Card */}
          <Card
            variant="low"
            className="bg-[#161B22] border-[#30363D] p-0 overflow-hidden"
            radius="xl"
          >
            <View className="h-48 items-center justify-center bg-[#0d1117] relative">
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(67, 229, 177, 0.05)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                className="absolute inset-0"
              />
              {/* Fake visualizer/chart lines */}
              <View className="flex-row items-end space-x-1">
                {[4, 7, 5, 8, 3, 6, 9, 5, 7, 4].map((h, i) => (
                  <View
                    key={i}
                    style={{ height: h * 10 }}
                    className={`w-[6px] rounded-full ${i === 6 ? "bg-[#43E5B1]" : i === 7 ? "bg-[#F5E642]" : "bg-[#30363D]"}`}
                  />
                ))}
              </View>

              <View className="absolute bottom-6 border border-[#30363D] bg-[#0D1117] px-6 py-2 rounded-xl">
                <Typography
                  variant="label-sm"
                  className="text-white tracking-widest"
                >
                  PROCESSING SPEED
                </Typography>
              </View>
            </View>
          </Card>

          {/* Progress Timeline */}
          <View className="mt-6">
            <View className="h-2 bg-[#30363D] rounded-full overflow-hidden flex-row">
              <View className="h-full bg-[#43E5B1] w-[45%]" />
              <View className="h-full bg-[#F5E642] w-[5%]" />
            </View>
            <View className="flex-row justify-between mt-4">
              <Typography variant="label-sm" className="text-[#43E5B1]">
                VERIFIED
              </Typography>
              <Typography variant="label-sm" className="text-[#F5E642]">
                SETTLING NOW
              </Typography>
              <Typography variant="label-sm" className="text-[#484f58]">
                COMPLETED
              </Typography>
            </View>
          </View>
        </View>
      ),
    },
  ];

  const renderItem = ({ item }: { item: OnboardingSlide }) => (
    <View style={{ width }} className="px-6 py-10">
      <View className="mb-10 min-h-[400px]">{item.content(currentIndex)}</View>

      <View className="space-y-4">
        <View className="bg-[#161B22] self-start px-3 py-1 rounded-full border border-[#30363D]">
          <Typography variant="label-sm" className="text-[#F5E642] text-[10px]">
            {item.tag}
          </Typography>
        </View>

        <Typography
          variant="display-lg"
          className="text-white text-[48px] leading-[54px]"
        >
          {item.title} {"\n"}
          <Typography variant="display-lg" className="text-[#F5E642]">
            {item.highlight}
          </Typography>
        </Typography>

        <Typography
          variant="body"
          className="text-[#8B949E] text-[15px] leading-[24px]"
        >
          {item.description}
        </Typography>
      </View>
    </View>
  );

  return (
    <Screen withPadding={false} className="bg-[#090B0D]">
      <StatusBar barStyle="light-content" />

      {/* Dynamic Header */}
      <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
        <View className="flex-row items-center space-x-2">
          <View className="w-8 h-8 bg-[#F5E642] rounded-lg items-center justify-center">
            <Ionicons name="shield-checkmark" size={18} color="#0D1117" />
          </View>
          <Typography
            variant="heading"
            className="text-[#F5E642] font-inter-extrabold text-sm tracking-widest"
          >
            {currentIndex === 0 ? "LymePay" : "LymePay"}
          </Typography>
        </View>
        <Typography
          variant="label-sm"
          className="text-[#8B949E] tracking-widest"
        >
          STEP 0{currentIndex + 1} / 04
        </Typography>
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Footer Controls */}
      <View className="px-6 pb-12 items-center">
        {/* Pagination Dots */}
        <View className="flex-row space-x-2 mb-10">
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              className={`h-1 rounded-full ${currentIndex === i ? "w-8 bg-[#F5E642]" : "w-3 bg-[#30363D]"}`}
            />
          ))}
        </View>

        <Button
          label={currentIndex === 1 ? "Next Step" : "Next Step"}
          onPress={handleNext}
          className="mb-8 shadow-2xl shadow-[#F5E642]/20"
          rightIcon={
            <Ionicons name="arrow-forward" size={20} color="#1f1c00" />
          }
        />

        <TouchableOpacity onPress={handleSkip}>
          <Typography
            variant="label"
            className="text-[#8B949E] font-inter-bold tracking-widest"
          >
            SKIP FOR NOW
          </Typography>
        </TouchableOpacity>

        {/* Bottom Nav Icons */}
        <View className="flex-row justify-between w-full mt-10 px-4">
          <TouchableOpacity
            onPress={() =>
              currentIndex > 0
                ? flatListRef.current?.scrollToIndex({
                    index: currentIndex - 1,
                  })
                : router.back()
            }
          >
            <Ionicons name="arrow-back" size={24} color="#575B5F" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="help-circle-outline" size={26} color="#575B5F" />
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}
