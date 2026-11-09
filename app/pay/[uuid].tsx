import { Redirect, useLocalSearchParams } from "expo-router";

// Seller payment links look like {web}/pay/{uuid} and lympay://pay/{uuid}.
// The escrow screen handles viewing and claiming, so just send people there.
// (If they're logged out, the auth guard brings them back here after login.)
export default function PayLinkScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  return <Redirect href={uuid ? `/escrow/${uuid}` : "/home"} />;
}
