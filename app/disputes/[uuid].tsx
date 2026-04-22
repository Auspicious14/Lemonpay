import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  FileText,
  Headset,
  Eye,
  Plus,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { useDisputeDetail, useCreateSupportTicket } from "@/lib/hooks/useDisputes";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToastStore } from "@/store/useToastStore";

const LEMON_YELLOW = "#F5E642";
const DARK_BG = "#161B22";
const CARD_BG = "#161B22";
const BORDER_COLOR = "#30363D";
const TEAL = "#00C896";

export default function DisputeDetailScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const router = useRouter();
  const { show: showToast } = useToastStore();

  const { data: dispute, isLoading } = useDisputeDetail(uuid || "");
  const createSupportTicketMutation = useCreateSupportTicket();

  const handleContactSupport = async () => {
    try {
      await createSupportTicketMutation.mutateAsync({
        subject: `Support for Case #${uuid?.substring(0, 8).toUpperCase()}`,
        description: `I need help with my dispute case ${uuid}`,
      });
      showToast("Support ticket created. We'll get back to you soon.", "success");
    } catch (error) {
      showToast("Failed to contact support", "error");
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

  const caseId = `#${dispute.uuid.substring(0, 8).toUpperCase()}`;
  const formattedDate = new Date(dispute.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const stages = [
    { 
      id: 1, 
      label: "Dispute Raised", 
      subtext: "Case successfully registered in the system.",
      status: "completed" 
    },
    { 
      id: 2, 
      label: "Review Started", 
      subtext: "Assigned to a LymePay specialist.",
      status: ["under_review", "evidence_review", "resolved"].includes(dispute.status) ? "completed" : "pending"
    },
    { 
      id: 3, 
      label: "Evidence Review", 
      subtext: "Currently analyzing documents and chat logs.",
      status: dispute.status === "evidence_review" ? "active" : (dispute.status === "resolved" ? "completed" : "pending")
    },
    { 
      id: 4, 
      label: "Resolution", 
      subtext: "Final decision will be communicated.",
      status: dispute.status === "resolved" ? "completed" : "pending"
    },
  ];

  return (
    <Screen>
      <View className="px-4 py-2">
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
      </View>

      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View className="mt-4 self-start">
          <View 
            style={{ backgroundColor: "#2D3018", borderColor: LEMON_YELLOW, borderWidth: 1 }}
            className="px-3 py-1 rounded-full"
          >
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-[#F5E642] text-[10px] uppercase tracking-wider"
            >
              {dispute.status.replace("_", " ").toUpperCase()}
            </Typography>
          </View>
        </View>

        {/* Case Info */}
        <View className="mt-4">
          <Typography 
            style={{ fontFamily: "Inter-ExtraBold" }}
            className="text-white text-3xl"
          >
            {caseId}
          </Typography>
          <Typography 
            style={{ fontFamily: "Inter" }}
            className="text-gray-500 text-sm mt-1"
          >
            Case opened on {formattedDate}
          </Typography>
        </View>

        {/* Est Resolution Card */}
        <View 
          style={{ backgroundColor: CARD_BG }}
          className="mt-6 p-4 rounded-2xl flex-row items-center border border-[#30363D]"
        >
          <View className="bg-[#21262D] p-3 rounded-xl">
            <Clock size={24} color={LEMON_YELLOW} />
          </View>
          <View className="ml-4">
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-gray-500 text-[10px] uppercase tracking-widest"
            >
              Est. Resolution
            </Typography>
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-white text-xl"
            >
              24-48 hours
            </Typography>
          </View>
        </View>

        {/* Progress Section */}
        <View className="mt-8">
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-gray-500 text-[10px] uppercase tracking-widest mb-6"
          >
            Dispute Progress
          </Typography>

          {stages.map((stage, index) => (
            <View key={stage.id} className="flex-row mb-6 last:mb-0">
              <View className="items-center mr-4">
                <View 
                  className={`w-6 h-6 rounded-full items-center justify-center ${
                    stage.status === "completed" ? "bg-[#00C896]" : 
                    stage.status === "active" ? "border-2 border-[#F5E642]" : 
                    "border-2 border-gray-700"
                  }`}
                >
                  {stage.status === "completed" && <View className="w-2 h-2 bg-white rounded-full" />}
                  {stage.status === "active" && <View className="w-2 h-2 bg-[#F5E642] rounded-full" />}
                </View>
                {index < stages.length - 1 && (
                  <View 
                    style={{ 
                      borderStyle: stage.status === "completed" ? "solid" : "dashed",
                      borderColor: stage.status === "completed" ? TEAL : "#30363D",
                      borderWidth: 1,
                    }}
                    className="w-0.5 flex-1 mt-1"
                  />
                )}
              </View>
              <View className="flex-1 pb-4">
                <Typography 
                  style={{ fontFamily: "Inter-Bold" }}
                  className={`text-base ${
                    stage.status === "completed" ? "text-white" : 
                    stage.status === "active" ? "text-[#F5E642]" : 
                    "text-gray-600"
                  }`}
                >
                  {stage.label}
                </Typography>
                <Typography 
                  style={{ fontFamily: "Inter" }}
                  className={`text-xs mt-1 ${stage.status === "pending" ? "text-gray-700" : "text-gray-500"}`}
                >
                  {stage.subtext}
                </Typography>
              </View>
            </View>
          ))}
        </View>

        {/* Status Update Card */}
        <View 
          style={{ backgroundColor: CARD_BG }}
          className="mt-4 p-4 rounded-2xl border border-[#30363D]"
        >
          <View className="flex-row items-center mb-3">
            <View className="bg-[#21262D] p-2 rounded-lg">
              <MessageSquare size={18} color={LEMON_YELLOW} />
            </View>
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-white text-base ml-3"
            >
              Status Update
            </Typography>
          </View>
          <Typography 
            style={{ fontFamily: "Inter" }}
            className="text-gray-400 text-sm leading-5"
          >
            {dispute.resolution_notes || "Our team of specialists is currently reviewing your case. We are cross-referencing the transaction data with the evidence provided. We will notify you if further information is needed."}
          </Typography>
        </View>

        {/* Quick Actions */}
        <View 
          style={{ backgroundColor: CARD_BG }}
          className="mt-6 p-4 rounded-2xl border border-[#30363D]"
        >
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-white text-base mb-4"
          >
            Quick Actions
          </Typography>

          <TouchableOpacity
            onPress={() => router.push(`/disputes/${uuid}/evidence`)}
          >
            <LinearGradient
              colors={["#F5E642", "#D9CC3B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-12 rounded-xl flex-row items-center justify-center"
            >
              <FileText size={18} color="black" />
              <Typography 
                style={{ fontFamily: "Inter-Bold" }}
                className="text-black ml-2"
              >
                Add More Evidence
              </Typography>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContactSupport}
            disabled={createSupportTicketMutation.isPending}
            style={{ backgroundColor: "transparent", borderColor: BORDER_COLOR, borderWidth: 1 }}
            className="h-12 rounded-xl flex-row items-center justify-center mt-3"
          >
            <Headset size={18} color="white" />
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-white ml-2"
            >
              {createSupportTicketMutation.isPending ? "Creating..." : "Contact Support"}
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Files Attached Section */}
        <View className="mt-8">
          <Typography 
            style={{ fontFamily: "Inter-Bold" }}
            className="text-gray-500 text-[10px] uppercase tracking-widest mb-4"
          >
            Files Attached
          </Typography>

          <View className="flex-row flex-wrap gap-2">
            {dispute.attachments?.map((file: any, index: number) => (
              <View 
                key={index}
                style={{ backgroundColor: CARD_BG, width: "48%" }}
                className="h-[100px] rounded-2xl border border-[#30363D] items-center justify-center overflow-hidden"
              >
                {file.url ? (
                  <Image source={{ uri: file.url }} className="w-full h-full" />
                ) : (
                  <Eye size={24} color="#8B949E" style={{ opacity: 0.5 }} />
                )}
              </View>
            ))}
            
            {(!dispute.attachments || dispute.attachments.length === 0) && (
              <View 
                style={{ backgroundColor: CARD_BG, width: "48%" }}
                className="h-[100px] rounded-2xl border border-[#30363D] items-center justify-center"
              >
                <Eye size={24} color="#8B949E" style={{ opacity: 0.5 }} />
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push(`/disputes/${uuid}/evidence`)}
            className="mt-4 flex-row items-center justify-center"
          >
            <Plus size={16} color="#8B949E" />
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-gray-500 ml-1 text-sm uppercase tracking-widest"
            >
              Add File
            </Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}
