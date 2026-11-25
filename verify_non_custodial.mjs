#!/usr/bin/env node
/**
 * HIP3Pulse Client-Side Non-Custodial Verifier (Zero External Dependencies · Node >= 20)
 *
 * Independently verifies 4 security & transparency invariants against the live deployment:
 *   Step 1: Strict Content-Security-Policy boundary (zero third-party script or telemetry origins)
 *   Step 2: Live SHA-384 Subresource Integrity (SRI) across all 4 served ES modules
 *   Step 3: /api/enrich public payload sanitization (zero raw 0x trader addresses leaked)
 *   Step 4: Direct Hyperliquid L1 verification of on-chain Builder address eligibility
 *
 * Usage:
 *   node verify_non_custodial.mjs
 *   node verify_non_custodial.mjs https://hip3pulse.pages.dev
 *   HIP3_VERIFY_ORIGIN=https://hip3pulse.pages.dev node verify_non_custodial.mjs
 */

import crypto from "node:crypto";
import dns from "node:dns/promises";

const DEFAULT_PRIMARY_ORIGIN = "https://hip3pulse.com";
const FALLBACK_ORIGIN = "https://hip3pulse.pages.dev";
const HL_INFO_API = "https://api.hyperliquid.xyz/info";
const FAKE_IP_RE = /^198\.1[89]\./;
const TLS_CERT_ERR_RE = /CERT|SELF_SIGNED|UNABLE_TO_VERIFY|ALTNAME|EXPIRED|REVOKED|BAD_CERTIFICATE|HANDSHAKE_FAILURE/i;

function normalizeOrigin(raw) {
  const s = String(raw || "").trim().replace(/\/+$/, "");
  const u = new URL(s);
  if (u.protocol !== "https:" && u.protocol !== "http:") {
    throw new Error(`Unsupported protocol in origin: ${s}`);
  }
  return u.origin;
}

function getDnsErrorCode(err) {
  return String(err?.code || err?.cause?.code || "").toUpperCase();
}

