# HIP3Pulse Product Roadmap

HIP3Pulse evolves across four structured stages focused exclusively on decentralized **Hyperliquid L1** (HIP-3 + HyperCore) risk awareness and deterministic non-custodial execution.

## Stage I (Delivered) — Non-Custodial Risk & Full-Cost Accounting Core
- Multi-market session classification distinguishing continuous external spot hours from off-hours `30m EMA` oracle regimes.
- Pre-trade corporate-action guardrails covering US `4-Day ET` ex-dividend gaps and `SPLIT_SETTLEMENT_HALT` forced-settlement risk.
- Browser-local zero-withdrawal `ApproveAgent` session signing and 3-tier `reduceOnly` (`0 bps`) legged-fill unwind circuit breakers bounded by max USD loss.

## Stage II (Active Baseline) — All-Weather Multi-Asset Pair Terminal & De-Noised Liq Radar
- Unified HIP-3 and HyperCore directional single-leg and arbitrary custom pair routing (`1:1`, `14d WLS β`, or custom ratio weight).
- Orderbook-walked closed-form all-in breakeven accounting (`0.1 bps` precision) separating Growth vs Standard protocol fees, dynamic `0.5–2.0 bps` Builder tiers, and funding drag.
- Sequential `Leg 1 ALO -> Leg 2 IOC` pair execution with `25s` resting guard and authoritative post-cancel `orderStatus` fill reconciliation.
- De-noised smart-money positioning (`Whale #XXXXXX`) and `<= 4.0%` (`>= $100k`, `24h` window) `ISOLATED_EXACT` vs `CROSS_ESTIMATED` liquidation clusters with honest `2 * OI` coverage disclosure.
- Multi-language institutional portal (`EN / KO / JA / ES / RU / zh-TW / zh-CN`) with live 4-script WebCrypto `SHA-384` SRI audit and independent CLI verifier.

## Stage III (Next Milestone) — Standardized AI Agent & Programmatic Thin-Client Pipeline
- Upgraded MCP server and Python SDK interfaces allowing external quantitative strategies and autonomous agents to query pre-trade corporate-action/session guardrails and route non-custodial Builder-attributed executions.
- Empirical calibration of cost and dislocation models once sufficient closed-sample audit volume accumulates.

## Stage IV (Future Horizon) — Multi-Subaccount Risk & Local Conditional Trigger Matrix
- Client-session conditional trigger engine reacting to on-chain positioning shifts and cross-asset basis thresholds.
- Consolidated multi-subaccount exposure and liquidation-buffer risk dashboard.
