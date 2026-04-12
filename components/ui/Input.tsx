import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { Typography } from "./Typography";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry,
  className = "",
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View className={`mb-4 w-full ${className}`}>
      {label && (
        <Typography
          variant="label-sm"
          className="mb-2 ml-1 text-primary-fixed-dim"
        >
          {label}
        </Typography>
      )}

      <View
        className={`
          flex-row items-center h-[60px] px-4 bg-surface-container rounded-xl border
          ${isFocused ? "border-primary-fixed/30" : error ? "border-accent-danger" : "border-outline-variant/20"}
        `}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          className="flex-1 text-white text-[15px] font-inter h-full"
          placeholderTextColor="rgba(149, 145, 122, 0.5)"
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="ml-3"
          >
            {showPassword ? (
              <EyeOff size={20} color="#ccc7ad" />
            ) : (
              <Eye size={20} color="#ccc7ad" />
            )}
          </TouchableOpacity>
        ) : (
          rightIcon && <View className="ml-3">{rightIcon}</View>
        )}
      </View>

      {error && (
        <Typography variant="caption" className="mt-1 ml-1 text-accent-danger">
          {error}
        </Typography>
      )}
    </View>
  );
};
