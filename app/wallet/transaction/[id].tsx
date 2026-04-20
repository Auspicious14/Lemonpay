import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Share as ShareIcon,
  Download,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import { useToastStore } from "@/store/useToastStore";

const { width } = Dimensions.get("window");

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const showToast = useToastStore((state) => state.show);
  
  const { data: transactionsData } = useTransactions();
  const transaction = transactionsData?.data.find(tx => tx.id.toString() === id);

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#F5E642" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Transaction not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCredit = transaction.type === "credit";
  const amount = parseFloat(transaction.amount);
  const escrowFee = amount * 0.005;
  const networkCharge = 150.00;
  const total = amount + (isCredit ? 0 : (escrowFee + networkCharge));

  const handleShare = async () => {
    const receiptText = `
===== LYMEPAY RECEIPT =====
Reference: ${transaction.reference}
Amount: ₦${amount.toLocaleString()}
Type: ${transaction.type.toUpperCase()}
Status: ${transaction.status.toUpperCase()}
Date: ${formatDate(transaction.created_at)}
===========================
    `;
    try {
      await Share.share({ message: receiptText });
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = () => {
    switch (transaction.status) {
      case "completed":
        return (
          <View style={[styles.statusBadge, styles.successBadge]}>
            <View style={[styles.statusDot, { backgroundColor: "#00C896" }]} />
            <Text style={[styles.statusBadgeText, { color: "#00C896" }]}>SUCCESS</Text>
          </View>
        );
      case "failed":
        return (
          <View style={[styles.statusBadge, styles.failedBadge]}>
            <XCircle size={12} color="#FF4D4F" />
            <Text style={[styles.statusBadgeText, { color: "#FF4D4F" }]}>FAILED</Text>
          </View>
        );
      case "pending":
        return (
          <View style={[styles.statusBadge, styles.pendingBadge]}>
            <Clock size={12} color="#8B949E" />
            <Text style={[styles.statusBadgeText, { color: "#8B949E" }]}>PENDING</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, styles.disputedBadge]}>
            <AlertTriangle size={12} color="#F5A600" />
            <Text style={[styles.statusBadgeText, { color: "#F5A600" }]}>DISPUTED</Text>
          </View>
        );
    }
  };

  const getTxTypeLabel = () => {
    const desc = transaction.description.toLowerCase();
    if (isCredit && desc.includes("escrow")) return "Escrow Funding";
    if (isCredit && desc.includes("wallet")) return "Wallet Funding";
    if (!isCredit && (desc.includes("withdrawal") || transaction.paystack_transfer_code)) return "Withdrawal";
    return "Transfer";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#F5E642" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Detail</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <ShareIcon size={24} color="#F5E642" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TOP HERO SECTION */}
        <View style={styles.heroSection}>
          {getStatusBadge()}
          <Text style={styles.heroLabel}>
            {isCredit ? "Amount Received" : "Amount Sent"}
          </Text>
          <Text style={styles.heroAmount}>
            {formatCurrency(amount)}
          </Text>
          <Text style={styles.heroRef}>{transaction.reference}</Text>
          <Text style={styles.heroDate}>
            {new Date(transaction.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })} • {new Date(transaction.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit', minute: '2-digit', hour12: false
            })}
          </Text>
        </View>

        {/* GENERAL SUMMARY CARD */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>GENERAL SUMMARY</Text>
          <View style={styles.grid}>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Transaction Type</Text>
              <Text style={styles.cellValue}>{getTxTypeLabel()}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Counterparty</Text>
              <Text style={styles.cellValue}>LymePay</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Bank Reference</Text>
              <Text style={styles.cellValue}>{transaction.reference.substring(0, 10)}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Asset Category</Text>
              <Text style={styles.cellValue}>Digital Goods</Text>
            </View>
          </View>
        </View>

        {/* FINANCIAL BREAKDOWN CARD */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>FINANCIAL BREAKDOWN</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Purchase Price</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(amount)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Escrow Fee (0.5%)</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(escrowFee)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Network Charge</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(networkCharge)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* ASSISTANCE CARD */}
        <View style={styles.assistanceCard}>
          <View style={styles.assistanceIcon}>
            <HelpCircle size={24} color="#8B949E" />
          </View>
          <View style={styles.assistanceMiddle}>
            <Text style={styles.assistanceTitle}>Need assistance?</Text>
            <Text style={styles.assistanceSubtitle}>Dispute resolution available 24/7</Text>
          </View>
          <TouchableOpacity onPress={() => showToast("Coming soon", "info")}>
            <Text style={styles.assistanceLink}>RAISE A DISPUTE</Text>
          </TouchableOpacity>
        </View>

        {/* CTA BUTTONS */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleShare} activeOpacity={0.8}>
            <LinearGradient
              colors={["#F5E642", "#D4C200"]}
              style={styles.primaryButton}
            >
              <Download size={20} color="#0D1117" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Download Receipt</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => showToast("No escrow linked", "info")}
          >
            <Text style={styles.secondaryButtonText}>View Escrow Agreement</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: "white",
  },
  shareButton: {
    width: 40,
    alignItems: "flex-end",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 16,
  },
  successBadge: {
    backgroundColor: "rgba(0,200,150,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,200,150,0.2)",
  },
  failedBadge: {
    backgroundColor: "rgba(255,77,79,0.1)",
  },
  pendingBadge: {
    backgroundColor: "rgba(139,148,158,0.1)",
  },
  disputedBadge: {
    backgroundColor: "rgba(245,166,0,0.1)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    fontFamily: "Inter-Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
  heroLabel: {
    fontFamily: "Inter",
    fontSize: 14,
    color: "#8B949E",
    marginBottom: 8,
  },
  heroAmount: {
    fontFamily: "Inter-ExtraBold",
    fontSize: 36,
    color: "#F5E642",
    marginBottom: 12,
  },
  heroRef: {
    fontFamily: "Inter",
    fontSize: 12,
    color: "#8B949E",
    marginBottom: 4,
  },
  heroDate: {
    fontFamily: "Inter",
    fontSize: 12,
    color: "#8B949E",
  },
  card: {
    backgroundColor: "#161B22",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardLabel: {
    fontFamily: "Inter-Bold",
    fontSize: 10,
    color: "#8B949E",
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridCell: {
    width: "50%",
    marginBottom: 16,
  },
  cellLabel: {
    fontFamily: "Inter",
    fontSize: 11,
    color: "#8B949E",
    marginBottom: 4,
  },
  cellValue: {
    fontFamily: "Inter-Bold",
    fontSize: 14,
    color: "white",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  breakdownLabel: {
    fontFamily: "Inter",
    fontSize: 13,
    color: "#8B949E",
  },
  breakdownValue: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    color: "white",
  },
  divider: {
    height: 1,
    backgroundColor: "#30363D",
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: "Inter-Bold",
    fontSize: 14,
    color: "white",
  },
  totalValue: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#F5E642",
  },
  assistanceCard: {
    backgroundColor: "#161B22",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  assistanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#21262D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  assistanceMiddle: {
    flex: 1,
  },
  assistanceTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 14,
    color: "white",
  },
  assistanceSubtitle: {
    fontFamily: "Inter",
    fontSize: 12,
    color: "#8B949E",
    marginTop: 2,
  },
  assistanceLink: {
    fontFamily: "Inter-Bold",
    fontSize: 10,
    color: "#F5E642",
    letterSpacing: 1,
  },
  footer: {
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#0D1117",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#30363D",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#161B22",
  },
  secondaryButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "white",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#8B949E",
    fontFamily: "Inter",
  },
});
