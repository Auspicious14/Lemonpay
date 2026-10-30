// Web address of the LymPay site that hosts payment links (/pay/{uuid}) and
// the public "check a code" page. The API returns `share_link` when a seller
// creates a link; this rebuilds it for links opened later from the escrow screen.
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL || "https://lemonpayapp.vercel.app").replace(/\/$/, "");

export const paymentLinkFor = (uuid: string) => `${WEB_URL}/pay/${uuid}`;
