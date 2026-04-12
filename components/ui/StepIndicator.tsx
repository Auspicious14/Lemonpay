import React from "react";
import { View } from "react-native";
import { Typography } from "./Typography";
import { Check } from "lucide-react-native";

export type EscrowStep =
  | "agreement"
  | "funded"
  | "delivered"
  | "confirmed"
  | "released";

interface StepIndicatorProps {
  currentStep: EscrowStep;
  vertical?: boolean;
  className?: string;
}

const steps: { key: EscrowStep; label: string; description: string }[] = [
  {
    key: "agreement",
    label: "Agreement",
    description: "Terms signed by both parties",
  },
  { key: "funded", label: "Funded", description: "Funds held in secure vault" },
  { key: "delivered", label: "Delivered", description: "In transit to buyer" },
  {
    key: "confirmed",
    label: "Confirmed",
    description: "Buyer inspects and confirms",
  },
  {
    key: "released",
    label: "Released",
    description: "Funds transferred to seller",
  },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  vertical = false,
  className = "",
}) => {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  if (vertical) {
    return (
      <View className={`space-y-10 ${className}`}>
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <View
              key={step.key}
              className="relative flex-row items-center pl-10"
            >
              {/* Connector */}
              {!isLast && (
                <View
                  className={`absolute left-[15px] top-8 w-[2px] h-10 ${index < currentIndex ? "bg-secondary" : "bg-surface-container-highest"}`}
                />
              )}

              {/* Point */}
              <View
                className={`
                  absolute left-0 w-8 h-8 rounded-full items-center justify-center z-10
                  ${isCompleted ? "bg-secondary" : isActive ? "bg-surface-dim border-4 border-primary-fixed shadow-2xl shadow-primary-fixed/50" : "bg-surface-container-highest"}
                `}
              >
                {isCompleted ? (
                  <Check size={14} color="#003828" strokeWidth={3} />
                ) : isActive ? (
                  <View className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />
                ) : null}
              </View>

              {/* Text */}
              <View className={!isCompleted && !isActive ? "opacity-40" : ""}>
                <Typography
                  variant="body"
                  className={`font-inter-extrabold ${isActive ? "text-primary-fixed" : "text-white"}`}
                >
                  {step.label}
                </Typography>
                <Typography
                  variant="label-sm"
                  className="text-text-secondary text-[10px]"
                >
                  {step.description}
                </Typography>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  // Horizontal version (for progress bars)
  return (
    <View
      className={`flex-row items-center justify-between w-full px-2 ${className}`}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.key}>
            <View className="items-center flex-1">
              <View
                className={`
                  w-8 h-8 rounded-full items-center justify-center border-2
                  ${
                    isCompleted
                      ? "bg-secondary border-secondary"
                      : isActive
                        ? "bg-primary-fixed border-primary-fixed"
                        : "bg-transparent border-outline-variant"
                  }
                `}
              >
                {isCompleted ? (
                  <Check size={14} color="#003828" strokeWidth={3} />
                ) : (
                  <Typography
                    variant="label-sm"
                    className={
                      isActive
                        ? "text-on-primary-fixed font-bold"
                        : "text-text-secondary"
                    }
                  >
                    {(index + 1).toString()}
                  </Typography>
                )}
              </View>
              <Typography
                variant="label-sm"
                className={`mt-2 text-[8px] uppercase tracking-tighter ${isActive ? "text-primary-fixed" : "text-text-secondary"}`}
                numberOfLines={1}
              >
                {step.label}
              </Typography>
            </View>

            {!isLast && (
              <View
                className={`h-[2px] flex-1 -mt-6 mx-[-10px] ${index < currentIndex ? "bg-secondary" : "bg-outline-variant/20"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};
