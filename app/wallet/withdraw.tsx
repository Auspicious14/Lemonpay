import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Info,
  Landmark,
  Plus,
  CheckCircle2,
  Lock,
  ChevronDown,
  Search,
  X,
  AlertCircle,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useWalletBalance } from "@/lib/hooks/useWallet";
import {
  useBanks,
  useMyBankAccounts,
  useVerifyAccount,
  useAddBankAccount,
  useWithdraw,
} from "@/lib/hooks/useBankAccount";
import { formatCurrency } from "@/lib/utils/format";
import { useToastStore } from "@/store/useToastStore";
import { Bank } from "@/types/api";

const QUICK_AMOUNTS = ["5000", "10000", "20000", "50000"];

export default function WithdrawFundsScreen() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<number | null>(null);

  // Step 1: Add Bank Modal State
  const [isAddBankModalVisible, setIsAddBankModalVisible] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isBankPickerVisible, setIsBankPickerVisible] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [withdrawReference, setWithdrawReference] = useState("");
  const [errors, setErrors] = useState<{ accountNumber?: string; accountName?: string; bank?: string }>({});

  const { data: balanceData } = useWalletBalance();
  const { data: myBankAccounts, isLoading: isAccountsLoading } = useMyBankAccounts();
  const { data: allBanks } = useBanks();

  const verifyMutation = useVerifyAccount();
  const addBankAccountMutation = useAddBankAccount();
  const withdrawMutation = useWithdraw();

  // Auto-verify when account number is 10 digits and bank selected
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      const verify = async () => {
        setIsVerifying(true);
        setVerifiedName(null);
        setAccountName("");
        try {
          const result = await verifyMutation.mutateAsync({
            bank_code: selectedBank.code,
            account_number: accountNumber,
            account_name: "",
          });
          setVerifiedName(result.verified_name);
          setAccountName(result.verified_name);
          setErrors(prev => ({ ...prev, accountNumber: undefined }));
        } catch (err: any) {
          setVerifiedName(null);
          setErrors(prev => ({
            ...prev,
            accountNumber: err.response?.data?.message || "Could not verify account number"
          }));
        } finally {
          setIsVerifying(false);
        }
      };
      verify();
    } else {
      setVerifiedName(null);
    }
  }, [accountNumber, selectedBank]);

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

  const validateBankForm = () => {
    const newErrors: typeof errors = {};
    if (!selectedBank) newErrors.bank = "Please select a bank";
    if (accountNumber.length !== 10) newErrors.accountNumber = "Account number must be 10 digits";
    if (!accountName.trim()) newErrors.accountName = "Account name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveBank = async () => {
    if (!validateBankForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    try {
      const result = await addBankAccountMutation.mutateAsync({
        bank_code: selectedBank!.code,
        account_number: accountNumber,
        account_name: accountName,
      });
      setSelectedBankAccountId(result.id);
      setIsAddBankModalVisible(false);
      showToast("Bank account added successfully", "success");
      // Reset form
      setSelectedBank(null);
      setAccountNumber("");
      setAccountName("");
      setVerifiedName(null);
      setErrors({});
    } catch (error: any) {
      console.error("Add bank failed", error);
      showToast(error.response?.data?.message || "Failed to add bank account", "error");
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
      showToast("Withdrawal successful", "success");
    } catch (error: any) {
      console.error("Withdrawal failed", error);
      showToast(error.message || "Withdrawal failed", "error");
    }
  };

  const renderStep1 = () => (
    <View className="space-y-6">
      <View className="flex-row justify-between items-center px-1">
        <Typography
          style={{ fontFamily: 'Inter' }}
          variant="label-sm" className="text-[#8B949E]"
        >
          Select Destination
        </Typography>
        <TouchableOpacity onPress={() => setIsAddBankModalVisible(true)}>
          <Typography
            style={{ fontFamily: 'Inter-Bold' }}
            variant="label-sm" className="text-[#F5E642]"
          >
            Add New Bank
          </Typography>
        </TouchableOpacity>
      </View>

      {isAccountsLoading ? (
        <LoadingSpinner />
      ) : myBankAccounts?.length === 0 ? (
        <TouchableOpacity
          onPress={() => setIsAddBankModalVisible(true)}
          className="bg-[#161B22] rounded-2xl p-8 items-center border border-dashed border-[#30363D]"
        >
          <Plus size={32} color="#8B949E" />
          <Typography
            style={{ fontFamily: 'Inter-Medium' }}
            className="text-[#8B949E] mt-2"
          >
            No bank accounts linked
          </Typography>
          <Typography
            style={{ fontFamily: 'Inter' }}
            variant="caption" className="text-[#484f58]"
          >
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
                selectedBankAccountId === account.id ? "border border-[#F5E642]/30" : ""
              }`}
            >
              <View className="flex-row items-center space-x-4">
                <View className="w-12 h-12 rounded-lg bg-[#161B22] items-center justify-center">
                  <Landmark size={24} color="#F5E642" />
                </View>
                <View className="ml-4">
                  <Typography
                    style={{ fontFamily: 'Inter-Bold' }}
                    className="text-white"
                  >
                    {account.bank_name}
                  </Typography>
                  <Typography
                    style={{ fontFamily: 'Inter' }}
                    variant="caption" className="text-[#8B949E]"
                  >
                    {account.account_number} • {account.account_name}
                  </Typography>
                </View>
              </View>

              <View
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedBankAccountId === account.id ? "border-[#F5E642]" : "border-[#30363D]"
                } items-center justify-center`}
              >
                {selectedBankAccountId === account.id && (
                  <View className="w-3 h-3 bg-[#F5E642] rounded-full" />
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
      <Card variant="low" className="p-6 bg-[#161B22]/30">
        <Typography
          style={{ fontFamily: 'Inter' }}
          variant="label-sm" className="text-[#8B949E] mb-1"
        >
          Available Balance
        </Typography>
        <Typography
          style={{ fontFamily: 'Inter-ExtraBold' }}
          variant="display" className="text-[#F5E642]"
        >
          {formatCurrency(balance)}
        </Typography>
      </Card>

      {/* Amount Input */}
      <View className="space-y-4">
        <Typography
          style={{ fontFamily: 'Inter' }}
          variant="label-sm" className="text-[#8B949E] px-1"
        >
          Enter Amount
        </Typography>
        <View className="relative">
          <View className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
            <Typography
              style={{ fontFamily: 'Inter-Bold' }}
              className="text-[#F5E642] text-2xl"
            >
              ₦
            </Typography>
          </View>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="rgba(204, 199, 173, 0.3)"
            keyboardType="numeric"
            style={{ fontFamily: 'Inter-ExtraBold' }}
            className="w-full bg-[#161B22] rounded-2xl py-6 pl-14 pr-6 text-3xl text-white"
            autoFocus
          />
        </View>

        {/* Quick Amounts */}
        <View className="flex-row gap-x-2">
          {QUICK_AMOUNTS.map(val => (
            <TouchableOpacity
              key={val}
              onPress={() => setAmount(val)}
              className="flex-1 bg-[#161B22] py-3 rounded-xl border border-[#30363D]/20 items-center"
            >
              <Typography
                style={{ fontFamily: 'Inter-Bold' }}
                className="text-white text-xs"
              >
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
      <Typography
        style={{ fontFamily: 'Inter-Bold' }}
        variant="heading" className="text-white text-center"
      >
        Confirm Withdrawal
      </Typography>

      <View className="bg-[#161B22]/30 p-6 space-y-6">
        <View className="items-center mb-4">
          <Typography
            style={{ fontFamily: 'Inter' }}
            variant="label-sm" className="text-[#8B949E] uppercase tracking-widest"
          >
            Withdrawal Amount
          </Typography>
          <Typography
            style={{ fontFamily: 'Inter-ExtraBold' }}
            variant="display" className="text-[#F5E642] mt-1"
          >
            {formatCurrency(amount)}
          </Typography>
        </View>

        <View className="space-y-4">
          <View className="flex-row justify-between border-t border-[#30363D]/10 pt-4">
            <Typography
              style={{ fontFamily: 'Inter' }}
              className="text-[#8B949E]"
            >
              Bank
            </Typography>
            <Typography
              style={{ fontFamily: 'Inter-Bold' }}
              className="text-white"
            >
              {selectedBankAccount?.bank_name}
            </Typography>
          </View>
          <View className="flex-row justify-between">
            <Typography
              style={{ fontFamily: 'Inter' }}
              className="text-[#8B949E]"
            >
              Account Number
            </Typography>
            <Typography
              style={{ fontFamily: 'Inter-Bold' }}
              className="text-white"
            >
              {selectedBankAccount?.account_number}
            </Typography>
          </View>
          <View className="flex-row justify-between">
            <Typography
              style={{ fontFamily: 'Inter' }}
              className="text-[#8B949E]"
            >
              Account Name
            </Typography>
            <Typography
              style={{ fontFamily: 'Inter-Bold' }}
              className="text-white uppercase"
            >
              {selectedBankAccount?.account_name}
            </Typography>
          </View>
          <View className="flex-row justify-between">
            <Typography
              style={{ fontFamily: 'Inter' }}
              className="text-[#8B949E]"
            >
              Fee
            </Typography>
            <Typography
              style={{ fontFamily: 'Inter-Bold' }}
              className="text-white"
            >
              ₦100.00
            </Typography>
          </View>
        </View>
      </View>

      <View className="bg-[#161B22]/30 p-4 rounded-xl flex-row items-center">
        <Info size={16} color="#8B949E" />
        <Typography
          style={{ fontFamily: 'Inter' }}
          variant="caption" className="text-[#8B949E] ml-2 flex-1"
        >
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
      className="bg-[#0D1117]"
      showBackButton
      onBack={handleBack}
    >
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Action Button */}
      <View className="p-4 bg-[#0D1117]">
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
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 bg-black/70 justify-end">
            <View className="bg-[#0D1117] rounded-t-[32px] border-t border-[#30363D] p-6 max-h-[90%]">
              <View className="w-12 h-1 bg-[#30363D] rounded-full self-center mb-6" />

              <View className="flex-row justify-between items-center mb-8">
                <View>
                  <Typography variant="heading" className="text-white text-2xl">Add Bank</Typography>
                  <Typography variant="caption" className="text-[#8B949E] mt-1">
                    Enter your NGN bank details
                  </Typography>
                </View>
                <TouchableOpacity
                  onPress={() => setIsAddBankModalVisible(false)}
                  className="w-10 h-10 bg-[#161B22] rounded-full items-center justify-center border border-[#30363D]"
                >
                  <X size={20} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView
                className="space-y-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                {/* Select Bank */}
                <View className="space-y-3">
                  <Typography variant="label-sm" className="text-[#8B949E] px-1 uppercase tracking-widest">
                    Financial Institution
                  </Typography>
                  <TouchableOpacity
                    onPress={() => setIsBankPickerVisible(true)}
                    activeOpacity={0.7}
                    className={`bg-[#161B22] rounded-2xl px-5 py-4 flex-row justify-between items-center border ${
                      errors.bank ? "border-red-500/50" : "border-[#30363D]"
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-8 h-8 bg-[#F5E642]/10 rounded-lg items-center justify-center mr-3">
                        <Landmark size={18} color="#F5E642" />
                      </View>
                      <Typography className={`font-inter-medium flex-1 ${selectedBank ? "text-white" : "text-[#484f58]"}`}>
                        {selectedBank ? selectedBank.name : "Select your bank"}
                      </Typography>
                    </View>
                    <ChevronDown size={20} color="#8B949E" />
                  </TouchableOpacity>
                  {errors.bank && (
                    <View className="flex-row items-center mt-1 px-1">
                      <AlertCircle size={12} color="#EF4444" />
                      <Typography className="text-red-500 text-[10px] ml-1">{errors.bank}</Typography>
                    </View>
                  )}
                </View>

                {/* Account Number */}
                <View className="space-y-3">
                  <Typography variant="label-sm" className="text-[#8B949E] px-1 uppercase tracking-widest">
                    Account Number
                  </Typography>
                  <View className="relative">
                    <TextInput
                      placeholder="e.g. 0123456789"
                      placeholderTextColor="#484f58"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={accountNumber}
                      onChangeText={(text) => {
                        setAccountNumber(text);
                        if (errors.accountNumber) setErrors(prev => ({ ...prev, accountNumber: undefined }));
                      }}
                      style={{ fontFamily: 'Inter-Medium' }}
                      className={`w-full bg-[#161B22] rounded-2xl py-4 px-5 text-white border ${
                        errors.accountNumber ? "border-red-500/50" : "border-[#30363D]"
                      }`}
                    />
                    {isVerifying && (
                      <View className="absolute right-5 top-4">
                        <ActivityIndicator size="small" color="#F5E642" />
                      </View>
                    )}
                  </View>
                  {errors.accountNumber && (
                    <View className="flex-row items-center mt-1 px-1">
                      <AlertCircle size={12} color="#EF4444" />
                      <Typography className="text-red-500 text-[10px] ml-1">{errors.accountNumber}</Typography>
                    </View>
                  )}
                </View>

                {/* Account Name */}
                <View className="space-y-3">
                  <Typography variant="label-sm" className="text-[#8B949E] px-1 uppercase tracking-widest">
                    Account Name
                  </Typography>
                  <TextInput
                    placeholder="Beneficiary Name"
                    placeholderTextColor="#484f58"
                    value={accountName}
                    onChangeText={(text) => {
                      setAccountName(text);
                      if (errors.accountName) setErrors(prev => ({ ...prev, accountName: undefined }));
                    }}
                    editable={!isVerifying}
                    style={{ fontFamily: 'Inter-Bold' }}
                    className={`w-full bg-[#161B22] rounded-2xl py-4 px-5 text-white border ${
                      errors.accountName ? "border-red-500/50" : "border-[#30363D]"
                    } ${isVerifying ? "opacity-50" : ""}`}
                  />
                  {verifiedName && !isVerifying && (
                    <View className="flex-row items-center mt-1 px-1">
                      <CheckCircle2 size={12} color="#00C896" />
                      <Typography className="text-[#00C896] text-[10px] ml-1">Account verified successfully</Typography>
                    </View>
                  )}
                  {errors.accountName && (
                    <View className="flex-row items-center mt-1 px-1">
                      <AlertCircle size={12} color="#EF4444" />
                      <Typography className="text-red-500 text-[10px] ml-1">{errors.accountName}</Typography>
                    </View>
                  )}
                </View>

                <View className="pt-8">
                  <Button
                    label="Link Bank Account"
                    onPress={handleSaveBank}
                    disabled={addBankAccountMutation.isPending || isVerifying}
                    loading={addBankAccountMutation.isPending}
                    className="h-16 rounded-2xl"
                  />

                  <View className="flex-row items-center justify-center mt-6">
                    <Lock size={12} color="#8B949E" />
                    <Typography variant="caption" className="text-[#8B949E] ml-1.5">
                      Encrypted and secure by LemonPay
                    </Typography>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Bank Picker Nested Modal */}
        <Modal
          visible={isBankPickerVisible}
          animationType="slide"
          transparent={true}
          statusBarTranslucent
        >
          <View className="flex-1 bg-[#0D1117] pt-14">
            <View className="px-6 pb-6 border-b border-[#30363D]">
              <View className="flex-row justify-between items-center mb-6">
                <Typography variant="heading" className="text-white text-2xl">Select Bank</Typography>
                <TouchableOpacity
                  onPress={() => setIsBankPickerVisible(false)}
                  className="w-10 h-10 bg-[#161B22] rounded-full items-center justify-center border border-[#30363D]"
                >
                  <X size={20} color="white" />
                </TouchableOpacity>
              </View>

              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Search size={20} color="#8B949E" />
                </View>
                <TextInput
                  placeholder="Search for your bank..."
                  placeholderTextColor="#484f58"
                  value={bankSearch}
                  onChangeText={setBankSearch}
                  className="bg-[#161B22] rounded-2xl py-4 pl-12 pr-4 text-white font-inter-medium border border-[#30363D]"
                />
              </View>
            </View>

            <FlatList
              data={filteredBanks}
              keyExtractor={item => item.code}
              contentContainerStyle={{ padding: 24 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedBank(item);
                    setIsBankPickerVisible(false);
                    setBankSearch("");
                    if (errors.bank) setErrors(prev => ({ ...prev, bank: undefined }));
                  }}
                  activeOpacity={0.7}
                  className="py-5 border-b border-[#30363D]/30 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-[#161B22] rounded-xl items-center justify-center mr-4 border border-[#30363D]">
                      <Landmark size={20} color={selectedBank?.code === item.code ? "#F5E642" : "#8B949E"} />
                    </View>
                    <Typography className={`text-lg ${selectedBank?.code === item.code ? "text-[#F5E642] font-inter-bold" : "text-white font-inter-medium"}`}>
                      {item.name}
                    </Typography>
                  </View>
                  {selectedBank?.code === item.code && (
                    <View className="w-6 h-6 bg-[#F5E642] rounded-full items-center justify-center">
                      <CheckCircle2 size={16} color="#0D1117" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="py-20 items-center">
                  <Typography className="text-[#8B949E]">No banks found for "{bankSearch}"</Typography>
                </View>
              }
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
          <Card className="w-full bg-[#161B22] p-8 items-center border border-[#F5E642]/20">
            <View className="w-20 h-20 rounded-full bg-[#00C896]/10 items-center justify-center mb-6">
              <CheckCircle2 size={48} color="#00C896" />
            </View>
            <Typography variant="heading" className="text-white mb-2">Withdrawal Initiated</Typography>
            <Typography className="text-[#8B949E] text-center mb-8">
              Funds will be sent to {selectedBankAccount?.bank_name} shortly.
            </Typography>

            <View className="bg-[#0D1117] p-4 rounded-xl w-full mb-8 items-center border border-[#30363D]">
              <Typography variant="caption" className="text-[#8B949E] uppercase mb-1">Reference</Typography>
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
