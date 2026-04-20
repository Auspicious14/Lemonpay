import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  ShoppingBag,
  Landmark,
  TriangleAlert,
  Wallet,
  CreditCard,
  ChartBar,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils/format";
import { Transaction } from "@/types/api";

const { width } = Dimensions.get("window");

type FilterTab = "All" | "Escrow" | "Withdrawals" | "Funding";

export default function TransactionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [activeRange, setActiveRange] = useState<"Month" | "Custom">("Month");
  
  const { data: transactionsData, isLoading, refetch, isRefetching } = useTransactions();
  const transactions = transactionsData?.data || [];

  const filteredTransactions = useMemo(() => {
    switch (activeTab) {
      case "Escrow":
        return transactions.filter(tx => tx.description?.toLowerCase().includes('escrow'));
      case "Withdrawals":
        return transactions.filter(tx => tx.type === 'debit' && !!tx.paystack_transfer_code);
      case "Funding":
        return transactions.filter(tx => tx.type === 'credit');
      default:
        return transactions;
    }
  }, [transactions, activeTab]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      const date = new Date(tx.created_at);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const key = isToday
        ? 'TODAY'
        : date.toLocaleDateString('en-NG', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).toUpperCase();
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);

  const getTxTitle = (tx: Transaction): string => {
    const desc = tx.description || '';
    if (desc.toLowerCase().includes('escrow')) return 'Escrow Funded';
    if (desc.toLowerCase().includes('wallet')) return 'Wallet Funded';
    if (desc.toLowerCase().includes('withdrawal')) return 'Withdrawal';
    return desc || 'Transaction';
  };

  const getTxCategory = (tx: Transaction): string => {
    if (tx.description?.toLowerCase().includes('escrow')) return 'Escrow';
    if (tx.description?.toLowerCase().includes('wallet')) return 'Wallet';
    if (tx.paystack_transfer_code) return 'Payout';
    return 'Wallet';
  };

  const getIcon = (tx: Transaction) => {
    const desc = tx.description?.toLowerCase() || '';
    if (tx.status === 'failed') return <CreditCard size={20} color="#8B949E" />;
    if (desc.includes('disputed')) return <TriangleAlert size={20} color="#F5E642" />;
    if (desc.includes('escrow')) return <ShoppingBag size={20} color="#F5E642" />;
    if (desc.includes('wallet')) return <Landmark size={20} color="#00C896" />;
    if (desc.includes('withdrawal') || tx.paystack_transfer_code) return <Wallet size={20} color="#8B949E" />;
    return <CreditCard size={20} color="#8B949E" />;
  };

  const getIconBg = (tx: Transaction) => {
    const desc = tx.description?.toLowerCase() || '';
    if (tx.status === 'failed') return '#21262D';
    if (desc.includes('disputed')) return 'rgba(245,230,66,0.15)';
    if (desc.includes('escrow')) return 'rgba(245,230,66,0.15)';
    if (desc.includes('wallet')) return 'rgba(0,200,150,0.15)';
    if (desc.includes('withdrawal') || tx.paystack_transfer_code) return '#21262D';
    return '#21262D';
  };

  const getAmountStyles = (tx: Transaction) => {
    if (tx.status === 'failed') return { color: '#FF4D4F', prefix: '' };
    if (tx.status === 'pending') return { color: '#8B949E', prefix: '' };
    if (tx.status === 'completed') {
      if (tx.type === 'credit') return { color: '#00C896', prefix: '+' };
      return { color: 'white', prefix: '-' };
    }
    return { color: 'white', prefix: '' };
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(0,200,150,0.15)', text: '#00C896', label: 'SUCCESS' };
      case 'failed':
        return { bg: 'rgba(255,77,79,0.15)', text: '#FF4D4F', label: 'FAILED' };
      case 'pending':
        return { bg: '#21262D', text: '#8B949E', label: 'PENDING' };
      default:
        return { bg: 'rgba(245,166,0,0.15)', text: '#F5A600', label: status.toUpperCase() };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#F5E642" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>

      {/* FILTER TABS */}
      <View style={styles.tabsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {["All", "Escrow", "Withdrawals", "Funding"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as FilterTab)}
              style={[
                styles.tabPill,
                activeTab === tab ? styles.activeTabPill : styles.inactiveTabPill
              ]}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab ? styles.activeTabText : styles.inactiveTabText
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* DATE RANGE SELECTOR */}
      <View style={styles.rangeWrapper}>
        <View style={styles.rangeCard}>
          <TouchableOpacity 
            onPress={() => setActiveRange("Month")}
            style={[styles.rangeOption, activeRange === "Month" && styles.activeRangeOption]}
          >
            <Text style={[styles.rangeText, activeRange === "Month" && styles.activeRangeText]}>
              This Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveRange("Custom")}
            style={[styles.rangeOption, activeRange === "Custom" && styles.activeRangeOption]}
          >
            <Text style={[styles.rangeText, activeRange === "Custom" && styles.activeRangeText]}>
              Custom Range
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.listWrapper}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F5E642" />
        }
      >
        {isLoading ? (
          <Text style={styles.emptyText}>Loading transactions...</Text>
        ) : filteredTransactions.length > 0 ? (
          <>
            {Object.keys(groupedTransactions).map((date) => (
              <View key={date}>
                <Text style={styles.groupHeader}>{date}</Text>
                {groupedTransactions[date].map((tx) => {
                  const amtStyle = getAmountStyles(tx);
                  const statusStyle = getStatusStyles(tx.status);
                  const time = new Date(tx.created_at).toLocaleTimeString('en-NG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });

                  return (
                    <TouchableOpacity 
                      key={tx.id} 
                      style={styles.txCard}
                      onPress={() => router.push(`/wallet/transaction/${tx.id}`)}
                    >
                      <View style={[styles.iconSquare, { backgroundColor: getIconBg(tx) }]}>
                        {getIcon(tx)}
                      </View>
                      
                      <View style={styles.txMiddle}>
                        <Text style={styles.txTitle} numberOfLines={1} ellipsizeMode="tail">
                          {getTxTitle(tx)}
                        </Text>
                        <View style={styles.statusRow}>
                          <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusLabel, { color: statusStyle.text }]}>
                              {statusStyle.label}
                            </Text>
                          </View>
                          <Text style={styles.txMutedText}>
                            {time} • {getTxCategory(tx)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.txRight}>
                        <Text style={[styles.txAmount, { color: amtStyle.color }]}>
                          {amtStyle.prefix}{formatCurrency(parseFloat(tx.amount))}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* SPENDING INSIGHT CARD */}
            <View style={styles.insightCard}>
              <View style={styles.insightContent}>
                <View style={styles.insightLeft}>
                  <Text style={styles.insightLabel}>SPENDING INSIGHT</Text>
                  <Text style={styles.insightText}>
                    You saved ₦12,400 in escrow fees this month.
                  </Text>
                  <TouchableOpacity>
                    <Text style={styles.insightLink}>VIEW DETAILED REPORT →</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.insightIconContainer}>
                  <ChartBar size={48} color="#30363D" />
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 20,
    color: "white",
  },
  tabsWrapper: {
    marginTop: 8,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  activeTabPill: {
    backgroundColor: "#F5E642",
  },
  inactiveTabPill: {
    backgroundColor: "#21262D",
  },
  tabText: {
    fontFamily: "Inter-Bold",
    fontSize: 13,
  },
  activeTabText: {
    color: "#0D1117",
  },
  inactiveTabText: {
    color: "white",
  },
  rangeWrapper: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  rangeCard: {
    backgroundColor: "#161B22",
    borderRadius: 12,
    flexDirection: "row",
    padding: 4,
    borderWidth: 1,
    borderColor: "#30363D",
  },
  rangeOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeRangeOption: {
    backgroundColor: "#21262D",
  },
  rangeText: {
    fontFamily: "Inter",
    fontSize: 13,
    color: "#8B949E",
  },
  activeRangeText: {
    fontFamily: "Inter-Bold",
    color: "white",
  },
  listWrapper: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  groupHeader: {
    fontFamily: "Inter-Bold",
    fontSize: 10,
    color: "#8B949E",
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 12,
  },
  txCard: {
    backgroundColor: "#161B22",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#30363D",
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txMiddle: {
    flex: 1,
  },
  txTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 14,
    color: "white",
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontFamily: "Inter-Bold",
    fontSize: 8,
    letterSpacing: 0.5,
  },
  txMutedText: {
    fontFamily: "Inter",
    fontSize: 11,
    color: "#8B949E",
  },
  txRight: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontFamily: "Inter-Bold",
    fontSize: 15,
  },
  insightCard: {
    backgroundColor: "#161B22",
    borderRadius: 16,
    marginTop: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#30363D",
    overflow: "hidden",
  },
  insightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  insightLeft: {
    flex: 1,
    zIndex: 1,
  },
  insightLabel: {
    fontFamily: "Inter-Bold",
    fontSize: 10,
    color: "#F5E642",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  insightText: {
    fontFamily: "Inter-ExtraBold",
    fontSize: 24,
    color: "white",
    lineHeight: 30,
    marginBottom: 12,
  },
  insightLink: {
    fontFamily: "Inter-Bold",
    fontSize: 10,
    color: "#F5E642",
    letterSpacing: 1,
  },
  insightIconContainer: {
    position: "absolute",
    right: -10,
    bottom: -10,
    opacity: 0.5,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Inter",
    fontSize: 14,
    color: "#8B949E",
    textAlign: "center",
  },
});
