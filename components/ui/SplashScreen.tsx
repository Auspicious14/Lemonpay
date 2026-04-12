import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const LEMON_YELLOW = "#F5E642";
const DARK_BG = "#0D1117";

export const SplashScreen = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{ transform: [{ scale: pulseAnim }], alignItems: "center" }}
      >
        <Text style={styles.logo}>🍋</Text>
        <Text style={styles.wordmark}>LemonPay</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  wordmark: {
    fontSize: 32,
    fontWeight: "800",
    color: LEMON_YELLOW,
    letterSpacing: -1,
    fontFamily: "Inter-ExtraBold",
  },
});
