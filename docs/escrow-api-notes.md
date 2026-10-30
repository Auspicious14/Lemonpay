# Escrow API ↔ app notes

The API reference is `LymPay-Escrow-v2.postman_collection.json` in this folder.
The app follows it. This page lists where the app had to guess, and the
couple of things that live outside the app.

## Please confirm (fields the collection examples don't show)

| Where | What the app reads | Fallbacks it also accepts |
|---|---|---|
| `GET /disputes/{uuid}` → `messages[]` | `sender_id`, `sender_role` (`buyer` / `seller` / `admin`), `attachments[].url`, `created_at` | `user_id`, `role`, `sender.id`, `sender.role` |
| `GET /disputes/{uuid}` → `proposals[]` | `uuid`, `outcome`, `refund_amount`, `note`, `status` (`pending` …), `proposed_by` (user id) | `proposed_by_role`, `user_id`, `role` |
| `GET /disputes` items | `escrow_uuid` (or `escrow.uuid`), `stage`, `type`, `escrow.title` | — |
| `GET /escrow/{uuid}` | `delivery_evidence` (array from mark-delivered), `dispute_uuid` while `disputed` | Without `dispute_uuid` the app looks the dispute up in `GET /disputes` by `escrow_uuid` |

If any of these are named differently, say so and it's a one-line change in
`types/api.ts`.

## Outside the app

- **Payment link web page** (`{web}/pay/{uuid}`): it should offer an
  "Open in LymPay" button pointing to `lympay://pay/{uuid}`. The app handles
  that link: it shows the deal and a **Claim & review terms** button, and
  sends logged-out users back to the link after they log in. Opening
  `https://…/pay/…` straight into the app (universal / app links) needs
  `associatedDomains` / `intentFilters` in `app.json` plus the
  `apple-app-site-association` / `assetlinks.json` files on the web host.
  That isn't set up yet.
- **Web base URL**: set `EXPO_PUBLIC_WEB_URL` (defaults to
  `https://lemonpayapp.vercel.app`). The app uses it to rebuild a link from
  the escrow screen; at creation it uses `share_link` from the API.
- **Paystack callback**: the app opens checkout with
  `WebBrowser.openAuthSessionAsync(url, "lympay://")` and expects the API to
  finish on `lympay://escrow-payment-success|failed?uuid=…`. It never trusts
  the redirect. It polls `GET /escrow/{uuid}` until `is_payment_secured`.

## Not in the app (by design)

- `POST /wallet/withdraw/finalize-otp`: the OTP goes to the business's
  Paystack phone, so it's an admin step, not a customer screen.
- `PUT /admin/disputes/{uuid}`: mediator decisions belong in an admin tool.
- `POST /escrow/{uuid}/seller-confirm`: deprecated; the app uses
  `confirm-agreement`.