async function fetchWithTimeout(url, opts = {}, timeoutMs = 10_000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function resolveOriginAndHomeResponse() {
  const explicit = process.argv[2] || process.env.HIP3_VERIFY_ORIGIN || "";
  if (explicit.trim()) {
    const origin = normalizeOrigin(explicit);
    const resp = await fetchWithTimeout(`${origin}/`, { cache: "no-store" }, 10_000);
    return { origin, homeResp: resp };
  }

  // Default probe: try https://hip3pulse.com (3,000ms timeout); ONLY fall back to pages.dev on DNS ENOTFOUND/EAI_AGAIN
  // (or synthetic RFC-2544 fake-IP 198.18.0.0/15 proxy pre-TLS reset for unregistered NXDOMAIN).
  // NEVER falls back on TLS certificate errors, HTTP non-200, or SRI/hash failures.
  try {
    const resp = await fetchWithTimeout(`${DEFAULT_PRIMARY_ORIGIN}/`, { cache: "no-store" }, 3_000);
    return { origin: DEFAULT_PRIMARY_ORIGIN, homeResp: resp };
  } catch (err) {
    const code = getDnsErrorCode(err);
    const errText = `${code} ${err?.message || ""} ${err?.cause?.message || ""}`;
    let isUnregisteredDns = code === "ENOTFOUND" || code === "EAI_AGAIN";
    if (!isUnregisteredDns && !TLS_CERT_ERR_RE.test(errText) && (code === "ECONNRESET" || code === "ECONNREFUSED" || err?.name === "AbortError")) {
      try {
        const looked = await dns.lookup("hip3pulse.com");
        if (FAKE_IP_RE.test(String(looked?.address || ""))) {
          isUnregisteredDns = true;
        }
      } catch (dnsErr) {
        const dCode = getDnsErrorCode(dnsErr);
        if (dCode === "ENOTFOUND" || dCode === "EAI_AGAIN") isUnregisteredDns = true;
      }
    }
    if (isUnregisteredDns) {
      console.log(`[INFO] ${DEFAULT_PRIMARY_ORIGIN} is not yet DNS-active (${code || "NXDOMAIN"}); falling back to live ${FALLBACK_ORIGIN}`);
      const resp = await fetchWithTimeout(`${FALLBACK_ORIGIN}/`, { cache: "no-store" }, 10_000);
      return { origin: FALLBACK_ORIGIN, homeResp: resp };
    }
    throw err;
  }
}

function extractIntegrityForPath(html, assetPath) {
  const escaped = assetPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<(?:script|link)\\b[^>]*\\b(?:src|href)="${escaped}"[^>]*\\bintegrity="(sha384-[A-Za-z0-9+/=]+)"`, "i"),
    new RegExp(`<(?:script|link)\\b[^>]*\\bintegrity="(sha384-[A-Za-z0-9+/=]+)"[^>]*\\b(?:src|href)="${escaped}"`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

async function main() {
  const { origin, homeResp } = await resolveOriginAndHomeResponse();
  console.log(`\nHIP3Pulse Non-Custodial Verifier — Target Origin: ${origin}\n`);

  // Step 1: Strict CSP boundary check
  if (homeResp.status !== 200) {
    throw new Error(`Step 1 FAIL: GET ${origin}/ returned HTTP ${homeResp.status} (expected 200)`);
  }
  const csp = homeResp.headers.get("content-security-policy") || "";
  const requiredDirectives = [
    "default-src 'self'",
    "script-src 'self'",
    "connect-src 'self' https://api.hyperliquid.xyz",
    "object-src 'none'",
    "frame-ancestors 'none'",
  ];
  const missingDirs = requiredDirectives.filter((d) => !csp.includes(d));
  if (missingDirs.length > 0) {
    throw new Error(`Step 1 FAIL: Missing required CSP directives: ${missingDirs.join(", ")} (got: ${csp})`);
  }
  console.log("[PASS] Step 1: Strict CSP verified (default-src 'self', script-src 'self', connect-src 'self' https://api.hyperliquid.xyz, object-src 'none', frame-ancestors 'none')");

  // Step 2: Live SHA-384 SRI verification for all 4 ES module scripts
  const html = await homeResp.text();
  const scripts = [
    "/app.mjs",
    "/i18n.mjs",
    "/vendor/hl-sdk.mjs",
    "/vendor/neural-core.mjs",
  ];
  for (const assetPath of scripts) {
    const expectedSri = extractIntegrityForPath(html, assetPath);
    if (!expectedSri) {
      throw new Error(`Step 2 FAIL: Missing integrity="sha384-..." attribute in HTML for ${assetPath}`);
    }
    const r = await fetchWithTimeout(`${origin}${assetPath}`, { cache: "no-store" }, 10_000);
    if (r.status !== 200) {
      throw new Error(`Step 2 FAIL: GET ${origin}${assetPath} returned HTTP ${r.status}`);
    }
    const buf = Buffer.from(await r.arrayBuffer());
    const actualSri = "sha384-" + crypto.createHash("sha384").update(buf).digest("base64");
    if (actualSri !== expectedSri) {
      throw new Error(`Step 2 FAIL: SHA-384 mismatch for ${assetPath} (HTML=${expectedSri} vs LIVE=${actualSri})`);
    }
    console.log(`[PASS] Step 2: ${assetPath} SHA-384 MATCH (${actualSri.slice(0, 26)}... · ${buf.length} B)`);
  }

  // Step 3: /api/enrich?src=api public sanitization check (zero non-builder 0x addresses)
  const enrichResp = await fetchWithTimeout(`${origin}/api/enrich?src=api`, { cache: "no-store" }, 10_000);
  if (enrichResp.status !== 200) {
    throw new Error(`Step 3 FAIL: GET ${origin}/api/enrich?src=api returned HTTP ${enrichResp.status}`);
  }
  const enrichText = await enrichResp.text();
  const enrichJson = JSON.parse(enrichText);
  const builderAddr = String(enrichJson?.builderConfig?.address || "").trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(builderAddr)) {
    throw new Error(`Step 3 FAIL: Invalid builderConfig.address: ${builderAddr}`);
  }
  const allAddrs = enrichText.match(/0x[a-fA-F0-9]{40}/g) || [];
  const leaked = allAddrs.filter((a) => a.toLowerCase() !== builderAddr.toLowerCase());
  if (leaked.length > 0) {
    throw new Error(`Step 3 FAIL: Found ${leaked.length} unexpected 0x addresses in /api/enrich payload`);
  }
  console.log(`[PASS] Step 3: /api/enrich?src=api verified (builder=${builderAddr}, 0 non-builder 0x addresses)`);

  // Step 4: Direct Hyperliquid L1 Builder vault verification
  const hlPost = async (body) => {
    const r = await fetchWithTimeout(
      HL_INFO_API,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
      10_000
    );
    if (r.status !== 200) throw new Error(`HL L1 HTTP ${r.status} for ${body.type}`);
    return r.json();
  };
  const [absMode, chState] = await Promise.all([
    hlPost({ type: "userAbstraction", user: builderAddr }),
    hlPost({ type: "clearinghouseState", user: builderAddr }),
  ]);
  const isStandardMode = absMode === "disabled" || absMode === "default" || absMode == null;
  const acctVal = Number(chState?.marginSummary?.accountValue || 0);
  if (!isStandardMode) {
    throw new Error(`Step 4 FAIL: Builder address mode is ${JSON.stringify(absMode)} (expected standard mode)`);
  }
  if (!Number.isFinite(acctVal) || acctVal < 100) {
    throw new Error(`Step 4 FAIL: Builder L1 accountValue=${acctVal} USDC (< 100 USDC minimum)`);
  }
  console.log(`[PASS] Step 4: Hyperliquid L1 Builder verified (mode=${absMode ?? "standard"}, accountValue=${acctVal.toFixed(2)} USDC)`);
  console.log("\nALL 4 NON-CUSTODIAL CHECKS PASSED.\n");
}

main().catch((err) => {
  console.error(`\n[FAIL] ${err?.message || err}\n`);
  process.exit(1);
});
