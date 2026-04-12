import React from "react";
import { View } from "react-native";
import { Typography } from "./Typography";

interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ label, className = "" }) => {
  return (
    <View className={`flex-row items-center my-4 ${className}`}>
      <View className="flex-1 h-[1px] bg-border" />
      {label && (
        <Typography variant="label" className="mx-4 text-text-secondary">
          {label}
        </Typography>
      )}
      {label && <View className="flex-1 h-[1px] bg-border" />}
    </View>
  );
};
