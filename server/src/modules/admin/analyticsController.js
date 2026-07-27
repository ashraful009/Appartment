const priceRequestRepository = require("../../repositories/PriceRequestRepository");
const userRepository = require("../../repositories/UserRepository");
const { whereJsonArrayContains } = require("../../utils/dbUtils");

const STAGE_ORDER = [
  "New",
  "Contacted",
  "Site Visited",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

const getPipelineFunnel = async (_req, res) => {
  try {
    const raw = await priceRequestRepository.db('price_requests')
      .select('pipeline_stage as stage')
      .count('id as count')
      .groupBy('pipeline_stage');

    const countMap = Object.fromEntries(raw.map((r) => [r.stage, parseInt(r.count, 10)]));
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

const getLeadSources = async (_req, res) => {
  try {
    const sourcesRaw = await priceRequestRepository.db('price_requests')
      .select('lead_source as source')
      .count('id as count')
      .groupBy('lead_source')
      .orderBy('count', 'desc');

    const sources = sourcesRaw.map(s => ({ source: s.source, count: parseInt(s.count, 10) }));

    const total = sources.reduce((s, x) => s + x.count, 0);
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

const getGenealogyTree = async (_req, res) => {
  try {
    const allUsers = await userRepository.db('users').select('id', 'name', 'roles', 'referred_by');

    const byId = {};
    allUsers.forEach((u) => { byId[u.id.toString()] = { _id: u.id, name: u.name, roles: u.roles || [], referredBy: u.referred_by, children: [] }; });

    const roots = [];
    allUsers.forEach((u) => {
      const roles = u.roles || [];
      if (!u.referred_by) {
        if (roles.includes("admin") || roles.includes("seller")) {
          roots.push(byId[u.id.toString()]);
        }
      } else {
        const parentId = u.referred_by.toString();
        if (byId[parentId]) {
          byId[parentId].children.push(byId[u.id.toString()]);
        }
      }
    });

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

const getTeamLeaderboard = async (_req, res) => {
  try {
    const subSellers = await whereJsonArrayContains(userRepository.db('users')
      .whereNotNull('referred_by')
      , 'roles', 'seller')
      .select('referred_by', 'id');

    const teamMap = {};
    subSellers.forEach((s) => {
      const pid = s.referred_by.toString();
      if (!teamMap[pid]) teamMap[pid] = [];
      teamMap[pid].push(s.id);
    });

    if (!Object.keys(teamMap).length) {
      return res.status(200).json({ leaderboard: [] });
    }

    const parentIds = Object.keys(teamMap);
    const parents = await whereJsonArrayContains(userRepository.db('users')
      .whereIn('id', parentIds)
      , 'roles', 'seller')
      .select('id', 'name', 'phone');

    const leaderboard = await Promise.all(
      parents.map(async (parent) => {
        const teamIds = [parent.id, ...(teamMap[parent.id.toString()] || [])];

        const closedWonRec = await priceRequestRepository.db('price_requests')
          .whereIn('assigned_to', teamIds)
          .where({ pipeline_stage: "Closed Won" })
          .count('id as total').first();
          
        const totalSales = parseInt(closedWonRec?.total || 0, 10);

        return {
          _id:        parent.id,
          name:       parent.name,
          phone:      parent.phone,
          teamSize:   teamIds.length,
          totalSales: totalSales,
        };
      })
    );

    leaderboard.sort((a, b) => b.totalSales - a.totalSales);

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("getTeamLeaderboard error:", error);
    res.status(500).json({ message: "Failed to build team leaderboard." });
  }
};

module.exports = { getPipelineFunnel, getLeadSources, getGenealogyTree, getTeamLeaderboard };
