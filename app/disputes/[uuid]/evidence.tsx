import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  MoreVertical,
  AlertCircle,
  CloudUpload,
  CheckCircle2,
  Info,
  Clock,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { useDisputeDetail, useSubmitAdditionalEvidence, useCreateSupportTicket } from "@/lib/hooks/useDisputes";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToastStore } from "@/store/useToastStore";

const LEMON_YELLOW = "#F5E642";
const DARK_BG = "#161B22";
const CARD_BG = "#161B22";
const BORDER_COLOR = "#30363D";
const INPUT_BG = "#21262D";

export default function AdditionalEvidenceScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const router = useRouter();
  const { show: showToast } = useToastStore();

  const { data: dispute, isLoading } = useDisputeDetail(uuid || "");
  const submitEvidenceMutation = useSubmitAdditionalEvidence(uuid || "");
  const createSupportTicketMutation = useCreateSupportTicket();
  const [attachment, setAttachment] = useState<any | null>(null);

  const handleContactSupport = async () => {
    try {
      await createSupportTicketMutation.mutateAsync({
        subject: `Evidence Inquiry for Case #${uuid?.substring(0, 8).toUpperCase()}`,
        description: `I have a question about submitting evidence for case ${uuid}`,
      });
      showToast("Support ticket created.", "success");
    } catch (error) {
      showToast("Failed to contact support", "error");
    }
  };

  const handlePickFiles = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your gallery to upload evidence.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAttachment(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!attachment) return;

    try {
      await submitEvidenceMutation.mutateAsync({
        uri: attachment.uri,
        mimeType: attachment.mimeType,
        fileName: attachment.fileName || "evidence.jpg",
      });
      showToast("Evidence submitted successfully", "success");
      router.back();
    } catch (error) {
      console.error("Failed to submit evidence", error);
      showToast("Failed to submit evidence", "error");
    }
  };

  if (isLoading || !dispute) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  const isMediatorRequested = dispute.status === "evidence_review";
  const caseIdShort = `#${dispute.uuid.substring(0, 8).toUpperCase()}`;

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
        <TouchableOpacity>
          <MoreVertical size={20} color="#8B949E" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Action Required Banner */}
        {isMediatorRequested ? (
          <View 
            style={{ backgroundColor: "#2D3018", borderLeftWidth: 3, borderLeftColor: LEMON_YELLOW }}
            className="mt-4 p-4 rounded-xl"
          >
            <View className="flex-row items-center">
              <View className="bg-[#F5E642] p-1 rounded-md mr-3">
                <AlertCircle size={16} color="black" />
              </View>
              <View>
                <Typography 
                  style={{ fontFamily: "Inter-Bold" }}
                  className="text-[#F5E642] text-xs uppercase"
                >
                  Action Required:
                </Typography>
                <Typography 
                  style={{ fontFamily: "Inter-Bold" }}
                  className="text-[#F5E642] text-xs uppercase"
                >
                  Additional Evidence Needed
                </Typography>
              </View>
            </View>
            <Typography 
              style={{ fontFamily: "Inter" }}
              className="text-gray-400 text-xs mt-3 leading-4"
            >
              The mediator has requested further documentation to verify your claim. Please provide the requested files below.
            </Typography>
          </View>
        ) : (
          <View className="mt-6">
            <Typography 
              style={{ fontFamily: "Inter-ExtraBold" }}
              className="text-white text-2xl"
            >
              Add Supporting Evidence
            </Typography>
            <Typography 
              style={{ fontFamily: "Inter" }}
              className="text-gray-500 mt-2"
            >
              Upload additional files to strengthen your case.
            </Typography>
          </View>
        )}

        {/* Case Meta Row */}
        <View className="flex-row items-center justify-between mt-6">
          <View className="flex-row items-center">
            <Typography style={{ fontFamily: "Inter" }} className="text-gray-500 text-xs uppercase">Case ID:</Typography>
            <Typography style={{ fontFamily: "Inter-Bold" }} className="text-[#F5E642] text-xs ml-1">{caseIdShort}</Typography>
          </View>
          {isMediatorRequested && (
            <View className="flex-row items-center">
              <Clock size={12} color={LEMON_YELLOW} />
              <Typography style={{ fontFamily: "Inter-Bold" }} className="text-[#F5E642] text-xs ml-1 uppercase">Due in 12h 44m</Typography>
            </View>
          )}
        </View>

        {/* Required Documentation */}
        <View className="mt-8">
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-gray-500 text-[10px] uppercase tracking-widest mb-4"
          >
            Required Documentation
          </Typography>

          <View style={{ backgroundColor: CARD_BG }} className="p-4 rounded-2xl border border-[#30363D]">
            <View className="flex-row items-center">
              <View className="bg-[#21262D] w-8 h-8 rounded-full items-center justify-center mr-3">
                <Typography style={{ fontFamily: "Inter-Bold" }} className="text-white text-xs">01</Typography>
              </View>
              <Typography style={{ fontFamily: "Inter-Bold" }} className="text-white text-base">
                {isMediatorRequested ? "Clear photo of the defect" : "Supporting Documents"}
              </Typography>
            </View>
            <Typography style={{ fontFamily: "Inter" }} className="text-gray-500 text-xs mt-2 ml-11">
              {isMediatorRequested 
                ? "Please provide a high-resolution image showing the specific damage mentioned in your description." 
                : "Add any additional files that support your claim."}
            </Typography>
          </View>
        </View>

        {/* Upload Evidence Section */}
        <View className="mt-8">
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-gray-500 text-[10px] uppercase tracking-widest mb-4"
          >
            Upload Evidence
          </Typography>

          <TouchableOpacity
            onPress={handlePickFiles}
            activeOpacity={0.7}
            style={{ backgroundColor: CARD_BG, borderStyle: "dashed", borderWidth: 1, borderColor: BORDER_COLOR }}
            className="rounded-2xl p-10 items-center justify-center"
          >
            <View className="bg-[#21262D] p-4 rounded-full mb-4">
              <CloudUpload size={32} color={LEMON_YELLOW} />
            </View>
            <Typography style={{ fontFamily: "Inter-Bold" }} className="text-white text-lg">
              {attachment ? "File Selected" : "Drop your files here"}
            </Typography>
            <Typography style={{ fontFamily: "Inter" }} className="text-gray-500 text-sm mt-1">
              {attachment ? attachment.fileName || "evidence.jpg" : "or click to browse from device"}
            </Typography>

            <View className="flex-row mt-6 gap-2">
              {["JPG", "PNG", "PDF"].map((ext) => (
                <View key={ext} className="bg-[#21262D] px-3 py-1 rounded-full border border-[#30363D]">
                  <Typography style={{ fontFamily: "Inter-Bold" }} className="text-gray-400 text-[10px]">{ext}</Typography>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </View>

        {/* Warning Card */}
        {isMediatorRequested && (
          <View style={{ backgroundColor: CARD_BG, borderColor: "rgba(255,68,68,0.3)", borderWidth: 1 }} className="mt-6 p-4 rounded-2xl flex-row items-center">
            <Info size={20} color="#FF4444" />
            <Typography style={{ fontFamily: "Inter" }} className="text-gray-400 text-xs ml-3 flex-1 leading-4">
              Failure to provide the requested evidence before the 12h deadline may result in the dispute being resolved in favor of the counterparty.
            </Typography>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          disabled={!attachment || submitEvidenceMutation.isPending}
          onPress={handleSubmit}
          className="mt-10"
        >
          <LinearGradient
            colors={!attachment ? ["#30363D", "#30363D"] : ["#F5E642", "#D9CC3B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-14 rounded-2xl flex-row items-center justify-center"
          >
            <CheckCircle2 size={20} color={!attachment ? "#8B949E" : "black"} />
            <Typography 
              style={{ fontFamily: "Inter-ExtraBold" }}
              className={`${!attachment ? "text-gray-500" : "text-black"} text-base uppercase tracking-widest ml-2`}
            >
              {submitEvidenceMutation.isPending ? "Submitting..." : "Submit Evidence"}
            </Typography>
          </LinearGradient>
        </TouchableOpacity>

        {/* Contact Support Link */}
        <TouchableOpacity 
          onPress={handleContactSupport}
          disabled={createSupportTicketMutation.isPending}
          className="mt-6 self-center"
        >
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-gray-600 text-[10px] uppercase tracking-widest"
          >
            {createSupportTicketMutation.isPending ? "Connecting..." : "Contact Support"}
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}
