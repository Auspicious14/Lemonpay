import React, { useState, useRef, useMemo } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, FlatList, Modal, Text } from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Info,
  Landmark,
  Plus,
  CheckCircle2,
  Lock,
  ChevronDown,
  Search,
  X,
} from "lucide-react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomBottomSheet } from "@/components/ui/BottomSheet";
import { useWalletBalance } from "@/lib/hooks/useWallet";
import { useBanks, useMyBankAccounts, useVerifyAccount, useAddBankAccount, useWithdraw } from "@/lib/hooks/useBankAccount";
import { formatCurrency } from "@/lib/utils/format";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Bank, BankAccount } from "@/types/api";

const QUICK_AMOUNTS = ["5000", "10000", "20000", "50000"];

export default function WithdrawFundsScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<number | null>(null);
  
  // Step 1: Add Bank Modal State
  const [isAddBankModalVisible, setIsAddBankModalVisible] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isBankPickerVisible, setIsBankPickerVisible] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [withdrawReference, setWithdrawReference] = useState("");

  const { data: balanceData } = useWalletBalance();
  const { data: myBankAccounts, isLoading: isAccountsLoading } = useMyBankAccounts();
  const { data: allBanks } = useBanks();
  
  const verifyMutation = useVerifyAccount();
  const addBankAccountMutation = useAddBankAccount();
  const withdrawMutation = useWithdraw();

  const balance = balanceData?.balance || 0;

  const filteredBanks = useMemo(() => {
    if (!allBanks) return [];
    return allBanks.filter(b => 
      b.name.toLowerCase().includes(bankSearch.toLowerCase())
    );
  }, [allBanks, bankSearch]);

  const selectedBankAccount = useMemo(() => {
    return myBankAccounts?.find(a => a.id === selectedBankAccountId);
  }, [myBankAccounts, selectedBankAccountId]);

  const handleVerify = async () => {
    if (!selectedBank || accountNumber.length !== 10) return;
    try {
      const result = await verifyMutation.mutateAsync({
        bank_code: selectedBank.code,
        account_number: accountNumber,
        account_name: "", // Not needed for verification usually, but interface requires it
      });
      setVerifiedName(result.verified_name);
    } catch (error) {
      console.error("Verification failed", error);
    }
  };

  const handleSaveBank = async () => {
    if (!selectedBank || !verifiedName) return;
    try {
      const result = await addBankAccountMutation.mutateAsync({
        bank_code: selectedBank.code,
        account_number: accountNumber,
        account_name: verifiedName,
      });
      setSelectedBankAccountId(result.id);
      setIsAddBankModalVisible(false);
      // Reset form
      setSelectedBank(null);
      setAccountNumber("");
      setVerifiedName("");
    } catch (error) {
      console.error("Add bank failed", error);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedBankAccountId || !amount) return;
    try {
      const result = await withdrawMutation.mutateAsync({
        amount,
        bank_account_id: selectedBankAccountId,
      });
      setWithdrawReference(result.reference);
      setIsSuccessModalVisible(true);
    } catch (error: any) {
      console.error("Withdrawal failed", error);
    }
  };

  const renderStep1 = () => (
    <View className="space-y-6">
      <View className="flex-row justify-between items-center px-1">
        <Typography variant="label-sm" className="text-on-surface-variant">
          Select Destination
        </Typography>
        <TouchableOpacity onPress={() => setIsAddBankModalVisible(true)}>
          <Typography variant="label-sm" className="text-primary-fixed font-inter-bold">
            Add New Bank
          </Typography>
        </TouchableOpacity>
      </View>

      {isAccountsLoading ? (
        <LoadingSpinner />
      ) : myBankAccounts?.length === 0 ? (
        <TouchableOpacity 
          onPress={() => setIsAddBankModalVisible(true)}
          className="bg-surface-container-highest rounded-2xl p-8 items-center border border-dashed border-outline"
        >
          <Plus size={32} color="#8B949E" />
          <Typography className="text-on-surface-variant mt-2 font-inter-medium">
            No bank accounts linked
          </Typography>
          <Typography variant="caption" className="text-outline">
            Tap to add your first bank account
          </Typography>
        </TouchableOpacity>
      ) : (
        myBankAccounts?.map((account) => (
          <TouchableOpacity
            key={account.id}
            onPress={() => setSelectedBankAccountId(account.id)}
            className="active:scale-[0.98] mb-3"
          >
            <Card
              variant={selectedBankAccountId === account.id ? "high" : "default"}
              className={`flex-row items-center justify-between p-5 ${
                selectedBankAccountId === account.id ? "border border-primary-fixed/30" : ""
              }`}
            >
              <View className="flex-row items-center space-x-4">
                <View className="w-12 h-12 rounded-lg bg-surface-container-highest items-center justify-center">
                  <Landmark size={24} color="#F5E642" />
                </View>
                <View className="ml-4">
                  <Typography className="font-inter-bold text-white">
                    {account.bank_name}
                  </Typography>
                  <Typography variant="caption" className="text-on-surface-variant">
                    {account.account_number} • {account.account_name}
                  </Typography>
                </View>
              </View>

              <View
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedBankAccountId === account.id ? "border-primary-fixed" : "border-outline"
                } items-center justify-center`}
              >
                {selectedBankAccountId === account.id && (
                  <View className="w-3 h-3 bg-primary-fixed rounded-full" />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderStep2 = () => (
    <View className="space-y-8">
      {/* Balance Card */}
      <Card variant="low" className="p-6 bg-surface-container-highest/30">
        <Typography variant="label-sm" className="text-on-surface-variant mb-1">
          Available Balance
        </Typography>
        <Typography variant="display" className="text-primary font-inter-extrabold">
          {formatCurrency(balance)}
        </Typography>
      </Card>

      {/* Amount Input */}
      <View className="space-y-4">
        <Typography variant="label-sm" className="text-on-surface-variant px-1">
          Enter Amount
        </Typography>
        <View className="relative">
          <View className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
            <Typography className="text-primary-fixed text-2xl font-inter-bold">₦</Typography>
          </View>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="rgba(204, 199, 173, 0.3)"
            keyboardType="numeric"
            className="w-full bg-surface-container-highest rounded-2xl py-6 pl-14 pr-6 text-3xl font-inter-extrabold text-white"
            autoFocus
          />
        </View>

        {/* Quick Amounts */}
        <View className="flex-row gap-x-2">
          {QUICK_AMOUNTS.map(val => (
            <TouchableOpacity 
              key={val}
              onPress={() => setAmount(val)}
              className="flex-1 bg-surface-container-high py-3 rounded-xl border border-outline/20 items-center"
            >
              <Typography className="text-white font-inter-bold text-xs">
                ₦{parseInt(val).toLocaleString()}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View className="space-y-8">
      <Typography variant="heading" className="text-white text-center font-inter-bold">
        Confirm Withdrawal
      </Typography>
      
      <View className="bg-surface-container-highest/30 p-6 space-y-6">
        <View className="items-center mb-4">
          <Typography variant="label-sm" className="text-outline uppercase tracking-widest">
            Withdrawal Amount
          </Typography>
          <Typography variant="display" className="text-primary-fixed font-inter-extrabold mt-1">
            {formatCurrency(amount)}
          </Typography>
        </View>
        
        <View className="space-y-4">
          <View className="flex-row justify-between border-t border-outline/10 pt-4">
            <Typography className="text-outline">Bank</Typography>
            <Typography className="text-white font-inter-bold">{selectedBankAccount?.bank_name}</Typography>
          </View>
          <View className="flex-row justify-between">
            <Typography className="text-outline">Account Number</Typography>
            <Typography className="text-white font-inter-bold">{selectedBankAccount?.account_number}</Typography>
          </View>
          <View className="flex-row justify-between">
            <Typography className="text-outline">Account Name</Typography>
            <Typography className="text-white font-inter-bold uppercase">{selectedBankAccount?.account_name}</Typography>
          </View>
          <View className="flex-row justify-between">
            <Typography className="text-outline">Fee</Typography>
            <Typography className="text-white font-inter-bold">₦100.00</Typography>
          </View>
        </View>
      </View>

      <View className="bg-surface-container-highest/30 p-4 rounded-xl flex-row items-center">
        <Info size={16} color="#8B949E" />
        <Typography variant="caption" className="text-outline ml-2 flex-1">
          Funds will be processed immediately and should arrive in your bank account within minutes.
        </Typography>
      </View>
    </View>
  );

  const canContinue = () => {
    if (step === 1) return selectedBankAccountId !== null;
    if (step === 2) {
      const numAmount = parseFloat(amount);
      return amount && numAmount >= 100 && numAmount <= balance;
    }
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleWithdraw();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  return (
    <Screen
      title="Withdraw Funds"
      className="bg-background-primary"
      showBackButton
      onBack={handleBack}
    >
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Action Button */}
      <View className="p-4 bg-background-primary">
        <Button
          label={step === 3 ? "Confirm & Withdraw" : "Continue"}
          onPress={handleNext}
          disabled={!canContinue() || withdrawMutation.isPending}
          loading={withdrawMutation.isPending}
        />
      </View>

      {/* Add Bank Modal */}
      <Modal
        visible={isAddBankModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-[#161B22] rounded-t-3xl p-6 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Typography variant="subheading" className="text-white">Add Bank Account</Typography>
              <TouchableOpacity onPress={() => setIsAddBankModalVisible(false)}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 space-y-6">
              {/* Select Bank */}
              <View className="space-y-2">
                <Typography variant="label-sm" className="text-outline">Select Bank</Typography>
                <TouchableOpacity 
                  onPress={() => setIsBankPickerVisible(true)}
                  className="bg-surface-container-high rounded-xl px-4 py-4 flex-row justify-between items-center"
                >
                  <Typography className="text-white font-inter-medium">
                    {selectedBank ? selectedBank.name : "Choose a bank"}
                  </Typography>
                  <ChevronDown size={20} color="#8B949E" />
                </TouchableOpacity>
              </View>

              {/* Account Number */}
              <View className="space-y-2">
                <Typography variant="label-sm" className="text-outline">Account Number</Typography>
                <View className="relative">
                  <Input
                    placeholder="10-digit account number"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={accountNumber}
                    onChangeText={(val) => {
                      setAccountNumber(val);
                      if (val.length === 10) handleVerify();
                      else setVerifiedName("");
                    }}
                    className="mb-0 pr-16"
                  />
                  {verifyMutation.isPending && (
                    <View className="absolute right-4 top-4">
                      <LoadingSpinner />
                    </View>
                  )}
                </View>
              </View>

              {/* Verified Name */}
              {verifiedName ? (
                <View className="bg-secondary-container/10 border border-secondary-container/20 rounded-xl p-4 flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-secondary-container items-center justify-center mr-3">
                    <CheckCircle2 size={24} color="#00C896" />
                  </View>
                  <View className="flex-1">
                    <Typography variant="label-sm" className="text-[#00C896]">Account Holder Name</Typography>
                    <Typography className="text-white font-inter-bold text-lg uppercase">{verifiedName}</Typography>
                  </View>
                </View>
              ) : null}

              <View className="pt-6">
                <Button
                  label="Save Bank Account"
                  onPress={handleSaveBank}
                  disabled={!verifiedName || addBankAccountMutation.isPending}
                  loading={addBankAccountMutation.isPending}
                />
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Bank Picker Nested Modal */}
        <Modal
          visible={isBankPickerVisible}
          animationType="fade"
          transparent={true}
        >
          <View className="flex-1 bg-black/90 p-6 pt-20">
            <View className="flex-row justify-between items-center mb-6">
              <Typography variant="heading" className="text-white">Select Bank</Typography>
              <TouchableOpacity onPress={() => setIsBankPickerVisible(false)}>
                <X size={28} color="white" />
              </TouchableOpacity>
            </View>
            
            <View className="relative mb-6">
              <View className="absolute left-4 top-4 z-10">
                <Search size={20} color="#8B949E" />
              </View>
              <TextInput
                placeholder="Search banks..."
                placeholderTextColor="#8B949E"
                value={bankSearch}
                onChangeText={setBankSearch}
                className="bg-surface-container-high rounded-xl py-4 pl-12 pr-4 text-white font-inter-medium"
              />
            </View>

            <FlatList
              data={filteredBanks}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedBank(item);
                    setIsBankPickerVisible(false);
                    setBankSearch("");
                  }}
                  className="py-4 border-b border-outline/10 flex-row items-center justify-between"
                >
                  <Typography className="text-white text-lg">{item.name}</Typography>
                  {selectedBank?.code === item.code && (
                    <CheckCircle2 size={20} color="#F5E642" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={isSuccessModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/90 items-center justify-center p-6">
          <Card className="w-full bg-[#161B22] p-8 items-center border border-primary-fixed/20">
            <View className="w-20 h-20 rounded-full bg-secondary-container items-center justify-center mb-6">
              <CheckCircle2 size={48} color="#00C896" />
            </View>
            <Typography variant="heading" className="text-white mb-2">Withdrawal Initiated</Typography>
            <Typography className="text-outline text-center mb-8">
              Funds will be sent to {selectedBankAccount?.bank_name} shortly.
            </Typography>
            
            <View className="bg-[#0D1117] p-4 rounded-xl w-full mb-8 items-center border border-outline/10">
              <Typography variant="caption" className="text-outline uppercase mb-1">Reference</Typography>
              <Typography className="text-white font-inter-bold">{withdrawReference}</Typography>
            </View>

            <Button
              label="Back to Wallet"
              className="w-full"
              onPress={() => {
                setIsSuccessModalVisible(false);
                router.replace("/(tabs)/wallet");
              }}
            />
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}
