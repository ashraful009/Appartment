const priceRequestRepository = require("../repositories/PriceRequestRepository");
const targetRepository = require("../repositories/TargetRepository");

// ─────────────────────────────────────────────────────────────
// @desc   Get idle leads (assigned but no interaction > 7 days)
// @route  GET /api/admin/idle-leads
// @access Private (admin)
// ─────────────────────────────────────────────────────────────
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

    // Format output to match old mongoose populate structure
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

    res.status(200).json({
      count: formattedLeads.length,
      idleLeads: formattedLeads,
    });
  } catch (error) {
    console.error("getIdleLeads error:", error);
    res.status(500).json({ message: "Failed to fetch idle leads." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Set / upsert the monthly target
// @route  POST /api/admin/targets
// @access Private (admin)
// ─────────────────────────────────────────────────────────────
const setMonthlyTarget = async (req, res) => {
  try {
    const { month, year, globalTarget } = req.body;

    if (!month || !year || globalTarget === undefined) {
      return res.status(400).json({ message: "month, year, and globalTarget are required." });
    }
    if (isNaN(Number(globalTarget)) || Number(globalTarget) < 0) {
      return res.status(400).json({ message: "globalTarget must be a non-negative number." });
    }

    // Convert month and year to a target_date (1st of the month) to match the migration schema we made
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthIndex = monthNames.indexOf(month);
    
    if (monthIndex === -1) {
        return res.status(400).json({ message: "Invalid month name." });
    }
    
    // We map globalTarget to amount, and month/year to target_date since that's what the migration has
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

    res.status(200).json({ message: "Monthly target saved.", target });
  } catch (error) {
    console.error("setMonthlyTarget error:", error);
    res.status(500).json({ message: "Failed to save monthly target." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc   Get the current active month's target (public to all sellers)
// @route  GET /api/targets/current
// @access Private (seller / admin)
// ─────────────────────────────────────────────────────────────
const getCurrentTarget = async (req, res) => {
  try {
    const now   = new Date();
    const month = now.toLocaleString("en-US", { month: "long" }); // e.g. "March"
    const year  = now.getFullYear();

    const target = await targetRepository.db('targets')
        .whereRaw('MONTH(target_date) = ?', [now.getMonth() + 1])
        .andWhereRaw('YEAR(target_date) = ?', [year])
        .first();

    if (!target) {
      return res.status(200).json({
        message: "No target set for this month.",
        target:  null,
        month,
        year,
      });
    }
    
    // Reformat for the frontend
    const formattedTarget = {
        ...target,
        globalTarget: target.amount,
        month,
        year
    };

    res.status(200).json({ target: formattedTarget, month, year });
  } catch (error) {
    console.error("getCurrentTarget error:", error);
    res.status(500).json({ message: "Failed to fetch current target." });
  }
};

module.exports = { getIdleLeads, setMonthlyTarget, getCurrentTarget };
