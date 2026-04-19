import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ChevronRight,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useEscrowDetail } from "@/lib/hooks/useEscrow";
import { useDisputes, useCreateDispute, useDisputeDetail } from "@/lib/hooks/useDisputes";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToastStore } from "@/store/useToastStore";

const DISPUTE_REASONS = [
  { id: "not_received", label: "Item not received", description: "The seller hasn't delivered the item or service." },
  { id: "not_as_described", label: "Not as described", description: "The item received is different from what was agreed." },
  { id: "damaged", label: "Item damaged", description: "The item arrived in a damaged or unusable state." },
  { id: "other", label: "Other", description: "Any other reason for raising a dispute." },
] as const;

export default function DisputeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { show: showToast } = useToastStore();

  const { data: escrow, isLoading: isEscrowLoading } = useEscrowDetail(id || "");
  const { data: disputes } = useDisputes();
  
  // Find if there's an existing dispute for this escrow
  const existingDispute = useMemo(() => {
    return disputes?.find(d => d.escrow_uuid === escrow?.uuid);
  }, [disputes, escrow]);

  const [reason, setReason] = useState<typeof DISPUTE_REASONS[number]["id"] | null>(null);
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<{ uri: string; mimeType?: string; fileName?: string } | null>(null);

  const createDisputeMutation = useCreateDispute();

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your gallery to upload evidence.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setAttachment({
        uri: asset.uri,
        mimeType: asset.mimeType,
        fileName: asset.fileName || "evidence.jpg",
      });
    }
  };

  const handleSubmit = async () => {
    if (!reason || !description || description.length < 50) {
      showToast("Please provide a reason and at least 50 characters of description", "error");
      return;
    }

    try {
      await createDisputeMutation.mutateAsync({
        escrow_uuid: escrow!.uuid,
        reason,
        description,
        attachment: attachment || undefined,
      });
      showToast("Dispute submitted successfully", "success");
      router.back();
    } catch (error) {
      console.error("Failed to submit dispute", error);
    }
  };

  if (isEscrowLoading || !escrow) {
    return (
      <Screen showBackButton title="Dispute">
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  if (existingDispute) {
    const reasonLabel = DISPUTE_REASONS.find(r => r.id === existingDispute.reason)?.label || existingDispute.reason;
    
    return (
      <Screen showBackButton title="Dispute Details">
        <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
          <Card variant="high" className="p-6 space-y-6">
            <View className="flex-row items-center justify-between">
              <View className="bg-accent-danger/10 px-3 py-1 rounded-full">
                <Typography className="text-accent-danger font-inter-bold text-[10px] tracking-widest uppercase">
                  {existingDispute.status.toUpperCase()}
                </Typography>
              </View>
              <Typography variant="caption" className="text-outline">
                Opened {new Date(existingDispute.created_at).toLocaleDateString()}
              </Typography>
            </View>

            <View className="space-y-2">
              <Typography variant="label-sm" className="text-outline uppercase">REASON</Typography>
              <Typography className="text-white font-inter-bold text-lg">{reasonLabel}</Typography>
            </View>

            <View className="space-y-2">
              <Typography variant="label-sm" className="text-outline uppercase">DESCRIPTION</Typography>
              <Typography className="text-[#8B949E] leading-relaxed">
                {existingDispute.description}
              </Typography>
            </View>

            {existingDispute.attachment && (
              <View className="space-y-2">
                <Typography variant="label-sm" className="text-outline uppercase">EVIDENCE</Typography>
                <Image 
                  source={{ uri: existingDispute.attachment }} 
                  className="w-full h-48 rounded-xl bg-surface-container-high"
                  resizeMode="cover"
                />
              </View>
            )}

            <View className="bg-surface-container-high/50 p-4 rounded-xl flex-row items-start">
              <Info size={16} color="#8B949E" />
              <Typography variant="caption" className="text-outline ml-3 leading-relaxed">
                Our resolution team is reviewing your dispute. You'll receive a notification once a decision is made.
              </Typography>
            </View>
          </Card>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen showBackButton title="Open Dispute">
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <View className="space-y-8">
          <View className="space-y-2">
            <Typography variant="label" className="text-white font-inter-bold">Why are you disputing?</Typography>
            <Typography className="text-outline">Select the primary reason for this dispute.</Typography>
          </View>

          {/* Reason Selector */}
          <View className="space-y-3">
            {DISPUTE_REASONS.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => setReason(r.id)}
                className={`bg-[#161B22] p-5 rounded-2xl border ${
                  reason === r.id ? "border-accent-danger" : "border-outline/10"
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Typography className="text-white font-inter-bold">{r.label}</Typography>
                    <Typography variant="caption" className="text-outline mt-1">{r.description}</Typography>
                  </View>
                  <View className={`w-6 h-6 rounded-full border-2 ${
                    reason === r.id ? "border-accent-danger" : "border-outline/30"
                  } items-center justify-center`}>
                    {reason === r.id && <View className="w-3 h-3 bg-accent-danger rounded-full" />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <View className="space-y-3">
            <View className="flex-row justify-between px-1">
              <Typography variant="label-sm" className="text-outline">Describe the issue</Typography>
              <Typography variant="caption" className={`${description.length < 50 ? "text-accent-danger" : "text-secondary"}`}>
                {description.length}/50 min
              </Typography>
            </View>
            <TextInput
              multiline
              numberOfLines={6}
              placeholder="Provide as much detail as possible to help our team resolve this quickly..."
              placeholderTextColor="#4a4734"
              className="bg-[#161B22] text-white p-5 rounded-2xl font-inter text-sm h-40"
              style={{ textAlignVertical: "top" }}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Attachment */}
          <View className="space-y-3">
            <Typography variant="label-sm" className="text-outline">Evidence (Optional)</Typography>
            {attachment ? (
              <View className="relative">
                <Image source={{ uri: attachment.uri }} className="w-full h-48 rounded-2xl" />
                <TouchableOpacity 
                  onPress={() => setAttachment(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
                >
                  <X size={18} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={handlePickImage}
                className="bg-surface-container-high/30 border border-dashed border-outline/30 rounded-2xl p-10 items-center justify-center"
              >
                <Camera size={32} color="#8B949E" />
                <Typography className="text-outline mt-2 font-inter-medium">Upload photo evidence</Typography>
              </TouchableOpacity>
            )}
          </View>

          <View className="pt-4 pb-12">
            <Button
              label="Submit Dispute"
              onPress={handleSubmit}
              disabled={!reason || description.length < 50 || createDisputeMutation.isPending}
              loading={createDisputeMutation.isPending}
              className="bg-accent-danger"
            />
            <Typography variant="caption" className="text-outline text-center mt-4 px-6">
              Our team will review your claim and the agreement terms. Both parties will be contacted.
            </Typography>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
