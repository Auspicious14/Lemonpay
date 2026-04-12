import React from "react";
import { View } from "react-native";
import { Typography } from "./Typography";

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  totalSteps,
  label,
}) => {
  return (
    <View className="mb-8">
      {/* Top Labels Row */}
      <View className="flex-row justify-between items-center mb-4">
        <Typography
          style={{
            color: "#484F58",
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          STEP 0{currentStep} OF 0{totalSteps}
        </Typography>
        {label && (
          <Typography
            style={{
              color: "#F5E642",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {label}
          </Typography>
        )}
      </View>

      {/* Progress Segments */}
      <View className="flex-row" style={{ gap: 8 }}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepIndex = index + 1;
          const isFilled = stepIndex <= currentStep;
          return (
            <View
              key={index}
              style={{
                flex: 1,
                height: 4,
                backgroundColor: isFilled ? "#F5E642" : "#30363D",
                borderRadius: 2,
              }}
            />
          );
        })}
      </View>
    </View>
  );
};
