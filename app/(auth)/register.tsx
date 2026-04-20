import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
  FlatList,
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
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

export default function RegisterScreen() {
  const router = useRouter();
  const setPersonalDetails = useRegistrationStore(
    (state) => state.setPersonalDetails,
  );

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // DOB States
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%"], []);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const arr = [];
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
    const arr = [];
    for (let i = 1; i <= 31; i++) {
      arr.push(i.toString().padStart(2, "0"));
    }
    return arr;
  }, []);

  const dob =
    selectedYear && selectedMonth && selectedDay
      ? `${selectedYear}-${(months.indexOf(selectedMonth) + 1).toString().padStart(2, "0")}-${selectedDay}`
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

  const openPicker = () => {
    setShowPicker(true);
    bottomSheetRef.current?.expand();
  };

  const handleConfirm = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      setShowPicker(false);
    } else {
      Toast.show({ message: "Please select full date", type: "info" });
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  return (
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
        >
          {/* Top Brand */}
          <View className="flex-row items-center mb-6">
            <Ionicons name="shield-checkmark" size={20} color="#F5E642" />
            <Typography variant="subheading" className="!text-primary-fixed">
              LYMEPAY
            </Typography>
          </View>

          {/* Progress */}
          <StepProgressBar currentStep={1} totalSteps={3} />

          {/* Heading */}
          <Typography variant="display" className="mb-4">
            Personal Details
          </Typography>

          {/* Form Card */}
          <View style={styles.card}>
            {/* First Name */}
            <View style={{ marginBottom: 20 }}>
              <Typography variant="label" className="!text-primary-fixed mb-2">
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
              <Typography variant="label" className="!text-primary-fixed mb-2">
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
              <Typography variant="label" className="!text-primary-fixed mb-2">
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
              <Typography variant="label" className="!text-primary-fixed mb-2">
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

            {/* DOB (Proper UI) */}
            <View style={{ marginBottom: 24 }}>
              <Typography variant="label" className="!text-primary-fixed mb-2">
                DATE OF BIRTH
              </Typography>
              <TouchableOpacity
                onPress={openPicker}
                activeOpacity={0.7}
                style={styles.inputContainer}
              >
                <Typography
                  style={[
                    styles.textInput,
                    { color: dob ? "#FFFFFF" : "#484F58", paddingTop: 16 },
                  ]}
                >
                  {dob
                    ? `${selectedDay} ${selectedMonth} ${selectedYear}`
                    : "Select Birth Date"}
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

          {/* CTA Button */}
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

        {/* Date Picker Bottom Sheet */}
        {showPicker && (
          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={() => setShowPicker(false)}
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: "#161B22" }}
            handleIndicatorStyle={{ backgroundColor: "#30363D" }}
          >
            <BottomSheetView style={styles.pickerContent}>
              <View className="flex-row justify-between items-center mb-6 px-6">
                <Typography
                  style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700" }}
                >
                  Birth Date
                </Typography>
                <TouchableOpacity onPress={handleConfirm}>
                  <Typography
                    style={{
                      color: "#F5E642",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    Confirm
                  </Typography>
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-1 px-4">
                {/* Day */}
                <View className="flex-1">
                  <Typography style={styles.pickerLabel}>DAY</Typography>
                  <FlatList
                    data={days}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => setSelectedDay(item)}
                        style={[
                          styles.pickerItem,
                          selectedDay === item && styles.selectedItem,
                        ]}
                      >
                        <Typography
                          style={[
                            styles.itemText,
                            selectedDay === item && styles.selectedText,
                          ]}
                        >
                          {item}
                        </Typography>
                      </TouchableOpacity>
                    )}
                  />
                </View>
                {/* Month */}
                <View className="flex-[2]">
                  <Typography style={styles.pickerLabel}>MONTH</Typography>
                  <FlatList
                    data={months}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => setSelectedMonth(item)}
                        style={[
                          styles.pickerItem,
                          selectedMonth === item && styles.selectedItem,
                        ]}
                      >
                        <Typography
                          style={[
                            styles.itemText,
                            selectedMonth === item && styles.selectedText,
                          ]}
                        >
                          {item}
                        </Typography>
                      </TouchableOpacity>
                    )}
                  />
                </View>
                {/* Year */}
                <View className="flex-[1.5]">
                  <Typography style={styles.pickerLabel}>YEAR</Typography>
                  <FlatList
                    data={years}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => setSelectedYear(item)}
                        style={[
                          styles.pickerItem,
                          selectedYear === item && styles.selectedItem,
                        ]}
                      >
                        <Typography
                          style={[
                            styles.itemText,
                            selectedYear === item && styles.selectedText,
                          ]}
                        >
                          {item}
                        </Typography>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </BottomSheetView>
          </BottomSheet>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandText: {
    color: "#F5E642",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
    marginLeft: 6,
    textTransform: "uppercase",
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#161B22",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#30363D",
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#8B949E",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
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
  bottomLink: {
    color: "#8B949E",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  pickerContent: { flex: 1, paddingVertical: 10 },
  pickerLabel: {
    color: "#484F58",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 10,
  },
  pickerItem: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedItem: { backgroundColor: "rgba(245, 230, 66, 0.1)" },
  itemText: { color: "#8B949E", fontSize: 16 },
  selectedText: { color: "#F5E642", fontWeight: "700" },
});
