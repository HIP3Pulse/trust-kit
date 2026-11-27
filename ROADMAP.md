# HIP3Pulse Product Roadmap

HIP3Pulse evolves across four structured stages focused exclusively on decentralized **Hyperliquid L1** (HIP-3 + HyperCore) risk awareness and deterministic non-custodial execution.

## Stage I (Delivered) — Non-Custodial Risk & Full-Cost Accounting Core
- Multi-market session classification distinguishing continuous external spot hours from off-hours `30m EMA` oracle regimes.
- Pre-trade corporate-action guardrails covering US `4-Day ET` ex-dividend gaps and `SPLIT_SETTLEMENT_HALT` forced-settlement risk.
- Browser-local zero-withdrawal `ApproveAgent` session signing and 3-tier `reduceOnly` (`0 bps`) legged-fill unwind circuit breakers bounded by max USD loss.

## Stage II (Active Baseline · `v0.5.6`) — All-Weather Multi-Asset Execution Terminal & De-Noised Liq Radar
- Unified HIP-3 (`178` live contracts) and HyperCore (`179` active contracts) directional single-leg and arbitrary custom pair routing (`1:1`, `14d WLS β`, or custom ratio weight).
- Orderbook-walked closed-form all-in breakeven accounting (`0.1 bps` precision) separating Growth vs Standard protocol fees, open-only `0.5–1.0 bps` Builder tiers (`0 bps` on all closes & L1 `SL/TP`), real exit depth, 24h dynamic Cross-DEX twin basis anchors, and funding drag.
- Sequential `Leg 1 ALO (0.5 bps) -> Leg 2 IOC` pair execution with `25s` resting guard, terminal-confirmed `Smart Maker Chase`, and single-leg 24/7 on-chain `0 bps` `positionTpsl` (`SL/TP`) brackets.
- De-noised smart-money positioning (`Whale #XXXXXX`) with strict 4-way `AND` live-stream gating (`PUBLIC_DELAYED_10M` vs `<20s` `BUILDER_LIVE`) and `<= 4.0%` (`>= $100k`, `24h` window) `ISOLATED_EXACT` vs `CROSS_ESTIMATED` liquidation clusters with honest `2 * OI` coverage disclosure.
- Multi-language institutional portal (`EN / ES / FR / DE / zh-CN / zh-TW / RU / JA / KO / PT / TR / VI`) with live 4-script WebCrypto `SHA-384` SRI audit and independent CLI verifier.

## Stage III (Next Milestone · `v0.5.7` / `v0.6.0`) — Non-Custodial USDC Referral Rebates & Standardized AI Agent Thin-Client Pipeline
- Post-audit non-custodial USDC referral rebates (`v0.5.7`) funded strictly from verified realized Builder fee revenue after empirical $\Delta_{\text{wallet}} > 0$ sign-off.
- Human-vs-programmatic separation (`v0.6.0`): upgraded MCP server and Python thin-client SDK with pay-as-you-route quotas replacing the retired legacy `v0.3.x` read-only packages.
- Empirical calibration of cost and signal models once sufficient closed-sample audit volume accumulates.

## Stage IV (Future Horizon) — Multi-Subaccount Risk & Local Conditional Trigger Matrix
- Client-session conditional trigger engine reacting to on-chain positioning shifts and cross-asset basis thresholds.
- Consolidated multi-subaccount exposure and liquidation-buffer risk dashboard.
