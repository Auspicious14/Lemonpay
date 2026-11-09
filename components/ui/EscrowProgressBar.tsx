import React from "react";
import { View, Text } from "react-native";
import { EscrowStatus } from "@/types/api";
import { getEscrowStepIndex, getEscrowPhase } from "@/lib/utils/escrow";

interface EscrowProgressBarProps {
  status: EscrowStatus;
}

export const EscrowProgressBar: React.FC<EscrowProgressBarProps> = ({
  status,
}) => {
  // Lights up as the deal moves: paid & held → delivered → released.
  const steps = [
    { label: "SECURED", minIndex: 2 },
    { label: "DELIVERED", minIndex: 3 },
    { label: "RELEASED", minIndex: 4 },
  ];

  const currentIndex = getEscrowStepIndex(status);
  const isReleased = getEscrowPhase(status) === "released";

  const getStepStatus = (step: (typeof steps)[number]) => {
    // Refunded/resolved also map to index 4 but must not show "RELEASED".
    if (step.minIndex === 4) return isReleased ? "active" : "inactive";
    return currentIndex >= step.minIndex ? "active" : "inactive";
  };

  return (
    <View className="mt-4">
      <View className="flex-row gap-x-2">
        {steps.map((step, index) => (
          <View
            key={step.label}
            className={`flex-1 h-1 rounded-full ${
              getStepStatus(step) === "active"
                ? "bg-secondary-container"
                : "bg-[#30363D]"
            }`}
          />
        ))}
      </View>
      <View className="flex-row justify-between mt-2">
        {steps.map((step) => (
          <Text
            key={step.label}
            className={`text-[8px] font-inter-bold tracking-widest ${
              getStepStatus(step) === "active"
                ? "text-secondary-container"
                : "text-[#8B949E]"
            }`}
          >
            {step.label}
          </Text>
        ))}
      </View>
    </View>
  );
};
