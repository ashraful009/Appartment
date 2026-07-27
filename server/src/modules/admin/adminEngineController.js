const priceRequestRepository = require("../../repositories/PriceRequestRepository");
const targetRepository = require("../../repositories/TargetRepository");
const { sendSuccess, sendError } = require("../../responses/apiResponse");

const getIdleLeads = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const idleLeads = await priceRequestRepository.db('price_requests')
      .whereNotNull('assigned_to')
      .andWhere('last_interaction_date', '<', sevenDaysAgo)
      .leftJoin('users as assignedUser', 'price_requests.assigned_to', 'assignedUser.id')
      .leftJoin('users as customerUser', 'price_requests.user_id', 'customerUser.id')
      .select(
        'price_requests.*',
        'assignedUser.name as assigned_to_name',
        'assignedUser.phone as assigned_to_phone',
        'assignedUser.email as assigned_to_email',
        'customerUser.name as user_name',
        'customerUser.phone as user_phone',
        'customerUser.email as user_email'
      )
      .orderBy('last_interaction_date', 'asc');

    const formattedLeads = idleLeads.map(lead => ({
        ...lead,
        assignedTo: {
            id: lead.assigned_to,
            name: lead.assigned_to_name,
            phone: lead.assigned_to_phone,
            email: lead.assigned_to_email
        },
        user: {
            id: lead.user_id,
            name: lead.user_name,
            phone: lead.user_phone,
            email: lead.user_email
        }
    }));

    return sendSuccess(res, { count: formattedLeads.length, idleLeads: formattedLeads }, "Idle leads fetched successfully", 200);
  } catch (error) {
    console.error("getIdleLeads error:", error);
    return sendError(res, error, "Failed to fetch idle leads.", 500);
  }
};

const setMonthlyTarget = async (req, res) => {
  try {
    const { month, year, globalTarget } = req.body;

    if (!month || !year || globalTarget === undefined) {
      return sendError(res, "Missing fields", "month, year, and globalTarget are required.", 400);
    }
    if (isNaN(Number(globalTarget)) || Number(globalTarget) < 0) {
      return sendError(res, "Invalid input", "globalTarget must be a non-negative number.", 400);
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthIndex = monthNames.indexOf(month);
    
    if (monthIndex === -1) {
        return sendError(res, "Invalid input", "Invalid month name.", 400);
    }
    
    const targetDateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;

    const existingTarget = await targetRepository.db('targets')
        .whereRaw('MONTH(target_date) = ?', [monthIndex + 1])
        .andWhereRaw('YEAR(target_date) = ?', [Number(year)])
        .first();

    let target;
    if (existingTarget) {
        target = await targetRepository.update(existingTarget.id, { amount: Number(globalTarget) });
    } else {
        target = await targetRepository.create({ amount: Number(globalTarget), target_date: targetDateStr });
    }

    return sendSuccess(res, { target }, "Monthly target saved.", 200);
  } catch (error) {
    console.error("setMonthlyTarget error:", error);
    return sendError(res, error, "Failed to save monthly target.", 500);
  }
};

const getCurrentTarget = async (req, res) => {
  try {
    const now   = new Date();
    const month = now.toLocaleString("en-US", { month: "long" }); 
    const year  = now.getFullYear();

    const target = await targetRepository.db('targets')
        .whereRaw('MONTH(target_date) = ?', [now.getMonth() + 1])
        .andWhereRaw('YEAR(target_date) = ?', [year])
        .first();

    if (!target) {
      return sendSuccess(res, { target: null, month, year }, "No target set for this month.", 200);
    }
    
    const formattedTarget = {
        ...target,
        globalTarget: target.amount,
        month,
        year
    };

    return sendSuccess(res, { target: formattedTarget, month, year }, "Target fetched", 200);
  } catch (error) {
    console.error("getCurrentTarget error:", error);
    return sendError(res, error, "Failed to fetch current target.", 500);
  }
};

module.exports = { getIdleLeads, setMonthlyTarget, getCurrentTarget };
