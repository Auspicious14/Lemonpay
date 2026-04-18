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

const variantFontFamily: Record<TypographyVariant, string> = {
  "display-lg": "Inter-ExtraBold",
  display: "Inter-ExtraBold",
  heading: "Inter-Bold",
  subheading: "Inter-SemiBold",
  body: "Inter",
  caption: "Inter",
  label: "Inter-Medium",
  "label-sm": "Inter-Bold",
};

const variantStyles: Record<TypographyVariant, string> = {
  "display-lg": "text-[56px] leading-[60px] tracking-tighter",
  display: "text-[32px] leading-[38px] tracking-tighter",
  heading: "text-[24px] leading-[30px]",
  subheading: "text-[18px] leading-[24px]",
  body: "text-[15px] leading-[22px]",
  caption: "text-[13px] leading-[18px]",
  label: "text-[12px]",
  "label-sm": "text-[10px]",
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

  return (
    <Text
      className={`${variantStyles[variant]} ${textColorClass} ${className || ""}`}
      style={[
        { fontFamily: variantFontFamily[variant] },
        weight === "800"
          ? { fontFamily: "Inter-ExtraBold" }
          : weight === "700"
            ? { fontFamily: "Inter-Bold" }
            : weight === "600"
              ? { fontFamily: "Inter-SemiBold" }
              : weight === "500"
                ? { fontFamily: "Inter-Medium" }
                : weight === "400"
                  ? { fontFamily: "Inter" }
                  : {},
        {
          letterSpacing: variant.startsWith("label") ? 1.5 : undefined,
        },
        style as TextStyle,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
