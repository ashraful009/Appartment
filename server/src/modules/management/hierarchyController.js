const userRepository = require("../../repositories/UserRepository");
const priceRequestRepository = require("../../repositories/PriceRequestRepository");

const verifyDescendantAccess = (loggedInUserId, targetUserId, allUsersMap) => {
  if (loggedInUserId.toString() === targetUserId.toString()) return true;
  let currId = targetUserId.toString();
  const visited = new Set();
  while (currId && !visited.has(currId)) {
    visited.add(currId);
    if (currId === loggedInUserId.toString()) return true;
    const node = allUsersMap[currId];
    if (!node || !node.superior_id) break;
    currId = node.superior_id.toString();
  }
  return false;
};

const buildNodeTree = (userNode, childrenMap, allLeadsMap) => {
  const childrenNodes = childrenMap[userNode.id.toString()] || [];
  const children = childrenNodes.map(child => buildNodeTree(child, childrenMap, allLeadsMap));

  const roleCounts = { Director: 0, GM: 0, AGM: 0, AreaManager: 0, Seller: 0, Customer: 0 };
  const leadStats = { totalLeads: 0, onProcessLeads: 0, cancelledLeads: 0 };

  children.forEach(c => {
    if (c.roles.includes("Director")) roleCounts.Director++;
    else if (c.roles.includes("GM")) roleCounts.GM++;
    else if (c.roles.includes("AGM")) roleCounts.AGM++;
    else if (c.roles.includes("area_manager")) roleCounts.AreaManager++;
    else if (c.roles.includes("seller")) roleCounts.Seller++;
    else if (c.roles.includes("customer")) roleCounts.Customer++;

    roleCounts.Director += c.roleCounts.Director;
    roleCounts.GM += c.roleCounts.GM;
    roleCounts.AGM += c.roleCounts.AGM;
    roleCounts.AreaManager += (c.roleCounts.AreaManager || 0);
    roleCounts.Seller += c.roleCounts.Seller;
    roleCounts.Customer += c.roleCounts.Customer;

    leadStats.totalLeads += c.leadStats.totalLeads;
    leadStats.onProcessLeads += c.leadStats.onProcessLeads;
    leadStats.cancelledLeads += c.leadStats.cancelledLeads;
  });

  const myLeads = allLeadsMap[userNode.id.toString()] || [];
  myLeads.forEach(l => {
    leadStats.totalLeads++;
    const stage = l.pipeline_stage || '';
    const conv = l.conversion_status || '';
    const sellerConv = l.seller_conversion_status || '';
    if (stage === 'Closed Lost' || conv === 'rejected' || sellerConv === 'rejected') {
      leadStats.cancelledLeads++;
    } else if (stage !== 'Closed Won' && conv !== 'approved' && sellerConv !== 'approved') {
      leadStats.onProcessLeads++;
    }
  });

  return {
    _id: userNode.id,
    id: userNode.id,
    name: userNode.name,
    email: userNode.email,
    phone: userNode.phone,
    avatar: userNode.avatar,
    roles: userNode.roles,
    superior_id: userNode.superior_id || null,
    roleCounts,
    leadStats,
    children
  };
};

