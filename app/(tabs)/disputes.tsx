import React from "react";
import { View, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Scale, ChevronRight } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { useDisputes } from "@/lib/hooks/useDisputes";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Dispute } from "@/types/api";

const LEMON_YELLOW = "#F5E642";

export default function DisputesScreen() {
  const router = useRouter();
  const { data: disputes, isLoading, refetch } = useDisputes();

  const renderDisputeItem = ({ item }: { item: Dispute }) => {
    const caseId = `#${item.uuid.substring(0, 8).toUpperCase()}`;
    const stage = item.type === "support" ? null : item.stage;

    // settle = needs the parties, mediation = with LymPay, closed = done
    let statusColor = "#8B949E";
    let label = String(item.status ?? "").replace(/_/g, " ");
    if (item.type === "support") label = `support · ${label}`;
    else if (stage === "settle") {
      statusColor = LEMON_YELLOW;
      label = "settle";
    } else if (stage === "mediation") {
      statusColor = "#3b82f6";
      label = "mediator";
    } else if (stage === "closed" || item.status === "resolved") {
      statusColor = "#00C896";
      label = "settled";
    }

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
                  {item.escrow?.title
                    ? `${item.escrow.title} · ${item.description || ""}`
                    : item.description || "No description provided"}
                </Typography>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <View className="bg-[#21262D] px-2 py-1 rounded-md mr-2">
                <Typography 
                  style={{ fontFamily: "Inter-Bold" }}
                  className="text-[10px] text-gray-300 uppercase"
                >
                  {label}
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
              If something goes wrong with a deal, report it from the escrow screen. It'll show up here.
            </Typography>
          </View>
        }
      />
    </Screen>
  );
}
