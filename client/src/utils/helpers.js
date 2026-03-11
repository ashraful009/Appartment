// ── Date Formatting ───────────────────────────────────────────────────────────
/**
 * Format a date string/object into a human-readable "DD Mon YYYY" string.
 * Returns "—" for null/undefined values.
 */
export const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ── Conversion Ratio ──────────────────────────────────────────────────────────
/**
 * Calculate conversion ratio as a percentage string.
 * @param {number} approved
 * @param {number} total
 * @returns {string} e.g. "42%"
 */
export const conversionRatio = (approved, total) => {
  if (!total || total === 0) return "0%";
  return `${Math.round((approved / total) * 100)}%`;
};

// ── Request Types ─────────────────────────────────────────────────────────────
/**
 * A request can have BOTH pendingCustomer and pendingSeller simultaneously.
 * Returns an array of type strings: 'customer' | 'seller'
 */
export const getRequestTypes = (request) => {
  const types = [];
  if (request.conversionStatus       === "pending_approval") types.push("customer");
  if (request.sellerConversionStatus === "pending_approval") types.push("seller");
  return types;
};

/**
 * Given an array of pendingRequests, expand each request into one card per type.
 * Returns: [{ req, type }]
 */
export const buildPendingCards = (pendingRequests = []) => {
  const cards = [];
  pendingRequests.forEach((req) => {
    getRequestTypes(req).forEach((type) => cards.push({ req, type }));
  });
  return cards;
};
