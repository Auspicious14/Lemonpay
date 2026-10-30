# Escrow API contract (what the app expects)

The app reads every escrow through `getEscrowPhase()` in `lib/utils/escrow.ts`.
For the flow to work, the backend must follow the rules below. Rule 2 is the
one causing the "seller can also Accept & Lock" bug today.

## 1. One status = one meaning, one person acts

| Status | Meaning | Who acts next | App shows |
|---|---|---|---|
| `pending_seller_agreement` | Buyer created the deal | Seller | Add your terms |
| `pending_buyer_confirmation` | Seller added/updated terms | Buyer | **Accept & Pay** / Counter |
| `awaiting_seller_confirmation` | **Buyer sent a counter.** Only this. | Seller | Accept buyer's counter / Counter |
| `locked` | Terms final, not yet paid | Buyer | Pay & secure deal |
| `funded` | Money held by LymPay ("Payment Secured") | Seller | I've delivered — notify buyer |
| `awaiting_buyer_release` | Seller marked delivered | Buyer | It's okay — release / Not okay — report |
| `released` / `disputed` / `resolved` / `refunded` | Terminal / dispute | — | — |

Please stop returning `pending_seller_confirmation`. The app treats it as an
alias of `awaiting_seller_confirmation` for now, but there should be one name.

## 2. Whoever made the last offer is bound by it

`POST /escrow/:id/confirm-agreement`

- Called by the **buyer** while `pending_buyer_confirmation` → set status to
  **`locked`** (set `locked_at`, `can_be_funded = true`). Do **not** move it to
  `awaiting_seller_confirmation`; the seller proposed these terms and has
  nothing left to confirm.
- Called by the **seller** while `awaiting_seller_confirmation` → `locked`.
- Called by anyone else, or in any other status → `409` with a clear `message`.
- Return the updated escrow in `data` (the app checks `data.status === "locked"`
  before it charges the buyer).

The app calls `confirm-agreement` and then immediately `POST /escrow/:id/fund`
when the buyer taps **Accept & Pay**, so `fund` must accept `locked` escrows
right after the lock. `/escrow/:uuid/seller-confirm` is no longer used by the
app.

`POST /escrow/:id/buyer-counter` (buyer, while `pending_buyer_confirmation`)
→ save `buyer_terms`, set `awaiting_seller_confirmation`.

`POST /escrow/:id/seller-agreement` (seller, while `pending_seller_agreement`
or `awaiting_seller_confirmation`) → save `seller_terms`, set
`pending_buyer_confirmation`.

## 3. Enforce it on the server

Every action must check **both** the caller's role and the current status,
and reject anything else with `409`. The app hides buttons, but the server is
what actually stops a seller from locking, a buyer from marking delivered, or a
double-fund from a double tap. Make `fund` and `confirm-delivery` idempotent.

## 4. Next (app will follow once these exist)

1. **Inspection window + auto-release.** On `mark-delivered`, set
   `buyer_confirmation_deadline` (e.g. 72h). If the buyer neither releases nor
   disputes by then, auto-release to the seller. The app already shows this
   deadline in the delivered stage.
2. **Delivery deadline.** If the seller hasn't marked delivered by an agreed
   date, let the buyer cancel for a refund without a full dispute.
3. **Seller can open a dispute** (e.g. buyer claims non-delivery after
   handover). `POST /disputes` currently seems buyer-only.
4. **Settle-first disputes.** Let the other party reply, and support one-tap
   outcomes (redeliver / partial refund with amount / full refund) that move
   money when both agree; escalate to a LymPay mediator only if they don't.
5. **Handover code.** On `funded`, generate a 4-digit code shown only to the
   buyer. Seller enters it at handover → counts as delivered *and* received.
6. **Notifications** for every status change, sent server-side (push + SMS /
   WhatsApp), so the seller never has to trust a screenshot.
