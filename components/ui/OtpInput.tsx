import React, { useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  TextInput,
  Pressable,
} from "react-native";
import { Typography } from "./Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface OtpInputProps {
  length: 4 | 6;
  value: string;
  onChange: (value: string) => void;
  showCustomKeypad?: boolean;
  obscure?: boolean;
}

const { width } = Dimensions.get("window");

export const OtpInput: React.FC<OtpInputProps> = ({
  length,
  value,
  onChange,
  showCustomKeypad = true,
  obscure = false,
}) => {
  const inputRef = useRef<TextInput>(null);

  const BOX_COUNT = length;
  const GAP = 10;
  const PADDING = 40;
  const availableWidth = width - PADDING;
  const boxSize = (availableWidth - (BOX_COUNT - 1) * GAP) / BOX_COUNT;

  const handleKeypadPress = (val: string) => {
    if (val === "back") {
      onChange(value.slice(0, -1));
    } else if (value.length < length) {
      onChange(value + val);
    }
  };

  const handleBoxPress = () => {
    if (!showCustomKeypad) {
      inputRef.current?.focus();
    }
  };

  const renderKeypad = () => {
    const keys = [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      ["empty", "0", "back"],
    ];

    return (
      <View style={styles.keypadContainer}>
        {keys.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.keypadRow}>
            {row.map((key, keyIdx) => {
              if (key === "empty")
                return <View key={keyIdx} style={styles.keyItem} />;
              return (
                <TouchableOpacity
                  key={keyIdx}
                  onPress={() => handleKeypadPress(key)}
                  activeOpacity={0.6}
                  style={[styles.keyItem, key === "back" && styles.backKey]}
                >
                  {key === "back" ? (
                    <MaterialCommunityIcons
                      name="backspace"
                      size={24}
                      color="#0D1117"
                    />
                  ) : (
                    <Typography style={styles.keyText}>{key}</Typography>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Hidden Text Input to capture native keyboard events */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        maxLength={length}
        keyboardType="number-pad"
        style={styles.hiddenInput}
        showSoftInputOnFocus={!showCustomKeypad}
        caretHidden
      />

      {/* Boxes Row */}
      <Pressable onPress={handleBoxPress} style={styles.boxesRow}>
        {Array.from({ length }).map((_, idx) => {
          const isFocused = value.length === idx;
          const char = value[idx] || "";

          return (
            <View
              key={idx}
              style={[
                styles.box,
                { width: boxSize, height: boxSize },
                !showCustomKeypad && isFocused && styles.focusedBox,
                char !== "" && styles.filledBox,
              ]}
            >
              <Typography style={styles.boxText}>
                {char !== ""
                  ? obscure
                    ? "•"
                    : char
                  : !showCustomKeypad && isFocused
                    ? "|"
                    : ""}
              </Typography>
            </View>
          );
        })}
      </Pressable>

      {/* Custom Keypad */}
      {showCustomKeypad && renderKeypad()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  boxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  box: {
    backgroundColor: "#21262D",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#30363D",
    alignItems: "center",
    justifyContent: "center",
  },
  focusedBox: {
    borderColor: "#F5E642",
  },
  filledBox: {
    borderColor: "#484F58",
  },
  boxText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  keypadContainer: {
    backgroundColor: "#1C2128",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    paddingHorizontal: 24,
    marginHorizontal: -24, // Pull out to screen edges
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  keyItem: {
    width: "30%",
    height: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  backKey: {
    backgroundColor: "#F5E642",
    borderRadius: 16,
  },
  keyText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "600",
  },
});
