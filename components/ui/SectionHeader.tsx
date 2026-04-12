import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  return (
    <View className="flex-row justify-between items-end mb-4">
      <View className="flex-1">
        <Text className="text-white font-inter-bold text-[22px] leading-7">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-[#8B949E] font-inter text-sm mt-1">
            {subtitle}
          </Text>
        )}
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text className="text-accent-primary font-inter-semibold text-sm">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
