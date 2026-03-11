const PriceRequest = require("../models/PriceRequest");

// Ordered pipeline stages for correct funnel ordering
const STAGE_ORDER = [
  "New",
  "Contacted",
  "Site Visited",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Count leads per pipeline stage (Sales Funnel)
// @route  GET /api/admin/analytics/pipeline-funnel
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getPipelineFunnel = async (_req, res) => {
  try {
    const raw = await PriceRequest.aggregate([
      {
        $group: {
          _id: "$pipelineStage",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          stage: "$_id",
          count: 1,
        },
      },
    ]);

    // Ensure all stages are represented (even 0-count ones) and sorted correctly
    const countMap = Object.fromEntries(raw.map((r) => [r.stage, r.count]));
    const funnel = STAGE_ORDER.map((stage) => ({
      stage,
      count: countMap[stage] ?? 0,
    }));

    res.status(200).json({ funnel });
  } catch (error) {
    console.error("getPipelineFunnel error:", error);
    res.status(500).json({ message: "Failed to aggregate pipeline funnel data." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Count leads per source (Lead Source Breakdown)
// @route  GET /api/admin/analytics/lead-sources
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getLeadSources = async (_req, res) => {
  try {
    const sources = await PriceRequest.aggregate([
      {
        $group: {
          _id: "$leadSource",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          source: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = sources.reduce((s, x) => s + x.count, 0);
    // Append percentage
    const withPct = sources.map((s) => ({
      ...s,
      pct: total ? Math.round((s.count / total) * 100) : 0,
    }));

    res.status(200).json({ sources: withPct, total });
  } catch (error) {
    console.error("getLeadSources error:", error);
    res.status(500).json({ message: "Failed to aggregate lead-source data." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Build a nested agency hierarchy tree using $graphLookup
// @route  GET /api/admin/analytics/genealogy-tree
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getGenealogyTree = async (_req, res) => {
  try {
    const User = require("../models/User");

    // Fetch all users (id, name, roles, referredBy)
    const allUsers = await User.find({}, { name: 1, roles: 1, referredBy: 1 }).lean();

    // Build a quick lookup map
    const byId = {};
    allUsers.forEach((u) => { byId[u._id.toString()] = { ...u, children: [] }; });

    // Find root nodes — admins OR sellers with no referredBy (top-tier sellers)
    const roots = [];
    allUsers.forEach((u) => {
      if (!u.referredBy) {
        // admin or unsponsored user
        if (u.roles.includes("admin") || u.roles.includes("seller")) {
          roots.push(byId[u._id.toString()]);
        }
      } else {
        const parentId = u.referredBy.toString();
        if (byId[parentId]) {
          byId[parentId].children.push(byId[u._id.toString()]);
        }
      }
    });

    // Only expose needed fields
    const clean = (node) => ({
      _id:      node._id,
      name:     node.name,
      roles:    node.roles,
      children: node.children.map(clean),
    });

    const tree = roots.map(clean);
    res.status(200).json({ tree });
  } catch (error) {
    console.error("getGenealogyTree error:", error);
    res.status(500).json({ message: "Failed to build genealogy tree." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Rank parent sellers by their team's total Closed Won leads
// @route  GET /api/admin/analytics/team-leaderboard
// @access Private (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getTeamLeaderboard = async (_req, res) => {
  try {
    const User = require("../models/User");

    // 1. Find all sellers who are parents (have sub-sellers under them)
    const subSellers = await User.find(
      { referredBy: { $ne: null }, roles: "seller" },
      { referredBy: 1 }
    ).lean();

    // Map: parentId -> [subSeller ids]
    const teamMap = {};
    subSellers.forEach((s) => {
      const pid = s.referredBy.toString();
      if (!teamMap[pid]) teamMap[pid] = [];
      teamMap[pid].push(s._id);
    });

    if (!Object.keys(teamMap).length) {
      return res.status(200).json({ leaderboard: [] });
    }

    // 2. For each parent, gather team leads and count Closed Won
    const parentIds = Object.keys(teamMap);
    const parents   = await User.find(
      { _id: { $in: parentIds }, roles: "seller" },
      { name: 1, phone: 1 }
    ).lean();

    const leaderboard = await Promise.all(
      parents.map(async (parent) => {
        const teamIds = [parent._id, ...(teamMap[parent._id.toString()] || [])];

        const [closedWon] = await PriceRequest.aggregate([
          { $match: { assignedTo: { $in: teamIds }, pipelineStage: "Closed Won" } },
          { $count: "total" },
        ]);

        return {
          _id:        parent._id,
          name:       parent.name,
          phone:      parent.phone,
          teamSize:   teamIds.length,       // parent + sub-sellers
          totalSales: closedWon?.total ?? 0,
        };
      })
    );

    // Sort by sales descending
    leaderboard.sort((a, b) => b.totalSales - a.totalSales);

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("getTeamLeaderboard error:", error);
    res.status(500).json({ message: "Failed to build team leaderboard." });
  }
};

module.exports = { getPipelineFunnel, getLeadSources, getGenealogyTree, getTeamLeaderboard };
