import axios from "axios";

// ─── Circuit Breaker State ──────────────────────────────
const MAX_FAILURES = 5;       // Increased — Render cold starts cause transient failures
const COOLDOWN_MS = 60_000;   // 60s cooldown before retrying a downed ML API

let consecutiveFailures = 0;
let circuitOpenedAt = null; // timestamp when circuit opened
let lastFailureTime = null;
let lastErrorType = null;

function isCircuitOpen() {
  if (consecutiveFailures < MAX_FAILURES) return false;

  // Circuit is open — check if cooldown has expired
  const elapsed = Date.now() - circuitOpenedAt;
  if (elapsed >= COOLDOWN_MS) {
    // Transition to HALF_OPEN: allow one request through
    return false;
  }

  return true; // still within cooldown
}

function recordSuccess() {
  if (consecutiveFailures >= MAX_FAILURES) {
    console.log("✅ ML Circuit CLOSED (ML recovered)");
  }
  consecutiveFailures = 0;
  circuitOpenedAt = null;
  // lastErrorType = null; // We keep lastErrorType for last known failure reason
}

function recordFailure(error) {
  consecutiveFailures++;
  lastFailureTime = new Date();

  // Track failure reason
  if (error.code === "ECONNABORTED") {
    lastErrorType = "TIMEOUT";
  } else if (error.response) {
    lastErrorType = `HTTP_${error.response.status}`;
  } else {
    lastErrorType = "NETWORK";
  }

  if (consecutiveFailures >= MAX_FAILURES && !circuitOpenedAt) {
    circuitOpenedAt = Date.now();
    console.warn(`⚠️ Circuit OPEN (ML disabled temporarily). Reason: ${lastErrorType}`);
  }
}

// ─── ML API Calls ───────────────────────────────────────

/**
 * Call ML API to parse food input with intent detection.
 */
export const parseWithML = async (text) => {
  // ── Circuit breaker gate ──
  if (isCircuitOpen()) {
    console.warn("⚡ ML Circuit OPEN → Skipping /parse, using fallback");
    return null;
  }

  const baseUrl = process.env.ML_API_URL || "http://127.0.0.1:8000";

  // ── Attempt 1: Main request ──
  // Timeout: 45s to survive Render free-tier cold starts.
  // NOTE: Do NOT inline .catch() with a retry here — that counts failures TWICE
  // and opens the circuit breaker too quickly.
  try {
    const res = await axios.post(`${baseUrl}/parse`, { text }, { timeout: 45000 });
    recordSuccess();
    return res.data;
  } catch (firstError) {
    // ── Attempt 2: Single retry after a brief warm-up pause ──
    // Only retry on timeout/network — not on 4xx/5xx responses
    const isNetworkError = !firstError.response;
    if (isNetworkError) {
      console.warn(`ML API → First attempt failed (${firstError.code || firstError.message}). Waiting 3s before retry...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      try {
        const res = await axios.post(`${baseUrl}/parse`, { text }, { timeout: 35000 });
        recordSuccess();
        return res.data;
      } catch (retryError) {
        recordFailure(retryError);
        console.warn(`ML API → Retry also failed: ${retryError.message} → Falling back to rules`);
        return null;
      }
    }

    // Non-retryable error (e.g. 400, 500 from ML service)
    recordFailure(firstError);
    if (firstError.response) {
      console.warn(`ML API Error: HTTP ${firstError.response.status} → Falling back to rules`);
    } else if (firstError.code === "ECONNABORTED") {
      console.warn("ML API Timeout → Falling back to rule parser");
    } else {
      console.warn(`ML API Down: ${firstError.message} → Falling back to rules`);
    }
    return null;
  }
};

/**
 * Check ML API health.
 */
export const checkMLHealth = async () => {
  const baseUrl = process.env.ML_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await axios.get(`${baseUrl}/health`, { timeout: 1000 });
    return res.data;
  } catch {
    return { status: "down" };
  }
};

/**
 * Get current circuit breaker status for Admin/Debug.
 */
export const getCircuitStatus = () => ({
  state:
    consecutiveFailures >= MAX_FAILURES
      ? isCircuitOpen()
        ? "OPEN"
        : "HALF_OPEN"
      : "CLOSED",
  failureCount: consecutiveFailures,
  circuitOpenedAt,
  lastFailureTime,
  lastErrorType,
  cooldownMs: COOLDOWN_MS,
  maxFailures: MAX_FAILURES,
  apiUrl: process.env.ML_API_URL
});
