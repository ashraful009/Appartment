const cron = require("node-cron");
const Property = require("../models/Property");

// Helper function to parse 'Month Year' into a Date object
const parseHandoverTime = (timeStr) => {
  if (!timeStr) return null;
  // Assumes format like "December 2026"
  const [monthStr, yearStr] = timeStr.trim().split(" ");
  if (!monthStr || !yearStr) return null;

  const monthIndex = new Date(`${monthStr} 1, 2000`).getMonth();
  if (isNaN(monthIndex)) return null;

  const year = parseInt(yearStr, 10);
  if (isNaN(year)) return null;

  // Set to the end of the specified month
  return new Date(year, monthIndex + 1, 0, 23, 59, 59);
};

const startPropertyCron = () => {
  // Run daily at midnight: '0 0 * * *'
  const JOB_EXPRESSION = "0 0 * * *";

  if (!cron.validate(JOB_EXPRESSION)) {
    console.error("[Cron] Invalid property cron expression — job NOT started.");
    return;
  }

  cron.schedule(JOB_EXPRESSION, async () => {
    console.log("\n[Cron] ====== Property status update pass started ======");
    const start = Date.now();
    let updatedCount = 0;
    try {
      const now = new Date();
      // Find properties that are not yet Completed and have a handoverTime
      const properties = await Property.find({
        status: { $in: ["Ongoing", "Upcoming"] },
        handoverTime: { $exists: true, $ne: "" },
      });

      for (const prop of properties) {
        const handoverDate = parseHandoverTime(prop.handoverTime);
        if (handoverDate && handoverDate < now) {
          prop.status = "Completed";
          await prop.save();
          updatedCount++;
        }
      }

      console.log(
        `[Cron] Property status pass: ${updatedCount} properties marked 'Completed'. (${Date.now() - start} ms)\n`
      );
    } catch (err) {
      console.error("[Cron] Property status pass FAILED:", err);
    }
  });

  console.log("[Cron] Property status job scheduled — runs at midnight daily.");
};

module.exports = { startPropertyCron };
