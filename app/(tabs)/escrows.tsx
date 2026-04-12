import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Search } from "lucide-react-native";
import { EmptyState } from "@/components/ui/EmptyState";

export default function EscrowsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#0D1117]">
      <StatusBar style="light" />
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
        <Text className="text-white font-inter-bold text-3xl">Escrows</Text>
        <View className="w-10 h-10 bg-[#161B22] rounded-full items-center justify-center border border-[#30363D]">
          <Search size={20} color="#8B949E" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-4">
        <EmptyState
          title="No Escrow Contracts"
          description="You haven't created or joined any escrow contracts yet. Start a secure transaction now."
          icon="shopping-bag"
          actionLabel="Create New Escrow"
          onAction={() => {}}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
