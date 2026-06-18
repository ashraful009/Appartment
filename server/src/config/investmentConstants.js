/**
 * investmentConstants.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central constants for the Membership → Investor investment journey.
 * Keep all the business-rule numbers in one place so they're easy to tune.
 */

module.exports = {
  BOOKING_MONEY:        20000,    // user → member
  DOWNPAYMENT_TARGET:   480000,   // 4.80 lakh (minimum cash payment)
  TOTAL_TARGET:         5000000,  // 50 lakh (includes downpayment)
  INSTALLMENT_AMOUNT:   25000,    // monthly installment
  MEMBER_WINDOW_MONTHS: 6,        // months a member has to complete downpayment
  SHARE_UNIT:           100000,   // 1 lakh = 1 share
};
