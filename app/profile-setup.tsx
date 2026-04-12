import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Screen } from "../components/ui/Screen";
import { Typography } from "../components/ui/Typography";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { apiClient } from "../lib/api/client";
import { Toast } from "../components/ui/Toast";
import * as ImagePicker from "expo-image-picker";
import { Camera, User as UserIcon } from "lucide-react-native";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { checkSession, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [bvn, setBvn] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd use FormData to upload the image
      await apiClient.post("/users/profile-setup", {
        bvn: bvn || undefined,
        // profileImage: image (handled separately usually)
      });

      await checkSession(); // This will update user.needsProfile to false
      Toast.show({ message: "Profile completed!", type: "success" });
      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({
        message: error.response?.data?.message || "Failed to complete profile",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen className="bg-[#0D1117]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6">
          <View className="mt-12 mb-8 items-center">
            <Typography variant="display" className="text-white text-3xl mb-2">
              Complete Profile
            </Typography>
            <Typography className="text-gray-400 text-center">
              A few more details to get your account fully verified.
            </Typography>
          </View>

          <View className="items-center mb-10">
            <TouchableOpacity
              onPress={pickImage}
              className="w-32 h-32 rounded-full bg-[#161B22] border-2 border-dashed border-gray-700 justify-center items-center overflow-hidden"
            >
              {image ? (
                <Image source={{ uri: image }} className="w-full h-full" />
              ) : (
                <View className="items-center">
                  <Camera size={32} color="#94A3B8" />
                  <Typography className="text-[#94A3B8] text-xs mt-1">
                    Upload
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View className="gap-6">
            <Input
              label="Bank Verification Number (BVN)"
              placeholder="222XXXXXXXX"
              keyboardType="number-pad"
              maxLength={11}
              value={bvn}
              onChangeText={setBvn}
            />
            <Typography variant="caption" className="mt-1 ml-1 text-gray-500">
              Optional. Required for higher transaction limits.
            </Typography>

            <View className="mt-4">
              <Button
                label="Save & Continue"
                onPress={handleComplete}
                loading={isLoading}
              />
              <TouchableOpacity
                onPress={() => logout()}
                className="mt-6 items-center"
              >
                <Typography className="text-red-400">
                  Cancel & Logout
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
