import React from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { TransactionRow, TransactionType } from "@/components/ui/TransactionRow";
import { formatRelativeTime, formatDate } from "@/lib/utils/format";

export default function TransactionsScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useTransactions();

  const transactions = data?.data || [];

  return (
    <Screen showBackButton title="Transactions">
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isCredit = item.type === "credit";
          
          let type: TransactionType = "funded";
          if (item.description.includes("Escrow released")) type = "released";
          if (item.description.includes("Withdrawal")) type = "disputed";
          if (item.description.includes("Wallet fund")) type = "funded";

          return (
            <View className="bg-[#161B22] rounded-lg p-4 mb-2">
              <TransactionRow
                type={type}
                title={item.description}
                subtitle={`${item.reference.substring(0, 8)} • ${formatDate(item.created_at)}`}
                amount={parseFloat(item.amount)}
                isCredit={isCredit}
                status={item.status.toUpperCase()}
                statusColor={
                  item.status === "completed" ? "success" : 
                  item.status === "pending" ? "pending" : "danger"
                }
              />
            </View>
          );
        }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#F5E642"
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ paddingVertical: 80, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#F5E642" />
            </View>
          ) : (
            <View style={{ paddingVertical: 80, alignItems: "center" }}>
              <Text style={{ fontFamily: "Inter-Bold", color: "white", fontSize: 18, marginBottom: 8 }}>
                No transactions yet
              </Text>
              <Text style={{ fontFamily: "Inter", color: "#8B949E", fontSize: 14, textAlign: "center" }}>
                Your financial activity will appear here.
              </Text>
            </View>
          )
        }
      />
    </Screen>
  );
}
