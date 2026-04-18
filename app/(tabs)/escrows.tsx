import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Plus, ShoppingBag } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useMyEscrows } from "@/lib/hooks/useEscrow";
import { useRefreshOnFocus } from "@/lib/hooks/useRefreshOnFocus";
import { EscrowStatus, Escrow } from "@/types/api";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getStatusBadgeInfo } from "@/lib/utils/escrow";
import { EscrowProgressBar } from "@/components/ui/EscrowProgressBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

type FilterType = "ALL" | "ACTIVE" | "COMPLETED" | "DISPUTED";

const FILTER_TABS: FilterType[] = ["ALL", "ACTIVE", "COMPLETED", "DISPUTED"];

export default function EscrowsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");

  const getStatusParam = (): EscrowStatus | undefined => {
    switch (activeFilter) {
      case "COMPLETED":
        return "released";
      case "DISPUTED":
        return "disputed";
      default:
        return undefined;
    }
  };

  const {
    data: escrowsData,
    isLoading,
    refetch,
    isRefetching,
  } = useMyEscrows(getStatusParam());

  useRefreshOnFocus(refetch);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const filteredEscrows = (escrowsData?.data || []).filter((escrow) => {
    if (activeFilter === "ACTIVE") {
      return [
        "locked",
        "funded",
        "awaiting_buyer_release",
        "pending_seller_agreement",
        "pending_buyer_confirmation",
      ].includes(escrow.status);
    }
    return true;
  });

  const renderEscrowItem = ({ item }: { item: Escrow }) => {
    const badgeInfo = getStatusBadgeInfo(item.status);
    const isBuyer = user?.id === item.buyer_id;
    
    let colorClass = "text-gray-400";
    let bgClass = "bg-[#30363D]";
    
    switch (badgeInfo.color) {
      case "amber": colorClass = "text-amber-500"; bgClass = "bg-amber-500/10"; break;
      case "blue": colorClass = "text-blue-500"; bgClass = "bg-blue-500/10"; break;
      case "purple": colorClass = "text-purple-500"; bgClass = "bg-purple-500/10"; break;
      case "yellow": colorClass = "text-yellow-500"; bgClass = "bg-yellow-500/10"; break;
      case "teal": colorClass = "text-[#00C896]"; bgClass = "bg-[#00C896]/10"; break;
      case "red": colorClass = "text-red-500"; bgClass = "bg-red-500/10"; break;
    }

    return (
      <TouchableOpacity
        onPress={() => router.push(`/escrow/${item.id}`)}
        className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 mb-4"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className={`${bgClass} px-2 py-1 rounded`}>
            <Text className={`${colorClass} font-inter-bold text-[8px] tracking-widest uppercase`}>
              {badgeInfo.label}
            </Text>
          </View>
          <View className="bg-[#0D1117] px-2 py-1 rounded-full border border-[#30363D]">
            <Text className="text-[#8B949E] font-inter-bold text-[8px] tracking-widest uppercase">
              {isBuyer ? "BUYER" : "SELLER"}
            </Text>
          </View>
        </View>

        <Text className="text-white font-inter-bold text-lg mb-1" numberOfLines={1}>
          {item.title}
        </Text>
        
        <Text className="text-[#8B949E] font-inter text-sm mb-4">
          With {isBuyer 
            ? (item.seller?.first_name ? `${item.seller.first_name} ${item.seller.last_name}` : item.seller_identifier)
            : `${item.buyer.first_name} ${item.buyer.last_name}`}
        </Text>

        <EscrowProgressBar status={item.status} />

        <View className="flex-row justify-between items-center mt-6">
          <Text className="text-white font-inter-bold text-xl">
            {formatCurrency(item.amount)}
          </Text>
          <Text className="text-[#8B949E] font-inter text-xs">
            {formatDate(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0D1117]">
      <StatusBar style="light" />
      
      {/* HEADER */}
      <View className="px-6 pt-4 pb-4">
        <Text className="text-white font-inter-bold text-3xl">My Escrows</Text>
      </View>

      {/* FILTER TABS */}
      <View className="px-6 mb-6">
        <View className="flex-row bg-[#161B22] p-1 rounded-xl">
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveFilter(tab)}
              className={`flex-1 py-2 rounded-lg items-center ${
                activeFilter === tab ? "bg-accent-primary" : ""
              }`}
            >
              <Text
                className={`font-inter-bold text-[10px] tracking-widest ${
                  activeFilter === tab ? "text-[#0D1117]" : "text-[#8B949E]"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredEscrows}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEscrowItem}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor="#F5E642"
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="py-20 items-center">
              <LoadingSpinner />
            </View>
          ) : (
            <EmptyState
              title={
                activeFilter === "ALL"
                  ? "No escrows yet"
                  : activeFilter === "ACTIVE"
                  ? "No active escrows"
                  : activeFilter === "COMPLETED"
                  ? "No completed escrows"
                  : "No disputes"
              }
              subtitle={
                activeFilter === "ALL"
                  ? "Create your first escrow to start a secure transaction."
                  : "Try changing your filter to see other escrows."
              }
              icon={<ShoppingBag size={48} color="#8B949E" />}
              ctaLabel={activeFilter === "ALL" ? "Create Escrow" : undefined}
              onCtaPress={() => router.push("/escrow/create")}
            />
          )
        }
      />

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-accent-primary items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
        onPress={() => router.push("/escrow/create")}
      >
        <Plus size={32} color="#0D1117" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
