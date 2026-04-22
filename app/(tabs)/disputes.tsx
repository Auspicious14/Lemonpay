import React from "react";
import { View, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Scale, ChevronRight } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { useDisputes } from "@/lib/hooks/useDisputes";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const LEMON_YELLOW = "#F5E642";

export default function DisputesScreen() {
  const router = useRouter();
  const { data: disputes, isLoading, refetch } = useDisputes();

  const renderDisputeItem = ({ item }: { item: any }) => {
    const caseId = `#${item.uuid.substring(0, 8).toUpperCase()}`;
    
    let statusColor = "#8B949E"; // Default gray
    if (item.status === "resolved") statusColor = "#00C896"; // Teal
    if (["open", "under_review", "evidence_review"].includes(item.status)) statusColor = LEMON_YELLOW;
    if (item.status === "disputed") statusColor = "#FF4444"; // Red

    return (
      <TouchableOpacity
        onPress={() => router.push(`/disputes/${item.uuid}`)}
        activeOpacity={0.7}
      >
        <Card className="mb-3 border-[#30363D] bg-[#161B22] p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View 
                style={{ backgroundColor: statusColor }}
                className="w-2 h-2 rounded-full mr-3" 
              />
              <View className="flex-1">
                <Typography 
                  style={{ fontFamily: "Inter-Bold" }}
                  className="text-white text-base"
                >
                  {caseId}
                </Typography>
                <Typography 
                  numberOfLines={1}
                  style={{ fontFamily: "Inter" }}
                  className="text-gray-400 text-xs mt-0.5"
                >
                  {item.description || "No description provided"}
                </Typography>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <View className="bg-[#21262D] px-2 py-1 rounded-md mr-2">
                <Typography 
                  style={{ fontFamily: "Inter-Bold" }}
                  className="text-[10px] text-gray-300 uppercase"
                >
                  {item.status.replace("_", " ")}
                </Typography>
              </View>
              <ChevronRight size={16} color="#8B949E" />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="px-4 pt-4 pb-2">
        <Typography 
          style={{ fontFamily: "Inter-ExtraBold" }}
          className="text-white text-2xl"
        >
          Dispute Center
        </Typography>
      </View>

      <FlatList
        data={disputes}
        keyExtractor={(item) => item.uuid}
        renderItem={renderDisputeItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={refetch} 
            tintColor={LEMON_YELLOW} 
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-20">
            <View className="bg-[#161B22] p-6 rounded-full mb-4">
              <Scale size={48} color={LEMON_YELLOW} />
            </View>
            <Typography 
              style={{ fontFamily: "Inter-Bold" }}
              className="text-white text-lg"
            >
              No disputes
            </Typography>
            <Typography 
              style={{ fontFamily: "Inter" }}
              className="text-gray-400 text-center mt-2"
            >
              All your transactions are safe. Any disputes you raise will appear here.
            </Typography>
          </View>
        }
      />
    </Screen>
  );
}
