import React from "react";
import { View } from "react-native";
import { Typography } from "./Typography";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  ctaLabel,
  onCtaPress,
  className = "",
}) => {
  return (
    <View
      className={`items-center justify-center p-8 bg-background-secondary rounded-lg ${className}`}
    >
      {icon && <View className="mb-4">{icon}</View>}

      <Typography variant="heading" className="text-center mb-2">
        {title}
      </Typography>

      <Typography
        variant="body"
        className="text-text-secondary text-center mb-6"
      >
        {subtitle}
      </Typography>

      {ctaLabel && onCtaPress && (
        <Button
          label={ctaLabel}
          onPress={onCtaPress}
          variant="secondary"
          fullWidth={false}
          className="px-8"
        />
      )}
    </View>
  );
};
