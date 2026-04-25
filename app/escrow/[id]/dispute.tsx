import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Shield,
  Scale,
  Package,
  AlertCircle,
  CreditCard,
  CloudUpload,
  Info,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { useEscrowDetail } from "@/lib/hooks/useEscrow";
import { useCreateDispute } from "@/lib/hooks/useDisputes";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToastStore } from "@/store/useToastStore";
import { useDialogStore } from "@/store/useDialogStore";

const LEMON_YELLOW = "#F5E642";
const DARK_BG = "#161B22";
const CARD_BG = "#161B22";
const INPUT_BG = "#21262D";
const BORDER_COLOR = "#30363D";
const TEAL = "#00C896";

const DISPUTE_REASONS = [
  { id: "not_received", label: "Item not received", icon: Package },
  { id: "not_as_described", label: "Item not as described", icon: AlertCircle },
  { id: "damaged", label: "Counterfeit item", icon: CreditCard }, // Mapped 'Counterfeit' to 'damaged' as requested
] as const;

export default function RaiseDisputeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { show: showToast } = useToastStore();
  const { show: showDialog } = useDialogStore();

  const { data: escrow, isLoading: isEscrowLoading } = useEscrowDetail(id || "");
  const [reason, setReason] = useState<typeof DISPUTE_REASONS[number]["id"] | null>(null);
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const createDisputeMutation = useCreateDispute();

  const handlePickFiles = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showDialog({
        title: "Permission Denied",
        message: "We need access to your gallery to upload evidence.",
        confirmLabel: "Understood",
        cancelLabel: null as any,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setAttachments([...attachments, ...result.assets]);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleSubmit = async () => {
    if (!reason || !description) return;

    try {
      const firstAttachment = attachments.length > 0 ? {
        uri: attachments[0].uri,
        mimeType: attachments[0].mimeType,
        fileName: attachments[0].fileName || "evidence.jpg"
      } : undefined;

      const result = await createDisputeMutation.mutateAsync({
        escrow_uuid: escrow!.uuid,
        reason,
        description,
        attachment: firstAttachment,
      });
      
      showToast("Dispute raised successfully", "success");
      router.replace(`/disputes/${result.uuid}`);
    } catch (error) {
      console.error("Failed to submit dispute", error);
      showToast("Failed to raise dispute", "error");
    }
  };

  if (isEscrowLoading || !escrow) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  const isSubmitDisabled = !reason || !description || createDisputeMutation.isPending;

  return (
    <Screen>
      <View className="px-4 py-2 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <ArrowLeft size={20} color={LEMON_YELLOW} />
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-[#F5E642] ml-2 text-sm"
          >
            Dispute Center
          </Typography>
        </TouchableOpacity>
        <Typography 
          style={{ fontFamily: "Inter-ExtraBold" }}
          className="text-[#F5E642] text-lg"
        >
          LymePay
        </Typography>
      </View>

      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Trust Badges */}
        <View className="flex-row mt-4 gap-2">
          <View 
            style={{ backgroundColor: "rgba(0,200,150,0.12)", borderColor: TEAL, borderWidth: 1 }}
            className="flex-row items-center px-3 py-1.5 rounded-full"
          >
            <Shield size={14} color={TEAL} />
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-[#00C896] ml-1.5 text-[10px] uppercase"
            >
              Escrow Protected
            </Typography>
          </View>
          <View 
            style={{ backgroundColor: "#21262D", borderColor: BORDER_COLOR, borderWidth: 1 }}
            className="flex-row items-center px-3 py-1.5 rounded-full"
          >
            <Scale size={14} color="#8B949E" />
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-[#8B949E] ml-1.5 text-[10px] uppercase"
            >
              Secure Dispute Process
            </Typography>
          </View>
        </View>

        {/* Heading */}
        <View className="mt-6">
          <Typography 
            style={{ fontFamily: "Inter-ExtraBold" }}
            className="text-white text-[32px] leading-tight"
          >
            Raise a Dispute
          </Typography>
          <Typography 
            style={{ fontFamily: "Inter" }}
            className="text-gray-400 mt-2 text-sm leading-5"
          >
            Our neutral mediators will review your claim within 24-48 hours. Funds remain locked in escrow until a resolution is reached.
          </Typography>
        </View>

        {/* Reason Section */}
        <View className="mt-8">
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-gray-500 text-[10px] uppercase tracking-widest mb-3"
          >
            Reason for Dispute
          </Typography>
          {DISPUTE_REASONS.map((item) => {
            const isSelected = reason === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setReason(isSelected ? null : item.id)}
                activeOpacity={0.7}
                style={{ 
                  backgroundColor: isSelected ? "rgba(245,230,66,0.05)" : CARD_BG,
                  borderColor: isSelected ? LEMON_YELLOW : BORDER_COLOR,
                  borderWidth: 1
                }}
                className="flex-row items-center p-4 rounded-2xl mb-3"
              >
                <item.icon size={20} color={isSelected ? LEMON_YELLOW : "#8B949E"} />
                <Typography 
                  style={{ fontFamily: isSelected ? "Inter-Bold" : "Inter" }}
                  className={`ml-3 text-base ${isSelected ? "text-white" : "text-gray-300"}`}
                >
                  {item.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description Section */}
        <View className="mt-6">
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-gray-500 text-[10px] uppercase tracking-widest mb-3"
          >
            Detailed Description
          </Typography>
          <TextInput
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholder="Provide a clear explanation of the issue. Include dates, specific defects, or missing items..."
            placeholderTextColor="#8B949E"
            value={description}
            onChangeText={setDescription}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ 
              fontFamily: "Inter",
              backgroundColor: INPUT_BG,
              borderColor: isFocused ? LEMON_YELLOW : "transparent",
              borderWidth: 1,
              minHeight: 120,
            }}
            className="rounded-2xl p-4 text-white text-sm"
          />
        </View>

        {/* Upload Section */}
        <View className="mt-8">
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-gray-500 text-[10px] uppercase tracking-widest mb-3"
          >
            Evidence & Uploads
          </Typography>
          <View 
            style={{ backgroundColor: "#161B22", borderStyle: "dashed", borderWidth: 1, borderColor: BORDER_COLOR }}
            className="rounded-2xl p-8 items-center justify-center"
          >
            <CloudUpload size={40} color={LEMON_YELLOW} />
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-white text-base mt-4"
            >
              Upload supporting evidence
            </Typography>
            <Typography 
              style={{ fontFamily: "Inter" }}
              className="text-gray-500 text-xs text-center mt-1"
            >
              Images (JPG, PNG) or Video clips (MP4). Max 50MB.
            </Typography>
            
            <TouchableOpacity
              onPress={handlePickFiles}
              style={{ backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, borderWidth: 1 }}
              className="mt-6 px-6 py-2.5 rounded-full"
            >
              <Typography 
                style={{ fontFamily: "Inter-Bold" }}
                className="text-white text-sm"
              >
                Select Files
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Thumbnails */}
          {attachments.length > 0 && (
            <ScrollView horizontal className="mt-4" showsHorizontalScrollIndicator={false}>
              {attachments.map((asset, index) => (
                <View key={index} className="mr-3 relative">
                  <Image 
                    source={{ uri: asset.uri }} 
                    className="w-[60px] h-[60px] rounded-lg bg-[#21262D]" 
                  />
                  <TouchableOpacity 
                    onPress={() => removeAttachment(index)}
                    className="absolute -top-2 -right-2 bg-black/60 rounded-full p-1"
                  >
                    <X size={12} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          disabled={isSubmitDisabled}
          onPress={handleSubmit}
          className="mt-10"
        >
          <LinearGradient
            colors={isSubmitDisabled ? ["#30363D", "#30363D"] : ["#F5E642", "#D9CC3B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-14 rounded-2xl items-center justify-center"
          >
            <Typography 
              style={{ fontFamily: "Inter-ExtraBold" }}
              className={`${isSubmitDisabled ? "text-gray-500" : "text-black"} text-base uppercase tracking-widest`}
            >
              {createDisputeMutation.isPending ? "Submitting..." : "Submit Dispute"}
            </Typography>
          </LinearGradient>
        </TouchableOpacity>

        {/* Privacy Notice */}
        <View 
          style={{ backgroundColor: INPUT_BG, borderColor: BORDER_COLOR, borderWidth: 1 }}
          className="mt-6 p-4 rounded-2xl flex-row"
        >
          <Info size={20} color={LEMON_YELLOW} className="mt-0.5" />
          <View className="ml-3 flex-1">
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-[#F5E642] text-[10px] uppercase tracking-widest"
            >
              Privacy Notice
            </Typography>
            <Typography 
              style={{ fontFamily: "Inter" }}
              className="text-gray-400 text-xs mt-1 leading-4"
            >
              LymePay will share these details with the counterparty to facilitate a response. Sensitive data should be redacted from evidence where possible.
            </Typography>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
