import React from "react";
import { Pressable, ActivityIndicator, View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Typography } from "./Typography";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  textClassName?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "",
  secondary: "bg-transparent border border-[#30363D]",
  ghost: "bg-transparent",
  danger: "bg-red-500",
};

const textStyles: Record<ButtonVariant, string> = {
  primary: "text-[#F5E642] font-inter-bold",
  secondary: "text-white font-inter-semibold",
  ghost: "text-white font-inter-semibold",
  danger: "text-white font-inter-bold",
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = "",
  textClassName = "",
}) => {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const content = (
    <View className="flex-row items-center justify-center h-full px-8">
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#1f1c00" : "#ffffff"}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          <Typography
            variant="body"
            className={`${textStyles[variant]} uppercase tracking-[1px] text-[13px] ${textClassName}`}
          >
            {label}
          </Typography>
          {rightIcon && <View className="ml-3">{rightIcon}</View>}
        </>
      )}
    </View>
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        animatedStyle,
        fullWidth ? { width: "100%" } : { alignSelf: "flex-start" },
      ]}
      className={`
        h-[58px] rounded-2xl overflow-hidden
        ${variantStyles[variant]}
        ${isDisabled ? "opacity-50" : "opacity-100"}
        ${className}
      `}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={["#F5E642", "rgba(245, 230, 66, 0.7)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </AnimatedPressable>
  );
};
