import { Redirect } from "expo-router";

export default function Index() {
  // Fallback redirect if AuthContext guard hasn't triggered yet
  return <Redirect href="/onboarding" />;
}
