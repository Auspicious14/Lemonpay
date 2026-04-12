import React from "react";
import { Text, TextProps, TextStyle } from "react-native";

export type TypographyVariant =
  | "display-lg"
  | "display"
  | "heading"
  | "subheading"
  | "body"
  | "caption"
  | "label"
  | "label-sm";

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  weight?: "400" | "500" | "600" | "700" | "800";
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<TypographyVariant, string> = {
  "display-lg":
    "text-[56px] font-inter-extrabold leading-[60px] tracking-tighter",
  display: "text-[32px] font-inter-extrabold leading-[38px] tracking-tighter",
  heading: "text-[24px] font-inter-bold leading-[30px]",
  subheading: "text-[18px] font-inter-semibold leading-[24px]",
  body: "text-[15px] font-inter leading-[22px]",
  caption: "text-[13px] font-inter leading-[18px]",
  label: "text-[12px] font-inter-medium uppercase",
  "label-sm": "text-[10px] font-inter-bold uppercase",
};

export const Typography: React.FC<TypographyProps> = ({
  variant = "body",
  color,
  weight,
  className,
  style,
  children,
  ...props
}) => {
  const textColorClass = color || "text-white";

  // Map weight to font-family if not already in variant
  const weightClass =
    weight === "800"
      ? "font-inter-extrabold"
      : weight === "700"
        ? "font-inter-bold"
        : weight === "600"
          ? "font-inter-semibold"
          : weight === "500"
            ? "font-inter-medium"
            : weight === "400"
              ? "font-inter"
              : "";

  return (
    <Text
      className={`${variantStyles[variant]} ${textColorClass} ${weightClass} ${className || ""}`}
      style={[
        { letterSpacing: variant.startsWith("label") ? 0.5 : undefined },
        style as TextStyle,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
