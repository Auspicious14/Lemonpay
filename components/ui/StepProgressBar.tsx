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
        <Typography variant="label" className="!text-xs">
          STEP 0{currentStep} OF 0{totalSteps}
        </Typography>
        {label && (
          <Typography variant="label" className="!text-primary-fixed text-xs">
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
