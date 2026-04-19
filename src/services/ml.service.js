import axios from "axios";

// ─── Circuit Breaker State ──────────────────────────────
const MAX_FAILURES = 3;
const COOLDOWN_MS = 30_000; // 30s before retrying a downed API

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

  try {
    const res = await axios
      .post(`${baseUrl}/parse`, { text }, { timeout: 2000 })
      .catch(async (err) => {
        // Retry once on first failure
        console.warn("ML API → Retry attempt...");
        return await axios.post(
          `${baseUrl}/parse`,
          { text },
          { timeout: 2000 }
        );
      });

    // Success → reset circuit
    recordSuccess();
    return res.data;
  } catch (error) {
    // Failure → increment circuit breaker counter
    recordFailure(error);

    if (error.code === "ECONNABORTED") {
      console.warn("ML API Timeout → Falling back to rule parser");
    } else if (error.response) {
      console.warn(`ML API Error: ${error.response.status} → Falling back`);
    } else {
      console.warn(`ML API Down: ${error.message} → Falling back`);
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
