import React from "react";
import { View, ViewProps, Platform, StyleSheet } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: boolean;
  variant?: "low" | "default" | "high" | "highest" | "lowest";
  className?: string;
  radius?: "sm" | "md" | "lg" | "xl";
}

const variantBg: Record<string, string> = {
  lowest: "bg-surface-container-lowest",
  low: "bg-surface-container-low",
  default: "bg-surface-container",
  high: "bg-surface-container-high",
  highest: "bg-surface-container-highest",
};

const radiusMap: Record<string, number> = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const Card: React.FC<CardProps> = ({
  children,
  padding = true,
  variant = "default",
  className = "",
  radius = "lg",
  style,
  ...props
}) => {
  return (
    <View
      className={`
        ${variantBg[variant]}
        ${padding ? "p-6" : ""}
        ${className}
      `}
      style={[
        styles.base,
        { borderRadius: radiusMap[radius] },
        variant === "high" && styles.highShadow,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: "#30363D",
  },
  highShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
