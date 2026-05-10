import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  StyleSheet,
  Keyboard,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { StepProgressBar } from "@/components/ui/StepProgressBar";
import { useRegistrationStore } from "@/store/registrationStore";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Toast } from "@/components/ui/Toast";
import { WheelPicker } from "@/components/ui/WheelPicker";

export default function RegisterScreen() {
  const router = useRouter();
  const setPersonalDetails = useRegistrationStore(
    (state) => state.setPersonalDetails,
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedDay, setSelectedDay] = useState("01");
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState("2000");

  const [showPicker, setShowPicker] = useState(false);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const arr: string[] = [];
    for (let i = currentYear - 18; i >= 1940; i--) {
      arr.push(i.toString());
    }
    return arr;
  }, []);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = useMemo(() => {
    const arr: string[] = [];
    for (let i = 1; i <= 31; i++) {
      arr.push(i.toString().padStart(2, "0"));
    }
    return arr;
  }, []);

  const dob =
    selectedYear && selectedMonth && selectedDay
      ? `${selectedYear}-${(months.indexOf(selectedMonth) + 1)
          .toString()
          .padStart(2, "0")}-${selectedDay}`
      : "";

  const dobDisplay =
    selectedDay && selectedMonth && selectedYear
      ? `${selectedDay} ${selectedMonth} ${selectedYear}`
      : "";

  const validatePhone = (p: string) => /^0[789][01]\d{8}$/.test(p);

  const handleContinue = () => {
    if (!firstName || !lastName || !email || !phone || !dob) {
      Toast.show({ message: "All fields are required", type: "error" });
      return;
    }
    if (!validatePhone(phone)) {
      Toast.show({ message: "Invalid Nigerian phone number", type: "error" });
      return;
    }
    setPersonalDetails({ firstName, lastName, email, phone, dob });
    router.push("/(auth)/account-type");
  };

  // ── Open: programmatically set showPicker to true ──────────────────────
  const openPicker = useCallback(() => {
    Keyboard.dismiss();
    setShowPicker(true);
  }, []);

  const closePicker = useCallback(() => {
    setShowPicker(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      closePicker();
    } else {
      Toast.show({ message: "Please select full date", type: "info" });
    }
  }, [selectedDay, selectedMonth, selectedYear, closePicker]);

  return (
    // ── Use a plain View as root so BottomSheet can be a sibling ──────────
    <View style={{ flex: 1, backgroundColor: "#0D1117" }}>
      <Screen withPadding={false} className="font-sans">
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 20,
              paddingTop: 40,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Brand */}
            <View className="flex-row items-center mb-6">
              <Ionicons name="shield-checkmark" size={20} color="#F5E642" />
              <Typography variant="subheading" className="!text-primary-fixed">
                LYMEPAY
              </Typography>
            </View>

            <StepProgressBar currentStep={1} totalSteps={3} />

            <Typography variant="display" className="mb-4">
              Personal Details
            </Typography>

            <View style={styles.card}>
              {/* First Name */}
              <View style={{ marginBottom: 20 }}>
                <Typography
                  variant="label"
                  className="!text-primary-fixed mb-2"
                >
                  FIRST NAME
                </Typography>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="e.g. Chinedu"
                    placeholderTextColor="#484F58"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Last Name */}
              <View style={{ marginBottom: 20 }}>
                <Typography
                  variant="label"
                  className="!text-primary-fixed mb-2"
                >
                  LAST NAME
                </Typography>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="e.g. Okafor"
                    placeholderTextColor="#484F58"
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={{ marginBottom: 20 }}>
                <Typography
                  variant="label"
                  className="!text-primary-fixed mb-2"
                >
                  EMAIL ADDRESS
                </Typography>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color="#8B949E"
                    style={{ marginLeft: 16 }}
                  />
                  <TextInput
                    placeholder="chinedu.o@lymepay.com"
                    placeholderTextColor="#484F58"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.textInput, { marginLeft: 10 }]}
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={{ marginBottom: 20 }}>
                <Typography
                  variant="label"
                  className="!text-primary-fixed mb-2"
                >
                  PHONE NUMBER
                </Typography>
                <View style={styles.inputContainer}>
                  <View className="flex-row items-center pl-4 pr-3 border-r border-[#30363D] h-full">
                    <Typography style={{ color: "#8B949E", fontSize: 14 }}>
                      +234
                    </Typography>
                  </View>
                  <TextInput
                    placeholder="801 234 5678"
                    placeholderTextColor="#484F58"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={[styles.textInput, { marginLeft: 12 }]}
                  />
                </View>
              </View>

              {/* DOB */}
              <View style={{ marginBottom: 24 }}>
                <Typography
                  variant="label"
                  className="!text-primary-fixed mb-2"
                >
                  DATE OF BIRTH
                </Typography>
                <TouchableOpacity
                  onPress={openPicker}
                  activeOpacity={0.7}
                  style={styles.inputContainer}
                >
                  <Typography
                    style={{
                      flex: 1,
                      color: dobDisplay ? "#FFFFFF" : "#484F58",
                      fontSize: 15,
                      paddingHorizontal: 16,
                    }}
                  >
                    {dobDisplay || "Select Birth Date"}
                  </Typography>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color="#8B949E"
                    style={{ marginRight: 16 }}
                  />
                </TouchableOpacity>
              </View>

              {/* Trust Note */}
              <View className="flex-row items-start pt-4 border-t border-[#30363D]">
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color="#1FA192"
                  style={{ marginTop: 2 }}
                />
                <Typography style={styles.trustText}>
                  Your data is encrypted with military-grade 256-bit protocols,
                  ensuring total privacy.
                </Typography>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.8}
              style={{ marginBottom: 40 }}
            >
              <LinearGradient
                colors={["#F5E642", "#D4C200"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <View className="flex-row gap-2 items-center">
                  <Typography variant="body" className="!text-black">
                    Continue
                  </Typography>
                  <Ionicons name="arrow-forward" size={18} color="#0D1117" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center"
            >
              <Typography variant="caption" className="!text-sm">
                ← BACK
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center">
              <Typography variant="caption" className="!text-sm">
                ? HELP
              </Typography>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Screen>

      {/* ── Standard Modal for Date of Birth ────────────────────────────── */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={closePicker}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={closePicker}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#161B22",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: 40,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#30363D",
              }}
            >
              <Typography
                style={{
                  fontFamily: "Inter-Bold",
                  color: "white",
                  fontSize: 18,
                }}
              >
                Date of Birth
              </Typography>
              <TouchableOpacity onPress={handleConfirm}>
                <Typography
                  style={{
                    fontFamily: "Inter-Bold",
                    color: "#F5E642",
                    fontSize: 16,
                  }}
                >
                  Confirm
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Wheel Pickers */}
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 16,
                paddingTop: 16,
                gap: 8,
              }}
            >
              <WheelPicker
                data={days}
                selected={selectedDay}
                onSelect={setSelectedDay}
                label="DAY"
              />
              <WheelPicker
                data={months}
                selected={selectedMonth}
                onSelect={setSelectedMonth}
                label="MONTH"
              />
              <WheelPicker
                data={years}
                selected={selectedYear}
                onSelect={setSelectedYear}
                label="YEAR"
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#161B22",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#30363D",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#21262D",
    borderRadius: 12,
    height: 56,
    borderWidth: 1,
    borderColor: "#30363D",
    overflow: "hidden",
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    paddingHorizontal: 16,
    height: "100%",
  },
  trustText: {
    color: "#8B949E",
    fontSize: 11,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  button: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#30363D",
    backgroundColor: "#0D1117",
  },
});
