import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  ShieldCheck,
  Search,
  ChevronDown,
  Plus,
  CloudUpload,
  ArrowRight,
  Info,
  DollarSign,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function CreateEscrowScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    recipient: "",
    terms: "",
    days: 7,
  });

  const handleNext = () => {
    router.push("/escrow/review");
  };

  return (
    <Screen
      showBackButton
      title="Create Escrow"
      rightAction={
        <Typography
          variant="label-sm"
          className="text-text-secondary uppercase tracking-widest"
        >
          Step 1 of 3
        </Typography>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-32">
        <View className="space-y-10 py-6">
          {/* Hero Trust Signal */}
          <View className="items-center space-y-6">
            <View className="flex-row items-center space-x-2 px-4 py-2 rounded-full bg-surface-container-high">
              <ShieldCheck size={14} color="#43e5b1" fill="#43e5b1" />
              <Typography
                variant="label-sm"
                className="text-text-secondary tracking-wider uppercase text-[10px]"
              >
                Secured by Paystack
              </Typography>
            </View>
            <View className="space-y-4">
              <Typography
                variant="display-lg"
                className="text-center leading-tight"
              >
                Start a protected {"\n"}transaction
              </Typography>
              <Typography
                variant="body"
                className="text-text-secondary text-center max-w-md mx-auto leading-relaxed"
              >
                Fill in the details below to initiate your secure escrow
                agreement. Your funds will be held safely until delivery is
                confirmed.
              </Typography>
            </View>
          </View>

          {/* Form Canvas */}
          <Card
            variant="low"
            className="p-8 space-y-8 relative overflow-hidden"
          >
            <View
              className="absolute top-[-32px] right-[-32px] w-32 h-32 bg-primary-fixed/5 rounded-full"
              style={{ filter: "blur(40px)" }}
            />

            <View className="space-y-6">
              <Input
                label="Transaction Title"
                placeholder="e.g. MacBook Pro M3 Max"
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
              />

              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Input
                    label="Escrow Amount (NGN)"
                    placeholder="0.00"
                    keyboardType="numeric"
                    leftIcon={
                      <Typography
                        variant="heading"
                        className="text-primary-fixed-dim"
                      >
                        ₦
                      </Typography>
                    }
                    value={formData.amount}
                    onChangeText={(text) =>
                      setFormData({ ...formData, amount: text })
                    }
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Seller Handle"
                    placeholder="username"
                    leftIcon={
                      <Typography
                        variant="heading"
                        className="text-primary-fixed-dim"
                      >
                        @
                      </Typography>
                    }
                    value={formData.recipient}
                    onChangeText={(text) =>
                      setFormData({ ...formData, recipient: text })
                    }
                  />
                </View>
              </View>

              <View className="space-y-2">
                <Typography
                  variant="label-sm"
                  className="text-primary-fixed ml-1"
                >
                  Escrow Terms & Agreement
                </Typography>
                <Card
                  variant="default"
                  className="p-0 border-none bg-surface-container-highest/20"
                >
                  <TextInput
                    multiline
                    numberOfLines={6}
                    placeholder="Detail the exact condition of the item and the specific criteria that must be met for funds to be released..."
                    placeholderTextColor="#4a4734"
                    className="text-white p-4 font-inter text-sm leading-relaxed"
                    style={{ textAlignVertical: "top", minHeight: 120 }}
                    value={formData.terms}
                    onChangeText={(text) =>
                      setFormData({ ...formData, terms: text })
                    }
                  />
                </Card>
              </View>

              <View className="flex-row items-start space-x-3 p-4 bg-surface-container-highest/30 rounded-2xl border border-outline-variant/10">
                <Info size={16} color="#43e5b1" />
                <Typography
                  variant="caption"
                  className="text-text-secondary leading-tight"
                >
                  Funds will only be released to the seller once you confirm
                  receipt of the item. Our dispute resolution team is available
                  24/7.
                </Typography>
              </View>

              <Button
                label="Next: Review Agreement"
                onPress={handleNext}
                rightIcon={<ArrowRight size={20} color="#1f1c00" />}
                className="h-16 shadow-2xl shadow-primary-fixed/20"
              />
            </View>
          </Card>

          {/* Editorial Section: Transaction Safety */}
          <View className="space-y-6">
            <View className="flex-row justify-between items-end px-2">
              <Typography variant="heading" className="text-2xl">
                Safety Standards
              </Typography>
              <TouchableOpacity>
                <Typography
                  variant="label-sm"
                  className="text-primary-fixed border-b border-primary-fixed/30 pb-1"
                >
                  Read Guides
                </Typography>
              </TouchableOpacity>
            </View>

            <View className="flex-row space-x-4">
              <TouchableOpacity className="flex-1 aspect-[4/3] rounded-3xl overflow-hidden bg-surface-container-low relative">
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuaFvgxLaX72rh-zZABz6fRASWBxvWW5lgifa5WRgePmd93YgpBAKn-WaWxmIV-FfiSRDF0Mepwm_VVPHaLzzhPBy8UVE2OOEKjxDu6-9JlUeU-J-Tayf5phxT_brK73WOkwf498rYFQRRiGVhP6S9hMCW7O6qqgI6idOA6seX0nuZ8qaZzCgCTHWK2F7CcIJbrfiGSxxKEy7CjLQ0IFKiOARs-jGZNeSEw34XmShd7hEGxnEPfE_ij0Z91eZD-os1CUJ_Jwjh0DiP",
                  }}
                  className="absolute inset-0 w-full h-full opacity-40"
                />
                <View className="absolute inset-0 p-6 justify-end bg-gradient-to-t from-surface-container-low to-transparent">
                  <Typography
                    variant="label-sm"
                    className="text-primary-fixed mb-1 uppercase tracking-widest text-[8px]"
                  >
                    Security
                  </Typography>
                  <Typography
                    variant="subheading"
                    className="text-sm font-bold mb-1"
                  >
                    How Escrow Protects You
                  </Typography>
                </View>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 aspect-[4/3] rounded-3xl overflow-hidden bg-surface-container-low relative">
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQxHGZFzQ2rAimu__hnB6tUePNOpYXDEibozgfIAZx2uEU9AyLdOn_ylxMtERDpeEejDx8Zlxwyt4WFT_xQdOOyVCzhpTOc-pthBvppPOJyTnnVEhvV5-uWXeCSDyQO-6Ce6VXTSRf4_TsEHzxUrRh8lFD3aB3k-MFscITeWShnLqKfx6ynkapk382VSUuLp7tN1dNEMXz35sO1f2_4EXSzWlByzSgiB3GuRpfxc4I_uNekQavuP4NAWuKp6CldShGF_VmoTuUNls8",
                  }}
                  className="absolute inset-0 w-full h-full opacity-40"
                />
                <View className="absolute inset-0 p-6 justify-end bg-gradient-to-t from-surface-container-low to-transparent">
                  <Typography
                    variant="label-sm"
                    className="text-primary-fixed mb-1 uppercase tracking-widest text-[8px]"
                  >
                    Legal
                  </Typography>
                  <Typography
                    variant="subheading"
                    className="text-sm font-bold mb-1"
                  >
                    Drafting Agreements
                  </Typography>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View className="items-center py-6">
            <Typography
              variant="caption"
              className="text-text-secondary text-[10px] text-center max-w-[240px]"
            >
              By proceeding, you agree to LemonPay's Escrow Protection Policy.
            </Typography>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
