import React from "react";
import { View, Text } from "react-native";
import { EscrowStatus } from "@/types/api";

interface EscrowProgressBarProps {
  status: EscrowStatus;
}

export const EscrowProgressBar: React.FC<EscrowProgressBarProps> = ({
  status,
}) => {
  const steps = [
    { label: "FUNDED", key: "funded" },
    { label: "INSPECTION", key: "delivery_marked" },
    { label: "RELEASED", key: "released" },
  ];

  const getStepStatus = (stepKey: string) => {
    const statusPriority: Record<EscrowStatus, number> = {
      locked: 0,
      funded: 1,
      delivery_marked: 2,
      released: 3,
      disputed: 2.5, // Between inspection and release for visual logic
    };

    const currentPriority = statusPriority[status] || 0;
    const stepPriority = statusPriority[stepKey as EscrowStatus] || 0;

    if (currentPriority >= stepPriority) return "active";
    return "inactive";
  };

  return (
    <View className="mt-4">
      <View className="flex-row gap-x-2">
        {steps.map((step, index) => (
          <View
            key={step.key}
            className={`flex-1 h-1 rounded-full ${
              getStepStatus(step.key) === "active"
                ? "bg-secondary-container"
                : "bg-[#30363D]"
            }`}
          />
        ))}
      </View>
      <View className="flex-row justify-between mt-2">
        {steps.map((step) => (
          <Text
            key={step.key}
            className={`text-[8px] font-inter-bold tracking-widest ${
              getStepStatus(step.key) === "active"
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
