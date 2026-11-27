# HIP3Pulse Security & Non-Custodial Architecture

HIP3Pulse is engineered so users never have to trust an operator with custody of funds or private keys. Every critical security boundary can be independently verified directly in the browser or via [`verify_non_custodial.mjs`](./verify_non_custodial.mjs).

## 1. Local Client Signing & Zero Withdrawal Permission (`ApproveAgent`)

- Main wallet EIP-712 signatures are executed locally in the user's own wallet provider.
- Optional 1-Click 24-hour trading uses Hyperliquid's native `ApproveAgent` protocol mechanism, generating an ephemeral session key strictly inside browser `sessionStorage`.
- At the Hyperliquid L1 protocol layer, approved agent keys **cannot withdraw funds, transfer balances, or modify account-level custody settings** — they are strictly trade-only and can be revoked or wiped at any time.

## 2. Explicit On-Chain Builder Fee Cap (`ApproveBuilderFee`) & `0 bps` Closes

- Users explicitly authorize Hyperliquid's native `ApproveBuilderFee` up to a one-time protocol ceiling of **`0.02%` (`2.0 bps` max)** so future fee tiers never require re-signing.
- Active execution fees are **open-only** across three verifiable on-chain tiers: `STANDARD` (`1.0 / 0.8 / 0.5 bps`), `PRO` (`0.8 / 0.6 / 0.5 bps`), and `WHALE` (`0.5 / 0.5 / 0.5 bps`) for Single IOC / Pair / Smart Maker ALO openings.
- **Every position close**, managed convergence close, emergency legged-fill unwind, and **single-leg 24/7 on-chain `positionTpsl` (`SL/TP`) trigger** executes with **no `builder` field (`0 bps`)** directly against `https://api.hyperliquid.xyz/exchange` so protective exits can never be blocked by relay or fee checks.

## 3. Direct L1 Cancellation, `0 bps` Exit Escape & Race-Safe Chase

- Order cancellations (`cancel`, `cancelByCloid`), order modifications (`modify`, `batchModify`), `scheduleCancel`, and all pure `r: true` orders without `builder` (all closes, unwinds, and `positionTpsl` triggers) route **directly** from the browser to `https://api.hyperliquid.xyz/exchange`.
- `Smart Maker Chase` cancels direct on L1, confirms non-open terminal status via `orderStatus` before reposting any unfilled remainder, and enforces a cumulative chase cap from the original resting price.
- If the opening relay endpoint returns a network timeout, HTTP `429`, or HTTP `>= 500`, pre-signed payloads fall back directly to Hyperliquid L1 with strict nonce-replay-only recovery (`NONCE_REPLAY_ERROR_RE`) so business errors (such as insufficient margin) are never misclassified as fills.

## 4. Strict CSP & 4-Script WebCrypto `SHA-384` SRI

- Every served document enforces a strict `Content-Security-Policy`:
  - `default-src 'self'`
  - `script-src 'self'` (zero inline scripts, zero third-party CDNs, zero external analytics/trackers)
  - `connect-src 'self' https://api.hyperliquid.xyz`
  - `object-src 'none'`
  - `frame-ancestors 'none'`
- All four runtime ES modules (`/app.mjs`, `/i18n.mjs`, `/vendor/hl-sdk.mjs`, `/vendor/neural-core.mjs`) carry cryptographic `integrity="sha384-..."` hashes verified both by the browser on load and on-demand inside the terminal's `[🛡️ Verify Non-Custodial]` WebCrypto modal or via `node verify_non_custodial.mjs`.

## 5. Privacy & Pseudonymization

- All public smart-money positioning feeds and liquidation cluster summaries one-way pseudonymize wallet addresses into `Whale #XXXXXX` identifiers before leaving the origin boundary. Raw `0x` trader addresses are never exposed in public endpoints or broadcast cards.

## Reporting a Vulnerability

If you discover a security issue affecting client signing boundaries, CSP/SRI integrity, or order-routing safety, please reach out via the official `@HIP3Pulse` channel with reproducible technical details.
