import React from "react";
import { View, Image } from "react-native";
import { Typography } from "./Typography";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<
  AvatarSize,
  { container: string; text: string; icon: number }
> = {
  sm: { container: "w-8 h-8", text: "caption", icon: 32 },
  md: { container: "w-12 h-12", text: "body", icon: 48 },
  lg: { container: "w-20 h-20", text: "heading", icon: 80 },
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = "md",
  className = "",
}) => {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "?";

  return (
    <View
      className={`
        rounded-full overflow-hidden items-center justify-center bg-background-tertiary border border-border
        ${sizeMap[size].container}
        ${className}
      `}
    >
      {source ? (
        <Image source={{ uri: source }} className="w-full h-full" />
      ) : (
        <Typography
          variant={sizeMap[size].text as any}
          className="text-text-secondary font-inter-bold"
        >
          {initials}
        </Typography>
      )}
    </View>
  );
};
