import React, { useState, useRef } from "react";
import { View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Info,
  Landmark,
  Plus,
  CheckCircle2,
  Lock,
  ChevronDown,
  ArrowRight,
} from "lucide-react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomBottomSheet } from "@/components/ui/BottomSheet";

// --- Mock Data ---
const MOCK_BALANCE = 1250000.0;
const MOCK_DESTINATIONS = [
  {
    id: "1",
    bankName: "Wema Bank",
    accountNumber: "0123456789",
    selected: true,
  },
];
const WITHDRAWAL_FEE = 100.0;

export default function WithdrawFundsScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(
    MOCK_DESTINATIONS[0],
  );
  const addBankSheetRef = useRef<BottomSheet>(null);

  // --- Modal State ---
  const [newBank, setNewBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");

  const handleOpenAddBank = () => {
    addBankSheetRef.current?.expand();
  };

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate API call
    setTimeout(() => {
      setVerifiedName("CHINEDU OKAFOR");
      setIsVerifying(false);
    }, 1500);
  };

  const handleContinue = () => {
    // TODO: Validate input
    router.push({
      pathname: "/wallet/withdraw-review",
      params: {
        amount,
        bankName: selectedDestination.bankName,
        accountNumber: selectedDestination.accountNumber,
      },
    });
  };

  return (
    <Screen
      showBackButton
      title="Withdraw Funds"
      className="bg-background-primary"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="space-y-8 py-6">
          {/* Balance Card */}
          <Card
            variant="low"
            className="relative overflow-hidden p-8 border border-outline-variant/10"
          >
            <View
              className="absolute -right-12 -top-12 w-48 h-48 bg-primary-fixed/10 rounded-full"
              style={{ borderRadius: 100 }}
            />
            <View className="relative z-10">
              <Typography
                variant="label-sm"
                className="text-on-surface-variant mb-2"
              >
                Available Balance
              </Typography>
              <Typography
                variant="display"
                className="text-primary font-inter-extrabold"
              >
                ₦
                {MOCK_BALANCE.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </View>
          </Card>

          {/* Withdrawal Form */}
          <View className="space-y-6">
            {/* Amount Input */}
            <View className="space-y-3">
              <Typography
                variant="label-sm"
                className="text-on-surface-variant px-1"
              >
                Withdrawal Amount
              </Typography>
              <View className="relative">
                <View className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
                  <Typography className="text-primary-fixed text-2xl font-inter-bold">
                    ₦
                  </Typography>
                </View>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="rgba(204, 199, 173, 0.3)"
                  keyboardType="numeric"
                  className="w-full bg-surface-container-highest rounded-2xl py-6 pl-14 pr-6 text-2xl font-inter-extrabold text-white"
                />
              </View>
            </View>

            {/* Destination Selection */}
            <View className="space-y-3">
              <View className="flex-row justify-between items-center px-1">
                <Typography
                  variant="label-sm"
                  className="text-on-surface-variant"
                >
                  Select Destination
                </Typography>
                <TouchableOpacity onPress={handleOpenAddBank}>
                  <Typography
                    variant="label-sm"
                    className="text-primary-fixed font-inter-bold"
                  >
                    Add New
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* Linked Card List - TODO: Use FlatList if data grows */}
              {MOCK_DESTINATIONS.map((dest) => (
                <TouchableOpacity
                  key={dest.id}
                  onPress={() => setSelectedDestination(dest)}
                  className="active:scale-[0.98]"
                >
                  <Card
                    variant={
                      selectedDestination.id === dest.id ? "high" : "default"
                    }
                    className={`flex-row items-center justify-between p-5 ${selectedDestination.id === dest.id ? "border border-primary-fixed/30" : ""}`}
                  >
                    <View className="flex-row items-center space-x-4">
                      <View className="w-12 h-12 rounded-lg bg-surface-container-highest items-center justify-center">
                        <Landmark size={24} color="#F5E642" />
                      </View>
                      <View>
                        <Typography className="font-inter-bold text-white">
                          {dest.bankName}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-on-surface-variant"
                        >
                          {dest.accountNumber.replace(
                            /(\d{4})\d+(\d{4})/,
                            "$1...$2",
                          )}
                        </Typography>
                      </View>
                    </View>

                    <View
                      className={`w-6 h-6 rounded-full border-2 ${selectedDestination.id === dest.id ? "border-primary-fixed" : "border-outline"} items-center justify-center`}
                    >
                      {selectedDestination.id === dest.id && (
                        <View className="w-3 h-3 bg-primary-fixed rounded-full" />
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fee Breakdown */}
            <View className="bg-surface-container-lowest/50 rounded-xl p-4 flex-row justify-between items-center">
              <View className="flex-row items-center space-x-2">
                <Info size={16} color="#ccc7ad" />
                <Typography
                  variant="caption"
                  className="text-on-surface-variant font-inter-medium"
                >
                  Withdrawal Fee
                </Typography>
              </View>
              <Typography
                variant="caption"
                className="font-inter-bold text-white"
              >
                ₦
                {WITHDRAWAL_FEE.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Primary Action Button */}
      <View className="absolute bottom-10 left-4 right-4 bg-background-primary/80 pt-4">
        <Button
          label="Continue"
          onPress={handleContinue}
          disabled={!amount || parseFloat(amount) <= 0}
        />
      </View>

      {/* Add Bank Account Bottom Sheet */}
      <CustomBottomSheet
        ref={addBankSheetRef}
        snapPoints={["75%"]}
        title="Add Bank Account"
      >
        <View className="space-y-6 pt-4">
          {/* Select Bank */}
          <View className="space-y-2">
            <Typography variant="label-sm" className="text-outline ml-1">
              Select Bank
            </Typography>
            <TouchableOpacity className="flex-row items-center justify-between bg-surface-container-high rounded-xl px-4 py-4 border border-transparent">
              <View className="flex-row items-center space-x-3">
                <Landmark size={20} color="#95917a" />
                <Typography className="text-on-surface-variant font-inter-medium">
                  {newBank || "Choose from list..."}
                </Typography>
              </View>
              <ChevronDown size={20} color="#95917a" />
            </TouchableOpacity>
          </View>

          {/* Account Number */}
          <View className="space-y-2">
            <Typography variant="label-sm" className="text-outline ml-1">
              Account Number
            </Typography>
            <View className="relative">
              <Input
                placeholder="0000000000"
                keyboardType="number-pad"
                value={accountNumber}
                onChangeText={setAccountNumber}
                className="mb-0" // Reset margin
              />
              <TouchableOpacity
                onPress={handleVerify}
                className="absolute right-4 top-[18px]"
              >
                <Typography className="text-primary-fixed font-inter-bold text-sm">
                  {isVerifying ? "..." : "Verify"}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>

          {/* Verification Result */}
          {verifiedName ? (
            <View className="bg-secondary-container/10 border border-secondary-container/20 rounded-xl p-4 flex-row items-center space-x-4">
              <View className="w-10 h-10 rounded-full bg-secondary-container items-center justify-center">
                <CheckCircle2 size={24} color="#004d38" fill="#3adfab" />
              </View>
              <View>
                <Typography variant="label-sm" className="text-secondary">
                  Account Holder Name
                </Typography>
                <Typography className="text-white font-inter-extrabold text-lg uppercase">
                  {verifiedName}
                </Typography>
              </View>
            </View>
          ) : null}

          {/* Trust Signal */}
          <View className="flex-row items-center justify-center space-x-2 py-2">
            <Lock size={14} color="#95917a" fill="#31353c" />
            <Typography
              variant="caption"
              className="text-outline font-inter-medium"
            >
              Securely linked via NIBSS
            </Typography>
          </View>

          {/* CTA */}
          <Button
            label="Add Bank Account"
            onPress={() => {
              /* TODO: Save bank account */
            }}
            rightIcon={<Plus size={20} color="#1f1c00" />}
          />
        </View>
      </CustomBottomSheet>
    </Screen>
  );
}
