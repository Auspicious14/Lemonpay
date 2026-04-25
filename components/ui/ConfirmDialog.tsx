import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { Typography } from "./Typography";
import { Button } from "./Button";
import { useDialogStore } from "@/store/useDialogStore";
import { ShieldAlert, Info } from "lucide-react-native";

export const ConfirmDialog = () => {
  const { config, isOpen, hide } = useDialogStore();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (isOpen) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  if (!config) return null;

  const handleConfirm = () => {
    hide();
    config.onConfirm?.();
  };

  const handleCancel = () => {
    hide();
    config.onCancel?.();
  };

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="none"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.container,
                { opacity: fadeAnim, transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }
              ]}
            >
              <View style={styles.iconContainer}>
                {config.variant === "danger" ? (
                  <View style={[styles.iconCircle, { backgroundColor: "#FF4D4F20" }]}>
                    <ShieldAlert size={28} color="#FF4D4F" />
                  </View>
                ) : (
                  <View style={[styles.iconCircle, { backgroundColor: "#F5E64220" }]}>
                    <Info size={28} color="#F5E642" />
                  </View>
                )}
              </View>

              <Typography variant="heading" style={styles.title}>
                {config.title}
              </Typography>
              
              <Typography variant="body" style={styles.message}>
                {config.message}
              </Typography>

              <View style={styles.buttonContainer}>
                {config.cancelLabel !== null && (
                  <Button
                    label={config.cancelLabel || "Cancel"}
                    onPress={handleCancel}
                    variant={config.variant === "danger" ? "danger" : "secondary"}
                    className="flex-1 h-12 rounded-[14px]"
                    textClassName="!text-white !font-inter-bold capitalize"
                    fullWidth={false}
                  />
                )}
                
                <Button
                  label={config.confirmLabel || "Confirm"}
                  onPress={handleConfirm}
                  variant={config.variant === "danger" ? "danger" : "primary"}
                  className="flex-1 h-12 rounded-[14px]"
                  textClassName="!text-black !font-inter-bold capitalize"
                  fullWidth={true}
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    backgroundColor: "#161B22",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#30363D",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: "#8B949E",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30363D",
  },
  cancelText: {
    color: "white",
    fontFamily: "Inter-Bold",
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
  },
});
