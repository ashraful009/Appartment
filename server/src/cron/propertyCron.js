const cron = require("node-cron");
const propertyRepository = require("../repositories/PropertyRepository");


const parseHandoverTime = (timeStr) => {
  if (!timeStr) return null;
  
  const [monthStr, yearStr] = timeStr.trim().split(" ");
  if (!monthStr || !yearStr) return null;

  const monthIndex = new Date(`${monthStr} 1, 2000`).getMonth();
  if (isNaN(monthIndex)) return null;

  const year = parseInt(yearStr, 10);
  if (isNaN(year)) return null;

  
  return new Date(year, monthIndex + 1, 0, 23, 59, 59);
};

const startPropertyCron = () => {
  
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
      
      const properties = await propertyRepository.db('properties')
        .whereIn('status', ["Ongoing", "Upcoming"])
        .whereNotNull('handover_time')
        .where('handover_time', '!=', '');

      for (const prop of properties) {
        const handoverDate = parseHandoverTime(prop.handover_time);
        if (handoverDate && handoverDate < now) {
          await propertyRepository.update(prop.id, { status: "Completed" });
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
