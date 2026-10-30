import React from "react";
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from "react-native";
import { X } from "lucide-react-native";

// Shared look for escrow screens (matches the existing dark LymPay theme).
export const C = {
  bg: "#0D1117",
  card: "#161B22",
  input: "#0D1117",
  border: "#30363D",
  muted: "#8B949E",
  faint: "#484f58",
  yellow: "#F5E642",
  teal: "#00C896",
  red: "#FF4D4F",
  blue: "#3b82f6",
  orange: "#FF8C00",
};

export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontFamily: "Inter-Bold", color: C.muted, fontSize: 10, letterSpacing: 1.5 }}>
    {children}
  </Text>
);

export const Card = ({
  children,
  style,
  tone,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  tone?: "default" | "good" | "warn" | "bad";
}) => {
  const border =
    tone === "good" ? C.teal + "40" : tone === "warn" ? C.orange + "40" : tone === "bad" ? C.red + "40" : C.border;
  const bg =
    tone === "good" ? C.teal + "10" : tone === "warn" ? C.orange + "10" : tone === "bad" ? C.red + "10" : C.card;
  return (
    <View style={[{ backgroundColor: bg, borderWidth: 1, borderColor: border, borderRadius: 16, padding: 16 }, style]}>
      {children}
    </View>
  );
};

/** Small icon + text row used for warnings and tips. */
export const Notice = ({
  icon,
  title,
  children,
  color = C.orange,
}: {
  icon?: React.ReactNode;
  title?: string;
  children?: React.ReactNode;
  color?: string;
}) => (
  <View
    style={{
      backgroundColor: color + "12",
      borderWidth: 1,
      borderColor: color + "40",
      borderRadius: 12,
      padding: 14,
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
    }}
  >
    {icon ? <View style={{ marginTop: 1 }}>{icon}</View> : null}
    <View style={{ flex: 1 }}>
      {title ? (
        <Text style={{ fontFamily: "Inter-Bold", color, fontSize: 13, marginBottom: children ? 4 : 0 }}>{title}</Text>
      ) : null}
      {typeof children === "string" ? (
        <Text style={{ fontFamily: "Inter", color: C.muted, fontSize: 12, lineHeight: 18 }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  </View>
);

export const InfoCell = ({ label, value, color = "white" }: { label: string; value: string; color?: string }) => (
  <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontFamily: "Inter-Bold", color: C.muted, fontSize: 8, letterSpacing: 1.5, marginBottom: 4 }}>
      {label}
    </Text>
    <Text style={{ fontFamily: "Inter-Bold", color, fontSize: 14 }}>{value}</Text>
  </View>
);

/** Outline button used for secondary actions (keeps the existing yellow-outline look). */
export const OutlineButton = ({
  label,
  onPress,
  icon,
  color = C.yellow,
  disabled,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  color?: string;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={{
      borderWidth: 1,
      borderColor: color,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      opacity: disabled ? 0.5 : 1,
    }}
  >
    {icon}
    <Text style={{ fontFamily: "Inter-Bold", color, fontSize: 14 }}>{label}</Text>
  </TouchableOpacity>
);

export const TextLink = ({ label, onPress, color = C.muted }: { label: string; onPress: () => void; color?: string }) => (
  <TouchableOpacity onPress={onPress} style={{ paddingVertical: 10, alignItems: "center" }}>
    <Text style={{ fontFamily: "Inter-Bold", color, fontSize: 13, textDecorationLine: "underline" }}>{label}</Text>
  </TouchableOpacity>
);

/** Bottom sheet built on Modal (same pattern the app already used for terms). */
export const Sheet = ({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: C.card,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 24,
            maxHeight: "88%",
          }}
        >
          <View
            style={{ width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: "center", marginBottom: 20 }}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 18, flex: 1 }}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                backgroundColor: "#21262D",
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} color={C.muted} />
            </TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

export const inputStyle = {
  fontFamily: "Inter",
  backgroundColor: C.input,
  color: "white",
  padding: 16,
  borderRadius: 12,
  fontSize: 14,
  borderWidth: 1,
  borderColor: C.border,
} as const;
