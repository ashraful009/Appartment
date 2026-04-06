/**
 * installmentCron.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Scheduled tasks for the installment lifecycle:
 *
 *  1. PENALTY PASS  — marks Pending installments as Overdue when dueDate has
 *                     passed and adds a late-payment penalty to the total.
 *
 *  2. GENERATION PASS — creates the next monthly EMI installment for every
 *                        active unit that still has EMIs remaining.
 *
 * Schedule: 12:01 AM on the 1st of every month  →  '1 0 1 * *'
 * ─────────────────────────────────────────────────────────────────────────────
 */

const cron         = require("node-cron");
const Installment  = require("../models/Installment");
const ApartmentUnit = require("../models/ApartmentUnit");

// ── Constants ────────────────────────────────────────────────────────────────

/** Flat late-payment penalty added to each overdue installment (BDT). */
const LATE_PENALTY_FLAT = 2000;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Round a number to 2 decimal places safely. */
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Return the last moment (23:59:59.999) of the last day of the given month.
 * @param {Date} dateInMonth - any Date inside the target month
 */
const lastDayOfMonth = (dateInMonth) => {
  const d = new Date(dateInMonth);
  // Day 0 of next month = last day of current month
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

// ── Core Tasks ───────────────────────────────────────────────────────────────

/**
 * PASS 1 — Penalty
 * Query every Pending installment whose dueDate is already in the past,
 * flip its status to Overdue, and tack on the flat penalty.
 *
 * Uses bulkWrite for a single round-trip to MongoDB.
 */
const applyLatePenalties = async () => {
  const now = new Date();

  // Find all overdue-but-not-yet-marked installments
  const overdueInstallments = await Installment.find({
    status:  "Pending",
    dueDate: { $lt: now },
  }).select("_id latePenalty totalAmount");

  if (overdueInstallments.length === 0) {
    console.log("[Cron] Penalty pass: no overdue installments found.");
    return;
  }

  const bulkOps = overdueInstallments.map((inst) => ({
    updateOne: {
      filter: { _id: inst._id },
      update: {
        $set: {
          status:      "Overdue",
          latePenalty: round2((inst.latePenalty || 0) + LATE_PENALTY_FLAT),
          totalAmount: round2((inst.totalAmount || 0) + LATE_PENALTY_FLAT),
        },
      },
    },
  }));

  const result = await Installment.bulkWrite(bulkOps);
  console.log(
    `[Cron] Penalty pass: ${result.modifiedCount} installment(s) marked Overdue (+৳${LATE_PENALTY_FLAT} penalty each).`
  );
};

/**
 * PASS 2 — Generation
 * For every ApartmentUnit that is document-ready and still has EMIs left,
 * create the next monthly EMI installment and decrement remainingEmis.
 *
 * EMI number formula:  185 - unit.remainingEmis
 *   e.g. remainingEmis=184  →  EMI 1
 *        remainingEmis=183  →  EMI 2  … etc.
 */
const generateMonthlyEmis = async () => {
  const today = new Date();

  // Fetch all active units that still need EMI generation
  const activeUnits = await ApartmentUnit.find({
    isDocumentReady: true,
    remainingEmis:   { $gt: 0 },
    emiAmount:       { $ne: null },
    customerId:      { $ne: null },
  }).select("_id customerId emiAmount remainingEmis");

  if (activeUnits.length === 0) {
    console.log("[Cron] Generation pass: no active units found.");
    return;
  }

  // Build bulk installment documents + unit update operations
  const installmentDocs = [];
  const unitBulkOps     = [];

  for (const unit of activeUnits) {
    const emiNumber      = 185 - unit.remainingEmis; // 184 → 1, 183 → 2, …
    const dueDate        = lastDayOfMonth(today);

    installmentDocs.push({
      unitId:          unit._id,
      customerId:      unit.customerId,
      installmentName: `EMI - Month ${emiNumber}`,
      chargeBreakdown: {
        baseAmount:       round2(unit.emiAmount),
        parking:          0,
        financialService: 0,
        serviceCharge:    0,
      },
      latePenalty:  0,
      totalAmount:  round2(unit.emiAmount),
      invoiceDate:  today,
      dueDate,
      status:       "Pending",
    });

    unitBulkOps.push({
      updateOne: {
        filter: { _id: unit._id },
        update: { $inc: { remainingEmis: -1 } },
      },
    });
  }

  // Persist all new installments in one shot
  await Installment.insertMany(installmentDocs, { ordered: false });

  // Decrement remainingEmis on all affected units
  await ApartmentUnit.bulkWrite(unitBulkOps);

  console.log(
    `[Cron] Generation pass: ${installmentDocs.length} EMI installment(s) created for ${today.toLocaleString("en-BD", { month: "long", year: "numeric" })}.`
  );
};

// ── Scheduler ────────────────────────────────────────────────────────────────

/**
 * Registers the monthly cron job.
 * Call this once after the database connection is established.
 *
 * Expression: '1 0 1 * *'
 *   ┌─── minute (1)
 *   │ ┌─ hour (0 = midnight)
 *   │ │ ┌ day-of-month (1st)
 *   │ │ │ ┌ month (every)
 *   │ │ │ │ ┌ day-of-week (any)
 *   1 0 1 * *
 */
const startInstallmentCron = () => {
  const JOB_EXPRESSION = "1 0 1 * *";

  if (!cron.validate(JOB_EXPRESSION)) {
    console.error("[Cron] Invalid cron expression — job NOT started.");
    return;
  }

  cron.schedule(JOB_EXPRESSION, async () => {
    console.log("\n[Cron] ====== Monthly installment job started ======");
    const start = Date.now();

    try {
      // Step 1: apply penalties to already-overdue installments
      await applyLatePenalties();

      // Step 2: generate the new month's EMI for every active unit
      await generateMonthlyEmis();

      console.log(
        `[Cron] ====== Job completed in ${Date.now() - start} ms ======\n`
      );
    } catch (err) {
      console.error("[Cron] Monthly installment job FAILED:", err);
    }
  });

  console.log(
    `[Cron] Installment job scheduled — runs at 12:01 AM on the 1st of every month.`
  );
};

module.exports = { startInstallmentCron };