const getSubtreeData = async (req, res, returnType) => {
  try {
    const targetUserId = req.query.userId || req.user.id;

    const allUsers = await userRepository.db('users').select('id', 'name', 'email', 'phone', 'profile_photo as avatar', 'roles', 'superior_id');
    const allUsersMap = {};
    allUsers.forEach(u => {
      allUsersMap[u.id.toString()] = {
        ...u,
        _id: u.id,
        roles: typeof u.roles === 'string' ? JSON.parse(u.roles || '[]') : (u.roles || [])
      };
    });

    const targetUserNode = allUsersMap[targetUserId.toString()];
    if (!targetUserNode) {
      return res.status(404).json({ message: "User not found." });
    }

    const isAdmin = req.user.roles && req.user.roles.includes("admin");
    if (targetUserId.toString() !== req.user.id.toString() && !isAdmin) {
      const isDescendant = verifyDescendantAccess(req.user.id, targetUserId, allUsersMap);
      if (!isDescendant) {
        return res.status(403).json({ message: "Access denied: Target user is not within your downline hierarchy." });
      }
    }

    const allLeads = await priceRequestRepository.db('price_requests')
      .whereNotNull('assigned_to')
      .select('id', 'assigned_to', 'pipeline_stage', 'conversion_status', 'seller_conversion_status');

    const allLeadsMap = {};
    allLeads.forEach(l => {
      const aid = l.assigned_to ? l.assigned_to.toString() : null;
      if (aid) {
        if (!allLeadsMap[aid]) allLeadsMap[aid] = [];
        allLeadsMap[aid].push(l);
      }
    });

    const childrenMap = {};
    Object.values(allUsersMap).forEach(u => {
      const pid = u.superior_id ? u.superior_id.toString() : null;
      if (pid) {
        if (!childrenMap[pid]) childrenMap[pid] = [];
        childrenMap[pid].push(u);
      }
    });

    const tree = buildNodeTree(targetUserNode, childrenMap, allLeadsMap);

    if (returnType === 'report') {
      return res.status(200).json({
        report: {
          user: { _id: tree._id, name: tree.name, email: tree.email, roles: tree.roles },
          roleCounts: tree.roleCounts,
          leadStats: tree.leadStats
        }
      });
    } else {
      return res.status(200).json({ tree });
    }
  } catch (error) {
    console.error("Hierarchy error:", error);
    res.status(500).json({ message: "Failed to compute hierarchy report." });
  }
};

const getSubtreeReport = (req, res) => getSubtreeData(req, res, 'report');
const getSubtreeTree = (req, res) => getSubtreeData(req, res, 'tree');

const getFullSystemHierarchy = async (req, res) => {
  try {
    const allUsers = await userRepository.db('users').select('id', 'name', 'email', 'phone', 'profile_photo as avatar', 'roles', 'superior_id');
    const allUsersMap = {};
    allUsers.forEach(u => {
      allUsersMap[u.id.toString()] = {
        ...u,
        _id: u.id,
        roles: typeof u.roles === 'string' ? JSON.parse(u.roles || '[]') : (u.roles || [])
      };
    });

    const allLeads = await priceRequestRepository.db('price_requests')
      .whereNotNull('assigned_to')
      .select('id', 'assigned_to', 'pipeline_stage', 'conversion_status', 'seller_conversion_status');

    const allLeadsMap = {};
    allLeads.forEach(l => {
      const aid = l.assigned_to ? l.assigned_to.toString() : null;
      if (aid) {
        if (!allLeadsMap[aid]) allLeadsMap[aid] = [];
        allLeadsMap[aid].push(l);
      }
    });

    const childrenMap = {};
    Object.values(allUsersMap).forEach(u => {
      const pid = u.superior_id ? u.superior_id.toString() : null;
      if (pid && allUsersMap[pid]) {
        if (!childrenMap[pid]) childrenMap[pid] = [];
        childrenMap[pid].push(u);
      }
    });

    const MAIN_CHAIN_ROLES = ["Director", "GM", "AGM", "area_manager", "seller", "customer"];
    const mainTrees = [];
    const unassignedUsers = [];
    const otherRoles = {};

    Object.values(allUsersMap).forEach(u => {
      const isDirector = u.roles.includes("Director");
      const hasMainChain = u.roles.some(r => MAIN_CHAIN_ROLES.includes(r));
      const hasValidSuperior = u.superior_id && allUsersMap[u.superior_id.toString()];

      if (isDirector) {
        mainTrees.push(buildNodeTree(u, childrenMap, allLeadsMap));
      } else if (hasMainChain && !hasValidSuperior) {
        unassignedUsers.push({
          _id: u._id,
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          avatar: u.avatar,
          roles: u.roles
        });
      }

      u.roles.forEach(r => {
        if (!MAIN_CHAIN_ROLES.includes(r) && r !== "user" && r !== "admin") {
          if (!otherRoles[r]) otherRoles[r] = [];
          otherRoles[r].push({
            _id: u._id,
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            avatar: u.avatar,
            roles: u.roles
          });
        }
      });
    });

    res.status(200).json({ mainTrees, unassignedUsers, otherRoles });
  } catch (error) {
    console.error("getFullSystemHierarchy error:", error);
    res.status(500).json({ message: "Failed to compute full system hierarchy." });
  }
};

module.exports = {
  verifyDescendantAccess,
  buildNodeTree,
  getSubtreeReport,
  getSubtreeTree,
  getFullSystemHierarchy,
};
