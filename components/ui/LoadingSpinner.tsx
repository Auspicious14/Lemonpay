import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Typography } from "./Typography";

interface LoadingSpinnerProps {
  label?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label,
  overlay = false,
}) => {
  return (
    <View
      className={`
        items-center justify-center
        ${overlay ? "absolute inset-0 bg-background-primary/80 z-50" : "p-8"}
      `}
    >
      <ActivityIndicator size="large" color="#F5E642" />
      {label && (
        <Typography variant="body" className="mt-4 text-text-secondary">
          {label}
        </Typography>
      )}
    </View>
  );
};
