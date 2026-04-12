/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // High-End Editorial Palette (The LemonPay)
        surface: {
          DEFAULT: "#10141a",
          dim: "#10141a",
          bright: "#353940",
          container: {
            lowest: "#0a0e14",
            low: "#181c22",
            DEFAULT: "#1c2026",
            high: "#262a31",
            highest: "#31353c",
          },
        },
        primary: {
          DEFAULT: "#ffffff",
          fixed: {
            DEFAULT: "#f5e642",
            dim: "#d8ca23",
          },
        },
        on: {
          primary: {
            fixed: "#1f1c00",
            container: "#6e6600",
          },
          secondary: {
            container: "#004d38",
          },
          surface: {
            variant: "#ccc7ad",
          },
        },
        secondary: {
          DEFAULT: "#43e5b1",
          container: "#01c896",
        },
        outline: {
          variant: "#4a4734",
        },
        // Legacy/Semantic Mappings for existing project code
        background: {
          primary: "#10141a",
          secondary: "#181c22",
          tertiary: "#1c2026",
        },
        accent: {
          primary: "#f5e642",
          success: "#01c896",
          danger: "#ffb4ab", // map to error
          warning: "#f5e642", // map to primary_container
          info: "#b1c5ff", // map to tertiary_fixed_dim
        },
        lemon: "#f5e642",
        text: {
          primary: "#ffffff",
          secondary: "#ccc7ad",
        },
        border: {
          DEFAULT: "#4a4734",
        },
      },
      borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        "2xl": 32,
        "3xl": 48,
        full: 9999,
      },
      fontFamily: {
        sans: "Inter-Regular",
        inter: "Inter-Regular",
        "inter-bold": "Inter-Bold",
        "inter-semibold": "Inter-SemiBold",
        "inter-medium": "Inter-Medium",
        "inter-extrabold": "Inter-ExtraBold",
        // Mapping standard weights to Inter families
        bold: "Inter-Bold",
        semibold: "Inter-SemiBold",
        medium: "Inter-Medium",
        extrabold: "Inter-ExtraBold",
        black: "Inter-ExtraBold",
      },
    },
  },
  plugins: [],
};
