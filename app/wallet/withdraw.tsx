import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Landmark,
  Plus,
  Info,
  CheckCircle2,
  Lock,
  ChevronDown,
  X,
  Search,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useWalletBalance } from "@/lib/hooks/useWallet";
import {
  useBanks,
  useMyBankAccounts,
  useVerifyAccount,
  useAddBankAccount,
} from "@/lib/hooks/useBankAccount";
import { formatCurrency } from "@/lib/utils/format";
import { useToastStore } from "@/store/useToastStore";
import { Bank } from "@/types/api";
import { LinearGradient } from "expo-linear-gradient";

export default function WithdrawFundsScreen() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);

  // Withdrawal Amount State
  const [rawAmount, setRawAmount] = useState("");
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<
    number | null
  >(null);

  // Add Bank Modal State
  const [isAddBankModalVisible, setIsAddBankModalVisible] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isBankPickerVisible, setIsBankPickerVisible] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<{
    accountNumber?: string;
    accountName?: string;
    bank?: string;
  }>({});

  const { data: balanceData } = useWalletBalance();
  const { data: myBankAccounts, isLoading: isAccountsLoading } =
    useMyBankAccounts();
  const { data: allBanks } = useBanks();

  const verifyMutation = useVerifyAccount();
  const addBankAccountMutation = useAddBankAccount();

  const balance = balanceData?.balance || 0;

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
          setErrors((prev) => ({ ...prev, accountNumber: undefined }));
        } catch (err: any) {
          setVerifiedName(null);
          setErrors((prev) => ({
            ...prev,
            accountNumber:
              err.response?.data?.message || "Could not verify account number",
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

  const handleAmountChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    setRawAmount(digits);
  };

  const displayAmount = rawAmount
    ? parseInt(rawAmount).toLocaleString("en-NG")
    : "";

  const numericAmount = rawAmount || "0";

  const handleSaveBank = async () => {
    if (!selectedBank || accountNumber.length !== 10 || !accountName) {
      if (!selectedBank) showToast("Please select a bank", "error");
      else if (accountNumber.length !== 10)
        showToast("Account number must be 10 digits", "error");
      else if (!accountName)
        showToast("Please verify your account number first", "error");
      return;
    }

    try {
      const result = await addBankAccountMutation.mutateAsync({
        bank_code: selectedBank.code,
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
      showToast(
        error.response?.data?.message || "Failed to add bank account",
        "error",
      );
    }
  };

  const filteredBanks = useMemo(() => {
    if (!allBanks) return [];
    return allBanks.filter((b) =>
      b.name.toLowerCase().includes(bankSearch.toLowerCase()),
    );
  }, [allBanks, bankSearch]);

  const selectedBankAccount = useMemo(() => {
    return myBankAccounts?.find((a) => a.id === selectedBankAccountId);
  }, [myBankAccounts, selectedBankAccountId]);

  const handleContinue = () => {
    if (!selectedBankAccountId || !rawAmount) return;

    const numAmount = parseFloat(numericAmount);
    if (numAmount < 100) {
      showToast("Minimum withdrawal is ₦100.00", "error");
      return;
    }
    if (numAmount > balance) {
      showToast("Insufficient balance", "error");
      return;
    }

    router.push({
      pathname: "/wallet/withdraw-review",
      params: {
        amount: numericAmount,
        bankAccountId: selectedBankAccountId,
        bankName: selectedBankAccount?.bank_name,
        accountNumber: selectedBankAccount?.account_number,
      },
    });
  };
  console.log({ myBankAccounts });
  return (
    <Screen className="bg-[#0D1117]" withPadding={false}>
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#F5E642" />
        </TouchableOpacity>
        <Typography
          style={{ fontFamily: "Inter-Bold" }}
          className="text-white text-xl"
        >
          Withdraw Funds
        </Typography>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="bg-[#161B22] rounded-[20px] p-5 mb-8">
          <Typography
            style={{ fontFamily: "Inter", fontSize: 10 }}
            className="text-[#8B949E] uppercase mb-1"
          >
            AVAILABLE BALANCE
          </Typography>
          <Typography variant="display">{formatCurrency(balance)}</Typography>
        </View>

        {/* Withdrawal Amount Section */}
        <View className="mb-8">
          <Typography
            style={{ fontFamily: "Inter", fontSize: 10 }}
            className="text-[#8B949E] uppercase mb-3"
          >
            WITHDRAWAL AMOUNT
          </Typography>
          <View className="bg-[#21262D] rounded-[20px] p-4 flex-row items-center">
            <Typography
              style={{ fontFamily: "Inter-Bold", fontSize: 24 }}
              className="text-[#F5E642] mr-3"
            >
              ₦
            </Typography>
            <TextInput
              value={displayAmount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor="rgba(139, 148, 158, 0.3)"
              keyboardType="numeric"
              style={{
                fontFamily: "Inter-ExtraBold",
                fontSize: 24,
                color: "white",
                flex: 1,
              }}
            />
          </View>
        </View>

        {/* Select Destination Section */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Typography
              style={{ fontFamily: "Inter", fontSize: 10 }}
              className="text-[#8B949E] uppercase"
            >
              SELECT DESTINATION
            </Typography>
            <TouchableOpacity onPress={() => setIsAddBankModalVisible(true)}>
              <Typography
                style={{ fontFamily: "Inter-Bold", fontSize: 12 }}
                className="text-[#F5E642]"
              >
                Add New
              </Typography>
            </TouchableOpacity>
          </View>

          {isAccountsLoading ? (
            <LoadingSpinner />
          ) : myBankAccounts?.length === 0 ? (
            <TouchableOpacity
              onPress={() => setIsAddBankModalVisible(true)}
              className="bg-[#161B22] rounded-[20px] p-8 items-center border border-dashed border-[#30363D]"
            >
              <Plus size={32} color="#8B949E" />
              <Typography
                style={{ fontFamily: "Inter-Medium", fontSize: 14 }}
                className="text-[#8B949E] mt-2"
              >
                No bank accounts linked
              </Typography>
              <Typography
                style={{ fontFamily: "Inter", fontSize: 12 }}
                className="text-[#484f58]"
              >
                Tap to add your first bank account
              </Typography>
            </TouchableOpacity>
          ) : (
            myBankAccounts?.map((account) => (
              <TouchableOpacity
                key={account.id}
                onPress={() => setSelectedBankAccountId(account.id)}
                className={`bg-[#161B22] rounded-[20px] border ${
                  selectedBankAccountId === account.id
                    ? "border-[#F5E642]"
                    : "border-[#30363D]"
                } p-4 flex-row items-center mb-3`}
              >
                <View className="w-12 h-12 rounded-lg bg-[#0D1117] items-center justify-center mr-4">
                  <Landmark size={24} color="#8B949E" />
                </View>
                <View className="flex-1">
                  <Typography
                    style={{ fontFamily: "Inter-Bold", fontSize: 16 }}
                    className="text-white"
                  >
                    {account.bank_name}
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Inter", fontSize: 12 }}
                    className="text-[#8B949E]"
                  >
                    {account.account_number.slice(0, 4)}...
                    {account.account_number.slice(-4)}
                  </Typography>
                </View>
                <View
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedBankAccountId === account.id
                      ? "border-[#F5E642]"
                      : "border-[#30363D]"
                  } items-center justify-center`}
                >
                  {selectedBankAccountId === account.id && (
                    <View className="w-3 h-3 bg-[#F5E642] rounded-full" />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Fee Row */}
        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-row items-center">
            <Info size={16} color="#8B949E" className="mr-2" />
            <Typography
              style={{ fontFamily: "Inter", fontSize: 14 }}
              className="text-[#8B949E]"
            >
              Withdrawal Fee
            </Typography>
          </View>
          <Typography
            style={{ fontFamily: "Inter-Bold", fontSize: 14 }}
            className="text-white"
          >
            ₦100.00
          </Typography>
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View className="absolute bottom-10 left-4 right-4">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selectedBankAccountId || !rawAmount}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#F5E642", "#D9CC3C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 56,
              borderRadius: 14,
              justifyContent: "center",
              alignItems: "center",
              opacity: !selectedBankAccountId || !rawAmount ? 0.5 : 1,
            }}
          >
            <Typography
              style={{ fontFamily: "Inter-Bold", fontSize: 16 }}
              className="!text-[#0D1117] uppercase"
            >
              CONTINUE
            </Typography>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Add Bank Modal */}
      <Modal
        visible={isAddBankModalVisible}
        animationType="slide"
        transparent={true}
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/70 justify-end">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View className="bg-[#161B22] rounded-t-[24px] p-6 pb-12">
              <View className="w-12 h-1 bg-[#30363D] rounded-full self-center mb-6" />

              <View className="flex-row items-center mb-8">
                <TouchableOpacity
                  onPress={() => setIsAddBankModalVisible(false)}
                  className="mr-4"
                >
                  <ArrowLeft size={24} color="#F5E642" />
                </TouchableOpacity>
                <Typography
                  style={{ fontFamily: "Inter-Bold", fontSize: 20 }}
                  className="text-white"
                >
                  Add Bank Account
                </Typography>
              </View>

              <View className="space-y-6">
                {/* Select Bank Field */}
                <View>
                  <Typography
                    style={{ fontFamily: "Inter", fontSize: 10 }}
                    className="text-[#8B949E] uppercase mb-2"
                  >
                    SELECT BANK
                  </Typography>
                  <TouchableOpacity
                    onPress={() => setIsBankPickerVisible(true)}
                    className="bg-[#21262D] rounded-[16px] border border-[#30363D] p-4 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center">
                      <Landmark size={20} color="#8B949E" className="mr-3" />
                      <Typography
                        style={{ fontFamily: "Inter", fontSize: 14 }}
                        className={
                          selectedBank ? "text-white" : "text-[#8B949E]"
                        }
                      >
                        {selectedBank
                          ? selectedBank.name
                          : "Choose from list..."}
                      </Typography>
                    </View>
                    <ChevronDown size={20} color="#8B949E" />
                  </TouchableOpacity>
                </View>

                {/* Account Number Field */}
                <View>
                  <Typography
                    style={{ fontFamily: "Inter", fontSize: 10 }}
                    className="text-[#8B949E] uppercase mb-2"
                  >
                    ACCOUNT NUMBER
                  </Typography>
                  <View className="bg-[#21262D] rounded-[16px] border border-[#30363D] p-4 flex-row items-center">
                    <TextInput
                      value={accountNumber}
                      onChangeText={(text) =>
                        setAccountNumber(
                          text.replace(/[^0-9]/g, "").slice(0, 10),
                        )
                      }
                      placeholder="0000000000"
                      placeholderTextColor="rgba(139, 148, 158, 0.3)"
                      keyboardType="numeric"
                      maxLength={10}
                      style={{
                        fontFamily: "Inter",
                        fontSize: 14,
                        color: "white",
                        flex: 1,
                      }}
                    />
                    {isVerifying ? (
                      <ActivityIndicator size="small" color="#F5E642" />
                    ) : (
                      <Typography
                        style={{ fontFamily: "Inter-Bold", fontSize: 12 }}
                        className="text-[#F5E642]"
                      >
                        Verify
                      </Typography>
                    )}
                  </View>
                </View>

                {/* Account Name Field */}
                {isVerifying ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator color="#F5E642" />
                    <Typography
                      style={{ fontFamily: "Inter", fontSize: 12 }}
                      className="text-[#8B949E] mt-2"
                    >
                      Verifying account...
                    </Typography>
                  </View>
                ) : verifiedName ? (
                  <View className="bg-[#00C89626] border border-[#00C8964D] rounded-[16px] p-4 flex-row items-center">
                    <View className="w-6 h-6 rounded-full bg-[#00C896] items-center justify-center mr-3">
                      <CheckCircle2 size={16} color="white" />
                    </View>
                    <View className="flex-1">
                      <Typography
                        style={{ fontFamily: "Inter", fontSize: 10 }}
                        className="text-[#00C896] uppercase"
                      >
                        ACCOUNT HOLDER NAME
                      </Typography>
                      <Typography
                        style={{ fontFamily: "Inter-Bold", fontSize: 18 }}
                        className="text-white uppercase"
                      >
                        {verifiedName}
                      </Typography>
                    </View>
                  </View>
                ) : (
                  <View>
                    <Typography
                      style={{ fontFamily: "Inter", fontSize: 10 }}
                      className="text-[#8B949E] uppercase mb-2"
                    >
                      ACCOUNT NAME
                    </Typography>
                    <View
                      className={`bg-[#21262D] rounded-[16px] border ${errors.accountName ? "border-red-500" : "border-[#30363D]"} p-4`}
                    >
                      <TextInput
                        value={accountName}
                        onChangeText={(text) => {
                          setAccountName(text);
                          if (errors.accountName)
                            setErrors((prev) => ({
                              ...prev,
                              accountName: undefined,
                            }));
                        }}
                        placeholder="Enter account name"
                        placeholderTextColor="rgba(139, 148, 158, 0.3)"
                        style={{
                          fontFamily: "Inter-Bold",
                          fontSize: 14,
                          color: "white",
                        }}
                      />
                    </View>
                    {errors.accountName && (
                      <Typography className="text-red-500 text-[10px] mt-1 ml-1">
                        {errors.accountName}
                      </Typography>
                    )}
                  </View>
                )}

                {/* NIBSS Note */}
                <View className="flex-row items-center justify-center mt-2">
                  <Lock size={14} color="#8B949E" className="mr-2" />
                  <Typography
                    style={{ fontFamily: "Inter", fontSize: 12 }}
                    className="text-[#8B949E]"
                  >
                    Securely linked via NIBSS
                  </Typography>
                </View>

                {/* Add Bank Account Button */}
                <TouchableOpacity
                  onPress={handleSaveBank}
                  disabled={!accountName || addBankAccountMutation.isPending}
                  activeOpacity={0.8}
                  className="mt-4"
                >
                  <LinearGradient
                    colors={["#F5E642", "#D9CC3C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: 56,
                      borderRadius: 14,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      opacity:
                        !accountName || addBankAccountMutation.isPending
                          ? 0.5
                          : 1,
                    }}
                  >
                    {addBankAccountMutation.isPending ? (
                      <ActivityIndicator color="#0D1117" />
                    ) : (
                      <>
                        <Typography
                          style={{ fontFamily: "Inter-Bold", fontSize: 16 }}
                          className="text-[#0D1117] mr-2"
                        >
                          Add Bank Account
                        </Typography>
                        <Plus size={20} color="#0D1117" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>

        {/* Bank Picker Nested Modal */}
        {/* <Modal
          visible={isBankPickerVisible}
          animationType="fade"
          transparent={true}
        >
          <View className="flex-1 bg-black/80 p-6 justify-center">
            <View className="bg-[#161B22] rounded-[24px] border border-[#30363D] max-h-[80%]">
              <View className="p-4 border-b border-[#30363D] flex-row justify-between items-center">
                <Typography
                  style={{ fontFamily: "Inter-Bold" }}
                  className="text-white text-lg"
                >
                  Select Bank
                </Typography>
                <TouchableOpacity onPress={() => setIsBankPickerVisible(false)}>
                  <X size={20} color="#8B949E" />
                </TouchableOpacity>
              </View>
              <View className="p-4 flex-1">
                <TextInput
                  placeholder="Search banks..."
                  placeholderTextColor="#8B949E"
                  value={bankSearch}
                  onChangeText={setBankSearch}
                  style={{
                    fontFamily: "Inter",
                    backgroundColor: "#0D1117",
                    borderRadius: 12,
                    padding: 12,
                    color: "white",
                    marginBottom: 16,
                  }}
                />
                <FlatList
                  data={filteredBanks}
                  keyExtractor={(item) => item.code}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedBank(item);
                        setIsBankPickerVisible(false);
                        setBankSearch("");
                        if (errors.bank)
                          setErrors((prev) => ({ ...prev, bank: undefined }));
                      }}
                      activeOpacity={0.7}
                      className="py-4 border-b border-[#30363D]/30 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-[#0D1117] rounded-xl items-center justify-center mr-4 border border-[#30363D]">
                          <Landmark
                            size={20}
                            color={
                              selectedBank?.code === item.code
                                ? "#F5E642"
                                : "#8B949E"
                            }
                          />
                        </View>
                        <Typography
                          className={`text-base ${selectedBank?.code === item.code ? "text-[#F5E642] font-inter-bold" : "text-white font-inter-medium"}`}
                        >
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
                      <Typography className="text-[#8B949E]">
                        No banks found for "{bankSearch}"
                      </Typography>
                    </View>
                  }
                />
              </View>
            </View>
          </View>
        </Modal> */}

        <Modal
          visible={isBankPickerVisible}
          animationType="slide"
          transparent={true}
          statusBarTranslucent
        >
          <View className="flex-1 bg-[#0D1117] pt-14">
            <View className="px-6 pb-6 border-b border-[#30363D]">
              <View className="flex-row justify-between items-center mb-6">
                <Typography variant="heading" className="text-white text-2xl">
                  Select Bank
                </Typography>
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
              keyExtractor={(item) => item.code}
              contentContainerStyle={{ padding: 24 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedBank(item);

                    setIsBankPickerVisible(false);

                    setBankSearch("");

                    if (errors.bank)
                      setErrors((prev) => ({ ...prev, bank: undefined }));
                  }}
                  activeOpacity={0.7}
                  className="py-5 border-b border-[#30363D]/30 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-[#161B22] rounded-xl items-center justify-center mr-4 border border-[#30363D]">
                      <Landmark
                        size={20}
                        color={
                          selectedBank?.code === item.code
                            ? "#F5E642"
                            : "#8B949E"
                        }
                      />
                    </View>
                    <Typography
                      className={`text-lg ${selectedBank?.code === item.code ? "text-[#F5E642] font-inter-bold" : "text-white font-inter-medium"}`}
                    >
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
                  <Typography className="text-[#8B949E]">
                    No banks found for "{bankSearch}"
                  </Typography>
                </View>
              }
            />
          </View>
        </Modal>
      </Modal>
    </Screen>
  );
}
