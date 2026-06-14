/**
 * membershipCron.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Daily lapse pass for the membership journey:
 *   Members who did NOT get their down payment approved within the 6-month
 *   window lose the "member" role and their membership is marked "lapsed".
 *
 * Schedule: 1:00 AM every day → '0 1 * * *'
 * ─────────────────────────────────────────────────────────────────────────────
 */

const cron = require("node-cron");
const { lapseExpiredMembers } = require("../services/membershipService");

const startMembershipCron = () => {
  const JOB_EXPRESSION = "0 1 * * *";

  if (!cron.validate(JOB_EXPRESSION)) {
    console.error("[Cron] Invalid membership cron expression — job NOT started.");
    return;
  }

  cron.schedule(JOB_EXPRESSION, async () => {
    console.log("\n[Cron] ====== Membership lapse pass started ======");
    const start = Date.now();
    try {
      const count = await lapseExpiredMembers();
      console.log(
        `[Cron] Membership lapse pass: ${count} member(s) lapsed. (${Date.now() - start} ms)\n`
      );
    } catch (err) {
      console.error("[Cron] Membership lapse pass FAILED:", err);
    }
  });

  console.log("[Cron] Membership lapse job scheduled — runs at 1:00 AM daily.");
};

module.exports = { startMembershipCron };
