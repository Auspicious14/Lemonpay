import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { View } from "react-native";

export default function WithdrawSuccessScreen() {
  const { amount, bank, reference } = useLocalSearchParams<any>();

  return (
    <View className="flex-1 bg-[#0D1117] justify-center px-6">
      <View className="items-center mb-10">
        <View className="w-24 h-24 rounded-full bg-[#00C896]/20 items-center justify-center">
          <CheckCircle2 size={48} color="#00C896" />
        </View>

        <Typography
          variant="display"
          className="text-white text-3xl font-extrabold mt-6 text-center"
        >
          Withdrawal Successful
        </Typography>

        <Typography variant="body" className="text-[#8B949E] text-center mt-3">
          ₦{amount} is being sent to your {bank} account
        </Typography>
      </View>

      <View className="bg-[#161B22] p-5 rounded-2xl mb-6">
        <Typography variant="body" className="text-[#8B949E] text-xs">
          TRANSACTION ID
        </Typography>
        <Typography variant="body" className="text-white font-bold mt-1">
          {reference}
        </Typography>
      </View>

      <Button
        label="Back to Dashboard"
        onPress={() => router.replace("/(tabs)")}
      />
    </View>
  );
}
