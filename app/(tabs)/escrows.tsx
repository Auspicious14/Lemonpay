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
import { LinearGradient } from "expo-linear-gradient";
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
        <Text 
          style={{ fontFamily: 'Inter-Bold' }}
          className="text-white text-3xl"
        >
          My Escrows
        </Text>
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
                style={{ fontFamily: 'Inter-Bold' }}
                className={`text-[10px] tracking-widest ${
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
        renderItem={({ item }) => {
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
                  <Text 
                    style={{ fontFamily: 'Inter-Bold' }}
                    className={`${colorClass} text-[8px] tracking-widest uppercase`}
                  >
                    {badgeInfo.label}
                  </Text>
                </View>
                <View className="bg-[#0D1117] px-2 py-1 rounded-full border border-[#30363D]">
                  <Text 
                    style={{ fontFamily: 'Inter-Bold' }}
                    className="text-[#8B949E] text-[8px] tracking-widest uppercase"
                  >
                    {isBuyer ? "BUYER" : "SELLER"}
                  </Text>
                </View>
              </View>

              <Text 
                style={{ fontFamily: 'Inter-Bold' }}
                className="text-white text-lg mb-1" 
                numberOfLines={1}
              >
                {item.title}
              </Text>
              
              <Text 
                style={{ fontFamily: 'Inter' }}
                className="text-[#8B949E] text-sm mb-4"
              >
                With {isBuyer 
                  ? (item.seller?.first_name ? `${item.seller.first_name} ${item.seller.last_name}` : item.seller_identifier)
                  : `${item.buyer.first_name} ${item.buyer.last_name}`}
              </Text>

              <EscrowProgressBar status={item.status} />

              <View className="flex-row justify-between items-center mt-6">
                <Text 
                  style={{ fontFamily: 'Inter-Bold' }}
                  className="text-white text-xl"
                >
                  {formatCurrency(item.amount)}
                </Text>
                <Text 
                  style={{ fontFamily: 'Inter' }}
                  className="text-[#8B949E] text-xs"
                >
                  {formatDate(item.created_at)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
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
            <View style={{ paddingVertical: 80, alignItems: 'center' }}>
              <LoadingSpinner />
            </View>
          ) : (
            <View style={{ 
              paddingVertical: 80, 
              alignItems: 'center', 
              paddingHorizontal: 24, 
            }}> 
              <View style={{ 
                width: 80, height: 80, borderRadius: 40, 
                backgroundColor: '#161B22', 
                alignItems: 'center', justifyContent: 'center', 
                marginBottom: 20, 
              }}> 
                <ShoppingBag size={40} color="#8B949E" /> 
              </View> 
              <Text style={{ 
                fontFamily: 'Inter-Bold', color: 'white', 
                fontSize: 20, marginBottom: 8, textAlign: 'center' 
              }}> 
                {activeFilter === 'ALL' ? 'No escrows yet' 
                 : activeFilter === 'ACTIVE' ? 'No active escrows' 
                 : activeFilter === 'COMPLETED' ? 'No completed escrows' 
                 : 'No disputes'} 
              </Text> 
              <Text style={{ 
                fontFamily: 'Inter', color: '#8B949E', 
                fontSize: 14, textAlign: 'center', lineHeight: 20, 
                marginBottom: 32, 
              }}> 
                {activeFilter === 'ALL' 
                  ? 'Create your first escrow to start a secure transaction.' 
                  : 'Try changing your filter to see other escrows.'} 
              </Text> 
              {activeFilter === 'ALL' && ( 
                <TouchableOpacity 
                  onPress={() => router.push('/escrow/create')} 
                  style={{ overflow: 'hidden', borderRadius: 12 }} 
                > 
                  <LinearGradient 
                    colors={['#F5E642', '#D4C200']} 
                    style={{ 
                      paddingHorizontal: 24, paddingVertical: 14, 
                      borderRadius: 12, 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: 8, 
                    }} 
                  > 
                    <Plus size={18} color="#0D1117" /> 
                    <Text style={{ 
                      fontFamily: 'Inter-Bold', color: '#0D1117', 
                      fontSize: 15 
                    }}> 
                      Create Escrow 
                    </Text> 
                  </LinearGradient> 
                </TouchableOpacity> 
              )} 
            </View>
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
